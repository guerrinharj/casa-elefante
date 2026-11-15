
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SlidersHorizontal, ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { AnimatedCount } from "@/components/ui/animated-count";
import { PRODUCT_FORMATS, PRODUCT_GENRES } from "@/lib/products";

import type { ReactNode } from "react";

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
    const [expanded, setExpanded] = useState(false);

    const [openSections, setOpenSections] = useState<
        Record<FilterSection, boolean>
    >({
        genre: !mobile,
        format: !mobile,
        condition: !mobile,
        availability: !mobile,
        country: !mobile,
        year: !mobile,
    });

    useEffect(() => {
        const supabase = createClient();

        async function loadProducts() {
            const { data, error } = await supabase
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
                console.error("Sidebar Supabase error:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                });

                return;
            }

            setProducts((data ?? []) as SidebarProduct[]);
        }

        void loadProducts();
    }, []);

    function toggleSection(section: FilterSection) {
        setOpenSections((current) => ({
            ...current,
            [section]: !current[section],
        }));
    }

    function countValues(
        key: "genre" | "format" | "condition" | "country",
    ) {
        return products.reduce<Record<string, number>>(
            (acc, product) => {
                const value = product[key];

                if (value) {
                    acc[value] = (acc[value] ?? 0) + 1;
                }

                return acc;
            },
            {},
        );
    }

    const genreCounts = countValues("genre");
    const formatCounts = countValues("format");
    const conditionCounts = countValues("condition");
    const countryCounts = countValues("country");

    const yearCounts = products.reduce<Record<string, number>>(
        (acc, product) => {
            if (product.year) {
                const year = String(product.year);
                acc[year] = (acc[year] ?? 0) + 1;
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

                        <span>{label}</span>
                    </span>

                    <span className="shrink-0">
                        <AnimatedCount value={count} />
                    </span>
                </Link>
            </li>
        );
    }

    function renderSection(
        section: FilterSection,
        title: string,
        content: ReactNode,
    ) {
        return (
            <div key={section} className="mb-8">
                <button
                    type="button"
                    onClick={() => toggleSection(section)}
                    className={sectionButtonClassName}
                    aria-expanded={openSections[section]}
                >
                    <h2 className={headingClassName}>
                        {title}
                    </h2>

                    <span className={sectionArrowClassName(section)}>
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

    const filterSections = (
        <>
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
                    <span className="mt-3 block text-sm">—</span>
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
                    <span className="mt-3 block text-sm">—</span>
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
                    <span className="mt-3 block text-sm">—</span>
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
        </>
    );

    if (mobile) {
        return (
            <aside
                className="
                    animate-sidebar-in
                    w-full
                    px-4
                    pb-6
                    pt-2
                    text-black
                    transition-colors
                    duration-700
                    ease-in-out
                "
            >
                {filterSections}
            </aside>
        );
    }

    return (
        <aside
            className={`
                flex
                max-h-[calc(100dvh-48px)]
                flex-col
                overflow-hidden
                rounded-xl
                border
                border-black
                bg-white
                text-black
                shadow-[-5px_5px_0_0_#000]
                transition-[width]
                duration-300
                ease-in-out
                ${expanded ? "w-72" : "w-14"}
            `}
        >
            <div
                className={`
                    flex
                    h-14
                    shrink-0
                    items-center
                    ${expanded ? "justify-between px-4" : "justify-center"}
                `}
            >
                {expanded && (
                    <h2 className="font-october text-3xl uppercase leading-none">
                        Filtros
                    </h2>
                )}

                <button
                    type="button"
                    onClick={() => setExpanded((current) => !current)}
                    aria-label={
                        expanded
                            ? "Recolher filtros"
                            : "Expandir filtros"
                    }
                    aria-expanded={expanded}
                    title={
                        expanded
                            ? "Recolher filtros"
                            : "Expandir filtros"
                    }
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        transition-colors
                        hover:bg-black/5
                    "
                >
                    {expanded ? (
                        <ChevronLeft size={24} strokeWidth={2} />
                    ) : (
                        <SlidersHorizontal size={24} strokeWidth={2} />
                    )}
                </button>
            </div>

            <div
                className={`
                    min-h-0
                    overflow-x-hidden
                    overflow-y-auto
                    overscroll-contain
                    transition-opacity
                    duration-200
                    ${
                        expanded
                            ? "px-5 pb-5 opacity-100"
                            : "pointer-events-none h-0 opacity-0"
                    }
                `}
                aria-hidden={!expanded}
                inert={!expanded}
            >
                <div className="w-[246px] border-t border-black pt-5">
                    {filterSections}
                </div>
            </div>
        </aside>
    );
}
