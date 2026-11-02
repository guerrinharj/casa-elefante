import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = {
    params: Promise<{ id: string }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getAuthorizedOrder(id: string) {
    if (!UUID_PATTERN.test(id)) {
        return { error: "ID de pedido inválido.", status: 400 } as const;
    }

    const auth = await createClient();
    const { data: { user }, error: authError } = await auth.auth.getUser();
    if (authError || !user) {
        return { error: "Não autenticado.", status: 401 } as const;
    }

    const db = createAdminClient();
    const { data: profile, error: profileError } = await db
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || profile?.role !== "admin") {
        return { error: "Apenas administradores podem gerenciar NF-e.", status: 403 } as const;
    }

    const { data: order, error: orderError } = await db
        .from("orders")
        .select("id, status, customer_name, customer_email, customer_document, invoice_number, nfe_status, nfe_reference, nfe_access_key, nfe_issued_at, nfe_email_sent_at")
        .eq("id", id)
        .maybeSingle();

    if (orderError) {
        return { error: "Erro ao consultar pedido.", status: 500 } as const;
    }
    if (!order) {
        return { error: "Pedido não encontrado.", status: 404 } as const;
    }
    return { db, order };
}

// Consulta somente os dados locais. A consulta remota à Focus será adicionada
// após definirmos o contrato de sincronização e os estados da emissão.
export async function GET(_request: NextRequest, context: Context) {
    const { id } = await context.params;
    const result = await getAuthorizedOrder(id);
    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { order } = result;
    return NextResponse.json({
        status: order.nfe_status ?? "nao_emitida",
        reference: order.nfe_reference,
        accessKey: order.nfe_access_key,
        invoiceNumber: order.invoice_number,
        issuedAt: order.nfe_issued_at,
        emailSentAt: order.nfe_email_sent_at,
        enabled: false,
    });
}

// Blueprint seguro: emissão intencionalmente desativada.
// TODO antes de habilitar:
// 1. Confirmar regime tributário, credenciamento, certificado e dados do emitente.
// 2. Validar documento/endereço do destinatário e snapshot dos itens/preços.
// 3. Configurar NCM, CFOP, CST/CSOSN, origem, impostos e descontos/frete.
// 4. Implementar reserva atômica/idempotência persistente para impedir duplicidade.
// 5. Enviar à Focus com referência estável; conciliar timeout consultando a referência.
// 6. Persistir status e chave autorizada; só então disponibilizar XML/DANFE.
// 7. Enviar e-mail em operação separada, com registro de sucesso e possibilidade de reenvio.
export async function POST(_request: NextRequest, context: Context) {
    const { id } = await context.params;
    const result = await getAuthorizedOrder(id);
    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    if (result.order.status !== "paid") {
        return NextResponse.json(
            { error: "Somente pedidos pagos podem receber NF-e." },
            { status: 409 },
        );
    }

    if (result.order.nfe_status === "autorizada" || result.order.nfe_status === "processando") {
        return NextResponse.json(
            { error: "Este pedido já possui uma emissão autorizada ou em processamento." },
            { status: 409 },
        );
    }

    return NextResponse.json(
        { error: "Emissão indisponível: configuração fiscal e integração ainda não concluídas." },
        { status: 501 },
    );
}
