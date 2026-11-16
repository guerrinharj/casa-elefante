
import Link from "next/link";

import {
    notFound,
} from "next/navigation";

import {
    EditCouponForm,
} from "@/components/admin/edit-coupon-form";

import {
    createClient,
} from "@/lib/supabase/server";

type EditCouponPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditCouponPage({
    params,
}: EditCouponPageProps) {
    const { id } = await params;

    const supabase =
        await createClient();

    const {
        data: coupon,
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
            active
        `)
        .eq("id", id)
        .single();

    if (error || !coupon) {
        console.error(
            "Erro ao carregar cupom:",
            error,
        );

        notFound();
    }

    return (
        <main className="min-h-screen p-6 text-black md:p-10">
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <Link
                            href="/admin/cupons"
                            className="inline-flex w-fit items-center justify-center rounded-xl border border-black bg-white px-6 py-3 text-sm font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]"
                        >
                            ← Voltar para cupons
                        </Link>
                    </div>

                    <div>
                        <h1 className="font-october text-5xl uppercase leading-none text-black md:text-6xl">
                            Editar cupom
                        </h1>

                        <p className="mt-3 text-sm text-black/70 md:text-base">
                            Editando o cupom{" "}
                            <span className="font-semibold text-black">
                                {coupon.code}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="border-t border-black/20" />

                <EditCouponForm
                    coupon={coupon}
                />
            </div>
        </main>
    );
}
