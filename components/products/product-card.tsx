import Link from "next/link";

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
    };
};

export function ProductCard({
    product,
}: ProductCardProps) {
    const image = product.images?.[0];

    return (
        <Link
            href={`/produtos/${product.slug}`}
            className="
                group flex flex-col gap-3
                rounded-xl border border-black
                bg-white p-3
                shadow-[-5px_5px_0_0_#000]
                transition-all duration-200 ease-out
                hover:translate-x-1 hover:-translate-y-1
                hover:shadow-[-9px_9px_0_0_#000]
            "
        >
            <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm">
                        Sem imagem
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
                                {product.format}
                            </span>
                        )}

                        {product.year && (
                            <span>
                                {product.year}
                            </span>
                        )}
                    </div>

                    <span>
                        {Number(product.price).toLocaleString(
                            "pt-BR",
                            {
                                style: "currency",
                                currency: "BRL",
                            },
                        )}
                    </span>
                </div>
            </div>
        </Link>
    );
}