import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import {
    getPagBankCharge,
    getPagBankConfig,
    getPagBankOrder,
    PagBankError,
    refundPagBankCharge,
    type PagBankCharge,
} from "@/lib/pagbank";
import { canRefund, validateRefund, type RefundRequest } from "@/lib/refunds";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const pendingMessage = "Existe um estorno sem confirmação. Verifique novamente antes de solicitar outro.";
const refundFields = "id, status, type, requested_amount, amount, charge_id, refunded_before";

function failure(status: number, error: string, pending = false) {
    return NextResponse.json({ success: false, error, pending }, { status });
}

function refundedTotal(charge: PagBankCharge, paid: number) {
    const summary = charge.amount?.summary;
    if (
        charge.amount?.currency !== "BRL" ||
        charge.amount.value !== paid ||
        !summary ||
        summary.paid !== paid ||
        !Number.isSafeInteger(summary.refunded) ||
        summary.refunded < 0 ||
        summary.refunded > paid
    ) {
        throw new Error("Saldo PagBank divergente do pedido.");
    }
    return summary.refunded;
}

export async function POST(request: NextRequest) {
    let adminId: string;
    try {
        const { user } = await requireAdmin();
        adminId = user.id;
    } catch {
        return failure(403, "Acesso não autorizado.");
    }

    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
        return failure(415, "Envie a solicitação como JSON.");
    }

    const body: unknown = await request.json().catch(() => null);
    if (
        !body || typeof body !== "object" ||
        !("orderId" in body) || typeof body.orderId !== "string" || !UUID.test(body.orderId) ||
        !("requestId" in body) || typeof body.requestId !== "string" || !UUID.test(body.requestId)
    ) {
        return failure(400, "Solicitação de reembolso inválida.");
    }

    const { orderId, requestId } = body;
    const refund = (body as Record<string, unknown>) as RefundRequest;
    let stage = "configuração";
    try {
        if (getPagBankConfig().env !== "sandbox") {
            return failure(403, "Os reembolsos pelo checkout estão habilitados apenas no sandbox.");
        }

        stage = "consulta do pedido";
        const db = createAdminClient();
        const { data: order, error: orderError } = await db.from("orders")
            .select("id, status, total, payment_provider, payment_id")
            .eq("id", orderId)
            .maybeSingle();

        if (orderError) throw orderError;
        if (!order) return failure(404, "Pedido não encontrado.");
        if (order.payment_provider !== "pagbank" || !order.payment_id) {
            return failure(400, "O pedido não tem uma cobrança PagBank vinculada.");
        }

        const paymentId: string = order.payment_id;
        const paid = Math.round(Number(order.total) * 100);
        const validationError = validateRefund(refund, paid);
        if (validationError) return failure(400, validationError);

        async function getCharge() {
            const snapshot = await getPagBankOrder(paymentId);
            const charge = snapshot.charges?.[0];
            if (
                snapshot.id !== paymentId || snapshot.reference_id !== orderId ||
                snapshot.charges?.length !== 1 || !charge || !/^CHAR_[A-Za-z0-9-]+$/.test(charge.id)
            ) {
                throw new Error("Cobrança PagBank divergente do pedido.");
            }
            return charge;
        }

        async function complete(id: string, refunded: number) {
            const { error } = await db.rpc("complete_pagbank_refund", {
                p_id: id, p_refunded: refunded, p_paid: paid,
            });
            if (error) throw error;
        }

        async function markFailed() {
            const { error } = await db.from("pagbank_refunds").update({ status: "failed" })
                .eq("id", requestId).eq("status", "processing");
            if (error) throw error;
        }

        const success = (amount: number, refunded: number) => NextResponse.json({
            success: true, amount, remaining: paid - refunded,
        });

        stage = "consulta do histórico";
        const { data: previous, error: previousError } = await db.from("pagbank_refunds")
            .select(refundFields).eq("order_id", orderId).eq("id", requestId).maybeSingle();
        if (previousError) throw previousError;
        if (previous && (previous.type !== refund.type || previous.requested_amount !== refund.amount)) {
            return failure(409, "Os dados desta solicitação de reembolso mudaram.");
        }
        if (previous?.status === "completed") {
            stage = "consulta da cobrança no PagBank";
            return success(previous.amount, refundedTotal(await getCharge(), paid));
        }
        if (previous?.status === "failed") {
            return failure(409, "Esta solicitação foi encerrada. Abra o reembolso novamente para tentar.");
        }

        const { data: active, error: activeError } = await db.from("pagbank_refunds")
            .select(refundFields).eq("order_id", orderId).eq("status", "processing").maybeSingle();
        if (activeError) throw activeError;
        if (active) {
            const pending = `${pendingMessage} Referência: ${active.id}.`;
            if (active.refunded_before === null || !active.charge_id) {
                return failure(409, pending, true);
            }

            stage = "consulta da cobrança no PagBank";
            const charge = await getPagBankCharge(active.charge_id);
            const refunded = refundedTotal(charge, paid);
            if (charge.id !== active.charge_id || refunded !== active.refunded_before + active.amount) {
                return failure(409, pending, true);
            }

            stage = "registro da confirmação";
            await complete(active.id, refunded);
            return success(active.amount, refunded);
        }

        if (!canRefund(order.status)) {
            return failure(400, "Este pedido não está elegível para reembolso.");
        }

        stage = "registro da solicitação";
        const { error: reserveError } = await db.from("pagbank_refunds").insert({
            id: requestId,
            order_id: orderId,
            requested_by: adminId,
            type: refund.type,
            requested_amount: refund.amount,
            amount: refund.amount,
            reason: refund.reason,
            notes: refund.notes ?? "",
        });
        if (reserveError?.code === "23505") return failure(409, pendingMessage, true);
        if (reserveError) throw reserveError;

        let chargeId: string;
        let refundedBefore: number;
        let amount: number;
        try {
            stage = "consulta da cobrança no PagBank";
            const charge = await getCharge();
            chargeId = charge.id;
            refundedBefore = refundedTotal(charge, paid);
            const remaining = paid - refundedBefore;
            amount = refund.type === "total" ? remaining : refund.amount;
            if (charge.status !== "PAID" || remaining <= 0 || amount > remaining) {
                await markFailed();
                return failure(409, "O valor solicitado não está disponível no saldo reembolsável da cobrança.");
            }

            stage = "registro dos dados da cobrança";
            const { error } = await db.from("pagbank_refunds")
                .update({ amount, charge_id: chargeId, refunded_before: refundedBefore })
                .eq("id", requestId).eq("status", "processing");
            if (error) throw error;
        } catch (error) {
            await markFailed();
            throw error;
        }

        let providerDetail = "";
        try {
            const charge = await refundPagBankCharge(chargeId, amount, requestId);
            const refunded = refundedTotal(charge, paid);
            if (charge.id === chargeId && refunded === refundedBefore + amount) {
                await complete(requestId, refunded);
                return success(amount, refunded);
            }
            console.warn("[PagBank] Resposta de estorno sem confirmação", { requestId });
        } catch (error) {
            if (error instanceof PagBankError) {
                const code = error.providerCode ? `, código ${error.providerCode}` : "";
                providerDetail = ` PagBank: HTTP ${error.status}${code}.`;
            }

            console.warn(`[PagBank] Falha na solicitação ou confirmação de estorno ${JSON.stringify({
                requestId,
                status: error instanceof PagBankError ? error.status : undefined,
                code: error instanceof PagBankError ? error.providerCode : undefined,
                errorName: error instanceof Error ? error.name : undefined,
            })}`);

            if (error instanceof PagBankError && [400, 401, 403, 404, 406, 415, 422].includes(error.status)) {
                await markFailed();
                const code = error.providerCode ? ` Código PagBank: ${error.providerCode}.` : "";
                return failure(422, `O PagBank recusou o estorno (HTTP ${error.status}).${code}`);
            }
        }

        // A resposta do POST pode se perder depois de o PagBank aceitar o estorno.
        // Consulte a cobrança sem reenviar uma operação financeira ambígua.
        try {
            const charge = await getPagBankCharge(chargeId);
            const refunded = refundedTotal(charge, paid);
            if (charge.id === chargeId && refunded === refundedBefore + amount) {
                await complete(requestId, refunded);
                return success(amount, refunded);
            }
        } catch (error) {
            console.warn("[PagBank] Falha ao verificar o estorno", {
                requestId,
                status: error instanceof PagBankError ? error.status : undefined,
                code: error instanceof PagBankError ? error.providerCode : undefined,
            });
        }

        return failure(409, `${pendingMessage}${providerDetail} Referência: ${requestId}.`, true);
    } catch (error) {
        const providerStatus = error instanceof PagBankError ? ` (HTTP ${error.status})` : "";
        console.error("[PagBank] Falha ao processar reembolso", { requestId, stage, error });
        return failure(503, `Falha na etapa de ${stage}${providerStatus}. Referência: ${requestId}.`);
    }
}
