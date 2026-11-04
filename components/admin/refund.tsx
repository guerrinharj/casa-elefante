
"use client";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";

import {
    canRefund,
    REFUND_REASONS,
    type RefundType,
    type RefundReason,
} from "@/lib/refunds";

type RefundProps = {
    orderId: string;
    status?: string | null;
    total: number;
};

export function Refund({
    orderId,
    status,
    total,
}: RefundProps) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<RefundType>("total");
    const [reason, setReason] = useState<RefundReason>(
        "customer_request",
    );
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const eligible = canRefund(status);

    const totalCents = Math.round(total * 100);

    const refundCents =
        type === "total"
            ? totalCents
            : Math.round(Number(amount) * 100);

    const validAmount =
        Number.isSafeInteger(refundCents) &&
        refundCents > 0 &&
        refundCents <= totalCents &&
        (
            type === "total" ||
            refundCents < totalCents
        );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener(
                "keydown",
                handleEscape,
            );
        };
    }, [open]);

    function openDialog() {
        if (!eligible) {
            return;
        }

        setType("total");
        setReason("customer_request");
        setAmount("");
        setNotes("");
        setConfirmed(false);
        setError(null);
        setOpen(true);
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (
            !eligible ||
            !validAmount ||
            !confirmed ||
            loading
        ) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/refunds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId,
                    type,
                    amount: refundCents,
                    reason,
                    notes: notes.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(
                    result.error ||
                    "Não foi possível solicitar o reembolso.",
                );
                return;
            }

            setOpen(false);
        } catch {
            setError(
                "Erro de conexão. Tente novamente.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={openDialog}
                disabled={!eligible}
                title={
                    eligible
                        ? "Solicitar reembolso"
                        : "Disponível apenas para pedidos pagos"
                }
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
                Solicitar reembolso
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !loading
                        ) {
                            setOpen(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="refund-title"
                        className="w-full max-w-lg rounded-xl bg-[#FFFDE9] p-6 text-zinc-900 shadow-xl dark:bg-zinc-900 dark:text-white"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="refund-title"
                                    className="text-xl font-semibold"
                                >
                                    Solicitar reembolso
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Pedido #{orderId.slice(0, 8)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                                aria-label="Fechar"
                                className="text-xl text-zinc-500 hover:text-zinc-900 disabled:opacity-40 dark:hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
                                <p className="text-sm text-zinc-500">
                                    Valor do pedido
                                </p>

                                <p className="mt-1 text-2xl font-semibold">
                                    {formatCurrency(total)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                    Tipo de reembolso
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="refundType"
                                        checked={type === "total"}
                                        onChange={() => setType("total")}
                                    />
                                    Reembolso total
                                </label>

                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="refundType"
                                        checked={type === "partial"}
                                        onChange={() => setType("partial")}
                                    />
                                    Reembolso parcial
                                </label>
                            </div>

                            {type === "partial" && (
                                <div className="space-y-2">
                                    <label
                                        htmlFor="refund-amount"
                                        className="block text-sm font-medium"
                                    >
                                        Valor do reembolso (R$)
                                    </label>

                                    <input
                                        id="refund-amount"
                                        type="number"
                                        min="0.01"
                                        max={Math.max(
                                            0,
                                            (totalCents - 1) / 100,
                                        )}
                                        step="0.01"
                                        value={amount}
                                        onChange={(event) => {
                                            setAmount(event.target.value);
                                        }}
                                        required
                                        className="w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                                        placeholder="0,00"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label
                                    htmlFor="refund-reason"
                                    className="block text-sm font-medium"
                                >
                                    Motivo
                                </label>

                                <select
                                    id="refund-reason"
                                    value={reason}
                                    onChange={(event) => {
                                        setReason(
                                            event.target.value as RefundReason,
                                        );
                                    }}
                                    className="w-full rounded-lg border border-zinc-300 bg-[#FFFDE9] px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                                >
                                    {REFUND_REASONS.map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="refund-notes"
                                    className="block text-sm font-medium"
                                >
                                    Observações internas
                                </label>

                                <textarea
                                    id="refund-notes"
                                    value={notes}
                                    onChange={(event) => {
                                        setNotes(event.target.value);
                                    }}
                                    maxLength={2000}
                                    rows={3}
                                    placeholder="Detalhes do reembolso..."
                                    className="w-full resize-none rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                                />
                            </div>

                            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                O sistema de reembolsos ainda está em
                                desenvolvimento. Nenhum valor será
                                estornado nesta etapa.
                            </div>

                            <label className="flex items-start gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={confirmed}
                                    onChange={(event) => {
                                        setConfirmed(event.target.checked);
                                    }}
                                    className="mt-1"
                                />

                                <span>
                                    Confirmo que revisei os dados
                                    desta solicitação.
                                </span>
                            </label>

                            {error && (
                                <p
                                    role="alert"
                                    className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                                >
                                    {error}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    disabled={loading}
                                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm disabled:opacity-40 dark:border-zinc-700"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        !validAmount ||
                                        !confirmed ||
                                        loading
                                    }
                                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 dark:bg-[#FFFDE9] dark:text-zinc-900"
                                >
                                    {loading
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
