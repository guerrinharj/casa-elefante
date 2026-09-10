import { InfiniteProductList } from "@/components/products/infinite-product-list";
import { ProductSearch } from "@/components/products/product-search";

import { createClient } from "@/lib/supabase/server";

const PRODUCTS_PER_PAGE = 24;

type ProductsSectionProps = {
    searchParams: Promise<{
        genre?: string;
        format?: string;
        year?: string;
        artist?: string;
        label?: string;
        search?: string;
    }>;
};

export async function ProductsSection({
    searchParams,
}: ProductsSectionProps) {
    const filters = await searchParams;

    const supabase = await createClient();

    let query = supabase
        .from("products")
        .select(
            `
                id,
                name,
                slug,
                artist,
                price,
                year,
                format,
                images
            `,
            {
                count: "exact",
            },
        )
        .order("created_at", {
            ascending: false,
        });

    if (filters.genre) {
        query = query.eq(
            "genre",
            filters.genre,
        );
    }

    if (filters.format) {
        query = query.eq(
            "format",
            filters.format,
        );
    }

    if (filters.year) {
        query = query.eq(
            "year",
            Number(filters.year),
        );
    }

    if (filters.artist) {
        query = query.ilike(
            "artist",
            `%${filters.artist}%`,
        );
    }

    if (filters.label) {
        query = query.ilike(
            "label",
            `%${filters.label}%`,
        );
    }

    if (filters.search) {
        query = query.or(
            `name.ilike.%${filters.search}%,artist.ilike.%${filters.search}%`,
        );
    }

    const {
        data: products,
        error,
        count,
    } = await query.range(
        0,
        PRODUCTS_PER_PAGE - 1,
    );

    if (error) {
        console.error(
            "Erro ao carregar produtos:",
            error,
        );

        return (
            <p>
                Erro ao carregar produtos.
            </p>
        );
    }

    const activeFilters = [
        filters.genre,
        filters.format,
        filters.year,
        filters.artist,
        filters.label,
    ].filter(Boolean);

    const title =
        activeFilters.length > 0
            ? activeFilters.join(" / ")
            : "Loja";

    return (
        <>
            <div className="mb-8 flex items-center justify-between gap-8">
                <div className="flex flex-1 items-center gap-8">
                    <h1 className="font-grotesque shrink-0 text-4xl font-bold uppercase">
                        {title}
                    </h1>

                    <ProductSearch />
                </div>

                <span className="shrink-0 text-sm">
                    {count ?? 0} produtos
                </span>
            </div>

            {products.length === 0 ? (
                <p>
                    Nenhum produto encontrado.
                </p>
            ) : (
                <InfiniteProductList
                    initialProducts={products}
                    filters={filters}
                />
            )}
        </>
    );
}