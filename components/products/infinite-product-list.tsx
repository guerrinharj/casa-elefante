"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ProductCard,
} from "@/components/products/product-card";

const PRODUCTS_PER_PAGE = 24;
const PRELOAD_DISTANCE = 500;

type WholesaleStatus =
    | "pending"
    | "approved"
    | "rejected"
    | null;

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

function filterProducts(
    productList: Product[],
    isWholesale: boolean,
    wholesaleStatus: WholesaleStatus,
) {
    if (
        isWholesale ||
        wholesaleStatus === "approved" ||
        wholesaleStatus === "pending"
    ) {
        return productList;
    }

    return productList.filter(
        (product) => !product.wholesale_only,
    );
}

export function InfiniteProductList({
    initialProducts,
    filters,
    isWholesale,
    wholesaleStatus,
}: InfiniteProductListProps) {
    const sentinelRef = useRef<HTMLDivElement | null>(
        null,
    );

    const pageRef = useRef(1);
    const loadingRef = useRef(false);

    const hasMoreRef = useRef(
        initialProducts.length === PRODUCTS_PER_PAGE,
    );

    const errorRef = useRef(false);
    const requestVersionRef = useRef(0);

    const abortControllerRef =
        useRef<AbortController | null>(null);

    const filtersRef = useRef(filters);

    const accessRef = useRef({
        isWholesale,
        wholesaleStatus,
    });

    const [products, setProducts] = useState<Product[]>(
        () => filterProducts(
            initialProducts,
            isWholesale,
            wholesaleStatus,
        ),
    );

    const [hasMore, setHasMore] = useState(
        initialProducts.length === PRODUCTS_PER_PAGE,
    );

    const [loading, setLoading] = useState(false);

    const [loadError, setLoadError] = useState<
        string | null
    >(null);

    /*
     * Reinicia a listagem quando os filtros
     * ou as permissões do usuário mudam.
     */

    useEffect(() => {
        filtersRef.current = filters;

        accessRef.current = {
            isWholesale,
            wholesaleStatus,
        };

        requestVersionRef.current += 1;

        abortControllerRef.current?.abort();
        abortControllerRef.current = null;

        setProducts(
            filterProducts(
                initialProducts,
                isWholesale,
                wholesaleStatus,
            ),
        );

        pageRef.current = 1;

        const newHasMore =
            initialProducts.length === PRODUCTS_PER_PAGE;

        hasMoreRef.current = newHasMore;
        setHasMore(newHasMore);

        loadingRef.current = false;
        errorRef.current = false;

        setLoading(false);
        setLoadError(null);

        return () => {
            requestVersionRef.current += 1;

            abortControllerRef.current?.abort();
            abortControllerRef.current = null;
        };
    }, [
        initialProducts,
        filters,
        isWholesale,
        wholesaleStatus,
    ]);

    /*
     * Busca mais produtos.
     */

    const loadMore = useCallback(async () => {
        if (
            loadingRef.current ||
            !hasMoreRef.current ||
            errorRef.current
        ) {
            return;
        }

        loadingRef.current = true;
        setLoading(true);

        const requestVersion =
            requestVersionRef.current;

        const controller = new AbortController();

        abortControllerRef.current = controller;

        try {
            const currentFilters = filtersRef.current;

            const params = new URLSearchParams();

            params.set(
                "page",
                String(pageRef.current),
            );

            for (const key of [
                "genre",
                "format",
                "year",
                "artist",
                "label",
                "search",
                "condition",
                "availability",
                "pre_order",
                "country",
            ] as const) {
                const value = currentFilters[key];

                if (
                    value !== undefined &&
                    value !== ""
                ) {
                    params.set(key, value);
                }
            }

            const url =
                `/api/produtos?${params.toString()}`;

            const response = await fetch(url, {
                signal: controller.signal,
                cache: "no-store",
            });

            if (!response.ok) {
                const body = await response.text();

                console.error(
                    "[InfiniteProductList] Erro na API:",
                    {
                        url,
                        status: response.status,
                        body,
                    },
                );

                throw new Error(
                    `Erro HTTP ${response.status} ao carregar produtos.`,
                );
            }

            const data: unknown =
                await response.json();

            if (!Array.isArray(data)) {
                throw new Error(
                    "A API retornou um formato inesperado.",
                );
            }

            if (
                controller.signal.aborted ||
                requestVersion !== requestVersionRef.current
            ) {
                return;
            }

            const nextProducts = data as Product[];

            const currentAccess = accessRef.current;

            const visibleNextProducts = filterProducts(
                nextProducts,
                currentAccess.isWholesale,
                currentAccess.wholesaleStatus,
            );

            setProducts((currentProducts) => {
                const existingIds = new Set(
                    currentProducts.map(
                        (product) => product.id,
                    ),
                );

                const uniqueProducts =
                    visibleNextProducts.filter(
                        (product) => {
                            if (
                                existingIds.has(product.id)
                            ) {
                                return false;
                            }

                            existingIds.add(product.id);

                            return true;
                        },
                    );

                return [
                    ...currentProducts,
                    ...uniqueProducts,
                ];
            });

            pageRef.current += 1;

            const newHasMore =
                nextProducts.length === PRODUCTS_PER_PAGE;

            hasMoreRef.current = newHasMore;
            setHasMore(newHasMore);

            errorRef.current = false;
            setLoadError(null);
        } catch (error) {
            if (
                controller.signal.aborted ||
                requestVersion !== requestVersionRef.current
            ) {
                return;
            }

            console.error(
                "[InfiniteProductList] Erro:",
                error,
            );

            errorRef.current = true;

            setLoadError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar mais produtos.",
            );
        } finally {
            if (
                requestVersion === requestVersionRef.current &&
                !controller.signal.aborted
            ) {
                loadingRef.current = false;
                setLoading(false);
            }

            if (
                abortControllerRef.current === controller
            ) {
                abortControllerRef.current = null;
            }
        }
    }, []);

    /*
     * Infinite Scroll vertical.
     *
     * Carrega mais produtos quando o usuário
     * estiver próximo do final da listagem.
     */

    useEffect(() => {
        const sentinel = sentinelRef.current;

        if (
            !sentinel ||
            !hasMore ||
            loading ||
            loadError
        ) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries.some(
                        (entry) => entry.isIntersecting,
                    )
                ) {
                    void loadMore();
                }
            },
            {
                root: null,
                rootMargin: `0px 0px ${PRELOAD_DISTANCE}px 0px`,
                threshold: 0,
            },
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [
        hasMore,
        loading,
        loadError,
        loadMore,
        products.length,
        initialProducts,
        filters,
        isWholesale,
        wholesaleStatus,
    ]);

    /*
     * Retry manual.
     */

    function handleRetry() {
        errorRef.current = false;
        setLoadError(null);

        void loadMore();
    }

    return (
        <section
            className="
                w-full
                min-w-0
            "
        >

            {/* PRODUCT GRID */}

            <div
                className="
                    grid
                    w-full
                    min-w-0
                    grid-cols-2
                    items-start
                    gap-x-4
                    gap-y-8
                    md:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-5
                "
            >
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="
                            relative
                            min-w-0
                            hover:z-20
                        "
                    >
                        <div
                            className="
                                animate-card-in
                                opacity-0
                            "
                            style={{
                                animationDelay: `${
                                    (index % 6) * 45
                                }ms`,
                            }}
                        >
                            <ProductCard
                                product={product}
                                isWholesale={isWholesale}
                                wholesaleStatus={wholesaleStatus}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* INFINITE SCROLL SENTINEL */}

            {hasMore && (
                <div
                    ref={sentinelRef}
                    className="h-px w-full"
                    aria-hidden="true"
                />
            )}

            {/* LOADING */}

            {loading && (
                <p
                    className="
                        py-6
                        text-center
                        text-sm
                        text-black
                    "
                    role="status"
                >
                    Carregando mais discos...
                </p>
            )}

            {/* ERROR */}

            {loadError && (
                <div
                    className="
                        my-8
                        flex
                        flex-col
                        items-center
                        gap-4
                        rounded-xl
                        border
                        border-current
                        p-6
                        text-center
                        text-black
                    "
                >
                    <p className="text-sm font-semibold">
                        Não foi possível carregar mais produtos.
                    </p>

                    <p className="max-w-xl break-words text-xs opacity-70">
                        {loadError}
                    </p>

                    <button
                        type="button"
                        onClick={handleRetry}
                        disabled={loading}
                        className="
                            rounded-xl
                            border
                            border-current
                            px-5
                            py-3
                            text-sm
                            font-medium
                            hover:opacity-70
                            disabled:opacity-40
                        "
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* EMPTY STATE */}

            {!loading &&
                products.length === 0 &&
                !loadError && (
                    <p
                        className="
                            py-12
                            text-center
                            text-sm
                            text-black
                            opacity-60
                        "
                    >
                        Nenhum produto encontrado.
                    </p>
                )}

            {/* END OF PRODUCTS */}

            {!hasMore && products.length > 0 && (
                <p
                    className="
                        pt-6
                        text-center
                        text-xs
                        text-black
                        opacity-40
                    "
                >
                    Todos os discos foram carregados.
                </p>
            )}

        </section>
    );
}