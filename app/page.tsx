import { Suspense } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { ProductsSection } from "@/components/products/products-section";

type HomePageProps = {
    searchParams: Promise<{
        genre?: string;
        format?: string;
        year?: string;
        artist?: string;
        label?: string;
    }>;
};

export default function HomePage({
    searchParams,
}: HomePageProps) {
    return (
        <div className="flex">
            <Suspense fallback={<aside className="w-64" />}>
                <Sidebar />
            </Suspense>

            <section className="flex-1 p-6">
                <Suspense fallback={<p>Carregando produtos...</p>}>
                    <ProductsSection
                        searchParams={searchParams}
                    />
                </Suspense>
            </section>
        </div>
    );
}