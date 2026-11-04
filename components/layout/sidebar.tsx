
"use client";

import Link from "next/link";

import {
    useEffect,
    useState,
} from "react";

import {
    createClient,
} from "@/lib/supabase/client";

import {
    AnimatedCount,
} from "@/components/ui/animated-count";

import {
    PRODUCT_FORMATS,
    PRODUCT_GENRES,
} from "@/lib/products";

type SidebarProps = {
    mobile?: boolean;
};

type SidebarProduct = {
    genre: string | null;
    format: string | null;
    year: number | null;
    condition: string | null;
    pre_order: boolean | null;
    country: string | null;
};

type FilterSection =
    | "genre"
    | "format"
    | "condition"
    | "availability"
    | "country"
    | "year";

export function Sidebar({
    mobile = false,
}: SidebarProps) {
    const [products, setProducts] = useState<SidebarProduct[]>([]);

    const [openSections, setOpenSections] = useState<
        Record<FilterSection, boolean>
    >({
        genre: false,
        format: false,
        condition: false,
        availability: false,
        country: false,
        year: false,
    });

    /*
     * PRODUTOS
     */

    useEffect(() => {
        const supabase = createClient();

        async function loadProducts() {
            const {
                data,
                error,
            } = await supabase
                .from("products")
                .select(`
                    genre,
                    format,
                    year,
                    condition,
                    pre_order,
                    country
                `);

            if (error) {
                console.error(
                    "Sidebar Supabase error:",
                    {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code,
                    },
                );

                return;
            }

            setProducts(
                (data ?? []) as SidebarProduct[],
            );
        }

        loadProducts();
    }, []);

    /*
     * SEÇÕES
     */

    function toggleSection(section: FilterSection) {
        setOpenSections((current) => ({
            ...current,
            [section]: !current[section],
        }));
    }

    /*
     * CONTADORES
     */

    const genreCounts = products.reduce<Record<string, number>>(
        (acc, product) => {
            if (product.genre) {
                acc[product.genre] =
                    (acc[product.genre] ?? 0) + 1;
            }

            return acc;
        },
        {},
    );

    const formatCounts = products.reduce<Record<string, number>>(
        (acc, product) => {
            if (product.format) {
                acc[product.format] =
                    (acc[product.format] ?? 0) + 1;
            }

            return acc;
        },
        {},
    );

    const yearCounts = products.reduce<Record<string, number>>(
        (acc, product) => {
            if (product.year) {
                const year = String(product.year);

                acc[year] =
                    (acc[year] ?? 0) + 1;
            }

            return acc;
        },
        {},
    );

    const conditionCounts = products.reduce<Record<string, number>>(
        (acc, product) => {
            if (product.condition) {
                acc[product.condition] =
                    (acc[product.condition] ?? 0) + 1;
            }

            return acc;
        },
        {},
    );

    const countryCounts = products.reduce<Record<string, number>>(
        (acc, product) => {
            if (product.country) {
                acc[product.country] =
                    (acc[product.country] ?? 0) + 1;
            }

            return acc;
        },
        {},
    );

    const years = Object.keys(yearCounts)
        .map(Number)
        .sort((a, b) => b - a);

    const conditions = Object.keys(conditionCounts)
        .sort((a, b) => a.localeCompare(b, "pt-BR"));

    const countries = Object.keys(countryCounts)
        .sort((a, b) => a.localeCompare(b, "pt-BR"));

    const preOrderCount = products.filter(
        (product) => product.pre_order === true,
    ).length;

    const readyCount = products.filter(
        (product) => product.pre_order !== true,
    ).length;

    /*
     * CLASSES
     */

    const filterLinkClassName =
        "group/link flex items-center justify-between gap-4 " +
        "transition-opacity duration-200 hover:opacity-60";

    const arrowClassName =
        "mr-0 w-0 -translate-x-2 overflow-hidden opacity-0 " +
        "transition-all duration-200 ease-out " +
        "group-hover/link:mr-2 " +
        "group-hover/link:w-3 " +
        "group-hover/link:translate-x-0 " +
        "group-hover/link:opacity-100";

    const sectionButtonClassName =
        "group flex w-full items-center justify-between gap-4 " +
        "text-left transition-opacity duration-200 hover:opacity-70";

    const headingClassName =
        "font-october text-3xl uppercase leading-none";

    function sectionArrowClassName(section: FilterSection) {
        return `
            text-xl
            transition-transform
            duration-300
            ease-out
            ${openSections[section] ? "rotate-90" : "rotate-0"}
        `;
    }

    function sectionContentClassName(section: FilterSection) {
        return `
            grid
            transition-[grid-template-rows,opacity]
            duration-300
            ease-out
            ${
                openSections[section]
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
            }
        `;
    }

    /*
     * RENDERIZAÇÃO DOS LINKS
     */

    function renderFilterLink(
        href: string,
        label: string,
        count: number,
    ) {
        return (
            <li key={href}>
                <Link
                    href={href}
                    className={filterLinkClassName}
                >
                    <span className="flex min-w-0 items-center">
                        <span className={arrowClassName}>
                            →
                        </span>

                        <span>
                            {label}
                        </span>
                    </span>

                    <span className="shrink-0">
                        <AnimatedCount value={count} />
                    </span>
                </Link>
            </li>
        );
    }

    /*
     * RENDERIZAÇÃO DAS SEÇÕES
     */

    function renderSection(
        section: FilterSection,
        title: string,
        content: React.ReactNode,
    ) {
        return (
            <div
                key={section}
                className="mb-8"
            >
                <button
                    type="button"
                    onClick={() => toggleSection(section)}
                    className={sectionButtonClassName}
                    aria-expanded={openSections[section]}
                >
                    <h2 className={headingClassName}>
                        {title}
                    </h2>

                    <span
                        className={sectionArrowClassName(section)}
                    >
                        →
                    </span>
                </button>

                <div className={sectionContentClassName(section)}>
                    <div className="overflow-hidden">
                        {content}
                    </div>
                </div>
            </div>
        );
    }

    /*
     * SIDEBAR
     */

    return (
        <aside
            className={
                mobile
                    ? `
                        animate-sidebar-in
                        w-full
                        bg-[#FFFDE9]
                        px-4
                        pb-6
                        pt-2
                        text-[#D2232A]
                        transition-colors
                        duration-700
                        ease-in-out
                    `
                    : `
                        h-[calc(100vh-64px)]
                        w-64
                        overflow-y-auto
                        border-r
                        border-[#D2232A]
                        bg-[#FFFDE9]
                        p-6
                        text-[#D2232A]
                        transition-colors
                        duration-700
                        ease-in-out
                    `
            }
        >
            {renderSection(
                "genre",
                "Gênero",
                <ul className="mt-3 space-y-1 text-sm">
                    {PRODUCT_GENRES.map((genre) =>
                        renderFilterLink(
                            `/?genre=${encodeURIComponent(genre)}`,
                            genre,
                            genreCounts[genre] ?? 0,
                        ),
                    )}
                </ul>,
            )}

            {renderSection(
                "format",
                "Formato",
                <ul className="mt-3 space-y-1 text-sm">
                    {PRODUCT_FORMATS.map((format) =>
                        renderFilterLink(
                            `/?format=${encodeURIComponent(format)}`,
                            format,
                            formatCounts[format] ?? 0,
                        ),
                    )}
                </ul>,
            )}

            {renderSection(
                "condition",
                "Condição",
                conditions.length === 0 ? (
                    <span className="mt-3 block text-sm">
                        —
                    </span>
                ) : (
                    <ul className="mt-3 space-y-1 text-sm">
                        {conditions.map((condition) =>
                            renderFilterLink(
                                `/?condition=${encodeURIComponent(condition)}`,
                                condition,
                                conditionCounts[condition] ?? 0,
                            ),
                        )}
                    </ul>
                ),
            )}

            {renderSection(
                "availability",
                "Disponibilidade",
                <ul className="mt-3 space-y-1 text-sm">
                    {renderFilterLink(
                        "/?pre_order=false",
                        "Pronta Entrega",
                        readyCount,
                    )}

                    {renderFilterLink(
                        "/?pre_order=true",
                        "Pré-Order",
                        preOrderCount,
                    )}
                </ul>,
            )}

            {renderSection(
                "country",
                "País",
                countries.length === 0 ? (
                    <span className="mt-3 block text-sm">
                        —
                    </span>
                ) : (
                    <ul className="mt-3 space-y-1 text-sm">
                        {countries.map((country) =>
                            renderFilterLink(
                                `/?country=${encodeURIComponent(country)}`,
                                country,
                                countryCounts[country] ?? 0,
                            ),
                        )}
                    </ul>
                ),
            )}

            {renderSection(
                "year",
                "Ano",
                years.length === 0 ? (
                    <span className="mt-3 block text-sm">
                        —
                    </span>
                ) : (
                    <ul className="mt-3 space-y-1 text-sm">
                        {years.map((year) =>
                            renderFilterLink(
                                `/?year=${year}`,
                                String(year),
                                yearCounts[year] ?? 0,
                            ),
                        )}
                    </ul>
                ),
            )}
        </aside>
    );
}
