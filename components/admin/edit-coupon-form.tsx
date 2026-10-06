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

type Coupon = {
    id: string;
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    minimum_order_value: number | null;
    starts_at: string | null;
    expires_at: string | null;
    max_uses: number | null;
    usage_count: number;
    wholesale_only: boolean;
    active: boolean;
};

type EditCouponFormProps = {
    coupon: Coupon;
};

function toDateTimeLocal(
    value: string | null,
) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    const offset =
        date.getTimezoneOffset();

    const localDate = new Date(
        date.getTime() -
            offset * 60 * 1000,
    );

    return localDate
        .toISOString()
        .slice(0, 16);
}

export function EditCouponForm({
    coupon,
}: EditCouponFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [code, setCode] =
        useState(coupon.code);

    const [
        discountType,
        setDiscountType,
    ] = useState<"percentage" | "fixed">(
        coupon.discount_type,
    );

    const [
        discountValue,
        setDiscountValue,
    ] = useState(
        String(coupon.discount_value),
    );

    const [
        minimumOrderValue,
        setMinimumOrderValue,
    ] = useState(
        coupon.minimum_order_value !== null
            ? String(
                  coupon.minimum_order_value,
              )
            : "",
    );

    const [
        startsAt,
        setStartsAt,
    ] = useState(
        toDateTimeLocal(
            coupon.starts_at,
        ),
    );

    const [
        expiresAt,
        setExpiresAt,
    ] = useState(
        toDateTimeLocal(
            coupon.expires_at,
        ),
    );

    const [
        maxUses,
        setMaxUses,
    ] = useState(
        coupon.max_uses !== null
            ? String(coupon.max_uses)
            : "",
    );

    const [
        wholesaleOnly,
        setWholesaleOnly,
    ] = useState(
        coupon.wholesale_only,
    );

    const [
        active,
        setActive,
    ] = useState(
        coupon.active,
    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
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
            discountType ===
                "percentage" &&
            parsedDiscountValue > 100
        ) {
            setError(
                "O desconto percentual não pode ser maior que 100%.",
            );
            return;
        }

        const parsedMinimumOrderValue =
            minimumOrderValue
                ? Number(
                      minimumOrderValue,
                  )
                : 0;

        if (
            parsedMinimumOrderValue < 0
        ) {
            setError(
                "O valor mínimo do pedido não pode ser negativo.",
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

        if (
            parsedMaxUses !== null &&
            parsedMaxUses <
                coupon.usage_count
        ) {
            setError(
                `Este cupom já foi usado ${coupon.usage_count} vez(es). O limite não pode ser menor que isso.`,
            );
            return;
        }

        setLoading(true);

        const {
            error: updateError,
        } = await supabase
            .from("coupons")
            .update({
                code: normalizedCode,

                discount_type:
                    discountType,

                discount_value:
                    parsedDiscountValue,

                minimum_order_value:
                    parsedMinimumOrderValue,

                starts_at:
                    startsAt || null,

                expires_at:
                    expiresAt || null,

                max_uses:
                    parsedMaxUses,

                wholesale_only:
                    wholesaleOnly,

                active,
            })
            .eq("id", coupon.id);

        if (updateError) {
            console.error(
                "Erro ao atualizar cupom:",
                updateError,
            );

            if (
                updateError.code ===
                "23505"
            ) {
                setError(
                    "Já existe um cupom com esse código.",
                );
            } else {
                setError(
                    "Não foi possível atualizar o cupom.",
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

    async function handleDelete() {
        const confirmed =
            window.confirm(
                `Tem certeza que deseja excluir o cupom "${coupon.code}"?`,
            );

        if (!confirmed) {
            return;
        }

        setError(null);
        setDeleting(true);

        const {
            error: deleteError,
        } = await supabase
            .from("coupons")
            .delete()
            .eq("id", coupon.id);

        if (deleteError) {
            console.error(
                "Erro ao excluir cupom:",
                deleteError,
            );

            setError(
                "Não foi possível excluir o cupom.",
            );

            setDeleting(false);
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
                    required
                    className="border border-black bg-transparent px-3 py-2 uppercase outline-none"
                />
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
                        value={discountType}
                        onChange={(event) =>
                            setDiscountType(
                                event.target.value as
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
                        value={discountValue}
                        onChange={(event) =>
                            setDiscountValue(
                                event.target.value,
                            )
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
                    value={minimumOrderValue}
                    onChange={(event) =>
                        setMinimumOrderValue(
                            event.target.value,
                        )
                    }
                    placeholder="0.00"
                    className="border border-black bg-transparent px-3 py-2 outline-none"
                />
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
                        onChange={(event) =>
                            setStartsAt(
                                event.target.value,
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
                        onChange={(event) =>
                            setExpiresAt(
                                event.target.value,
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
                    Usos atuais:{" "}
                    {coupon.usage_count}
                </p>
            </div>

            <div className="border-t border-black pt-6">
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={wholesaleOnly}
                        onChange={(event) =>
                            setWholesaleOnly(
                                event.target.checked,
                            )
                        }
                    />

                    <span className="text-sm">
                        Exclusivo para atacadistas
                    </span>
                </label>
            </div>

            <div>
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(event) =>
                            setActive(
                                event.target.checked,
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

            <div className="flex items-center justify-between border-t border-black pt-6">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={
                        loading ||
                        deleting
                    }
                    className="text-sm underline transition-opacity hover:opacity-60 disabled:opacity-40"
                >
                    {deleting
                        ? "Excluindo..."
                        : "Excluir cupom"}
                </button>

                <button
                    type="submit"
                    disabled={
                        loading ||
                        deleting
                    }
                    className="border border-black px-6 py-3 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {loading
                        ? "Salvando..."
                        : "Salvar alterações"}
                </button>
            </div>
        </form>
    );
}