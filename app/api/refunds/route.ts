
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

import {
    canRefund,
    validateRefund,
    type RefundRequest,
} from "@/lib/refunds";

export async function POST(
    request: NextRequest,
) {
    try {
        await requireAdmin();
    } catch {
        return NextResponse.json(
            {
                success: false,
                error: "Acesso não autorizado.",
            },
            {
                status: 403,
            },
        );
    }

    try {
        const body: unknown = await request.json();

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Solicitação inválida.",
                },
                {
                    status: 400,
                },
            );
        }

        const data = body as Record<string, unknown>;

        if (
            typeof data.orderId !== "string" ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                data.orderId,
            )
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Identificador do pedido inválido.",
                },
                {
                    status: 400,
                },
            );
        }

        const supabase = createAdminClient();

        const {
            data: order,
            error: orderError,
        } = await supabase
            .from("orders")
            .select("id, status, total")
            .eq("id", data.orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Pedido não encontrado.",
                },
                {
                    status: 404,
                },
            );
        }

        if (!canRefund(order.status)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Este pedido não está elegível para reembolso.",
                },
                {
                    status: 400,
                },
            );
        }

        const paidAmount = Math.round(
            Number(order.total) * 100,
        );

        const refund = data as RefundRequest;

        const validationError = validateRefund(
            refund,
            paidAmount,
        );

        if (validationError) {
            return NextResponse.json(
                {
                    success: false,
                    error: validationError,
                },
                {
                    status: 400,
                },
            );
        }

        // TODO:
        // Consultar o pagamento confirmado no PagBank.
        // Validar o saldo efetivamente reembolsável.
        // Registrar a solicitação no Supabase.
        // Executar o estorno com proteção contra duplicidade.
        // Confirmar o resultado antes de atualizar o pedido.

        return NextResponse.json(
            {
                success: false,
                error: "A integração de reembolsos com o PagBank ainda não está habilitada. Nenhum valor foi estornado.",
            },
            {
                status: 501,
            },
        );
    } catch (error) {
        console.error("[Refund API Error]:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Não foi possível processar a solicitação.",
            },
            {
                status: 500,
            },
        );
    }
}
