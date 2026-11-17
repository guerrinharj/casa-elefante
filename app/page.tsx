
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

import {
    DraggableComponent,
} from "@/components/layout/draggable-component";

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
        wholesaleStatus === "pending";

    /*
     * PRODUTOS DESTACADOS
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

    /*
     * Rejected e usuários comuns
     * não recebem produtos exclusivos.
     */
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
     * APRESENTAÇÕES FUTURAS
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

    /*
     * Define se existe algum conteúdo
     * para mostrar no carousel.
     */
    const hasFeaturedContent =
        (featuredProducts?.length ?? 0) > 0 ||
        (upcomingPerformances?.length ?? 0) > 0;

    return (
        <div className="w-full max-w-full overflow-x-hidden">
            {/* SEARCH — MOBILE E DESKTOP */}

            <DraggableComponent
                id="product-search"
                defaultPosition={{
                    top: 24,
                    left: 24,
                }}
                width="max-content"
                zIndex={60}
            >
                <Suspense fallback={null}>
                    <ProductSearch />
                </Suspense>
            </DraggableComponent>

            {/* FILTERS — MOBILE */}

            <div className="md:hidden">
                <Suspense fallback={null}>
                    <MobileFilters>
                        <Sidebar mobile />
                    </MobileFilters>
                </Suspense>
            </div>

            {/* FILTERS — DESKTOP */}

            <DraggableComponent
                id="sidebar"
                defaultPosition={{
                    top: 24,
                    left: 96,
                }}
                width="max-content"
                zIndex={40}
                className="hidden md:block"
            >
                <Suspense fallback={null}>
                    <Sidebar />
                </Suspense>
            </DraggableComponent>

            {/* CONTENT */}

            <main className="w-full overflow-hidden p-4 md:p-6">
                {/* TÍTULO PRINCIPAL */}

                <PageHeader title="Casa Elefante" />

                {/* FEATURED CAROUSEL */}

                {!hasActiveFilters &&
                    hasFeaturedContent && (
                        <div className="mb-8">
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

                {/* PRODUCTS */}

                <Suspense fallback={<p></p>}>
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
                            mt-8
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
    );
}
