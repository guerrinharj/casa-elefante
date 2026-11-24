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
    ProductSearch,
} from "@/components/products/product-search";

import {
    ProductsSection,
} from "@/components/products/products-section";

import {
    FeaturedProductsCarousel,
} from "@/components/products/featured-products-carousel";

import {
    AboutSection,
} from "@/components/home/about-section";

import {
    NewsletterSection,
} from "@/components/home/newsletter-section";

import {
    createClient,
} from "@/lib/supabase/server";

import {
    getUserAccess,
} from "@/lib/auth";

import {
    PageHeader,
} from "@/components/layout/page-header";

type HomePageProps = {
    searchParams: Promise<{
        genre?: string;
        format?: string;
        year?: string;
        artist?: string;
        label?: string;
        condition?: string;
        availability?: string;
        pre_order?: string;
        country?: string;
        search?: string;
    }>;
};

export default async function HomePage({
    searchParams,
}: HomePageProps) {
    const filters = await searchParams;

    const hasActiveFilters = Object.values(
        filters,
    ).some((value) => {
        return (
            typeof value === "string" &&
            value.trim() !== ""
        );
    });

    const supabase = await createClient();

    const {
        isWholesale,
        isAdmin,
        wholesaleStatus,
    } = await getUserAccess();

    /*
     * WHOLESALE ACCESS
     */
    const canSeeWholesaleOnly =
        isAdmin ||
        isWholesale ||
        wholesaleStatus === "pending";

    /*
     * FEATURED PRODUCTS
     */
    let featuredQuery = supabase
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

    if (!canSeeWholesaleOnly) {
        featuredQuery = featuredQuery.eq(
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
     * UPCOMING PERFORMANCES
     */
    const today = new Date()
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

    const hasFeaturedContent =
        (featuredProducts?.length ?? 0) > 0 ||
        (upcomingPerformances?.length ?? 0) > 0;

    return (
        <div
            className="
                w-full
                min-w-0
                max-w-full
                overflow-x-clip
            "
        >

            {/* FULL WIDTH HERO */}

            <section
                className="
                    w-full
                    min-w-0
                    overflow-hidden
                "
            >

                {/* PAGE HEADER */}

                <PageHeader title="Casa Elefante" />

                {/* FEATURED CAROUSEL */}

                {!hasActiveFilters &&
                    hasFeaturedContent && (
                        <div
                            className="
                                w-full
                                min-w-0
                            "
                        >
                            <FeaturedProductsCarousel
                                products={
                                    featuredProducts ?? []
                                }
                                performances={
                                    upcomingPerformances ?? []
                                }
                            />
                        </div>
                    )}

            </section>

            {/* STORE CONTAINER */}

            <div
                className="
                    mx-auto
                    flex
                    w-full
                    min-w-0
                    max-w-[1440px]
                    items-start
                    gap-6
                    px-4
                    py-8
                    md:px-6
                    lg:gap-8
                "
            >

                {/* DESKTOP SIDEBAR */}

                <aside
                    className="
                        hidden
                        w-72
                        shrink-0
                        md:block
                    "
                >
                    <Suspense fallback={null}>
                        <Sidebar />
                    </Suspense>
                </aside>

                {/* MAIN CONTENT */}

                <main
                    className="
                        min-w-0
                        flex-1
                    "
                >

                    {/* SEARCH AND MOBILE FILTERS */}

                    <div
                        className="
                            relative
                            z-30
                            mb-8
                            flex
                            w-full
                            min-w-0
                            items-center
                            justify-between
                            gap-4
                        "
                    >

                        {/* MOBILE FILTERS */}

                        <div className="shrink-0 md:hidden">
                            <Suspense fallback={null}>
                                <MobileFilters>
                                    <Sidebar mobile />
                                </MobileFilters>
                            </Suspense>
                        </div>

                        {/* PRODUCT SEARCH */}

                        <div
                            className="
                                flex
                                w-full
                                min-w-0
                                flex-1
                            "
                        >
                            <Suspense fallback={null}>
                                <ProductSearch />
                            </Suspense>
                        </div>

                    </div>

                    {/* PRODUCTS */}

                    <Suspense fallback={null}>
                        <ProductsSection
                            searchParams={
                                Promise.resolve(filters)
                            }
                        />
                    </Suspense>

                    {/* HOME SECTIONS */}

                    {!hasActiveFilters && (
                        <div
                            className="
                                mt-12
                                flex
                                flex-col
                                items-start
                                gap-6
                                md:flex-row
                                md:gap-8
                            "
                        >
                            <div className="w-full max-w-[420px]">
                                <AboutSection />
                            </div>

                            <div className="w-full max-w-[420px]">
                                <NewsletterSection />
                            </div>
                        </div>
                    )}

                </main>

            </div>

        </div>
    );
}