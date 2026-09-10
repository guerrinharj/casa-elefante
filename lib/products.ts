export const PRODUCT_GENRES = [
    "Ambient / New Age",
    "Axé",
    "Blues",
    "Bossa Nova",
    "Choros",
    "Disco",
    "Forró",
    "Hard Rock / Heavy Metal",
    "House / Dance",
    "Humor",
    "Jazz",
    "Jovem Guarda",
    "Latinos",
    "MPB",
    "Novelas",
    "Orquestras Nacionais",
    "Pop / Alternativo",
    "Rap / Hip Hop",
    "Reggae",
    "Regionais",
    "Rock",
    "Samba / Pagode / Carnaval / Batucada",
    "Soul / Funk / R&B",
    "Velha Guarda",
] as const;

export type ProductGenre = (typeof PRODUCT_GENRES)[number];

export const PRODUCT_FORMATS = [
    "Cassette",
    "CD",
    "Compacto",
    "DVD",
    "LaserDisc",
    "Livro",
    "VHS",
    "Vinil",
] as const;

export type ProductFormat = (typeof PRODUCT_FORMATS)[number];