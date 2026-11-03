
export type RefundType = "total" | "partial";

export type RefundReason =
    | "customer_request"
    | "out_of_stock"
    | "damaged"
    | "wrong_item"
    | "other";

export type RefundStatus =
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled";

export type RefundRequest = {
    orderId: string;
    type: RefundType;
    amount: number;
    reason: RefundReason;
    notes?: string;
};

export const REFUND_REASONS: {
    value: RefundReason;
    label: string;
}[] = [
    {
        value: "customer_request",
        label: "Solicitação do comprador",
    },
    {
        value: "out_of_stock",
        label: "Produto indisponível",
    },
    {
        value: "damaged",
        label: "Produto danificado",
    },
    {
        value: "wrong_item",
        label: "Produto incorreto",
    },
    {
        value: "other",
        label: "Outro motivo",
    },
];

export function canRefund(
    status: string | null | undefined,
): boolean {
    return status === "paid";
}

export function validateRefund(
    request: RefundRequest,
    paidAmount: number,
): string | null {
    if (!request.orderId) {
        return "Pedido inválido.";
    }

    if (
        request.type !== "total" &&
        request.type !== "partial"
    ) {
        return "Tipo de reembolso inválido.";
    }

    if (
        !Number.isSafeInteger(request.amount) ||
        request.amount <= 0
    ) {
        return "Valor de reembolso inválido.";
    }

    if (
        !Number.isSafeInteger(paidAmount) ||
        paidAmount <= 0
    ) {
        return "Valor pago inválido.";
    }

    if (request.amount > paidAmount) {
        return "O reembolso não pode superar o valor pago.";
    }

    if (
        request.type === "total" &&
        request.amount !== paidAmount
    ) {
        return "O reembolso total deve corresponder ao valor pago.";
    }

    if (
        request.type === "partial" &&
        request.amount >= paidAmount
    ) {
        return "O reembolso parcial deve ser inferior ao valor pago.";
    }

    if (
        !REFUND_REASONS.some(
            (reason) => reason.value === request.reason,
        )
    ) {
        return "Motivo do reembolso inválido.";
    }

    if (
        request.notes !== undefined &&
        (
            typeof request.notes !== "string" ||
            request.notes.length > 2000
        )
    ) {
        return "Observações inválidas.";
    }

    return null;
}
