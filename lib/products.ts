export const PRODUCT_GENRES = [
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
] as const;

export type ProductGenre = (typeof PRODUCT_GENRES)[number];



export const PRODUCT_FORMATS = [
    "Vinil",
    "Compacto",
    "CD",
    "Cassette",
    "LaserDisc",
    "DVD",
    "VHS",
    "Livro",
] as const;

export type ProductFormat = (typeof PRODUCT_FORMATS)[number];