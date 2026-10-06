import Link from "next/link";

import {
    revalidatePath,
} from "next/cache";

import {
    createClient,
} from "@/lib/supabase/server";

function formatDiscount(
    type: string,
    value: number,
) {
    if (type === "percentage") {
        return `${value}%`;
    }

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function formatDate(
    date: string | null,
) {
    if (!date) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(
        new Date(date),
    );
}

function getCouponStatus(
    active: boolean,
    startsAt: string | null,
    expiresAt: string | null,
) {
    if (!active) {
        return "Inativo";
    }

    const now = new Date();

    if (
        startsAt &&
        new Date(startsAt) > now
    ) {
        return "Agendado";
    }

    if (
        expiresAt &&
        new Date(expiresAt) < now
    ) {
        return "Expirado";
    }

    return "Ativo";
}

export default async function AdminCouponsPage() {
    const supabase =
        await createClient();

    async function deleteCoupon(
        formData: FormData,
    ) {
        "use server";

        const couponId =
            formData.get("couponId");

        if (
            !couponId ||
            typeof couponId !== "string"
        ) {
            return;
        }

        const supabase =
            await createClient();

        const {
            error,
        } = await supabase
            .from("coupons")
            .delete()
            .eq(
                "id",
                couponId,
            );

        if (error) {
            console.error(
                "Erro ao excluir cupom:",
                error,
            );

            return;
        }

        revalidatePath(
            "/admin/cupons",
        );
    }

    const {
        data: coupons,
        error,
    } = await supabase
        .from("coupons")
        .select(`
            id,
            code,
            discount_type,
            discount_value,
            minimum_order_value,
            starts_at,
            expires_at,
            max_uses,
            usage_count,
            wholesale_only,
            active,
            created_at
        `)
        .order(
            "created_at",
            {
                ascending: false,
            },
        );

    if (error) {
        console.error(
            "Erro ao carregar cupons:",
            error,
        );
    }

    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-medium">
                        Cupons
                    </h1>

                    <Link
                        href="/admin/cupons/novo"
                        className="border border-black px-4 py-2 transition-opacity hover:opacity-60"
                    >
                        + Adicionar cupom
                    </Link>
                </div>

                {!coupons ||
                coupons.length === 0 ? (
                    <div className="border-t border-black">
                        <p className="py-6 text-sm">
                            Nenhum cupom encontrado.
                        </p>
                    </div>
                ) : (
                    <div className="border-t border-black">
                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-black py-3 text-xs uppercase">
                            <span>
                                Código
                            </span>

                            <span>
                                Desconto
                            </span>

                            <span>
                                Usos
                            </span>

                            <span>
                                Expiração
                            </span>

                            <span>
                                Status
                            </span>

                            <span>
                                Ações
                            </span>
                        </div>

                        {coupons.map(
                            (coupon) => {
                                const status =
                                    getCouponStatus(
                                        coupon.active,
                                        coupon.starts_at,
                                        coupon.expires_at,
                                    );

                                return (
                                    <div
                                        key={
                                            coupon.id
                                        }
                                        className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-black py-4 text-sm"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {
                                                    coupon.code
                                                }
                                            </span>

                                            {coupon.wholesale_only && (
                                                <span className="border border-black px-1.5 py-0.5 text-[10px] uppercase">
                                                    Atacado
                                                </span>
                                            )}
                                        </div>

                                        <span>
                                            {formatDiscount(
                                                coupon.discount_type,
                                                Number(
                                                    coupon.discount_value,
                                                ),
                                            )}
                                        </span>

                                        <span>
                                            {
                                                coupon.usage_count
                                            }
                                            {" / "}
                                            {coupon.max_uses ??
                                                "∞"}
                                        </span>

                                        <span>
                                            {formatDate(
                                                coupon.expires_at,
                                            )}
                                        </span>

                                        <span>
                                            {
                                                status
                                            }
                                        </span>

                                        <div className="flex items-center gap-4">
                                            <Link
                                                href={`/admin/cupons/${coupon.id}/editar`}
                                                className="underline transition-opacity hover:opacity-50"
                                            >
                                                Editar
                                            </Link>

                                            <form
                                                action={
                                                    deleteCoupon
                                                }
                                            >
                                                <input
                                                    type="hidden"
                                                    name="couponId"
                                                    value={
                                                        coupon.id
                                                    }
                                                />

                                                <button
                                                    type="submit"
                                                    className="underline transition-opacity hover:opacity-50"
                                                >
                                                    Excluir
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}