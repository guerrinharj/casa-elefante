
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

const labelClassName =
    "font-october text-xl uppercase leading-none text-black";

const inputClassName =
    "w-full min-w-0 rounded-xl border border-black bg-white px-4 py-3 text-base text-black outline-none transition-colors placeholder:text-black/35 focus:ring-2 focus:ring-black/15";

const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-white px-6 py-3 text-base font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[-5px_5px_0_0_#000]";

export function CouponForm() {
    const router = useRouter();

    const supabase = createClient();

    const [code, setCode] =
        useState("");

    const [discountType, setDiscountType] =
        useState<"percentage" | "fixed">(
            "percentage",
        );

    const [discountValue, setDiscountValue] =
        useState("");

    const [minimumOrderValue, setMinimumOrderValue] =
        useState("");

    const [startsAt, setStartsAt] =
        useState("");

    const [expiresAt, setExpiresAt] =
        useState("");

    const [maxUses, setMaxUses] =
        useState("");

    const [wholesaleOnly, setWholesaleOnly] =
        useState(false);

    const [active, setActive] =
        useState(true);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(
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
                    placeholder="CASA10"
                    required
                    className={`${inputClassName} uppercase`}
                />

                <p className="text-sm text-black/60">
                    Código que o cliente digitará no carrinho.
                </p>
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
                        placeholder={
                            discountType === "percentage"
                                ? "10"
                                : "20.00"
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

                <p className="text-sm text-black/60">
                    Deixe vazio para não exigir valor mínimo.
                </p>
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
                    Deixe vazio para usos ilimitados.
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

            <div className="flex justify-end border-t border-black/20 pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className={buttonClassName}
                >
                    {loading
                        ? "Salvando..."
                        : "Criar cupom"}
                </button>
            </div>
        </form>
    );
}
