import Link from "next/link";

const genres = [
    "Latinos",
    "Reggae",
    "Blues",
    "Disco",
    "Soul / Funk / R&B",
    "Rap / Hip Hop",
    "MPB",
    "Samba / Pagode / Carnaval / Batucada",
    "Axé",
    "Jovem Guarda",
    "Bossa Nova",
    "Forró",
    "Choros",
    "Rock",
    "Hard Rock / Heavy Metal",
    "Pop / Alternativo",
    "Jazz",
    "House / Dance",
    "Ambient / New Age",
];

const formats = [
    "Vinil 12",
    "Compacto 7",
    "CD",
    "Cassette",
    "VHS",
    "LaserDisc",
];

export function Sidebar() {
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
                                href={`/loja?genre=${encodeURIComponent(genre)}`}
                            >
                                {genre}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2 className="mb-3 font-bold uppercase">
                    Formato
                </h2>

                <ul className="space-y-1 text-sm">
                    {formats.map((format) => (
                        <li key={format}>
                            <Link
                                href={`/loja?format=${encodeURIComponent(format)}`}
                            >
                                {format}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}