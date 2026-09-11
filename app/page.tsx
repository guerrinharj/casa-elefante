import { Suspense } from "react";

import { MobileFilters } from "@/components/layout/mobile-filters";
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
        <div className="w-full max-w-full overflow-x-hidden">
            <div className="md:hidden">
                <Suspense fallback={<div className="h-12 border-b border-black" />}>
                    <MobileFilters>
                        <Sidebar mobile />
                    </MobileFilters>
                </Suspense>
            </div>

            <div className="flex w-full max-w-full">
                <div className="hidden shrink-0 md:block">
                    <Suspense fallback={<aside className="w-64" />}>
                        <Sidebar />
                    </Suspense>
                </div>

                <section className="min-w-0 flex-1 overflow-hidden p-4 md:p-6">
                    <Suspense fallback={<p></p>}>
                        <ProductsSection
                            searchParams={searchParams}
                        />
                    </Suspense>
                </section>
            </div>
        </div>
    );
}