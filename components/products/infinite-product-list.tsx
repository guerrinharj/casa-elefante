"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/products/product-card";

const PRODUCTS_PER_PAGE = 24;
type WholesaleStatus = "pending" | "approved" | "rejected" | null;
type Product = {
    id: string;
    name: string;
    slug: string;
    artist: string;
    price: number;
    year: number | null;
    format: string;
    images: string[];
    stock: number;
    wholesale_only?: boolean;
};
type Filters = {
    genre?: string;
    format?: string;
    year?: string;
    artist?: string;
    label?: string;
    search?: string;
    condition?: string;
    availability?: string;
    pre_order?: string;
    country?: string;
};
type InfiniteProductListProps = {
    initialProducts: Product[];
    filters: Filters;
    isWholesale: boolean;
    wholesaleStatus: WholesaleStatus;
};

export function InfiniteProductList({
    initialProducts,
    filters,
    isWholesale,
    wholesaleStatus,
}: InfiniteProductListProps) {
    function filterProducts(productList: Product[]) {
        if (wholesaleStatus === "approved" || isWholesale) return productList;
        if (wholesaleStatus === "pending") return productList;
        return productList.filter((product) => !product.wholesale_only);
    }

    const [products, setProducts] = useState<Product[]>(() => filterProducts(initialProducts));
    const [hasMore, setHasMore] = useState(initialProducts.length === PRODUCTS_PER_PAGE);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef(1);
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(initialProducts.length === PRODUCTS_PER_PAGE);
    const filtersRef = useRef(filters);
    const requestVersionRef = useRef(0);

    useEffect(() => {
        filtersRef.current = filters;
        requestVersionRef.current += 1;
        setProducts(filterProducts(initialProducts));
        pageRef.current = 1;
        const newHasMore = initialProducts.length === PRODUCTS_PER_PAGE;
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
        filters.condition,
        filters.availability,
        filters.pre_order,
        filters.country,
        wholesaleStatus,
        isWholesale,
    ]);

    async function loadMore() {
        if (loadingRef.current || !hasMoreRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        const requestVersion = requestVersionRef.current;
        try {
            const currentFilters = filtersRef.current;
            const params = new URLSearchParams();
            params.set("page", String(pageRef.current));
            for (const key of [
                "genre", "format", "year", "artist", "label", "search",
                "condition", "availability", "pre_order", "country",
            ] as const) {
                if (currentFilters[key] !== undefined && currentFilters[key] !== "") {
                    params.set(key, currentFilters[key]);
                }
            }
            const response = await fetch(`/api/produtos?${params.toString()}`);
            if (!response.ok) throw new Error("Erro ao carregar produtos.");
            const nextProducts: Product[] = await response.json();
            if (requestVersion !== requestVersionRef.current) return;
            const visibleNextProducts = filterProducts(nextProducts);
            setProducts((currentProducts) => {
                const existingIds = new Set(currentProducts.map((product) => product.id));
                const uniqueProducts = visibleNextProducts.filter((product) => !existingIds.has(product.id));
                return [...currentProducts, ...uniqueProducts];
            });
            pageRef.current += 1;
            const newHasMore = nextProducts.length === PRODUCTS_PER_PAGE;
            hasMoreRef.current = newHasMore;
            setHasMore(newHasMore);
        } catch (error) {
            if (requestVersion === requestVersionRef.current) {
                console.error("Erro ao carregar produtos:", error);
            }
        } finally {
            if (requestVersion === requestVersionRef.current) {
                loadingRef.current = false;
                setLoading(false);
            }
        }
    }

    // The observer is recreated when filters change, so the new list can load further pages.
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !loadingRef.current && hasMoreRef.current) {
                void loadMore();
            }
        }, { rootMargin: "300px" });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [
        initialProducts,
        filters.genre,
        filters.format,
        filters.year,
        filters.artist,
        filters.label,
        filters.search,
        filters.condition,
        filters.availability,
        filters.pre_order,
        filters.country,
        hasMore,
    ]);

    return (
        <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="animate-card-in opacity-0"
                        style={{ animationDelay: `${(index % PRODUCTS_PER_PAGE) * 60}ms` }}
                    >
                        <ProductCard
                            product={product}
                            isWholesale={isWholesale}
                            wholesaleStatus={wholesaleStatus}
                        />
                    </div>
                ))}
            </div>
            {hasMore && <div ref={sentinelRef} className="h-1" />}
            {loading && <p className="py-8 text-center text-black text-sm">Carregando...</p>}
        </>
    );
}
