
import Link from "next/link";
import { InfiniteProductList } from "@/components/products/infinite-product-list";
import { getUserAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const PRODUCTS_PER_PAGE = 24;

type Filters = {
    genre?: string;
    format?: string;
    year?: string;
    artist?: string;
    label?: string;
    search?: string;
    condition?: string;
    availability?: string;
    pre_order?: string;
    country?: string;
};

type ProductsSectionProps = {
    searchParams: Promise<Filters>;
};

function values(value?: string) {
    return [
        ...new Set(
            (value ?? "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
        ),
    ];
}

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
        .gt("stock", 0)
        .order("created_at", {
            ascending: false,
        });

    if (!canSeeWholesaleOnly) {
        query = query.eq("wholesale_only", false);
    }

    for (const key of [
        "genre",
        "format",
        "condition",
        "country",
    ] as const) {
        const selected = values(filters[key]);

        if (selected.length) {
            query = query.in(key, selected);
        }
    }

    const selectedYears = values(filters.year)
        .map(Number)
        .filter(
            (year) =>
                Number.isInteger(year) &&
                year > 0,
        );

    if (selectedYears.length) {
        query = query.in("year", selectedYears);
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

    const selectedAvailability = values(
        filters.pre_order,
    ).filter(
        (value) =>
            value === "true" ||
            value === "false",
    );

    if (selectedAvailability.length === 1) {
        query = query.eq(
            "pre_order",
            selectedAvailability[0] === "true",
        );
    } else if (selectedAvailability.length === 0) {
        if (filters.availability === "pre_order") {
            query = query.eq("pre_order", true);
        }

        if (filters.availability === "ready") {
            query = query.eq("pre_order", false);
        }
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
            <p>Erro ao carregar produtos.</p>
        );
    }

    const titleFilters = [
        ...values(filters.search),
        ...values(filters.genre),
        ...values(filters.format),
        ...values(filters.year),
        ...values(filters.artist),
        ...values(filters.label),
        ...values(filters.condition),
        ...values(filters.country),
        ...(selectedAvailability.length
            ? selectedAvailability.map((value) =>
                value === "true"
                    ? "Pré-venda"
                    : "Pronta entrega",
            )
            : filters.availability === "pre_order"
                ? ["Pré-venda"]
                : filters.availability === "ready"
                    ? ["Pronta entrega"]
                    : []),
    ];

    const title = [
        ...new Set(titleFilters),
    ].join(" / ");

    const hasActiveFilters = Object.values(
        filters,
    ).some((value) => Boolean(value));

    const productCount =
        count ?? products.length;

    return (
        <div className="flex flex-col gap-8">
            {hasActiveFilters && (
                <section className="flex max-w-full flex-col items-start gap-3 text-black">
                    <p className="text-xs font-medium uppercase tracking-wide">
                        Resultados da busca
                    </p>

                    <h2 className="max-w-full break-words font-october text-4xl uppercase leading-[0.9] [-webkit-text-stroke:1px_#000] md:text-6xl">
                        {title}
                    </h2>

                    <p className="text-sm">
                        {productCount}{" "}
                        {productCount === 1
                            ? "produto encontrado"
                            : "produtos encontrados"}
                    </p>

                    <Link
                        href="/"
                        scroll={false}
                        className="inline-flex items-center gap-2 rounded-xl border border-black bg-white px-5 py-3 text-xs font-semibold uppercase text-black shadow-[-4px_4px_0_0_#000] transition-all duration-200 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[-7px_7px_0_0_#000]"
                    >
                        ← Voltar à loja
                    </Link>
                </section>
            )}

            {products.length === 0 ? (
                <p className="text-sm">
                    Nenhum produto encontrado.
                </p>
            ) : (
                <InfiniteProductList
                    initialProducts={products}
                    filters={filters}
                    isWholesale={isWholesale || isAdmin}
                    wholesaleStatus={wholesaleStatus}
                />
            )}
        </div>
    );
}
