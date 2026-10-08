import { NextResponse } from "next/server";

import {
    getPagBankOrder,
} from "@/lib/pagbank";

export const runtime = "nodejs";

export async function POST(request: Request) {
    let notification: unknown;

    try {
        notification = await request.json();
    } catch {
        return NextResponse.json(
            {
                error: "JSON inválido.",
            },
            {
                status: 400,
            },
        );
    }

    if (
        !notification ||
        typeof notification !== "object" ||
        !("id" in notification) ||
        typeof notification.id !== "string" ||
        !/^ORDE_[A-Za-z0-9-]+$/.test(notification.id)
    ) {
        return NextResponse.json(
            {
                error: "Pedido inválido.",
            },
            {
                status: 400,
            },
        );
    }

    try {
        // A notificação apenas indica qual pedido consultar.
        // O status confiável vem da API autenticada do PagBank.
        const order = await getPagBankOrder(
            notification.id,
        );

        const paidCharges =
            order.charges?.filter(
                (charge) =>
                    charge.status === "PAID",
            ) ?? [];

        if (!paidCharges.length) {
            return NextResponse.json({
                received: true,
            });
        }

        /*
         * Aqui será chamada a confirmação do pedido:
         *
         * 1. Localizar o pedido na Casa Elefante.
         * 2. Conferir identificação, valor e moeda.
         * 3. Marcar como pago uma única vez.
         * 4. Atualizar estoque e uso do cupom.
         * 5. Enviar o e-mail de confirmação.
         *
         * Essa operação deve ser compartilhada com
         * a action, pois o cartão pode retornar PAID
         * imediatamente e também enviar um webhook.
         */

        // Enquanto a confirmação não estiver conectada,
        // não reconhecemos uma notificação de pagamento
        // como processada com sucesso.
        return NextResponse.json(
            {
                error:
                    "Confirmação do pedido ainda não conectada.",
            },
            {
                status: 503,
            },
        );
    } catch {
        console.error(
            "Não foi possível consultar o pedido no webhook PagBank.",
        );

        return NextResponse.json(
            {
                error:
                    "Não foi possível verificar o pagamento.",
            },
            {
                status: 502,
            },
        );
    }
}