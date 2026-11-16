
"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

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
    wholesale_only: boolean;
};

type AdminInfiniteProductListProps = {
    initialProducts: Product[];
    search?: string;
};

export function AdminInfiniteProductList({
    initialProducts,
    search,
}: AdminInfiniteProductListProps) {
    const supabase = createClient();

    const [products, setProducts] =
        useState(initialProducts);

    const [loading, setLoading] =
        useState(false);

    const [hasMore, setHasMore] =
        useState(
            initialProducts.length ===
                PRODUCTS_PER_PAGE,
        );

    const [deletingId, setDeletingId] =
        useState<string | null>(null);

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
    }, [
        initialProducts,
        search,
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

            hasMoreRef.current =
                false;

            setHasMore(false);
        } finally {
            loadingRef.current =
                false;

            setLoading(false);
        }
    }

    async function handleDelete(
        product: Product,
    ) {
        const confirmed =
            window.confirm(
                `Tem certeza que deseja excluir "${product.name}"?`,
            );

        if (!confirmed) {
            return;
        }

        setDeletingId(
            product.id,
        );

        try {
            const { error } =
                await supabase
                    .from(
                        "products",
                    )
                    .delete()
                    .eq(
                        "id",
                        product.id,
                    );

            if (error) {
                throw error;
            }

            const updatedProducts =
                productsRef.current.filter(
                    (item) =>
                        item.id !==
                        product.id,
                );

            productsRef.current =
                updatedProducts;

            setProducts(
                updatedProducts,
            );
        } catch (error) {
            console.error(
                "Erro ao excluir produto:",
                error,
            );

            window.alert(
                "Não foi possível excluir o produto.",
            );
        } finally {
            setDeletingId(
                null,
            );
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
            <div className="flex flex-col gap-5">
                {products.map(
                    (product) => (
                        <div
                            key={product.id}
                            className="
                                grid
                                grid-cols-[80px_minmax(0,1fr)]
                                items-center
                                gap-4
                                rounded-xl
                                border
                                border-black
                                bg-white
                                p-4
                                text-black
                                shadow-[-5px_5px_0_0_#000]
                                transition-all
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-[-5px_9px_0_0_#000]
                                sm:grid-cols-[80px_minmax(0,1fr)_auto]
                                md:p-5
                            "
                        >
                            <Link
                                href={`/admin/produtos/${product.id}/editar`}
                                className="
                                    contents
                                "
                            >
                                <div
                                    className="
                                        aspect-square
                                        overflow-hidden
                                        rounded-lg
                                        border
                                        border-black
                                        bg-neutral-100
                                        transition-opacity
                                        hover:opacity-60
                                    "
                                >
                                    {product.images?.[0] ? (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="
                                                h-full
                                                w-full
                                                object-cover
                                            "
                                        />
                                    ) : (
                                        <div
                                            className="
                                                flex
                                                h-full
                                                w-full
                                                items-center
                                                justify-center
                                                text-center
                                                text-xs
                                                text-black/50
                                            "
                                        >
                                            Sem imagem
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="
                                        min-w-0
                                        transition-opacity
                                        hover:opacity-60
                                    "
                                >
                                    <div
                                        className="
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-2
                                        "
                                    >
                                        <h2
                                            className="
                                                truncate
                                                text-base
                                                font-semibold
                                                text-black
                                            "
                                        >
                                            {product.name}
                                        </h2>

                                        {product.wholesale_only && (
                                            <span
                                                className="
                                                    shrink-0
                                                    rounded-full
                                                    border
                                                    border-black
                                                    bg-black
                                                    px-2
                                                    py-0.5
                                                    text-[9px]
                                                    font-medium
                                                    uppercase
                                                    tracking-wide
                                                    text-white
                                                "
                                            >
                                                Exclusivo atacado
                                            </span>
                                        )}
                                    </div>

                                    <p
                                        className="
                                            truncate
                                            text-sm
                                            text-black/70
                                        "
                                    >
                                        {product.artist}
                                    </p>

                                    <div
                                        className="
                                            mt-2
                                            flex
                                            flex-wrap
                                            gap-x-3
                                            gap-y-1
                                            text-xs
                                            text-black/60
                                        "
                                    >
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
                                            Estoque:{" "}
                                            {product.stock ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </Link>

                            <div
                                className="
                                    col-span-2
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                    border-t
                                    border-black/10
                                    pt-3
                                    sm:col-span-1
                                    sm:flex-col
                                    sm:items-end
                                    sm:justify-center
                                    sm:border-0
                                    sm:pt-0
                                    sm:text-right
                                "
                            >
                                <p
                                    className="
                                        text-base
                                        font-semibold
                                        text-black
                                    "
                                >
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

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        text-xs
                                    "
                                >
                                    <Link
                                        href={`/admin/produtos/${product.id}/editar`}
                                        className="
                                            font-medium
                                            text-black
                                            underline
                                            underline-offset-2
                                            transition-opacity
                                            hover:opacity-60
                                        "
                                    >
                                        Editar
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                product,
                                            )
                                        }
                                        disabled={
                                            deletingId ===
                                            product.id
                                        }
                                        className="
                                            font-medium
                                            text-black
                                            underline
                                            underline-offset-2
                                            transition-opacity
                                            hover:opacity-60
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        {deletingId ===
                                        product.id
                                            ? "Excluindo..."
                                            : "Excluir"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ),
                )}
            </div>

            {hasMore && (
                <div
                    ref={sentinelRef}
                    className="h-1"
                />
            )}

            {loading && (
                <p
                    className="
                        py-8
                        text-center
                        text-sm
                        text-black
                    "
                >
                    Carregando...
                </p>
            )}
        </>
    );
}
