
import Link from "next/link";

type WholesaleStatus =
    | "pending"
    | "approved"
    | "rejected"
    | null;

type ProductCardProps = {
    product: {
        id: string;
        name: string;
        slug: string;
        artist: string;
        price: number;
        year: number | null;
        format: string | null;
        images: string[] | null;
        stock: number;
        wholesale_only?: boolean;
    };
    isWholesale?: boolean;
    wholesaleStatus?: WholesaleStatus;
};

export function ProductCard({
    product,
    isWholesale = false,
    wholesaleStatus = null,
}: ProductCardProps) {
    const image = product.images?.[0];

    const isPendingWholesaleProduct =
        product.wholesale_only &&
        wholesaleStatus === "pending" &&
        !isWholesale;

    const cardContent = (
        <>
            {/* CAPA DO DISCO */}

            <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md bg-neutral-100">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className={`
                            h-full
                            w-full
                            object-cover
                            transition-all
                            duration-300
                            ${
                                isPendingWholesaleProduct
                                    ? "grayscale opacity-50"
                                    : "group-hover:scale-[1.02]"
                            }
                        `}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs">
                        Sem imagem
                    </div>
                )}

                {product.wholesale_only && (
                    <div className="absolute bottom-2 left-2">
                        <span
                            className="
                                inline-block
                                rounded-full
                                border
                                border-black
                                bg-[#FFFDE9]
                                px-2
                                py-1
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-wide
                                shadow-[2px_2px_0_0_#000]
                            "
                        >
                            Exclusivo atacadistas
                        </span>
                    </div>
                )}

                {isPendingWholesaleProduct && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#FFFDE9]/30">
                        <span
                            className="
                                rounded-full
                                border
                                border-black
                                bg-[#FFFDE9]
                                px-2
                                py-1.5
                                text-center
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-wide
                                shadow-[2px_2px_0_0_#000]
                            "
                        >
                            Aguardando aprovação
                        </span>
                    </div>
                )}
            </div>

            {/* INFORMAÇÕES DO PRODUTO */}

            <div className="flex h-[72px] min-w-0 flex-col overflow-hidden">

                {/* NOME DO DISCO */}

                <h2
                    className="
                        w-full
                        truncate
                        text-sm
                        font-medium
                        leading-4
                    "
                    title={product.name}
                >
                    {product.name}
                </h2>

                {/* ARTISTA */}

                <p
                    className="
                        mt-1
                        w-full
                        truncate
                        text-xs
                        leading-4
                    "
                    title={product.artist}
                >
                    {product.artist}
                </p>

                {/* FORMATO, ANO E PREÇO */}

                <div className="mt-auto flex min-w-0 items-center justify-between gap-1 text-xs">
                    <div className="flex min-w-0 items-center gap-1 overflow-hidden">
                        {product.format && (
                            <span
                                className="min-w-0 truncate"
                                title={product.format}
                            >
                                {product.format}
                            </span>
                        )}

                        {product.year && (
                            <span className="shrink-0">
                                {product.year}
                            </span>
                        )}
                    </div>

                    <span className="shrink-0 whitespace-nowrap">
                        {Number(
                            product.price,
                        ).toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency: "BRL",
                            },
                        )}
                    </span>
                </div>
            </div>
        </>
    );

    const baseCardClasses = `
        flex
        w-full
        min-w-0
        flex-col
        gap-2
        overflow-hidden
        rounded-lg
        border
        border-black
        p-2
        shadow-[-4px_4px_0_0_#000]
    `;

    if (isPendingWholesaleProduct) {
        return (
            <div
                className={`
                    ${baseCardClasses}
                    cursor-not-allowed
                    bg-[#FFFDE9]
                    opacity-70
                `}
            >
                {cardContent}
            </div>
        );
    }

    return (
        <Link
            href={`/produtos/${product.slug}`}
            className={`
                group
                ${baseCardClasses}
                bg-white
                text-black
                transition-all
                duration-200
                ease-out
                hover:translate-x-1
                hover:-translate-y-1
                hover:shadow-[-8px_8px_0_0_#000]
            `}
        >
            {cardContent}
        </Link>
    );
}
