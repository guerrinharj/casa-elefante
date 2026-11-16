
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AnimatedCount } from "@/components/ui/animated-count";
import { PRODUCT_FORMATS, PRODUCT_GENRES } from "@/lib/products";
import type { ReactNode } from "react";

type SidebarProps = {
    mobile?: boolean;
};

type SidebarProduct = {
    name: string | null;
    artist: string | null;
    label: string | null;
    stock: number | null;
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

type FilterKey =
    | "genre"
    | "format"
    | "condition"
    | "pre_order"
    | "country"
    | "year";

export function Sidebar({ mobile = false }: SidebarProps) {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState<SidebarProduct[]>([]);
    const [expanded, setExpanded] = useState(false);

    const [openSections, setOpenSections] = useState<Record<FilterSection, boolean>>({
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
            const { data, error } = await supabase.from("products").select(`
                name,
                artist,
                label,
                stock,
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

    function selectedValues(key: FilterKey) {
        return (searchParams.get(key) ?? "")
            .split(",")
            .filter(Boolean);
    }

    const activeFilters = {
        genre: selectedValues("genre"),
        format: selectedValues("format"),
        condition: selectedValues("condition"),
        pre_order: selectedValues("pre_order"),
        country: selectedValues("country"),
        year: selectedValues("year"),
    };

    const search = (searchParams.get("search") ?? "")
        .trim()
        .toLocaleLowerCase("pt-BR");

    const artist = (searchParams.get("artist") ?? "")
        .trim()
        .toLocaleLowerCase("pt-BR");

    const label = (searchParams.get("label") ?? "")
        .trim()
        .toLocaleLowerCase("pt-BR");

    const availability = searchParams.get("availability");

    function matchesFilters(product: SidebarProduct) {
        if ((product.stock ?? 0) <= 0) {
            return false;
        }

        if (
            search &&
            ![product.name, product.artist].some((value) =>
                (value ?? "")
                    .toLocaleLowerCase("pt-BR")
                    .includes(search)
            )
        ) {
            return false;
        }

        if (
            artist &&
            !(product.artist ?? "")
                .toLocaleLowerCase("pt-BR")
                .includes(artist)
        ) {
            return false;
        }

        if (
            label &&
            !(product.label ?? "")
                .toLocaleLowerCase("pt-BR")
                .includes(label)
        ) {
            return false;
        }

        if (
            availability === "pre_order" &&
            product.pre_order !== true
        ) {
            return false;
        }

        if (
            availability === "ready" &&
            product.pre_order !== false
        ) {
            return false;
        }

        return (Object.keys(activeFilters) as FilterKey[]).every((key) => {
            const selected = activeFilters[key];

            if (selected.length === 0) {
                return true;
            }

            if (key === "pre_order") {
                return selected.includes(String(product.pre_order));
            }

            return selected.includes(String(product[key] ?? ""));
        });
    }

    const matchingProducts = products.filter(matchesFilters);

    function countValues(
        key: "genre" | "format" | "condition" | "country",
    ) {
        return matchingProducts.reduce<Record<string, number>>(
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

    const yearCounts = matchingProducts.reduce<Record<string, number>>(
        (acc, product) => {
            if (product.year) {
                const year = String(product.year);
                acc[year] = (acc[year] ?? 0) + 1;
            }

            return acc;
        },
        {},
    );

    const years = [
        ...new Set(
            products
                .map((product) => product.year)
                .filter((year): year is number => year !== null),
        ),
    ].sort((a, b) => b - a);

    const conditions = [
        ...new Set(
            products
                .map((product) => product.condition)
                .filter((value): value is string => Boolean(value)),
        ),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));

    const countries = [
        ...new Set(
            products
                .map((product) => product.country)
                .filter((value): value is string => Boolean(value)),
        ),
    ].sort((a, b) => a.localeCompare(b, "pt-BR"));

    const preOrderCount = matchingProducts.filter(
        (product) => product.pre_order === true,
    ).length;

    const readyCount = matchingProducts.filter(
        (product) => product.pre_order === false,
    ).length;

    const filterLinkClassName =
        "group/link flex items-center justify-between gap-4 " +
        "transition-opacity duration-200 hover:opacity-60";

    const arrowClassName =
        "mr-0 w-0 -translate-x-2 overflow-hidden opacity-0 " +
        "transition-all duration-200 ease-out " +
        "group-hover/link:mr-2 group-hover/link:w-3 " +
        "group-hover/link:translate-x-0 group-hover/link:opacity-100";

    const sectionButtonClassName =
        "group flex w-full items-center justify-between gap-4 " +
        "text-left transition-opacity duration-200 hover:opacity-70";

    const headingClassName =
        "font-october text-3xl uppercase leading-none";

    function sectionArrowClassName(section: FilterSection) {
        return `text-xl transition-transform duration-300 ease-out ${
            openSections[section] ? "rotate-90" : "rotate-0"
        }`;
    }

    function sectionContentClassName(section: FilterSection) {
        return `grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            openSections[section]
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
        }`;
    }

    function filterHref(key: FilterKey, value: string) {
        const params = new URLSearchParams(searchParams.toString());
        const current = selectedValues(key);

        const next = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];

        if (next.length) {
            params.set(key, next.join(","));
        } else {
            params.delete(key);
        }

        const query = params.toString();

        return query ? `/?${query}` : "/";
    }

    function renderFilterLink(
        key: FilterKey,
        value: string,
        label: string,
        count: number,
    ) {
        const selected = selectedValues(key).includes(value);

        return (
            <li key={`${key}-${value}`}>
                <Link
                    href={filterHref(key, value)}
                    scroll={false}
                    aria-current={selected ? "true" : undefined}
                    className={`${filterLinkClassName} ${
                        selected ? "font-bold text-md" : ""
                    }`}
                >
                    <span className="flex min-w-0 items-center">
                        <span className={arrowClassName}>→</span>
                        <span>{label}</span>

                        {selected && (
                            <span
                                className="ml-2 font-bold"
                                aria-hidden="true"
                            >
                                ×
                            </span>
                        )}
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
                            "genre",
                            genre,
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
                            "format",
                            format,
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
                                "condition",
                                condition,
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
                        "pre_order",
                        "false",
                        "Pronta Entrega",
                        readyCount,
                    )}

                    {renderFilterLink(
                        "pre_order",
                        "true",
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
                                "country",
                                country,
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
                                "year",
                                String(year),
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
            <aside className="animate-sidebar-in w-full px-4 pb-6 pt-2 text-black transition-colors duration-700 ease-in-out">
                {filterSections}
            </aside>
        );
    }

    return (
        <aside
            className={`flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-xl border border-black bg-white text-black shadow-[-5px_5px_0_0_#000] transition-[width] duration-300 ease-in-out ${
                expanded ? "w-72" : "w-14"
            }`}
        >
            <div
                className={`flex h-14 shrink-0 items-center ${
                    expanded
                        ? "justify-between px-4"
                        : "justify-center"
                }`}
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
                >
                    {expanded ? (
                        <ChevronLeft size={24} strokeWidth={2} />
                    ) : (
                        <SlidersHorizontal size={24} strokeWidth={2} />
                    )}
                </button>
            </div>

            <div
                className={`min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain transition-opacity duration-200 ${
                    expanded
                        ? "px-5 pb-5 opacity-100"
                        : "pointer-events-none h-0 opacity-0"
                }`}
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
