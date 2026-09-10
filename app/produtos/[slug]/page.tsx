import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { createClient } from "@/lib/supabase/server";

type ProductPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const { slug } = await params;

    const supabase =
        await createClient();

    const {
        data: product,
        error,
    } = await supabase
        .from("products")
        .select(`
            id,
            name,
            slug,
            artist,
            label,
            year,
            price,
            genre,
            format,
            description,
            stock,
            condition,
            images
        `)
        .eq("slug", slug)
        .single();

    if (error || !product) {
        notFound();
    }

    return (
        <main className="p-4 md:p-6">
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                    {product.images?.length ? (
                        product.images.map(
                            (
                                image: string,
                                index: number,
                            ) => (
                                <div
                                    key={
                                        image
                                    }
                                    className="aspect-square overflow-hidden bg-neutral-100"
                                >
                                    <img
                                        src={
                                            image
                                        }
                                        alt={`${product.name} ${
                                            index +
                                            1
                                        }`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ),
                        )
                    ) : (
                        <div className="flex aspect-square items-center justify-center bg-neutral-100">
                            Sem imagem
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="font-grotesque text-4xl font-bold uppercase">
                            {
                                product.name
                            }
                        </h1>

                        <p className="mt-2 text-xl">
                            {
                                product.artist
                            }
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        {product.label && (
                            <span>
                                {
                                    product.label
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

                        {product.format && (
                            <span>
                                {
                                    product.format
                                }
                            </span>
                        )}

                        {product.genre && (
                            <span>
                                {
                                    product.genre
                                }
                            </span>
                        )}
                    </div>

                    {product.condition && (
                        <p className="text-sm">
                            Condição:{" "}
                            {
                                product.condition
                            }
                        </p>
                    )}

                    {product.description && (
                        <p className="whitespace-pre-line">
                            {
                                product.description
                            }
                        </p>
                    )}

                    <div className="border-t border-black pt-6">
                        <p className="text-2xl">
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
                        </p>

                        <p className="mt-2 text-sm">
                            {product.stock > 0
                                ? `${product.stock} em estoque`
                                : "Produto indisponível"}
                        </p>
                    </div>

                    <AddToCartButton
                        product={{
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            artist:
                                product.artist,
                            price: Number(
                                product.price,
                            ),
                            stock:
                                product.stock,
                            image:
                                product
                                    .images?.[0],
                        }}
                    />
                </div>
            </div>
        </main>
    );
}