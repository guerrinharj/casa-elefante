import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

const genres = [
    "LATINOS",
    "REGGAE",
    "BLUES",
    "DISCO",
    "SOUL / FUNK / R&B",
    "HUMOR",
    "RAP / HIP HOP",
    "NOVELAS",
    "MPB",
    "SAMBA / PAGODE / CARNAVAL / BATUCADA",
    "ORQUESTRAS NACIONAIS",
    "AXÉ",
    "JOVEM GUARDA",
    "BOSSA NOVA",
    "REGIONAIS",
    "VELHA GUARDA",
    "FORRÓ",
    "CHOROS",
    "ROCK",
    "HARD ROCK / HEAVY METAL",
    "POP / ALTERNATIVO",
    "JAZZ",
    "HOUSE / DANCE",
    "AMBIENT / NEW AGE",
];

const formats = [
    "Vinil 12",
    "Compacto 7",
    "CD",
    "Cassette",
    "VHS",
    "LaserDisc",
];

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

    const genreCounts = products?.reduce<Record<string, number>>(
        (acc, product) => {
            if (product.genre) {
                acc[product.genre] = (acc[product.genre] ?? 0) + 1;
            }

            return acc;
        },
        {}
    ) ?? {};

    const formatCounts = products?.reduce<Record<string, number>>(
        (acc, product) => {
            if (product.format) {
                acc[product.format] = (acc[product.format] ?? 0) + 1;
            }

            return acc;
        },
        {}
    ) ?? {};

    const yearCounts = products?.reduce<Record<string, number>>(
        (acc, product) => {
            if (product.year) {
                const year = String(product.year);

                acc[year] = (acc[year] ?? 0) + 1;
            }

            return acc;
        },
        {}
    ) ?? {};

    const years = Object.keys(yearCounts)
        .map(Number)
        .sort((a, b) => b - a);

    const filterLinkClassName =
        "group flex items-center justify-between gap-4";

    const arrowClassName =
        "mr-0 w-0 -translate-x-2 overflow-hidden opacity-0 transition-all duration-200 ease-out group-hover:mr-2 group-hover:w-3 group-hover:translate-x-0 group-hover:opacity-100";

    return (
        <aside
            className={
                mobile
                    ? "w-full px-4 pb-6 pt-2"
                    : "w-64 shrink-0 border-r border-black p-6"
            }
        >
            <div className="mb-8">
                <h2 className="mb-3 font-bold uppercase">
                    Gênero
                </h2>

                <ul className="space-y-1 text-sm">
                    {genres.map((genre) => (
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
                                    {genreCounts[genre] ?? 0}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mb-8">
                <h2 className="mb-3 font-bold uppercase">
                    Formato
                </h2>

                <ul className="space-y-1 text-sm">
                    {formats.map((format) => (
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
                                    {formatCounts[format] ?? 0}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2 className="mb-3 font-bold uppercase">
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
                                        {yearCounts[String(year)] ?? 0}
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