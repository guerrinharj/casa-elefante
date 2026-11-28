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
    const [fullyRefunded, setFullyRefunded] = useState(false);
    const [refundRequestId, setRefundRequestId] = useState("");
    const isPaid = order.status === "paid" && !fullyRefunded;
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
        setRefundRequestId(crypto.randomUUID());
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
                        requestId: refundRequestId,
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
            setFullyRefunded(data.remaining === 0);
            alert(`Estorno de ${formatPrice(data.amount / 100)} confirmado pelo PagBank.`);
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
            <div className="rounded-xl border border-black bg-white p-5 text-black shadow-[-5px_5px_0_0_#000] md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="font-october text-3xl uppercase leading-none text-black hover:underline md:text-4xl"
                        >
                            {order.customer_name ||
                                "Cliente"}
                        </Link>
                        <p className="mt-2 text-sm text-black/65">
                            {order.customer_email ||
                                "Sem e-mail"}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 text-left md:text-right">
                        <p className=" text-3xl  leading-none text-black">
                            {formatPrice(
                                order.total,
                            )}
                        </p>
                        <p className="text-xl  leading-none text-black/70">
                            {(fullyRefunded ? "refunded" : order.status) ||
                                "Pendente"}
                        </p>
                    </div>
                </div>
                <div className="mt-6 grid gap-6 border-t border-black/20 pt-5 md:grid-cols-2">
                    <div>
                        <p className=" text-xl  leading-none text-black">
                            Endereço de entrega
                        </p>
                        {order.shipping_address ? (
                            <div className="mt-3 text-sm leading-relaxed text-black/80">
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
                            <p className="mt-3 text-sm leading-relaxed text-black/80">
                                Sem endereço
                            </p>
                        )}
                    </div>
                    <div>
                        <p className=" text-xl  leading-none text-black">
                            Produtos
                        </p>
                        {order.items?.length ? (
                            <div className="mt-3 flex flex-col gap-3 text-sm">
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
                            className="font-medium text-black hover:underline"
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
                                                <span className="text-xs text-black/60">
                                                    × {item.quantity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-black/60">
                                                {item.product?.artist ||
                                                    "Artista não informado"}
                                            </p>
                                            {item.product?.format && (
                                                <p className="text-xs text-black/60">
                                                    ({item.product.format})
                                                </p>
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>
                        ) : (
                            <p className="mt-3 text-sm leading-relaxed text-black/80">
                                Sem produtos
                            </p>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex flex-col gap-5 border-t border-black/20 pt-5">
                    <div className="text-xs text-black/60">
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
                    <div className="flex flex-wrap items-center gap-4">
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
                            className={`rounded-xl border border-black bg-white px-4 py-3  text-xl  leading-none text-black shadow-[-4px_4px_0_0_#000] transition-all duration-200 ${
                                isPaid
                                    ? "hover:-translate-y-1 hover:shadow-[-4px_8px_0_0_#000]"
                                    : "cursor-not-allowed opacity-40"
                            }`}
                        >
                            Gerar NF-e
                        </button>
                        <a
                            href={`/api/admin/orders/${order.id}/label`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-black bg-white px-4 py-3  text-xl  leading-none text-black shadow-[-4px_4px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-4px_8px_0_0_#000]"
                        >
                            Gerar etiqueta
                        </a>
                        <button
                            type="button"
                            onClick={openRefund}
                            disabled={!isPaid || totalCents <= 0}
                            className={`rounded-xl border border-black bg-white px-4 py-3  text-xl  leading-none text-black shadow-[-4px_4px_0_0_#000] transition-all duration-200 ${
                                isPaid && totalCents > 0
                                    ? "hover:-translate-y-1 hover:shadow-[-4px_8px_0_0_#000]"
                                    : "cursor-not-allowed opacity-40"
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
                            className={`rounded-xl border border-black text-black bg-white px-4 py-3  text-xl  leading-none text-black shadow-[-4px_4px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-4px_8px_0_0_#000] ${
                                order.shipped
                                    ? "bg-black"
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
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
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
                            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-black bg-[#FFFDE9] p-6 text-black shadow-[-6px_6px_0_0_#000]"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2
                            id="refund-title"
                            className="text-4xl  leading-none text-black"
                                >
                                    Solicitar reembolso
                                </h2>
                                <p className="mt-2 text-sm text-black/60">
                                    Pedido {order.id.slice(0, 8)}
                                </p>
                            </div>
                            <button
                            type="button"
                            onClick={closeRefund}
                            disabled={refundLoading}
                            className="rounded-lg border border-black bg-white px-3 py-1 text-2xl leading-none transition-opacity hover:opacity-60 disabled:opacity-30"
aria-label="Fechar"
                            >
                                ×
                            </button>
                        </div>
                        <form
                            onSubmit={handleRefund}
                            className="flex flex-col gap-5"
                        >
                            <div className="rounded-xl border border-black bg-white p-4">
                                <p className="font-october text-xl uppercase leading-none text-black/70">
                                    Valor do pedido
                                </p>
                                <p className="mt-2 font-october text-3xl uppercase leading-none text-black">
                                    {formatPrice(order.total)}
                                </p>
                            </div>
                            <div>
                                <p className="mb-3 font-october text-xl uppercase leading-none text-black">
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
                            className="mb-2 block font-october text-xl uppercase leading-none text-black"
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
                            className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black/15"
                                    />
                                </div>
                            )}
                            <div>
                                <label
htmlFor={`refund-reason-${order.id}`}
                            className="mb-2 block font-october text-xl uppercase leading-none text-black"
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
                            className="w-full rounded-xl border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black/15"
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
                            className="mb-2 block font-october text-xl uppercase leading-none text-black"
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
                            className="w-full resize-none rounded-xl border border-black bg-white px-4 py-3 text-sm text-black outline-none focus:ring-2 focus:ring-black/15"
                                />
                            </div>
                            <div className="rounded-xl border border-black bg-white p-4 text-sm">
                                <p className="font-medium">
                                    Atenção
                                </p>
                                <p className="mt-2 text-black/70">
                                    Esta ação solicita um estorno no sandbox do PagBank.
                                    O reembolso total devolve todo o saldo disponível da cobrança.
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
                            className="rounded-xl border border-red-600 bg-red-50 p-3 text-sm text-red-600"
                                >
                                    {refundError}
                                </div>
                            )}
                            <div className="flex flex-wrap justify-end gap-4 border-t border-black/20 pt-5">
                                <button
                            type="button"
                            onClick={closeRefund}
                            disabled={refundLoading}
                            className="rounded-xl border border-black bg-white px-4 py-3 font-october text-xl uppercase leading-none text-black shadow-[-4px_4px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-4px_8px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-40"
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
                            className={`rounded-xl border border-black bg-white px-4 py-3 font-october text-xl uppercase leading-none text-black shadow-[-4px_4px_0_0_#000] transition-all duration-200 ${
                                        validRefundAmount &&
                                        refundConfirmed &&
                                        !refundLoading
                                            ? "hover:-translate-y-1 hover:shadow-[-4px_8px_0_0_#000]"
                                            : "cursor-not-allowed opacity-40"
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
