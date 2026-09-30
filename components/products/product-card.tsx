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
    const image =
        product.images?.[0];

    const isPendingWholesaleProduct =
        product.wholesale_only &&
        wholesaleStatus === "pending" &&
        !isWholesale;

    const cardContent = (
        <>
            <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
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
                    <div className="flex h-full w-full items-center justify-center text-sm">
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
                                bg-white
                                px-2
                                py-1
                                text-[10px]
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
                    <div className="absolute inset-0 flex items-center justify-center bg-white/30">
                        <span
                            className="
                                rounded-full
                                border
                                border-black
                                bg-white
                                px-3
                                py-2
                                text-center
                                text-[10px]
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

            <div>
                <h2 className="font-medium">
                    {product.name}
                </h2>

                <p className="text-sm">
                    {product.artist}
                </p>

                <div className="mt-1 flex items-center justify-between gap-4 text-sm">
                    <div className="flex gap-2">
                        {product.format && (
                            <span>
                                {
                                    product.format
                                }
                            </span>
                        )}

                        {product.year && (
                            <span>
                                {
                                    product.year
                                }
                            </span>
                        )}
                    </div>

                    <span>
                        {Number(
                            product.price,
                        ).toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency:
                                    "BRL",
                            },
                        )}
                    </span>
                </div>
            </div>
        </>
    );

    if (
        isPendingWholesaleProduct
    ) {
        return (
            <div
                className="
                    flex
                    cursor-not-allowed
                    flex-col
                    gap-3
                    rounded-xl
                    border
                    border-black
                    bg-white
                    p-3
                    opacity-70
                    shadow-[-5px_5px_0_0_#000]
                "
            >
                {cardContent}
            </div>
        );
    }

    return (
        <Link
            href={`/produtos/${product.slug}`}
            className="
                group
                flex
                flex-col
                gap-3
                rounded-xl
                border
                border-black
                bg-white
                p-3
                shadow-[-5px_5px_0_0_#000]
                transition-all
                duration-200
                ease-out
                hover:translate-x-1
                hover:-translate-y-1
                hover:shadow-[-9px_9px_0_0_#000]
            "
        >
            {cardContent}
        </Link>
    );
}