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
            catalog_number,
            description,
            stock,
            condition,
            images,
            width,
            height,
            length,
            weight,
            pre_order
        `)
        .eq("slug", slug)
        .single();

    if (error || !product) {
        notFound();
    }

    const productDetails = [
        product.label,
        product.year,
        product.format,
        product.genre,
    ].filter(Boolean);

    const hasDimensions =
        product.width ||
        product.height ||
        product.length;

    return (
        <main className="p-4 md:p-6">
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
                <div className="animate-product-image flex flex-col gap-4">
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
                                    className="aspect-square rounded-xl border border-black bg-white p-3 shadow-[6px_6px_0_0_#000]"
                                >
                                    <div className="h-full w-full overflow-hidden rounded-lg">
                                        <img
                                            src={
                                                image
                                            }
                                            alt={`${product.name} ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            ),
                        )
                    ) : (
                        <div className="flex aspect-square items-center justify-center rounded-2xl border border-black bg-neutral-100 shadow-[6px_6px_0_0_#000]">
                            Sem imagem
                        </div>
                    )}
                </div>

                <div className="animate-product-info flex flex-col gap-6">
                    <div>
                        {product.pre_order && (
                            <div className="mb-3">
                                <span className="inline-block rounded-full border border-black bg-black px-3 py-1 text-xs font-medium uppercase text-white">
                                    Pré-venda
                                </span>
                            </div>
                        )}

                        <h1 className="font-anton text-4xl font-bold uppercase">
                            {product.name}
                        </h1>

                        <p className="mt-2 text-xl">
                            {product.artist}
                        </p>
                    </div>

                    {productDetails.length >
                        0 && (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
                            {productDetails.map(
                                (
                                    detail,
                                    index,
                                ) => (
                                    <div
                                        key={`${detail}-${index}`}
                                        className="flex items-center gap-2"
                                    >
                                        {index >
                                            0 && (
                                            <span>
                                                /
                                            </span>
                                        )}

                                        <span>
                                            {
                                                detail
                                            }
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    )}

                    {product.catalog_number && (
                        <p className="text-sm">
                            <span className="underline">
                                Número de
                                catálogo:
                            </span>

                            <br />

                            {
                                product.catalog_number
                            }
                        </p>
                    )}

                    {product.condition && (
                        <p className="text-sm">
                            <span className="underline">
                                Condição:
                            </span>

                            <br />

                            {
                                product.condition
                            }
                        </p>
                    )}

                    {(hasDimensions ||
                        product.weight) && (
                        <div className="flex flex-col gap-3 text-sm">
                            {hasDimensions && (
                                <p>
                                    <span className="underline">
                                        Dimensões:
                                    </span>

                                    <br />

                                    {product.width ??
                                        "—"}
                                    {" × "}
                                    {product.length ??
                                        "—"}
                                    {" × "}
                                    {product.height ??
                                        "—"}{" "}
                                    cm
                                </p>
                            )}

                            {product.weight && (
                                <p>
                                    <span className="underline">
                                        Peso:
                                    </span>

                                    <br />

                                    {
                                        product.weight
                                    }{" "}
                                    g
                                </p>
                            )}
                        </div>
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

                        {product.pre_order ? (
                            <p className="mt-2 text-sm">
                                Produto em
                                pré-venda
                            </p>
                        ) : (
                            <p className="mt-2 text-sm">
                                {product.stock >
                                0
                                    ? `${product.stock} em estoque`
                                    : "Produto indisponível"}
                            </p>
                        )}
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