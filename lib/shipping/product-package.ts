export type ProductPackage = {
    weight: number;
    width: number;
    height: number;
    length: number;
};

export function getProductPackage(
    format: string,
): ProductPackage {
    const normalized =
        format.trim().toLowerCase();

    switch (normalized) {
        case "lp":
        case "vinil":
        case "12":
        case '12"':
            return {
                weight: 0.45,
                width: 33,
                height: 1,
                length: 33,
            };

        case "7":
        case '7"':
        case "compacto":
            return {
                weight: 0.15,
                width: 20,
                height: 1,
                length: 20,
            };

        case "cd":
            return {
                weight: 0.12,
                width: 15,
                height: 2,
                length: 15,
            };

        case "cassete":
        case "cassette":
        case "fita":
            return {
                weight: 0.1,
                width: 12,
                height: 3,
                length: 8,
            };

        default:
            return {
                weight: 0.5,
                width: 33,
                height: 2,
                length: 33,
            };
    }
}