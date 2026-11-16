
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

const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-white px-5 py-3 text-sm font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]";

const actionClassName =
    "inline-flex items-center justify-center rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black shadow-[-3px_3px_0_0_#000] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[-3px_5px_0_0_#000]";

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
        <main className="min-h-screen p-6 text-black md:p-10">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="font-october text-5xl uppercase leading-none text-black md:text-6xl">
                            Cupons
                        </h1>

                        <p className="mt-3 text-sm text-black/70 md:text-base">
                            Gerencie os cupons de desconto da loja.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/admin"
                            className={buttonClassName}
                        >
                            ← Admin
                        </Link>

                        <Link
                            href="/admin/cupons/novo"
                            className={buttonClassName}
                        >
                            + Adicionar cupom
                        </Link>
                    </div>
                </div>

                <div className="border-t border-black/20" />

                {!coupons ||
                coupons.length === 0 ? (
                    <div className="rounded-xl border border-black bg-white p-6 shadow-[-5px_5px_0_0_#000]">
                        <p className="font-october text-2xl uppercase leading-none text-black">
                            Nenhum cupom encontrado.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-black bg-white shadow-[-5px_5px_0_0_#000]">
                        <div className="overflow-x-auto">
                            <div className="min-w-[850px]">
                                <div className="grid grid-cols-[1.5fr_1fr_0.8fr_1fr_0.9fr_1.3fr] gap-4 border-b border-black bg-white px-5 py-4">
                                    <span className="font-october text-lg uppercase leading-none">
                                        Código
                                    </span>

                                    <span className="font-october text-lg uppercase leading-none">
                                        Desconto
                                    </span>

                                    <span className="font-october text-lg uppercase leading-none">
                                        Usos
                                    </span>

                                    <span className="font-october text-lg uppercase leading-none">
                                        Expiração
                                    </span>

                                    <span className="font-october text-lg uppercase leading-none">
                                        Status
                                    </span>

                                    <span className="font-october text-lg uppercase leading-none">
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
                                                key={coupon.id}
                                                className="grid grid-cols-[1.5fr_1fr_0.8fr_1fr_0.9fr_1.3fr] items-center gap-4 border-b border-black/15 px-5 py-5 text-sm last:border-b-0"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-semibold break-all">
                                                        {coupon.code}
                                                    </span>

                                                    {coupon.wholesale_only && (
                                                        <span className="rounded-md border border-black bg-[#FFFDE9] px-2 py-1 text-[10px] font-medium">
                                                            Atacado
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="font-medium">
                                                    {formatDiscount(
                                                        coupon.discount_type,
                                                        Number(
                                                            coupon.discount_value,
                                                        ),
                                                    )}
                                                </span>

                                                <span>
                                                    {coupon.usage_count}
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
                                                    <span
                                                        className={`inline-flex rounded-md border border-black px-3 py-1 text-xs font-medium ${
                                                            status === "Ativo"
                                                                ? "bg-[#FFFDE9]"
                                                                : "bg-white"
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </span>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Link
                                                        href={`/admin/cupons/${coupon.id}/editar`}
                                                        className={actionClassName}
                                                    >
                                                        Editar
                                                    </Link>

                                                    <form
                                                        action={deleteCoupon}
                                                    >
                                                        <input
                                                            type="hidden"
                                                            name="couponId"
                                                            value={coupon.id}
                                                        />

                                                        <button
                                                            type="submit"
                                                            className={actionClassName}
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
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
