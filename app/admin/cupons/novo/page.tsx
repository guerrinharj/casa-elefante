import Link from "next/link";

import {
    CouponForm,
} from "@/components/admin/coupon-form";

export default function NewCouponPage() {
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
                        Novo cupom
                    </h1>
                </div>

                <CouponForm />
            </div>
        </main>
    );
}