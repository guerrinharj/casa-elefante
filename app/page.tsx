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
            {/* MOBILE FILTERS */}
            <div className="md:hidden">
                <Suspense
                    fallback={
                        <div className="h-12 border-b border-black" />
                    }
                >
                    <MobileFilters>
                        <Sidebar mobile />
                    </MobileFilters>
                </Suspense>
            </div>

            {/* DESKTOP SIDEBAR */}
            <div
                className="
                    group
                    fixed
                    left-0
                    top-16
                    z-40
                    hidden
                    -translate-x-[calc(100%-50px)]
                    transition-transform
                    duration-500
                    ease-out
                    hover:translate-x-0
                    md:block
                "
            >
                <Suspense
                    fallback={
                        <aside className="h-[calc(100vh-64px)] w-64 bg-[#f8f7ef]" />
                    }
                >
                    <Sidebar />
                </Suspense>

                {/* Pequena área visível quando fechada */}
                <div
                    className="
                        absolute
                        right-0
                        top-0
                        h-full
                        w-5
                        border-r
                        border-black
                        bg-[#f8f7ef]
                    "
                />
            </div>

            {/* PRODUCTS */}
            <section className="w-full overflow-hidden p-4 md:py-6 md:pr-6 md:pl-24">
                <Suspense fallback={<p></p>}>
                    <ProductsSection
                        searchParams={searchParams}
                    />
                </Suspense>
            </section>
        </div>
    );
}