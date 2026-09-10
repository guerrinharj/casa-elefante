import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
    const supabase = await createClient();

    const { data: products, error } = await supabase
        .from("products")
        .select(`
            id,
            name,
            slug,
            artist,
            price,
            format,
            year,
            stock,
            images,
            created_at
        `)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        console.error(
            "Erro ao carregar produtos:",
            error,
        );
    }

    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-medium">
                            Produtos
                        </h1>

                        <p className="mt-1 text-sm">
                            Gerencie os produtos da loja.
                        </p>
                    </div>

                    <Link
                        href="/admin/produtos/novo"
                        className="border border-black px-4 py-2 transition-opacity hover:opacity-60"
                    >
                        + Adicionar produto
                    </Link>
                </div>

                <div className="border-t border-black">
                    {!products || products.length === 0 ? (
                        <p className="py-6 text-sm">
                            Nenhum produto cadastrado ainda.
                        </p>
                    ) : (
                        <div>
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/admin/produtos/${product.id}/editar`}
                                    className="grid grid-cols-[80px_1fr_auto] items-center gap-4 border-b border-black py-4 transition-opacity hover:opacity-60"
                                >
                                    <div className="aspect-square overflow-hidden bg-neutral-100">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs">
                                                Sem imagem
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="truncate font-medium">
                                            {product.name}
                                        </h2>

                                        <p className="truncate text-sm">
                                            {product.artist}
                                        </p>

                                        <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
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

                                            <span>
                                                Estoque: {product.stock ?? 0}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p>
                                            {Number(
                                                product.price,
                                            ).toLocaleString(
                                                "pt-BR",
                                                {
                                                    style: "currency",
                                                    currency: "BRL",
                                                },
                                            )}
                                        </p>

                                        <span className="text-xs underline">
                                            Editar
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}