import {
    Suspense,
} from "react";

import {
    MobileFilters,
} from "@/components/layout/mobile-filters";

import {
    Sidebar,
} from "@/components/layout/sidebar";

import {
    ProductsSection,
} from "@/components/products/products-section";

import {
    FeaturedProductsCarousel,
} from "@/components/products/featured-products-carousel";

import {
    createClient,
} from "@/lib/supabase/server";

type HomePageProps = {
    searchParams: Promise<{
        genre?: string;
        format?: string;
        year?: string;
        artist?: string;
        label?: string;
        condition?: string;
        availability?: string;
        country?: string;
        search?: string;
    }>;
};

export default async function HomePage({
    searchParams,
}: HomePageProps) {
    const supabase =
        await createClient();

    const {
        data: featuredProducts,
        error: featuredError,
    } = await supabase
        .from("products")
        .select(`
            id,
            name,
            slug,
            artist,
            price,
            format,
            year,
            images
        `)
        .eq(
            "is_featured",
            true,
        )
        .gt(
            "stock",
            0,
        )
        .order(
            "created_at",
            {
                ascending: false,
            },
        );

    if (featuredError) {
        console.error(
            "Erro ao buscar produtos destacados:",
            featuredError,
        );
    }

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
                        <aside className="h-[calc(100vh-64px)] w-64 bg-white" />
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
                        bg-white
                    "
                />
            </div>

            {/* CONTENT */}

            <main className="w-full overflow-hidden p-4 md:py-6 md:pr-6 md:pl-24">
                {/* FEATURED PRODUCTS */}

                {featuredProducts &&
                    featuredProducts.length >
                        0 && (
                    <div className="mb-8">
                        <FeaturedProductsCarousel
                            products={
                                featuredProducts
                            }
                        />
                    </div>
                )}

                {/* PRODUCTS */}

                <Suspense
                    fallback={
                        <p></p>
                    }
                >
                    <ProductsSection
                        searchParams={
                            searchParams
                        }
                    />
                </Suspense>
            </main>
        </div>
    );
}