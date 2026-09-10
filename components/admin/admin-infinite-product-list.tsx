"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

const PRODUCTS_PER_PAGE = 24;

type Product = {
    id: string;
    name: string;
    slug: string;
    artist: string;
    price: number;
    format: string;
    year: number | null;
    stock: number | null;
    images: string[];
    created_at: string;
};

type AdminInfiniteProductListProps = {
    initialProducts: Product[];
    search?: string;
};

export function AdminInfiniteProductList({
    initialProducts,
    search,
}: AdminInfiniteProductListProps) {
    const [products, setProducts] =
        useState(initialProducts);

    const [page, setPage] = useState(1);

    const [hasMore, setHasMore] = useState(
        initialProducts.length === PRODUCTS_PER_PAGE,
    );

    const [loading, setLoading] =
        useState(false);

    const sentinelRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        setProducts(initialProducts);
        setPage(1);

        setHasMore(
            initialProducts.length ===
                PRODUCTS_PER_PAGE,
        );

        setLoading(false);
    }, [
        initialProducts,
        search,
    ]);

    async function loadMore() {
        if (loading || !hasMore) {
            return;
        }

        setLoading(true);

        try {
            const params =
                new URLSearchParams();

            params.set(
                "page",
                String(page),
            );

            if (search) {
                params.set(
                    "search",
                    search,
                );
            }

            const response = await fetch(
                `/api/admin/products?${params.toString()}`,
            );

            if (!response.ok) {
                throw new Error(
                    "Erro ao carregar mais produtos.",
                );
            }

            const nextProducts: Product[] =
                await response.json();

            setProducts(
                (currentProducts) => [
                    ...currentProducts,
                    ...nextProducts,
                ],
            );

            setPage(
                (currentPage) =>
                    currentPage + 1,
            );

            setHasMore(
                nextProducts.length ===
                    PRODUCTS_PER_PAGE,
            );
        } catch (error) {
            console.error(
                "Erro ao carregar mais produtos:",
                error,
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const sentinel =
            sentinelRef.current;

        if (!sentinel) {
            return;
        }

        const observer =
            new IntersectionObserver(
                ([entry]) => {
                    if (
                        entry.isIntersecting
                    ) {
                        loadMore();
                    }
                },
                {
                    rootMargin: "300px",
                },
            );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [
        page,
        hasMore,
        loading,
        search,
    ]);

    return (
        <>
            <div className="border-t border-black">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/admin/produtos/${product.id}/editar`}
                        className="grid grid-cols-[80px_1fr_auto] items-center gap-4 border-b border-black py-4 transition-opacity hover:opacity-60"
                    >
                        <div className="aspect-square overflow-hidden bg-neutral-100">
                            {product.images?.[0] ? (
                                <img
                                    src={
                                        product
                                            .images[0]
                                    }
                                    alt={
                                        product.name
                                    }
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
                                {
                                    product.artist
                                }
                            </p>

                            <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
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

                                <span>
                                    Estoque:{" "}
                                    {product.stock ??
                                        0}
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
                                        currency:
                                            "BRL",
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

            {hasMore && (
                <div
                    ref={sentinelRef}
                    className="h-1"
                />
            )}

            {loading && (
                <p className="py-8 text-center text-sm">
                    Carregando...
                </p>
            )}
        </>
    );
}