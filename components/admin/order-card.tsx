
"use client";

import Link from "next/link";

import {
    useState,
    type FormEvent,
} from "react";

type ShippingAddress = {
    postalCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
};

type OrderItem = {
    id?: string;
    product_id?: string;
    quantity: number;

    product?: {
        name?: string | null;
        artist?: string | null;
        slug?: string | null;
        format?: string | null;
    } | null;
};

export type Order = {
    id: string;
    customer_name?: string | null;
    customer_email?: string | null;
    total?: number | null;
    status?: string | null;
    shipped?: boolean;
    shipping_address?: ShippingAddress | null;
    items?: OrderItem[];
    created_at?: string | null;
};

type OrderCardProps = {
    order: Order;

    onShippedChange: (
        orderId: string,
        shipped: boolean,
    ) => void;
};

type RefundType = "total" | "partial";

type RefundReason =
    | "customer_request"
    | "out_of_stock"
    | "damaged"
    | "wrong_item"
    | "other";

const REFUND_REASONS: {
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

export function OrderCard({
    order,
    onShippedChange,
}: OrderCardProps) {
    const isPaid = order.status === "paid";

    const [refundOpen, setRefundOpen] = useState(false);
    const [refundType, setRefundType] = useState<RefundType>("total");
    const [refundReason, setRefundReason] = useState<RefundReason>(
        "customer_request",
    );
    const [refundAmount, setRefundAmount] = useState("");
    const [refundNotes, setRefundNotes] = useState("");
    const [refundConfirmed, setRefundConfirmed] = useState(false);
    const [refundLoading, setRefundLoading] = useState(false);
    const [refundError, setRefundError] = useState<string | null>(null);

    const totalCents = Math.round(
        Number(order.total ?? 0) * 100,
    );

    const partialAmount = Number(refundAmount);

    const refundCents =
        refundType === "total"
            ? totalCents
            : Math.round(partialAmount * 100);

    const validRefundAmount =
        Number.isFinite(refundCents) &&
        Number.isSafeInteger(refundCents) &&
        refundCents > 0 &&
        refundCents <= totalCents &&
        (
            refundType === "total" ||
            (
                refundAmount.trim() !== "" &&
                refundCents < totalCents
            )
        );

    function formatPrice(
        value?: number | null,
    ) {
        if (
            value === null ||
            value === undefined
        ) {
            return "—";
        }

        return Number(
            value,
        ).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL",
            },
        );
    }

    function formatDate(
        value?: string | null,
    ) {
        if (!value) {
            return "—";
        }

        return new Date(
            value,
        ).toLocaleString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            },
        );
    }

    function formatPostalCode(
        value?: string,
    ) {
        if (!value) {
            return "—";
        }

        const numbers =
            value.replace(
                /\D/g,
                "",
            );

        if (
            numbers.length !== 8
        ) {
            return value;
        }

        return `${numbers.slice(
            0,
            5,
        )}-${numbers.slice(
            5,
            8,
        )}`;
    }

    function openRefund() {
        if (!isPaid || totalCents <= 0) {
            return;
        }

        setRefundType("total");
        setRefundReason("customer_request");
        setRefundAmount("");
        setRefundNotes("");
        setRefundConfirmed(false);
        setRefundError(null);
        setRefundOpen(true);
    }

    function closeRefund() {
        if (refundLoading) {
            return;
        }

        setRefundOpen(false);
        setRefundError(null);
    }

    async function handleRefund(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (
            !isPaid ||
            !validRefundAmount ||
            !refundConfirmed ||
            refundLoading
        ) {
            return;
        }

        setRefundLoading(true);
        setRefundError(null);

        try {
            const response = await fetch(
                "/api/refunds",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        orderId: order.id,
                        type: refundType,
                        amount: refundCents,
                        reason: refundReason,
                        notes: refundNotes.trim(),
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error ??
                    "Erro ao solicitar reembolso.",
                );
            }

            setRefundOpen(false);

            alert(
                "Solicitação de reembolso enviada.",
            );
        } catch (error) {
            setRefundError(
                error instanceof Error
                    ? error.message
                    : "Erro ao solicitar reembolso.",
            );
        } finally {
            setRefundLoading(false);
        }
    }

    return (
        <>
            <div className="border border-black p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="text-lg font-medium hover:underline"
                        >
                            {order.customer_name ||
                                "Cliente"}
                        </Link>

                        <p className="mt-1 text-sm">
                            {order.customer_email ||
                                "Sem e-mail"}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1 text-left md:text-right">
                        <p className="font-medium">
                            {formatPrice(
                                order.total,
                            )}
                        </p>

                        <p className="text-sm">
                            {order.status ||
                                "Pendente"}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 border-t border-black pt-4 md:grid-cols-2">
                    <div>
                        <p className="text-xs uppercase">
                            Endereço de entrega
                        </p>

                        {order.shipping_address ? (
                            <div className="mt-2 text-sm">
                                <p>
                                    {order
                                        .shipping_address
                                        .street ||
                                        "—"}

                                    {order
                                        .shipping_address
                                        .number
                                        ? `, ${order.shipping_address.number}`
                                        : ""}
                                </p>

                                {order
                                    .shipping_address
                                    .complement && (
                                    <p>
                                        {
                                            order
                                                .shipping_address
                                                .complement
                                        }
                                    </p>
                                )}

                                {order
                                    .shipping_address
                                    .neighborhood && (
                                    <p>
                                        {
                                            order
                                                .shipping_address
                                                .neighborhood
                                        }
                                    </p>
                                )}

                                <p>
                                    {order
                                        .shipping_address
                                        .city ||
                                        "—"}

                                    {order
                                        .shipping_address
                                        .state
                                        ? ` - ${order.shipping_address.state}`
                                        : ""}
                                </p>

                                <p className="mt-1">
                                    CEP:{" "}
                                    {formatPostalCode(
                                        order
                                            .shipping_address
                                            .postalCode,
                                    )}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm">
                                Sem endereço
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-xs uppercase">
                            Produtos
                        </p>

                        {order.items?.length ? (
                            <div className="mt-2 flex flex-col gap-2 text-sm">
                                {order.items.map(
                                    (
                                        item,
                                        index,
                                    ) => (
                                        <div
                                            key={
                                                item.id ??
                                                item.product_id ??
                                                index
                                            }
                                        >
                                            <div className="flex items-center gap-2">
                                                {item.product?.slug ? (
                                                    <Link
                                                        href={`/produtos/${item.product.slug}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {item.product.name ||
                                                            "Produto"}
                                                    </Link>
                                                ) : (
                                                    <p className="font-medium">
                                                        {item.product?.name ||
                                                            "Produto"}
                                                    </p>
                                                )}

                                                <span className="text-xs">
                                                    × {item.quantity}
                                                </span>
                                            </div>

                                            <p className="text-xs opacity-70">
                                                {item.product?.artist ||
                                                    "Artista não informado"}
                                            </p>

                                            {item.product?.format && (
                                                <p className="text-xs opacity-70">
                                                    ({item.product.format})
                                                </p>
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm">
                                Sem produtos
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-4 border-t border-black pt-4 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs">
                        <p>
                            Pedido{" "}
                            {order.id.slice(
                                0,
                                8,
                            )}
                        </p>

                        <p className="mt-1">
                            {formatDate(
                                order.created_at,
                            )}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            disabled={!isPaid}
                            onClick={async () => {
                                if (!window.confirm(
                                    "Deseja solicitar a emissão da NF-e deste pedido?",
                                )) {
                                    return;
                                }

                                try {
                                    const response = await fetch(
                                        `/api/admin/orders/${order.id}/nfe`,
                                        {
                                            method: "POST",
                                        },
                                    );

                                    const data = await response.json();

                                    if (!response.ok) {
                                        throw new Error(
                                            data.error ??
                                            "Erro ao gerar NF-e.",
                                        );
                                    }

                                    alert(
                                        "Solicitação de emissão de NF-e enviada.",
                                    );
                                } catch (error) {
                                    alert(
                                        error instanceof Error
                                            ? error.message
                                            : "Erro ao gerar NF-e.",
                                    );
                                }
                            }}
                            className={`border border-black px-4 py-2 text-sm transition-opacity ${
                                isPaid
                                    ? "hover:opacity-60"
                                    : "cursor-not-allowed opacity-30"
                            }`}
                        >
                            Gerar NF-e
                        </button>

                        <a
                            href={`/api/admin/orders/${order.id}/label`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border border-black px-4 py-2 text-sm transition-opacity hover:opacity-60"
                        >
                            Gerar etiqueta
                        </a>

                        <button
                            type="button"
                            onClick={openRefund}
                            disabled={!isPaid || totalCents <= 0}
                            className={`border border-black px-4 py-2 text-sm transition-opacity ${
                                isPaid && totalCents > 0
                                    ? "hover:opacity-60"
                                    : "cursor-not-allowed opacity-30"
                            }`}
                        >
                            Reembolso
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                onShippedChange(
                                    order.id,
                                    !order.shipped,
                                )
                            }
                            className={`border border-black px-4 py-2 text-sm transition-opacity hover:opacity-60 ${
                                order.shipped
                                    ? "bg-black text-white"
                                    : ""
                            }`}
                        >
                            {order.shipped
                                ? "Enviado"
                                : "Marcar como enviado"}
                        </button>
                    </div>
                </div>
            </div>

            {refundOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget
                        ) {
                            closeRefund();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="refund-title"
                        className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-black bg-white p-6 text-black shadow-xl"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="refund-title"
                                    className="text-xl font-medium"
                                >
                                    Solicitar reembolso
                                </h2>

                                <p className="mt-1 text-sm opacity-60">
                                    Pedido {order.id.slice(0, 8)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeRefund}
                                disabled={refundLoading}
                                className="text-2xl leading-none hover:opacity-60 disabled:opacity-30"
                                aria-label="Fechar"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleRefund}
                            className="flex flex-col gap-5"
                        >
                            <div className="border border-black p-4">
                                <p className="text-xs uppercase opacity-60">
                                    Valor do pedido
                                </p>

                                <p className="mt-2 text-2xl font-medium">
                                    {formatPrice(order.total)}
                                </p>
                            </div>

                            <div>
                                <p className="mb-3 text-xs uppercase">
                                    Tipo de reembolso
                                </p>

                                <div className="flex flex-col gap-3 text-sm">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`refund-type-${order.id}`}
                                            checked={refundType === "total"}
                                            onChange={() => {
                                                setRefundType("total");
                                            }}
                                        />

                                        Reembolso total
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`refund-type-${order.id}`}
                                            checked={refundType === "partial"}
                                            onChange={() => {
                                                setRefundType("partial");
                                            }}
                                        />

                                        Reembolso parcial
                                    </label>
                                </div>
                            </div>

                            {refundType === "partial" && (
                                <div>
                                    <label
                                        htmlFor={`refund-amount-${order.id}`}
                                        className="mb-2 block text-xs uppercase"
                                    >
                                        Valor do reembolso (R$)
                                    </label>

                                    <input
                                        id={`refund-amount-${order.id}`}
                                        type="number"
                                        min="0.01"
                                        max={Math.max(
                                            0,
                                            (totalCents - 1) / 100,
                                        )}
                                        step="0.01"
                                        value={refundAmount}
                                        onChange={(event) => {
                                            setRefundAmount(
                                                event.target.value,
                                            );
                                        }}
                                        required
                                        placeholder="0,00"
                                        className="w-full border border-black bg-white px-3 py-2 text-sm outline-none"
                                    />
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor={`refund-reason-${order.id}`}
                                    className="mb-2 block text-xs uppercase"
                                >
                                    Motivo do reembolso
                                </label>

                                <select
                                    id={`refund-reason-${order.id}`}
                                    value={refundReason}
                                    onChange={(event) => {
                                        setRefundReason(
                                            event.target.value as RefundReason,
                                        );
                                    }}
                                    className="w-full border border-black bg-white px-3 py-2 text-sm outline-none"
                                >
                                    {REFUND_REASONS.map((reason) => (
                                        <option
                                            key={reason.value}
                                            value={reason.value}
                                        >
                                            {reason.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor={`refund-notes-${order.id}`}
                                    className="mb-2 block text-xs uppercase"
                                >
                                    Observações internas
                                </label>

                                <textarea
                                    id={`refund-notes-${order.id}`}
                                    value={refundNotes}
                                    onChange={(event) => {
                                        setRefundNotes(
                                            event.target.value,
                                        );
                                    }}
                                    maxLength={2000}
                                    rows={4}
                                    placeholder="Descreva os detalhes do reembolso..."
                                    className="w-full resize-none border border-black bg-white px-3 py-2 text-sm outline-none"
                                />
                            </div>

                            <div className="border border-black p-4 text-sm">
                                <p className="font-medium">
                                    Atenção
                                </p>

                                <p className="mt-2 opacity-70">
                                    O sistema de reembolsos ainda
                                    está em desenvolvimento.
                                    Nenhum valor será estornado
                                    nesta etapa.
                                </p>
                            </div>

                            <label className="flex cursor-pointer items-start gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={refundConfirmed}
                                    onChange={(event) => {
                                        setRefundConfirmed(
                                            event.target.checked,
                                        );
                                    }}
                                    className="mt-1"
                                />

                                <span>
                                    Confirmo que revisei os dados
                                    desta solicitação.
                                </span>
                            </label>

                            {refundError && (
                                <div
                                    role="alert"
                                    className="border border-red-600 p-3 text-sm text-red-600"
                                >
                                    {refundError}
                                </div>
                            )}

                            <div className="flex flex-wrap justify-end gap-3 border-t border-black pt-5">
                                <button
                                    type="button"
                                    onClick={closeRefund}
                                    disabled={refundLoading}
                                    className="border border-black px-4 py-2 text-sm transition-opacity hover:opacity-60 disabled:opacity-30"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        !validRefundAmount ||
                                        !refundConfirmed ||
                                        refundLoading
                                    }
                                    className={`border border-black bg-black px-4 py-2 text-sm text-white transition-opacity ${
                                        validRefundAmount &&
                                        refundConfirmed &&
                                        !refundLoading
                                            ? "hover:opacity-60"
                                            : "cursor-not-allowed opacity-30"
                                    }`}
                                >
                                    {refundLoading
                                        ? "Verificando..."
                                        : "Validar solicitação"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
