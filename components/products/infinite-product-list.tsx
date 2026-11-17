
"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    MouseEvent,
    PointerEvent,
} from "react";

import {
    ProductCard,
} from "@/components/products/product-card";

const PRODUCTS_PER_PAGE = 24;
const ROW_COUNT = 4;

const SCROLL_SPEED = 0.32;
const RESUME_DELAY = 2500;
const PRELOAD_DISTANCE = 500;

const INITIAL_DIRECTIONS = [
    -1,
    1,
    -1,
    1,
];

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

type DragState = {
    active: boolean;
    startX: number;
    startScrollLeft: number;
    moved: boolean;
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

function distributeProducts(
    products: Product[],
): Product[][] {
    const rows: Product[][] = Array.from(
        {
            length: ROW_COUNT,
        },
        () => [],
    );

    products.forEach((product, index) => {
        const rowIndex =
            Math.floor(index / 4) % ROW_COUNT;

        rows[rowIndex].push(product);
    });

    return rows;
}

export function InfiniteProductList({
    initialProducts,
    filters,
    isWholesale,
    wholesaleStatus,
}: InfiniteProductListProps) {
    const rowRefs = useRef<Array<HTMLDivElement | null>>(
        Array(ROW_COUNT).fill(null),
    );

    const dragRefs = useRef<DragState[]>(
        Array.from(
            {
                length: ROW_COUNT,
            },
            () => ({
                active: false,
                startX: 0,
                startScrollLeft: 0,
                moved: false,
            }),
        ),
    );

    const directionsRef = useRef<number[]>(
        [...INITIAL_DIRECTIONS],
    );

    const initializedRowsRef = useRef<boolean[]>(
        Array(ROW_COUNT).fill(false),
    );

    const pauseUntilRef = useRef<number[]>(
        Array(ROW_COUNT).fill(0),
    );

    const hoverRef = useRef<boolean[]>(
        Array(ROW_COUNT).fill(false),
    );

    const scrollPositionsRef = useRef<number[]>(
        Array(ROW_COUNT).fill(0),
    );

    const animationFrameRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);

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
    const [loadError, setLoadError] = useState<string | null>(null);

    const rows = distributeProducts(products);

    /*
     * Pausa uma fileira após interação manual.
     */

    const pauseRow = useCallback((
        rowIndex: number,
    ) => {
        pauseUntilRef.current[rowIndex] =
            performance.now() + RESUME_DELAY;
    }, []);

    /*
     * Posiciona inicialmente as fileiras.
     *
     * Fileiras que andam para a esquerda
     * começam no lado direito do trilho.
     *
     * Fileiras que andam para a direita
     * começam no lado esquerdo.
     */

    const initializeRows = useCallback(() => {
        for (
            let rowIndex = 0;
            rowIndex < ROW_COUNT;
            rowIndex += 1
        ) {
            const row = rowRefs.current[rowIndex];

            if (
                !row ||
                initializedRowsRef.current[rowIndex]
            ) {
                continue;
            }

            const maxScrollLeft =
                row.scrollWidth - row.clientWidth;

            if (maxScrollLeft <= 0) {
                continue;
            }

            const direction =
                INITIAL_DIRECTIONS[rowIndex];

            const initialPosition =
                direction < 0
                    ? maxScrollLeft
                    : 0;

            row.scrollLeft = initialPosition;

            scrollPositionsRef.current[rowIndex] =
                initialPosition;

            initializedRowsRef.current[rowIndex] = true;
        }
    }, []);

    /*
     * Reinicia os produtos e as fileiras
     * quando os filtros mudam.
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

        directionsRef.current = [
            ...INITIAL_DIRECTIONS,
        ];

        initializedRowsRef.current =
            Array(ROW_COUNT).fill(false);

        pauseUntilRef.current =
            Array(ROW_COUNT).fill(0);

        scrollPositionsRef.current =
            Array(ROW_COUNT).fill(0);

        rowRefs.current.forEach((row) => {
            if (row) {
                row.scrollLeft = 0;
            }
        });

        dragRefs.current.forEach((drag) => {
            drag.active = false;
            drag.moved = false;
        });
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

            const data: unknown = await response.json();

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

                const uniqueProducts = visibleNextProducts.filter(
                    (product) => !existingIds.has(product.id),
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
     * Animação automática.
     */

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        );

        let reducedMotion = mediaQuery.matches;

        function handleMotionChange(
            event: MediaQueryListEvent,
        ) {
            reducedMotion = event.matches;
        }

        mediaQuery.addEventListener(
            "change",
            handleMotionChange,
        );

        function animate(time: number) {
            const previousTime = lastFrameTimeRef.current;

            const deltaTime =
                previousTime === null
                    ? 16
                    : Math.min(time - previousTime, 50);

            lastFrameTimeRef.current = time;

            /*
             * Inicializa depois que o DOM
             * recebeu os produtos.
             */

            initializeRows();

            if (
                !reducedMotion &&
                document.visibilityState === "visible"
            ) {
                for (
                    let rowIndex = 0;
                    rowIndex < ROW_COUNT;
                    rowIndex += 1
                ) {
                    const row = rowRefs.current[rowIndex];

                    if (!row) {
                        continue;
                    }

                    const drag = dragRefs.current[rowIndex];

                    if (
                        drag.active ||
                        hoverRef.current[rowIndex] ||
                        time < pauseUntilRef.current[rowIndex]
                    ) {
                        scrollPositionsRef.current[rowIndex] =
                            row.scrollLeft;

                        continue;
                    }

                    const maxScrollLeft =
                        row.scrollWidth - row.clientWidth;

                    if (maxScrollLeft <= 0) {
                        continue;
                    }

                    let direction =
                        directionsRef.current[rowIndex];

                    if (
                        row.scrollLeft >= maxScrollLeft - 1 &&
                        direction > 0
                    ) {
                        direction = -1;
                    }

                    if (
                        row.scrollLeft <= 1 &&
                        direction < 0
                    ) {
                        direction = 1;
                    }

                    directionsRef.current[rowIndex] =
                        direction;

                    const distance =
                        SCROLL_SPEED *
                        (deltaTime / 16) *
                        direction;

                    const nextPosition = Math.max(
                        0,
                        Math.min(
                            maxScrollLeft,
                            scrollPositionsRef.current[rowIndex] +
                                distance,
                        ),
                    );

                    scrollPositionsRef.current[rowIndex] =
                        nextPosition;

                    row.scrollLeft = nextPosition;

                    const remainingDistance =
                        maxScrollLeft - nextPosition;

                    if (
                        remainingDistance <= PRELOAD_DISTANCE &&
                        hasMoreRef.current &&
                        !loadingRef.current &&
                        !errorRef.current
                    ) {
                        void loadMore();
                    }
                }
            }

            animationFrameRef.current =
                requestAnimationFrame(animate);
        }

        animationFrameRef.current =
            requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(
                    animationFrameRef.current,
                );
            }

            lastFrameTimeRef.current = null;

            mediaQuery.removeEventListener(
                "change",
                handleMotionChange,
            );
        };
    }, [
        initializeRows,
        loadMore,
    ]);

    /*
     * Arrastar com o mouse.
     */

    function handlePointerDown(
        event: PointerEvent<HTMLDivElement>,
        rowIndex: number,
    ) {
        if (
            event.pointerType !== "mouse" ||
            event.button !== 0
        ) {
            return;
        }

        const row = rowRefs.current[rowIndex];

        if (!row) {
            return;
        }

        pauseRow(rowIndex);

        dragRefs.current[rowIndex] = {
            active: true,
            startX: event.clientX,
            startScrollLeft: row.scrollLeft,
            moved: false,
        };
    }

    function handlePointerMove(
        event: PointerEvent<HTMLDivElement>,
        rowIndex: number,
    ) {
        const row = rowRefs.current[rowIndex];
        const drag = dragRefs.current[rowIndex];

        if (
            !row ||
            !drag.active
        ) {
            return;
        }

        const distance =
            event.clientX - drag.startX;

        if (Math.abs(distance) > 6) {
            drag.moved = true;
        }

        if (drag.moved) {
            row.scrollLeft =
                drag.startScrollLeft - distance;

            scrollPositionsRef.current[rowIndex] =
                row.scrollLeft;

            pauseRow(rowIndex);
        }
    }

    function handlePointerUp(
        rowIndex: number,
    ) {
        dragRefs.current[rowIndex].active = false;
    }

    function handleClickCapture(
        event: MouseEvent<HTMLDivElement>,
        rowIndex: number,
    ) {
        const drag = dragRefs.current[rowIndex];

        if (drag.moved) {
            event.preventDefault();
            event.stopPropagation();

            drag.moved = false;
        }
    }

    /*
     * Sincroniza scroll manual.
     */

    function handleRowScroll(
        rowIndex: number,
    ) {
        const row = rowRefs.current[rowIndex];

        if (!row) {
            return;
        }

        scrollPositionsRef.current[rowIndex] =
            row.scrollLeft;
    }

    /*
     * Retry manual.
     */

    function handleRetry() {
        errorRef.current = false;
        setLoadError(null);

        void loadMore();
    }

    return (
        <section className="w-full min-w-0">
            <div className="flex flex-col gap-10">
                {rows.map((rowProducts, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="relative w-full min-w-0"
                    >
                        <div
                            ref={(element) => {
                                rowRefs.current[rowIndex] = element;
                            }}
                            onScroll={() => {
                                handleRowScroll(rowIndex);
                            }}
                            onWheel={() => {
                                pauseRow(rowIndex);
                            }}
                            onTouchStart={() => {
                                pauseRow(rowIndex);
                            }}
                            onTouchMove={() => {
                                pauseRow(rowIndex);
                            }}
                            onPointerEnter={() => {
                                hoverRef.current[rowIndex] = true;
                            }}
                            onPointerLeave={() => {
                                hoverRef.current[rowIndex] = false;
                                dragRefs.current[rowIndex].active = false;
                                pauseUntilRef.current[rowIndex] = 0;
                            }}
                            onPointerDown={(event) => {
                                handlePointerDown(
                                    event,
                                    rowIndex,
                                );
                            }}
                            onPointerMove={(event) => {
                                handlePointerMove(
                                    event,
                                    rowIndex,
                                );
                            }}
                            onPointerUp={() => {
                                handlePointerUp(rowIndex);
                            }}
                            onPointerCancel={() => {
                                handlePointerUp(rowIndex);
                            }}
                            onClickCapture={(event) => {
                                handleClickCapture(
                                    event,
                                    rowIndex,
                                );
                            }}
                            className="flex w-full min-w-0 flex-row flex-nowrap items-start gap-4 overflow-x-auto overflow-y-hidden pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            style={{
                                touchAction: "pan-x pan-y",
                                cursor: "grab",
                            }}
                        >
                            {rowProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="w-[calc((100%-1rem)/2)] min-w-0 shrink-0 md:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]"
                                >
                                    <div
                                        className="animate-card-in opacity-0"
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
                    </div>
                ))}
            </div>

            {loading && (
                <p
                    className="py-6 text-center text-sm text-black"
                    role="status"
                >
                    Carregando mais discos...
                </p>
            )}

            {loadError && (
                <div className="my-8 flex flex-col text-black items-center gap-4 rounded-xl border border-current p-6 text-center">
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
                        className="rounded-xl border border-current px-5 py-3 text-sm font-medium hover:opacity-70 disabled:opacity-40"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {!loading && products.length === 0 && !loadError && (
                <p className="py-12 text-center text-black text-sm opacity-60">
                    Nenhum produto encontrado.
                </p>
            )}

            {!hasMore && products.length > 0 && (
                <p className="pt-6 text-center text-xs text-black opacity-40">
                    Todos os discos foram carregados.
                </p>
            )}
        </section>
    );
}
