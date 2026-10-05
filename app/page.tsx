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

import {
    getUserAccess,
} from "@/lib/auth";

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
    const filters =
        await searchParams;

    const hasActiveFilters =
        Object.values(
            filters,
        ).some((value) => {
            return (
                typeof value ===
                    "string" &&
                value.trim() !== ""
            );
        });

    const supabase =
        await createClient();

    const {
        isWholesale,
        isAdmin,
        wholesaleStatus,
    } = await getUserAccess();

    /*
     * Quem pode enxergar produtos
     * exclusivos no carrossel:
     *
     * admin     -> sim
     * approved  -> sim
     * pending   -> sim
     * rejected  -> não
     * comum     -> não
     */
    const canSeeWholesaleOnly =
        isAdmin ||
        isWholesale ||
        wholesaleStatus ===
            "pending";

    /*
     * PRODUTOS DESTACADOS
     */
    let featuredQuery =
        supabase
            .from("products")
            .select(`
                id,
                name,
                slug,
                artist,
                price,
                format,
                year,
                images,
                wholesale_only
            `)
            .eq(
                "is_featured",
                true,
            )
            .gt(
                "stock",
                0,
            );

    /*
     * Rejected e usuários comuns
     * não recebem produtos exclusivos.
     */
    if (!canSeeWholesaleOnly) {
        featuredQuery =
            featuredQuery.eq(
                "wholesale_only",
                false,
            );
    }

    const {
        data: featuredProducts,
        error: featuredError,
    } = await featuredQuery.order(
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

    /*
     * APRESENTAÇÕES FUTURAS
     */

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const {
        data: upcomingPerformances,
        error: performancesError,
    } = await supabase
        .from("performances")
        .select(`
            id,
            name,
            slug,
            performance_date,
            cover_image,
            location
        `)
        .eq(
            "published",
            true,
        )
        .gte(
            "performance_date",
            today,
        )
        .order(
            "performance_date",
            {
                ascending: true,
            },
        );

    if (performancesError) {
        console.error(
            "Erro ao buscar apresentações futuras:",
            performancesError,
        );
    }

    /*
     * Define se existe algum conteúdo
     * para mostrar no carousel.
     */
    const hasFeaturedContent =
        (featuredProducts?.length ??
            0) >
            0 ||
        (upcomingPerformances?.length ??
            0) >
            0;

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
            </div>

            {/* CONTENT */}

            <main className="w-full overflow-hidden p-4 md:py-6 md:pr-6 md:pl-24">

                {/* FEATURED CAROUSEL */}

                {!hasActiveFilters &&
                    hasFeaturedContent && (
                        <div className="mb-8">
                            <FeaturedProductsCarousel
                                products={
                                    featuredProducts ??
                                    []
                                }
                                performances={
                                    upcomingPerformances ??
                                    []
                                }
                            />
                        </div>
                    )}

                {/* PRODUCTS */}

                <Suspense
                    fallback={<p></p>}
                >
                    <ProductsSection
                        searchParams={
                            Promise.resolve(
                                filters,
                            )
                        }
                    />
                </Suspense>
            </main>
        </div>
    );
}