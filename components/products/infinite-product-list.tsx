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

    const [page, setPage] = useState(1);

    const [hasMore, setHasMore] = useState(
        initialProducts.length === PRODUCTS_PER_PAGE,
    );

    const [loading, setLoading] = useState(false);

    const sentinelRef = useRef<HTMLDivElement>(null);

    async function loadMore() {
        if (loading || !hasMore) {
            return;
        }

        setLoading(true);

        try {
            const params = new URLSearchParams();

            params.set("page", String(page));

            if (filters.genre) {
                params.set("genre", filters.genre);
            }

            if (filters.format) {
                params.set("format", filters.format);
            }

            if (filters.year) {
                params.set("year", filters.year);
            }

            if (filters.artist) {
                params.set("artist", filters.artist);
            }

            if (filters.label) {
                params.set("label", filters.label);
            }

            const response = await fetch(
                `/api/products?${params.toString()}`,
            );

            if (!response.ok) {
                throw new Error(
                    "Erro ao carregar mais produtos.",
                );
            }

            const nextProducts: Product[] =
                await response.json();

            setProducts((currentProducts) => [
                ...currentProducts,
                ...nextProducts,
            ]);

            setPage((currentPage) => currentPage + 1);

            setHasMore(
                nextProducts.length === PRODUCTS_PER_PAGE,
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
        const sentinel = sentinelRef.current;

        if (!sentinel) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
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
    }, [page, hasMore, loading]);

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