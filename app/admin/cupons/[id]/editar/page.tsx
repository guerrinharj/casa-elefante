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
        <main className="p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
                <div>
                    <Link
                        href="/admin/cupons"
                        className="text-sm transition-opacity hover:opacity-60"
                    >
                        ← Voltar para cupons
                    </Link>

                    <h1 className="mt-4 text-3xl font-medium">
                        Editar cupom
                    </h1>

                    <p className="mt-1 text-sm">
                        {coupon.code}
                    </p>
                </div>

                <EditCouponForm
                    coupon={coupon}
                />
            </div>
        </main>
    );
}