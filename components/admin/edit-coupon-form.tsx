
"use client";

import {
    type FormEvent,
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

const labelClassName =
    "font-october text-xl uppercase leading-none text-black";

const inputClassName =
    "w-full min-w-0 rounded-xl border border-black bg-white px-4 py-3 text-base text-black outline-none transition-colors placeholder:text-black/35 focus:ring-2 focus:ring-black/15";

const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-white px-6 py-3 text-base font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[-5px_5px_0_0_#000]";

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

    const [discountType, setDiscountType] =
        useState<"percentage" | "fixed">(
            coupon.discount_type,
        );

    const [discountValue, setDiscountValue] =
        useState(
            String(coupon.discount_value),
        );

    const [
        minimumOrderValue,
        setMinimumOrderValue,
    ] = useState(
        coupon.minimum_order_value !== null
            ? String(coupon.minimum_order_value)
            : "",
    );

    const [startsAt, setStartsAt] =
        useState(
            toDateTimeLocal(coupon.starts_at),
        );

    const [expiresAt, setExpiresAt] =
        useState(
            toDateTimeLocal(coupon.expires_at),
        );

    const [maxUses, setMaxUses] =
        useState(
            coupon.max_uses !== null
                ? String(coupon.max_uses)
                : "",
        );

    const [wholesaleOnly, setWholesaleOnly] =
        useState(coupon.wholesale_only);

    const [active, setActive] =
        useState(coupon.active);

    const [loading, setLoading] =
        useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

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

        const parsedMinimumOrderValue =
            minimumOrderValue
                ? Number(minimumOrderValue)
                : 0;

        if (parsedMinimumOrderValue < 0) {
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
                !Number.isInteger(parsedMaxUses) ||
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
            parsedMaxUses < coupon.usage_count
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
                updateError.code === "23505"
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

        router.push("/admin/cupons");
        router.refresh();
    }

    async function handleDelete() {
        const confirmed = window.confirm(
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

        router.push("/admin/cupons");
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-8 text-black"
        >
            <div className="flex flex-col gap-3">
                <label
                    htmlFor="code"
                    className={labelClassName}
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
                    className={`${inputClassName} uppercase`}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-3">
                    <label
                        htmlFor="discountType"
                        className={labelClassName}
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
                        className={inputClassName}
                    >
                        <option value="percentage">
                            Porcentagem (%)
                        </option>

                        <option value="fixed">
                            Valor fixo (R$)
                        </option>
                    </select>
                </div>

                <div className="flex min-w-0 flex-col gap-3">
                    <label
                        htmlFor="discountValue"
                        className={labelClassName}
                    >
                        {discountType === "percentage"
                            ? "Porcentagem"
                            : "Valor do desconto"}
                    </label>

                    <input
                        id="discountValue"
                        type="number"
                        min="0.01"
                        max={
                            discountType === "percentage"
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
                        className={inputClassName}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <label
                    htmlFor="minimumOrderValue"
                    className={labelClassName}
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
                    className={inputClassName}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-3">
                    <label
                        htmlFor="startsAt"
                        className={labelClassName}
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
                        className={inputClassName}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-3">
                    <label
                        htmlFor="expiresAt"
                        className={labelClassName}
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
                        className={inputClassName}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <label
                    htmlFor="maxUses"
                    className={labelClassName}
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
                    className={inputClassName}
                />

                <p className="text-sm text-black/60">
                    Usos atuais: {coupon.usage_count}
                </p>
            </div>

            <div className="flex flex-col gap-5 border-t border-black/20 pt-6">
                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={wholesaleOnly}
                        onChange={(event) =>
                            setWholesaleOnly(
                                event.target.checked,
                            )
                        }
                        className="h-5 w-5 shrink-0 accent-black"
                    />

                    <span className="text-base text-black">
                        Exclusivo para atacadistas
                    </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={active}
                        onChange={(event) =>
                            setActive(
                                event.target.checked,
                            )
                        }
                        className="h-5 w-5 shrink-0 accent-black"
                    />

                    <span className="text-base text-black">
                        Cupom ativo
                    </span>
                </label>
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-black bg-white p-4 text-sm text-[#D2232A] shadow-[-3px_3px_0_0_#000]"
                >
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-5 border-t border-black/20 pt-6">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading || deleting}
                    className={buttonClassName}
                >
                    {deleting
                        ? "Excluindo..."
                        : "Excluir cupom"}
                </button>

                <button
                    type="submit"
                    disabled={loading || deleting}
                    className={buttonClassName}
                >
                    {loading
                        ? "Salvando..."
                        : "Salvar alterações"}
                </button>
            </div>
        </form>
    );
}
