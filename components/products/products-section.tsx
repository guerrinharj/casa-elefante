
import Link from "next/link";

import {
    InfiniteProductList,
} from "@/components/products/infinite-product-list";

import {
    getUserAccess,
} from "@/lib/auth";

import {
    createClient,
} from "@/lib/supabase/server";

const PRODUCTS_PER_PAGE = 24;

type ProductsSectionProps = {
    searchParams: Promise<{
        genre?: string;
        format?: string;
        year?: string;
        artist?: string;
        label?: string;
        search?: string;
        condition?: string;
        availability?: string;
        pre_order?: string;
    }>;
};

export async function ProductsSection({
    searchParams,
}: ProductsSectionProps) {
    const filters = await searchParams;

    const supabase = await createClient();

    const {
        isWholesale,
        isAdmin,
        wholesaleStatus,
    } = await getUserAccess();

    /*
     * Pode enxergar produtos exclusivos:
     *
     * admin    -> sim
     * approved -> sim
     * pending  -> sim, mas card bloqueado
     * rejected -> não
     * comum    -> não
     */
    const canSeeWholesaleOnly =
        isAdmin ||
        isWholesale ||
        wholesaleStatus === "pending";

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
                images,
                stock,
                condition,
                pre_order,
                wholesale_only
            `,
            {
                count: "exact",
            },
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

    /*
     * Rejected e usuários comuns
     * não recebem produtos exclusivos.
     */
    if (!canSeeWholesaleOnly) {
        query = query.eq(
            "wholesale_only",
            false,
        );
    }

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

    if (filters.condition) {
        query = query.eq(
            "condition",
            filters.condition,
        );
    }

    if (filters.availability) {
        if (
            filters.availability === "pre_order"
        ) {
            query = query.eq(
                "pre_order",
                true,
            );
        }

        if (
            filters.availability === "ready"
        ) {
            query = query.eq(
                "pre_order",
                false,
            );
        }
    }

    if (
        filters.pre_order !== undefined
    ) {
        query = query.eq(
            "pre_order",
            filters.pre_order === "true",
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

    /*
     * Identifica os filtros ativos para
     * construir o título da busca.
     */
    const titleFilters = [
        filters.search,
        filters.genre,
        filters.format,
        filters.year,
        filters.artist,
        filters.label,
        filters.condition,
        filters.availability === "pre_order"
            ? "Pré-venda"
            : filters.availability === "ready"
                ? "Pronta entrega"
                : filters.availability,
        filters.pre_order === "true"
            ? "Pré-venda"
            : filters.pre_order === "false"
                ? "Pronta entrega"
                : null,
    ].filter(
        (value): value is string =>
            Boolean(value),
    );

    const title =
        [...new Set(titleFilters)].join(" / ");

    const hasActiveFilters = Boolean(
        filters.genre ||
        filters.format ||
        filters.year ||
        filters.artist ||
        filters.label ||
        filters.condition ||
        filters.availability ||
        filters.pre_order !== undefined ||
        filters.search,
    );

    const productCount = count ?? products.length;

    return (
        <div className="flex flex-col gap-8">
            {/* CABEÇALHO DA BUSCA */}

            {hasActiveFilters && (
            <section
                className="
                    flex
                    w-fit
                    max-w-full
                    flex-col
                    self-start
                    gap-4
                    rounded-xl
                    border
                    border-black
                    bg-white
                    p-5
                    text-black
                    shadow-[-5px_5px_0_0_#000]
                    md:p-6
                "
            >
                    <p
                        className="
                            text-xs
                            font-medium
                            uppercase
                            tracking-wide
                        "
                    >
                        Resultados da busca
                    </p>

                    <h2
                        className="
                            break-words
                            font-october
                            text-4xl
                            uppercase
                            leading-[0.9]
                            [-webkit-text-stroke:1px_#000]
                            md:text-6xl
                        "
                    >
                        {title}
                    </h2>

                    <p className="text-sm">
                        {productCount}{" "}
                        {productCount === 1
                            ? "produto encontrado"
                            : "produtos encontrados"}
                    </p>

                    <div>
                        <Link
                            href="/"
                            scroll={false}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-black
                                bg-white
                                px-5
                                py-3
                                text-xs
                                font-semibold
                                uppercase
                                text-black
                                shadow-[-4px_4px_0_0_#000]
                                transition-all
                                duration-200
                                ease-out
                                hover:-translate-x-1
                                hover:-translate-y-1
                                hover:shadow-[-7px_7px_0_0_#000]
                            "
                        >
                            ← Voltar à loja
                        </Link>
                    </div>
                </section>
            )}

            {/* LISTAGEM DE PRODUTOS */}

            {products.length === 0 ? (
                <p className="text-sm">
                    Nenhum produto encontrado.
                </p>
            ) : (
                <InfiniteProductList
                    initialProducts={products}
                    filters={filters}
                    isWholesale={
                        isWholesale || isAdmin
                    }
                    wholesaleStatus={
                        wholesaleStatus
                    }
                />
            )}
        </div>
    );
}
