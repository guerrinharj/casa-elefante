import { createHash, createPublicKey, timingSafeEqual, verify } from "node:crypto";
import { NextResponse } from "next/server";

import {
    getPagBankConfig,
    getPagBankOrder,
    getPagBankWebhookPublicKey,
} from "@/lib/pagbank";
import { updateOrderFromPagBank } from "@/lib/pagbank-checkout";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function isAuthentic(body: Buffer, headers: Headers) {
    const signatures = headers.get("x-payload-signature");
    if (signatures) {
        const { public_key } = await getPagBankWebhookPublicKey();
        const key = createPublicKey({
            key: Buffer.from(public_key, "base64"),
            format: "der",
            type: "spki",
        });

        return signatures.split(",").some((signature) =>
            verify("sha256", body, key, Buffer.from(signature.trim(), "base64")),
        );
    }

    const signature = headers.get("x-authenticity-token");
    if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
        return false;
    }

    const { token } = getPagBankConfig();
    const expected = createHash("sha256").update(token).update("-").update(body).digest();
    return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export async function POST(request: Request) {
    try {
        const body = Buffer.from(await request.arrayBuffer());
        if (!(await isAuthentic(body, request.headers))) {
            return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
        }

        let notification: { id?: unknown } | null;
        try {
            notification = JSON.parse(body.toString("utf8"));
        } catch {
            return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
        }

        const headerId = request.headers.get("x-product-id");
        const bodyId = notification?.id;
        const orderId = typeof bodyId === "string" && bodyId.startsWith("ORDE_")
            ? bodyId
            : headerId;

        if (!orderId || !/^ORDE_[A-Za-z0-9-]+$/.test(orderId)) {
            return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
        }

        const snapshot = await getPagBankOrder(orderId);
        if (snapshot.id !== orderId) {
            throw new Error("Identificador PagBank divergente.");
        }

        if (
            snapshot.charges?.[0]?.payment_method?.type === "CREDIT_CARD" &&
            snapshot.reference_id &&
            /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(snapshot.reference_id)
        ) {
            const { data: order, error } = await createAdminClient()
                .from("orders")
                .select("id, total, payment_id")
                .eq("id", snapshot.reference_id)
                .eq("payment_provider", "pagbank")
                .maybeSingle();

            if (error) {
                throw new Error("Não foi possível consultar o pedido local.");
            }

            if (order && (!order.payment_id || order.payment_id === snapshot.id)) {
                await updateOrderFromPagBank(order.id, snapshot, Number(order.total));
            }
        }

        return NextResponse.json({ received: true });
    } catch {
        console.error("Não foi possível processar a notificação PagBank.");
        return NextResponse.json({ error: "Falha ao processar a notificação." }, { status: 503 });
    }
}
