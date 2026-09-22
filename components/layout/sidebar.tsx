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
    const [
        products,
        setProducts,
    ] = useState<SidebarProduct[]>(
        [],
    );

    const [
        openSections,
        setOpenSections,
    ] = useState<
        Record<
            FilterSection,
            boolean
        >
    >({
        genre: false,
        format: false,
        condition: false,
        availability: false,
        country: false,
        year: false,
    });

    useEffect(() => {
        const supabase =
            createClient();

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
                        message:
                            error.message,
                        details:
                            error.details,
                        hint:
                            error.hint,
                        code:
                            error.code,
                    },
                );

                return;
            }

            setProducts(
                (data ??
                    []) as SidebarProduct[],
            );
        }

        loadProducts();
    }, []);

    function toggleSection(
        section: FilterSection,
    ) {
        setOpenSections(
            (current) => ({
                ...current,
                [section]:
                    !current[
                        section
                    ],
            }),
        );
    }

    /*
     * GÊNERO
     */

    const genreCounts =
        products.reduce<
            Record<string, number>
        >(
            (
                acc,
                product,
            ) => {
                if (
                    product.genre
                ) {
                    acc[
                        product.genre
                    ] =
                        (acc[
                            product
                                .genre
                        ] ??
                            0) +
                        1;
                }

                return acc;
            },
            {},
        );

    /*
     * FORMATO
     */

    const formatCounts =
        products.reduce<
            Record<string, number>
        >(
            (
                acc,
                product,
            ) => {
                if (
                    product.format
                ) {
                    acc[
                        product.format
                    ] =
                        (acc[
                            product
                                .format
                        ] ??
                            0) +
                        1;
                }

                return acc;
            },
            {},
        );

    /*
     * ANO
     */

    const yearCounts =
        products.reduce<
            Record<string, number>
        >(
            (
                acc,
                product,
            ) => {
                if (
                    product.year
                ) {
                    const year =
                        String(
                            product.year,
                        );

                    acc[year] =
                        (acc[
                            year
                        ] ??
                            0) +
                        1;
                }

                return acc;
            },
            {},
        );

    const years =
        Object.keys(
            yearCounts,
        )
            .map(Number)
            .sort(
                (a, b) =>
                    b - a,
            );

    /*
     * CONDIÇÃO
     */

    const conditionCounts =
        products.reduce<
            Record<string, number>
        >(
            (
                acc,
                product,
            ) => {
                if (
                    product.condition
                ) {
                    acc[
                        product.condition
                    ] =
                        (acc[
                            product
                                .condition
                        ] ??
                            0) +
                        1;
                }

                return acc;
            },
            {},
        );

    const conditions =
        Object.keys(
            conditionCounts,
        ).sort((a, b) =>
            a.localeCompare(
                b,
                "pt-BR",
            ),
        );

    /*
     * PAÍS
     */

    const countryCounts =
        products.reduce<
            Record<string, number>
        >(
            (
                acc,
                product,
            ) => {
                if (
                    product.country
                ) {
                    acc[
                        product.country
                    ] =
                        (acc[
                            product
                                .country
                        ] ??
                            0) +
                        1;
                }

                return acc;
            },
            {},
        );

    const countries =
        Object.keys(
            countryCounts,
        ).sort((a, b) =>
            a.localeCompare(
                b,
                "pt-BR",
            ),
        );

    /*
     * DISPONIBILIDADE
     */

    const preOrderCount =
        products.filter(
            (product) =>
                product.pre_order ===
                true,
        ).length;

    const readyCount =
        products.filter(
            (product) =>
                product.pre_order !==
                true,
        ).length;

    /*
     * CLASSES
     */

    const filterLinkClassName =
        "group/link flex items-center justify-between gap-4";

    const arrowClassName =
        "mr-0 w-0 -translate-x-2 overflow-hidden opacity-0 " +
        "transition-all duration-200 ease-out " +
        "group-hover/link:mr-2 " +
        "group-hover/link:w-3 " +
        "group-hover/link:translate-x-0 " +
        "group-hover/link:opacity-100";

    const sectionButtonClassName =
        "group flex w-full items-center justify-between gap-4 text-left";

    function sectionArrowClassName(
        section: FilterSection,
    ) {
        return `
            text-xl
            transition-transform
            duration-300
            ease-out
            ${
                openSections[
                    section
                ]
                    ? "rotate-90"
                    : "rotate-0"
            }
        `;
    }

    function sectionContentClassName(
        section: FilterSection,
    ) {
        return `
            grid
            transition-[grid-template-rows,opacity]
            duration-300
            ease-out
            ${
                openSections[
                    section
                ]
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
            }
        `;
    }

    return (
        <aside
            className={
                mobile
                    ? `
                        animate-sidebar-in
                        w-full
                        px-4
                        pb-6
                        pt-2
                    `
                    : `
                        h-[calc(100vh-64px)]
                        w-64
                        overflow-y-auto
                        border-r
                        border-black
                        bg-white
                        p-6
                    `
            }
        >
            {/* GÊNERO */}

            <div className="mb-8">
                <button
                    type="button"
                    onClick={() =>
                        toggleSection(
                            "genre",
                        )
                    }
                    className={
                        sectionButtonClassName
                    }
                    aria-expanded={
                        openSections.genre
                    }
                >
                    <h2 className="font-anton text-2xl font-bold uppercase">
                        Gênero
                    </h2>

                    <span
                        className={sectionArrowClassName(
                            "genre",
                        )}
                    >
                        →
                    </span>
                </button>

                <div
                    className={sectionContentClassName(
                        "genre",
                    )}
                >
                    <div className="overflow-hidden">
                        <ul className="mt-3 space-y-1 text-sm">
                            {PRODUCT_GENRES.map(
                                (
                                    genre,
                                ) => (
                                    <li
                                        key={
                                            genre
                                        }
                                    >
                                        <Link
                                            href={`/?genre=${encodeURIComponent(
                                                genre,
                                            )}`}
                                            className={
                                                filterLinkClassName
                                            }
                                        >
                                            <span className="flex min-w-0 items-center">
                                                <span
                                                    className={
                                                        arrowClassName
                                                    }
                                                >
                                                    →
                                                </span>

                                                <span>
                                                    {
                                                        genre
                                                    }
                                                </span>
                                            </span>

                                            <span className="shrink-0">
                                                <AnimatedCount
                                                    value={
                                                        genreCounts[
                                                            genre
                                                        ] ??
                                                        0
                                                    }
                                                />
                                            </span>
                                        </Link>
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* FORMATO */}

            <div className="mb-8">
                <button
                    type="button"
                    onClick={() =>
                        toggleSection(
                            "format",
                        )
                    }
                    className={
                        sectionButtonClassName
                    }
                    aria-expanded={
                        openSections.format
                    }
                >
                    <h2 className="font-anton text-2xl font-bold uppercase">
                        Formato
                    </h2>

                    <span
                        className={sectionArrowClassName(
                            "format",
                        )}
                    >
                        →
                    </span>
                </button>

                <div
                    className={sectionContentClassName(
                        "format",
                    )}
                >
                    <div className="overflow-hidden">
                        <ul className="mt-3 space-y-1 text-sm">
                            {PRODUCT_FORMATS.map(
                                (
                                    format,
                                ) => (
                                    <li
                                        key={
                                            format
                                        }
                                    >
                                        <Link
                                            href={`/?format=${encodeURIComponent(
                                                format,
                                            )}`}
                                            className={
                                                filterLinkClassName
                                            }
                                        >
                                            <span className="flex min-w-0 items-center">
                                                <span
                                                    className={
                                                        arrowClassName
                                                    }
                                                >
                                                    →
                                                </span>

                                                <span>
                                                    {
                                                        format
                                                    }
                                                </span>
                                            </span>

                                            <span className="shrink-0">
                                                <AnimatedCount
                                                    value={
                                                        formatCounts[
                                                            format
                                                        ] ??
                                                        0
                                                    }
                                                />
                                            </span>
                                        </Link>
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* CONDIÇÃO */}

            <div className="mb-8">
                <button
                    type="button"
                    onClick={() =>
                        toggleSection(
                            "condition",
                        )
                    }
                    className={
                        sectionButtonClassName
                    }
                    aria-expanded={
                        openSections.condition
                    }
                >
                    <h2 className="font-anton text-2xl font-bold uppercase">
                        Condição
                    </h2>

                    <span
                        className={sectionArrowClassName(
                            "condition",
                        )}
                    >
                        →
                    </span>
                </button>

                <div
                    className={sectionContentClassName(
                        "condition",
                    )}
                >
                    <div className="overflow-hidden">
                        {conditions.length ===
                        0 ? (
                            <span className="mt-3 block text-sm">
                                —
                            </span>
                        ) : (
                            <ul className="mt-3 space-y-1 text-sm">
                                {conditions.map(
                                    (
                                        condition,
                                    ) => (
                                        <li
                                            key={
                                                condition
                                            }
                                        >
                                            <Link
                                                href={`/?condition=${encodeURIComponent(
                                                    condition,
                                                )}`}
                                                className={
                                                    filterLinkClassName
                                                }
                                            >
                                                <span className="flex min-w-0 items-center">
                                                    <span
                                                        className={
                                                            arrowClassName
                                                        }
                                                    >
                                                        →
                                                    </span>

                                                    <span>
                                                        {
                                                            condition
                                                        }
                                                    </span>
                                                </span>

                                                <span className="shrink-0">
                                                    <AnimatedCount
                                                        value={
                                                            conditionCounts[
                                                                condition
                                                            ] ??
                                                            0
                                                        }
                                                    />
                                                </span>
                                            </Link>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* DISPONIBILIDADE */}

            <div className="mb-8">
                <button
                    type="button"
                    onClick={() =>
                        toggleSection(
                            "availability",
                        )
                    }
                    className={
                        sectionButtonClassName
                    }
                    aria-expanded={
                        openSections.availability
                    }
                >
                    <h2 className="font-anton text-2xl font-bold uppercase">
                        Disponibilidade
                    </h2>

                    <span
                        className={sectionArrowClassName(
                            "availability",
                        )}
                    >
                        →
                    </span>
                </button>

                <div
                    className={sectionContentClassName(
                        "availability",
                    )}
                >
                    <div className="overflow-hidden">
                        <ul className="mt-3 space-y-1 text-sm">
                            <li>
                                <Link
                                    href="/?pre_order=false"
                                    className={
                                        filterLinkClassName
                                    }
                                >
                                    <span className="flex min-w-0 items-center">
                                        <span
                                            className={
                                                arrowClassName
                                            }
                                        >
                                            →
                                        </span>

                                        <span>
                                            Pronta
                                            Entrega
                                        </span>
                                    </span>

                                    <span className="shrink-0">
                                        <AnimatedCount
                                            value={
                                                readyCount
                                            }
                                        />
                                    </span>
                                </Link>
                            </li>

                            <li>
                                <Link
                                    href="/?pre_order=true"
                                    className={
                                        filterLinkClassName
                                    }
                                >
                                    <span className="flex min-w-0 items-center">
                                        <span
                                            className={
                                                arrowClassName
                                            }
                                        >
                                            →
                                        </span>

                                        <span>
                                            Pré-Order
                                        </span>
                                    </span>

                                    <span className="shrink-0">
                                        <AnimatedCount
                                            value={
                                                preOrderCount
                                            }
                                        />
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* PAÍS */}

            <div className="mb-8">
                <button
                    type="button"
                    onClick={() =>
                        toggleSection(
                            "country",
                        )
                    }
                    className={
                        sectionButtonClassName
                    }
                    aria-expanded={
                        openSections.country
                    }
                >
                    <h2 className="font-anton text-2xl font-bold uppercase">
                        País
                    </h2>

                    <span
                        className={sectionArrowClassName(
                            "country",
                        )}
                    >
                        →
                    </span>
                </button>

                <div
                    className={sectionContentClassName(
                        "country",
                    )}
                >
                    <div className="overflow-hidden">
                        {countries.length ===
                        0 ? (
                            <span className="mt-3 block text-sm">
                                —
                            </span>
                        ) : (
                            <ul className="mt-3 space-y-1 text-sm">
                                {countries.map(
                                    (
                                        country,
                                    ) => (
                                        <li
                                            key={
                                                country
                                            }
                                        >
                                            <Link
                                                href={`/?country=${encodeURIComponent(
                                                    country,
                                                )}`}
                                                className={
                                                    filterLinkClassName
                                                }
                                            >
                                                <span className="flex min-w-0 items-center">
                                                    <span
                                                        className={
                                                            arrowClassName
                                                        }
                                                    >
                                                        →
                                                    </span>

                                                    <span>
                                                        {
                                                            country
                                                        }
                                                    </span>
                                                </span>

                                                <span className="shrink-0">
                                                    <AnimatedCount
                                                        value={
                                                            countryCounts[
                                                                country
                                                            ] ??
                                                            0
                                                        }
                                                    />
                                                </span>
                                            </Link>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* ANO */}

            <div>
                <button
                    type="button"
                    onClick={() =>
                        toggleSection(
                            "year",
                        )
                    }
                    className={
                        sectionButtonClassName
                    }
                    aria-expanded={
                        openSections.year
                    }
                >
                    <h2 className="font-anton text-2xl font-bold uppercase">
                        Ano
                    </h2>

                    <span
                        className={sectionArrowClassName(
                            "year",
                        )}
                    >
                        →
                    </span>
                </button>

                <div
                    className={sectionContentClassName(
                        "year",
                    )}
                >
                    <div className="overflow-hidden">
                        {years.length ===
                        0 ? (
                            <span className="mt-3 block text-sm">
                                —
                            </span>
                        ) : (
                            <ul className="mt-3 space-y-1 text-sm">
                                {years.map(
                                    (
                                        year,
                                    ) => (
                                        <li
                                            key={
                                                year
                                            }
                                        >
                                            <Link
                                                href={`/?year=${year}`}
                                                className={
                                                    filterLinkClassName
                                                }
                                            >
                                                <span className="flex min-w-0 items-center">
                                                    <span
                                                        className={
                                                            arrowClassName
                                                        }
                                                    >
                                                        →
                                                    </span>

                                                    <span>
                                                        {
                                                            year
                                                        }
                                                    </span>
                                                </span>

                                                <span className="shrink-0">
                                                    <AnimatedCount
                                                        value={
                                                            yearCounts[
                                                                year
                                                            ] ??
                                                            0
                                                        }
                                                    />
                                                </span>
                                            </Link>
                                        </li>
                                    ),
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}