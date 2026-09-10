"use client";

import { useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/products/product-card";

const PRODUCTS_PER_PAGE = 24;

type Product = {
    id: string;
    name: string;
    slug: string;
    artist: string;
    price: number;
    year: number | null;
    format: string;
    images: string[];
};

type Filters = {
    genre?: string;
    format?: string;
    year?: string;
    artist?: string;
    label?: string;
    search?: string;
};

type InfiniteProductListProps = {
    initialProducts: Product[];
    filters: Filters;
};

export function InfiniteProductList({
    initialProducts,
    filters,
}: InfiniteProductListProps) {
    const [products, setProducts] = useState(initialProducts);

    const [hasMore, setHasMore] = useState(
        initialProducts.length === PRODUCTS_PER_PAGE,
    );

    const [loading, setLoading] = useState(false);

    const sentinelRef = useRef<HTMLDivElement>(null);

    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(
        initialProducts.length === PRODUCTS_PER_PAGE,
    );

    const filtersRef = useRef(filters);

    useEffect(() => {
        filtersRef.current = filters;

        setProducts(initialProducts);

        pageRef.current = 1;

        const newHasMore =
            initialProducts.length === PRODUCTS_PER_PAGE;

        hasMoreRef.current = newHasMore;

        setHasMore(newHasMore);

        loadingRef.current = false;
        setLoading(false);
    }, [
        initialProducts,
        filters.genre,
        filters.format,
        filters.year,
        filters.artist,
        filters.label,
        filters.search,
    ]);

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
            const filters = filtersRef.current;

            const params = new URLSearchParams();

            params.set(
                "page",
                String(pageRef.current),
            );

            if (filters.genre) {
                params.set(
                    "genre",
                    filters.genre,
                );
            }

            if (filters.format) {
                params.set(
                    "format",
                    filters.format,
                );
            }

            if (filters.year) {
                params.set(
                    "year",
                    filters.year,
                );
            }

            if (filters.artist) {
                params.set(
                    "artist",
                    filters.artist,
                );
            }

            if (filters.label) {
                params.set(
                    "label",
                    filters.label,
                );
            }

            if (filters.search) {
                params.set(
                    "search",
                    filters.search,
                );
            }

            const response = await fetch(
                `/api/products?${params.toString()}`,
            );

            if (!response.ok) {
                throw new Error(
                    "Erro ao carregar produtos.",
                );
            }

            const nextProducts: Product[] =
                await response.json();

            setProducts((currentProducts) => {
                const existingIds = new Set(
                    currentProducts.map(
                        (product) => product.id,
                    ),
                );

                const uniqueProducts =
                    nextProducts.filter(
                        (product) =>
                            !existingIds.has(
                                product.id,
                            ),
                    );

                return [
                    ...currentProducts,
                    ...uniqueProducts,
                ];
            });

            pageRef.current += 1;

            const newHasMore =
                nextProducts.length ===
                PRODUCTS_PER_PAGE;

            hasMoreRef.current = newHasMore;

            setHasMore(newHasMore);
        } catch (error) {
            console.error(
                "Erro ao carregar produtos:",
                error,
            );
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }

    useEffect(() => {
        const sentinel = sentinelRef.current;

        if (!sentinel) {
            return;
        }

        const observer =
            new IntersectionObserver(
                ([entry]) => {
                    if (
                        entry.isIntersecting &&
                        !loadingRef.current &&
                        hasMoreRef.current
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
    }, []);

    return (
        <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
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