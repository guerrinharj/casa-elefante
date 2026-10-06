"use client";

import {
    FormEvent,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    createClient,
} from "@/lib/supabase/client";

export function CouponForm() {
    const router = useRouter();

    const supabase = createClient();

    const [
        code,
        setCode,
    ] = useState("");

    const [
        discountType,
        setDiscountType,
    ] = useState<
        "percentage" | "fixed"
    >("percentage");

    const [
        discountValue,
        setDiscountValue,
    ] = useState("");

    const [
        minimumOrderValue,
        setMinimumOrderValue,
    ] = useState("");

    const [
        startsAt,
        setStartsAt,
    ] = useState("");

    const [
        expiresAt,
        setExpiresAt,
    ] = useState("");

    const [
        maxUses,
        setMaxUses,
    ] = useState("");

    const [
        wholesaleOnly,
        setWholesaleOnly,
    ] = useState(false);

    const [
        active,
        setActive,
    ] = useState(true);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        const normalizedCode =
            code.trim().toUpperCase();

        if (!normalizedCode) {
            setError(
                "Informe o código do cupom.",
            );
            return;
        }

        const parsedDiscountValue =
            Number(discountValue);

        if (
            !parsedDiscountValue ||
            parsedDiscountValue <= 0
        ) {
            setError(
                "Informe um valor de desconto válido.",
            );
            return;
        }

        if (
            discountType === "percentage" &&
            parsedDiscountValue > 100
        ) {
            setError(
                "O desconto percentual não pode ser maior que 100%.",
            );
            return;
        }

        if (
            startsAt &&
            expiresAt &&
            new Date(expiresAt) <=
                new Date(startsAt)
        ) {
            setError(
                "A data de expiração precisa ser posterior à data de início.",
            );
            return;
        }

        const parsedMaxUses =
            maxUses
                ? Number(maxUses)
                : null;

        if (
            parsedMaxUses !== null &&
            (
                !Number.isInteger(
                    parsedMaxUses,
                ) ||
                parsedMaxUses <= 0
            )
        ) {
            setError(
                "O limite de usos precisa ser um número inteiro maior que zero.",
            );
            return;
        }

        setLoading(true);

        const {
            error: insertError,
        } = await supabase
            .from("coupons")
            .insert({
                code: normalizedCode,

                discount_type:
                    discountType,

                discount_value:
                    parsedDiscountValue,

                minimum_order_value:
                    minimumOrderValue
                        ? Number(
                              minimumOrderValue,
                          )
                        : 0,

                starts_at:
                    startsAt || null,

                expires_at:
                    expiresAt || null,

                max_uses:
                    parsedMaxUses,

                wholesale_only:
                    wholesaleOnly,

                active,
            });

        if (insertError) {
            console.error(
                "Erro ao criar cupom:",
                insertError,
            );

            if (
                insertError.code ===
                "23505"
            ) {
                setError(
                    "Já existe um cupom com esse código.",
                );
            } else {
                setError(
                    "Não foi possível criar o cupom.",
                );
            }

            setLoading(false);

            return;
        }

        router.push(
            "/admin/cupons",
        );

        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-8"
        >
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="code"
                    className="text-sm"
                >
                    Código
                </label>

                <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(event) =>
                        setCode(
                            event.target.value.toUpperCase(),
                        )
                    }
                    placeholder="CASA10"
                    required
                    className="border border-black bg-transparent px-3 py-2 uppercase outline-none"
                />

                <p className="text-xs opacity-60">
                    Código que o cliente
                    digitará no carrinho.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="discountType"
                        className="text-sm"
                    >
                        Tipo de desconto
                    </label>

                    <select
                        id="discountType"
                        value={
                            discountType
                        }
                        onChange={(
                            event,
                        ) =>
                            setDiscountType(
                                event.target
                                    .value as
                                    | "percentage"
                                    | "fixed",
                            )
                        }
                        className="border border-black bg-transparent px-3 py-2 outline-none"
                    >
                        <option value="percentage">
                            Porcentagem (%)
                        </option>

                        <option value="fixed">
                            Valor fixo (R$)
                        </option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="discountValue"
                        className="text-sm"
                    >
                        {discountType ===
                        "percentage"
                            ? "Porcentagem"
                            : "Valor do desconto"}
                    </label>

                    <input
                        id="discountValue"
                        type="number"
                        min="0.01"
                        max={
                            discountType ===
                            "percentage"
                                ? "100"
                                : undefined
                        }
                        step="0.01"
                        value={
                            discountValue
                        }
                        onChange={(
                            event,
                        ) =>
                            setDiscountValue(
                                event.target
                                    .value,
                            )
                        }
                        placeholder={
                            discountType ===
                            "percentage"
                                ? "10"
                                : "20.00"
                        }
                        required
                        className="border border-black bg-transparent px-3 py-2 outline-none"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="minimumOrderValue"
                    className="text-sm"
                >
                    Valor mínimo do pedido
                </label>

                <input
                    id="minimumOrderValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                        minimumOrderValue
                    }
                    onChange={(event) =>
                        setMinimumOrderValue(
                            event.target.value,
                        )
                    }
                    placeholder="0.00"
                    className="border border-black bg-transparent px-3 py-2 outline-none"
                />

                <p className="text-xs opacity-60">
                    Deixe vazio para não
                    exigir valor mínimo.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="startsAt"
                        className="text-sm"
                    >
                        Início
                    </label>

                    <input
                        id="startsAt"
                        type="datetime-local"
                        value={startsAt}
                        onChange={(
                            event,
                        ) =>
                            setStartsAt(
                                event.target
                                    .value,
                            )
                        }
                        className="border border-black bg-transparent px-3 py-2 outline-none"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="expiresAt"
                        className="text-sm"
                    >
                        Expiração
                    </label>

                    <input
                        id="expiresAt"
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(
                            event,
                        ) =>
                            setExpiresAt(
                                event.target
                                    .value,
                            )
                        }
                        className="border border-black bg-transparent px-3 py-2 outline-none"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="maxUses"
                    className="text-sm"
                >
                    Limite de usos
                </label>

                <input
                    id="maxUses"
                    type="number"
                    min="1"
                    step="1"
                    value={maxUses}
                    onChange={(event) =>
                        setMaxUses(
                            event.target.value,
                        )
                    }
                    placeholder="Sem limite"
                    className="border border-black bg-transparent px-3 py-2 outline-none"
                />

                <p className="text-xs opacity-60">
                    Deixe vazio para usos
                    ilimitados.
                </p>
            </div>

            <div className="border-t border-black pt-6">
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={
                            wholesaleOnly
                        }
                        onChange={(
                            event,
                        ) =>
                            setWholesaleOnly(
                                event.target
                                    .checked,
                            )
                        }
                    />

                    <span className="text-sm">
                        Exclusivo para
                        atacadistas
                    </span>
                </label>
            </div>

            <div>
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(
                            event,
                        ) =>
                            setActive(
                                event.target
                                    .checked,
                            )
                        }
                    />

                    <span className="text-sm">
                        Cupom ativo
                    </span>
                </label>
            </div>

            {error && (
                <div className="border border-black p-4 text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end border-t border-black pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="border border-black px-6 py-3 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {loading
                        ? "Salvando..."
                        : "Criar cupom"}
                </button>
            </div>
        </form>
    );
}