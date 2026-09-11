import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { AnimatedCount } from "@/components/ui/animated-count";

import {
    PRODUCT_FORMATS,
    PRODUCT_GENRES,
} from "@/lib/products";

type SidebarProps = {
    mobile?: boolean;
};

export async function Sidebar({
    mobile = false,
}: SidebarProps) {
    const supabase = await createClient();

    const { data: products, error } = await supabase
        .from("products")
        .select("genre, format, year");

    if (error) {
        console.error("Sidebar Supabase error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
        });
    }

    // Conta quantos produtos existem em cada gênero.
    const genreCounts =
        products?.reduce<Record<string, number>>(
            (acc, product) => {
                if (product.genre) {
                    acc[product.genre] =
                        (acc[product.genre] ?? 0) + 1;
                }

                return acc;
            },
            {}
        ) ?? {};

    // Conta quantos produtos existem em cada formato.
    const formatCounts =
        products?.reduce<Record<string, number>>(
            (acc, product) => {
                if (product.format) {
                    acc[product.format] =
                        (acc[product.format] ?? 0) + 1;
                }

                return acc;
            },
            {}
        ) ?? {};

    // Conta quantos produtos existem em cada ano.
    const yearCounts =
        products?.reduce<Record<string, number>>(
            (acc, product) => {
                if (product.year) {
                    const year = String(product.year);

                    acc[year] =
                        (acc[year] ?? 0) + 1;
                }

                return acc;
            },
            {}
        ) ?? {};

    // Ordena os anos do mais recente para o mais antigo.
    const years = Object.keys(yearCounts)
        .map(Number)
        .sort((a, b) => b - a);

    /*
     * Usamos um named group ("group/link") para que
     * o hover da seta responda apenas ao Link.
     *
     * Isso evita conflito com o hover usado pelo
     * container da sidebar no desktop.
     */
    const filterLinkClassName =
        "group/link flex items-center justify-between gap-4";

    /*
     * A seta começa escondida e deslocada para a esquerda.
     * Quando fazemos hover no link correspondente,
     * ela aparece suavemente.
     */
    const arrowClassName =
        "mr-0 w-0 -translate-x-2 overflow-hidden opacity-0 " +
        "transition-all duration-200 ease-out " +
        "group-hover/link:mr-2 " +
        "group-hover/link:w-3 " +
        "group-hover/link:translate-x-0 " +
        "group-hover/link:opacity-100";

    return (
        <aside
            className={
                mobile
                    ? "animate-sidebar-in w-full px-4 pb-6 pt-2"
                    : `
                        h-[calc(100vh-64px)]
                        w-64
                        overflow-y-auto
                        border-r
                        border-black
                        bg-[#f8f7ef]
                        p-6
                    `
            }
        >
            {/* GÊNERO */}
            <div className="mb-8">
                <h2 className="mb-3 font-grotesque text-2xl font-bold uppercase">
                    Gênero
                </h2>

                <ul className="space-y-1 text-sm">
                    {PRODUCT_GENRES.map((genre) => (
                        <li key={genre}>
                            <Link
                                href={`/?genre=${encodeURIComponent(genre)}`}
                                className={filterLinkClassName}
                            >
                                <span className="flex min-w-0 items-center">
                                    <span className={arrowClassName}>
                                        →
                                    </span>

                                    <span>
                                        {genre}
                                    </span>
                                </span>

                                <span className="shrink-0">
                                    <AnimatedCount
                                        value={
                                            genreCounts[genre] ?? 0
                                        }
                                    />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* FORMATO */}
            <div className="mb-8">
                <h2 className="mb-3 font-grotesque text-2xl font-bold uppercase">
                    Formato
                </h2>

                <ul className="space-y-1 text-sm">
                    {PRODUCT_FORMATS.map((format) => (
                        <li key={format}>
                            <Link
                                href={`/?format=${encodeURIComponent(format)}`}
                                className={filterLinkClassName}
                            >
                                <span className="flex min-w-0 items-center">
                                    <span className={arrowClassName}>
                                        →
                                    </span>

                                    <span>
                                        {format}
                                    </span>
                                </span>

                                <span className="shrink-0">
                                    <AnimatedCount
                                        value={
                                            formatCounts[format] ?? 0
                                        }
                                    />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ANO */}
            <div>
                <h2 className="mb-3 font-grotesque text-2xl font-bold uppercase">
                    Ano
                </h2>

                {years.length === 0 ? (
                    <span className="text-sm">
                        —
                    </span>
                ) : (
                    <ul className="space-y-1 text-sm">
                        {years.map((year) => (
                            <li key={year}>
                                <Link
                                    href={`/?year=${year}`}
                                    className={filterLinkClassName}
                                >
                                    <span className="flex min-w-0 items-center">
                                        <span className={arrowClassName}>
                                            →
                                        </span>

                                        <span>
                                            {year}
                                        </span>
                                    </span>

                                    <span className="shrink-0">
                                        <AnimatedCount
                                            value={
                                                yearCounts[year] ?? 0
                                            }
                                        />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
}