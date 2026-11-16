
import {
    notFound,
} from "next/navigation";

import {
    AddToCartButton,
} from "@/components/cart/add-to-cart-button";

import {
    createClient,
} from "@/lib/supabase/server";

import {
    getUserAccess,
} from "@/lib/auth";

type ProductPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

function formatPrice(value: number | string) {
    return Number(value).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        },
    );
}

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const {
        slug,
    } = await params;

    const supabase = await createClient();

    const {
        canSeeWholesalePrice,
        isWholesale,
        isAdmin,
    } = await getUserAccess();

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
            country,
            year,
            price,
            genre,
            format,
            catalog_number,
            wholesale_price,
            wholesale_only,
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

    const unavailableForUser =
        product.wholesale_only &&
        !isWholesale &&
        !isAdmin;

    return (
        <main className="p-4 md:p-6">
            <div className="mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-2">
                {/* IMAGENS DO PRODUTO */}

                <div className="animate-product-image flex flex-col gap-4">
                    {product.images?.length ? (
                        product.images.map(
                            (
                                image: string,
                                index: number,
                            ) => (
                                <div
                                    key={image}
                                    className="
                                        aspect-square
                                        rounded-xl
                                        border
                                        border-black
                                        bg-white
                                        p-3
                                        shadow-[-5px_5px_0_0_#000]
                                    "
                                >
                                    <div className="h-full w-full overflow-hidden rounded-lg bg-white">
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                            ),
                        )
                    ) : (
                        <div
                            className="
                                flex
                                aspect-square
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-black
                                bg-white
                                text-black
                                shadow-[-5px_5px_0_0_#000]
                            "
                        >
                            Sem imagem
                        </div>
                    )}
                </div>

                {/* COLUNA DIREITA */}

                <div className="animate-product-info flex flex-col gap-6">
                    {/* BOX DE INFORMAÇÕES */}

                    <div
                        className="
                            flex
                            flex-col
                            gap-6
                            rounded-xl
                            border
                            border-black
                            bg-white
                            p-5
                            text-black
                            shadow-[-5px_5px_0_0_#000]
                            md:p-6
                        "
                    >
                        {/* TÍTULO E ARTISTA */}

                        <div>
                            {product.pre_order && (
                                <div className="mb-3">
                                    <span
                                        className="
                                            inline-block
                                            rounded-full
                                            border
                                            border-black
                                            bg-white
                                            px-3
                                            py-1
                                            text-xs
                                            font-medium
                                            uppercase
                                            text-black
                                        "
                                    >
                                        Pré-venda
                                    </span>
                                </div>
                            )}

                            {product.wholesale_only && (
                                <div className="mb-3">
                                    <span
                                        className="
                                            inline-block
                                            rounded-full
                                            border
                                            border-black
                                            bg-[#FFFDE9]
                                            px-3
                                            py-1
                                            text-xs
                                            font-medium
                                            uppercase
                                            text-black
                                        "
                                    >
                                        Exclusivo para atacadistas
                                    </span>
                                </div>
                            )}


                            <h1
                                className="
                                    font-october
                                    text-6xl
                                    font-bold
                                    uppercase
                                    leading-[0.85]
                                    tracking-tight
                                    text-[#FFFDE9]
                                    md:text-5xl
                                    lg:text-6xl
                                "
                                style={{
                                    WebkitTextStroke: "3px #000000",
                                    paintOrder: "stroke fill",
                                }}
                            >
                                {product.name}
                            </h1>


                            <p className="mt-3 text-xl">
                                {product.artist}
                            </p>
                        </div>

                        {/* DETALHES PRINCIPAIS */}

                        {productDetails.length > 0 && (
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
                                            {index > 0 && (
                                                <span>/</span>
                                            )}

                                            <span>{detail}</span>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}

                        {/* INFORMAÇÕES TÉCNICAS */}

                        {(product.catalog_number ||
                            product.country ||
                            product.condition ||
                            hasDimensions ||
                            product.weight) && (
                            <div className="flex flex-col gap-4 border-t border-black/20 pt-5 text-sm">
                                {product.catalog_number && (
                                    <p>
                                        <span className="font-semibold">
                                            Número de catálogo:
                                        </span>

                                        <span className="mt-1 block">
                                            {product.catalog_number}
                                        </span>
                                    </p>
                                )}

                                {product.country && (
                                    <p>
                                        <span className="font-semibold">
                                            País:
                                        </span>

                                        <span className="mt-1 block">
                                            {product.country}
                                        </span>
                                    </p>
                                )}

                                {product.condition && (
                                    <p>
                                        <span className="font-semibold">
                                            Condição:
                                        </span>

                                        <span className="mt-1 block">
                                            {product.condition}
                                        </span>
                                    </p>
                                )}

                                {hasDimensions && (
                                    <p>
                                        <span className="font-semibold">
                                            Dimensões:
                                        </span>

                                        <span className="mt-1 block">
                                            {product.width ?? "—"}
                                            {" × "}
                                            {product.length ?? "—"}
                                            {" × "}
                                            {product.height ?? "—"}
                                            {" cm"}
                                        </span>
                                    </p>
                                )}

                                {product.weight && (
                                    <p>
                                        <span className="font-semibold">
                                            Peso:
                                        </span>

                                        <span className="mt-1 block">
                                            {product.weight} g
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* DESCRIÇÃO */}

                        {product.description && (
                            <div className="border-t border-black/20 pt-5">
                                <p className="whitespace-pre-line text-sm leading-relaxed md:text-base">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* PREÇO E ESTOQUE */}

                        <div className="border-t border-black/20 pt-5">
                            {canSeeWholesalePrice &&
                            product.wholesale_price !== null ? (
                                <div>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-lg line-through opacity-50">
                                            {formatPrice(product.price)}
                                        </p>

                                        <span className="rounded-full border border-black bg-black px-2 py-1 text-xs uppercase text-white">
                                            Atacado
                                        </span>
                                    </div>

                                    <div className="mt-1 flex items-baseline gap-2">
                                        <p className="text-3xl font-medium">
                                            {formatPrice(
                                                product.wholesale_price,
                                            )}
                                        </p>

                                        <span className="text-sm">
                                            / unidade
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-3xl font-medium">
                                    {formatPrice(product.price)}
                                </p>
                            )}

                            {product.pre_order ? (
                                <p className="mt-2 text-sm">
                                    Produto em pré-venda
                                </p>
                            ) : (
                                <p className="mt-2 text-sm">
                                    {product.stock > 0
                                        ? `${product.stock} em estoque`
                                        : "Produto indisponível"}
                                </p>
                            )}
                        </div>
                    </div>

                    
                {/* ADICIONAR AO CARRINHO */}

                {unavailableForUser ? (
                    <div className="rounded-xl border border-black bg-[#FFFDE9] p-4 text-sm text-black">
                        Este produto é exclusivo para clientes atacadistas aprovados.
                    </div>
                ) : (
                    <AddToCartButton
                        product={{
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            artist: product.artist,
                            price:
                                canSeeWholesalePrice &&
                                product.wholesale_price !== null
                                    ? Number(product.wholesale_price)
                                    : Number(product.price),
                            stock: product.stock,
                            image: product.images?.[0],
                        }}
                    />
                )}

                </div>
            </div>
        </main>
    );
}
