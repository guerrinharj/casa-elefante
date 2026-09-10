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

    const [loading, setLoading] =
        useState(false);

    const [hasMore, setHasMore] =
        useState(
            initialProducts.length ===
                PRODUCTS_PER_PAGE,
        );

    const sentinelRef =
        useRef<HTMLDivElement>(null);

    const pageRef = useRef(1);

    const loadingRef = useRef(false);

    const hasMoreRef = useRef(
        initialProducts.length ===
            PRODUCTS_PER_PAGE,
    );

    const productsRef =
        useRef(initialProducts);

    const searchRef = useRef(search);

    useEffect(() => {
        searchRef.current = search;

        productsRef.current =
            initialProducts;

        setProducts(
            initialProducts,
        );

        pageRef.current = 1;

        loadingRef.current = false;

        setLoading(false);

        const newHasMore =
            initialProducts.length ===
            PRODUCTS_PER_PAGE;

        hasMoreRef.current =
            newHasMore;

        setHasMore(
            newHasMore,
        );
    }, [search]);

    async function loadMore() {
        if (
            loadingRef.current ||
            !hasMoreRef.current
        ) {
            return;
        }

        loadingRef.current = true;
        setLoading(true);

        try {
            const params =
                new URLSearchParams();

            params.set(
                "page",
                String(
                    pageRef.current,
                ),
            );

            if (
                searchRef.current
            ) {
                params.set(
                    "search",
                    searchRef.current,
                );
            }

            const response =
                await fetch(
                    `/api/admin/products?${params.toString()}`,
                    {
                        cache: "no-store",
                    },
                );

            if (!response.ok) {
                throw new Error(
                    "Erro ao carregar mais produtos.",
                );
            }

            const nextProducts:
                Product[] =
                    await response.json();

            /*
             * Se a API não devolver nada,
             * chegamos ao final.
             */
            if (
                nextProducts.length === 0
            ) {
                hasMoreRef.current =
                    false;

                setHasMore(false);

                return;
            }

            const existingIds =
                new Set(
                    productsRef.current.map(
                        (product) =>
                            product.id,
                    ),
                );

            const uniqueProducts =
                nextProducts.filter(
                    (product) =>
                        !existingIds.has(
                            product.id,
                        ),
                );

            /*
             * Proteção contra loop:
             *
             * Se a API devolver somente
             * produtos que já carregamos,
             * interrompemos o infinite scroll.
             */
            if (
                uniqueProducts.length === 0
            ) {
                hasMoreRef.current =
                    false;

                setHasMore(false);

                return;
            }

            const updatedProducts = [
                ...productsRef.current,
                ...uniqueProducts,
            ];

            productsRef.current =
                updatedProducts;

            setProducts(
                updatedProducts,
            );

            pageRef.current += 1;

            /*
             * Menos de 24 produtos significa
             * que essa foi a última página.
             */
            const newHasMore =
                nextProducts.length ===
                PRODUCTS_PER_PAGE;

            hasMoreRef.current =
                newHasMore;

            setHasMore(
                newHasMore,
            );
        } catch (error) {
            console.error(
                "Erro ao carregar mais produtos:",
                error,
            );

            /*
             * Se houver erro, também paramos
             * para evitar requests infinitas.
             */
            hasMoreRef.current =
                false;

            setHasMore(false);
        } finally {
            loadingRef.current =
                false;

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
                        !entry.isIntersecting
                    ) {
                        return;
                    }

                    loadMore();
                },
                {
                    rootMargin:
                        "300px",
                },
            );

        observer.observe(
            sentinel,
        );

        return () => {
            observer.disconnect();
        };
    }, [search]);

    return (
        <>
            <div className="border-t border-black">
                {products.map(
                    (product) => (
                        <Link
                            key={
                                product.id
                            }
                            href={`/admin/produtos/${product.id}/editar`}
                            className="grid grid-cols-[80px_1fr_auto] items-center gap-4 border-b border-black py-4 transition-opacity hover:opacity-60"
                        >
                            <div className="aspect-square overflow-hidden bg-neutral-100">
                                {product
                                    .images?.[0] ? (
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
                                    {
                                        product.name
                                    }
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
                    ),
                )}
            </div>

            {hasMore && (
                <div
                    ref={
                        sentinelRef
                    }
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