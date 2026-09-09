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

export async function Sidebar() {
    const supabase = await createClient();

    const { data: products, error } = await supabase
        .from("products")
        .select("genre, format, year");


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

    return (
        <aside className="w-64 shrink-0 border-r border-black p-6">
            <div className="mb-8">
                <h2 className="mb-3 font-bold uppercase">
                    Gênero
                </h2>

                <ul className="space-y-1 text-sm">
                    {genres.map((genre) => (
                        <li key={genre}>
                            <Link
                                href={`/?genre=${encodeURIComponent(genre)}`}
                                className="flex justify-between gap-4"
                            >
                                <span>
                                    {genre}
                                </span>

                                <span>
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
                                className="flex justify-between gap-4"
                            >
                                <span>
                                    {format}
                                </span>

                                <span>
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
                                    className="flex justify-between gap-4"
                                >
                                    <span>
                                        {year}
                                    </span>

                                    <span>
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