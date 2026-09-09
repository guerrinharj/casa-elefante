import { Suspense } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { FilteredProducts } from "@/components/products/filtered-products";

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
            <Sidebar />

            <section className="flex-1 p-6">
                <Suspense fallback={<p>Carregando produtos...</p>}>
                    <FilteredProducts searchParams={searchParams} />
                </Suspense>
            </section>
        </div>
    );
}