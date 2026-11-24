"use client";

import Link from "next/link";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ArrowUpRight,
    Pause,
    Play,
} from "lucide-react";

import tttFallback from "@/app/images/ttt-2.png";

type WholesaleStatus =
    | "pending"
    | "approved"
    | "rejected"
    | null;

export type FeaturedProduct = {
    id: string;
    name: string;
    slug: string;
    artist: string | null;
    price: number;
    format: string | null;
    year: number | null;
    images: string[] | null;
    stock: number;
    wholesale_only?: boolean;
    description?: string | null;
    genre?: string | null;
    label?: string | null;
    country?: string | null;
    condition?: string | null;
};

export type FeaturedPerformance = {
    id: string;
    name: string;
    slug: string;
    performance_date: string | null;
    cover_image: string | null;
    location: string | null;
    description?: string | null;
};

type FeaturedProductsCarouselProps = {
    products: FeaturedProduct[];
    performances: FeaturedPerformance[];
    isWholesale?: boolean;
    wholesaleStatus?: WholesaleStatus;
};

type CarouselItem =
    | {
        id: string;
        type: "product";
        product: FeaturedProduct;
    }
    | {
        id: string;
        type: "performance";
        performance: FeaturedPerformance;
    };

type FeaturedCardProps = {
    item: CarouselItem;
    expanded: boolean;
    isWholesale: boolean;
    wholesaleStatus: WholesaleStatus;
    onExpand: () => void;
    onCollapse: () => void;
    onToggle: () => void;
    duplicate: boolean;
};

const SCROLL_SPEED = 35;

function formatDate(date: string | null) {
    if (!date) return "";

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(date));
}

function formatPrice(price: number) {
    return Number(price).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function FeaturedCard({
    item,
    expanded,
    isWholesale,
    wholesaleStatus,
    onExpand,
    onCollapse,
    onToggle,
    duplicate,
}: FeaturedCardProps) {
    const isPerformance =
        item.type === "performance";

    const product =
        item.type === "product"
            ? item.product
            : null;

    const performance =
        item.type === "performance"
            ? item.performance
            : null;

    const name =
        product?.name ??
        performance?.name ??
        "";

    const artist =
        product?.artist ??
        (isPerformance ? "Toda Terça Tem" : "");

    const image =
        product?.images?.[0] ??
        performance?.cover_image ??
        (isPerformance ? tttFallback.src : null);

    const isFallback =
        isPerformance &&
        !performance?.cover_image;

    const isPendingWholesaleProduct =
        Boolean(product?.wholesale_only) &&
        wholesaleStatus === "pending" &&
        !isWholesale;

    const href =
        isPerformance
            ? `/toda-terca-tem/${performance?.slug}`
            : `/produtos/${product?.slug}`;

    const description =
        product?.description ??
        performance?.description ??
        null;

    const details = product
        ? [
            {
                label: "Gênero",
                value: product.genre,
            },
            {
                label: "Gravadora",
                value: product.label,
            },
            {
                label: "Ano",
                value: product.year,
            },
            {
                label: "Formato",
                value: product.format,
            },
            {
                label: "País",
                value: product.country,
            },
            {
                label: "Condição",
                value: product.condition,
            },
        ]
        : [
            {
                label: "Data",
                value: formatDate(
                    performance?.performance_date ?? null
                ),
            },
            {
                label: "Local",
                value: performance?.location,
            },
        ];

    const availableDetails = details.filter(
        (detail) =>
            detail.value !== null &&
            detail.value !== undefined &&
            detail.value !== ""
    );

    return (
        <article
            onMouseEnter={onExpand}
            onMouseLeave={onCollapse}
            onFocusCapture={onExpand}
            onBlurCapture={(event) => {
                if (
                    !event.currentTarget.contains(
                        event.relatedTarget as Node | null
                    )
                ) {
                    onCollapse();
                }
            }}
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    onCollapse();
                }
            }}
            className={`
                relative
                box-border
                shrink-0
                self-start

                [--card-width:170px]
                [--card-height:calc(var(--card-width)+80px)]
                [--expanded-width:calc(100vw-32px)]

                sm:[--card-width:200px]
                sm:[--expanded-width:440px]

                md:[--card-width:220px]
                md:[--expanded-width:480px]

                lg:[--card-width:240px]
                lg:[--expanded-width:520px]

                h-[var(--card-height)]
                min-h-[var(--card-height)]
                max-h-[var(--card-height)]

                transition-[width]
                duration-[450ms]
                ease-[cubic-bezier(0.2,0.75,0.2,1)]
                motion-reduce:transition-none

                ${
                    expanded
                        ? "z-20 w-[var(--expanded-width)]"
                        : "z-0 w-[var(--card-width)]"
                }
            `}
        >
            <div
                className={`
                    relative
                    box-border
                    flex
                    h-full
                    min-h-0
                    w-full
                    min-w-0
                    items-stretch
                    overflow-hidden
                    rounded-lg
                    border
                    border-black
                    p-2

                    transition-[transform,box-shadow]
                    duration-300
                    ease-out
                    motion-reduce:transition-none

                    ${
                        isPerformance
                            ? "bg-[#D2232A] text-[#FFFDE9]"
                            : "bg-white text-black"
                    }

                    ${
                        expanded
                            ? "translate-x-1 -translate-y-1 shadow-[-8px_8px_0_0_#000]"
                            : "shadow-[-4px_4px_0_0_#000]"
                    }
                `}
            >
                {/* CARD PRINCIPAL */}

                <div
                    className="
                        flex
                        h-full
                        min-h-0
                        w-[calc(var(--card-width)-18px)]
                        min-w-0
                        max-w-[calc(var(--card-width)-18px)]
                        shrink-0
                        flex-col
                        gap-2
                        overflow-hidden
                    "
                >
                    {/* CAPA */}

                    <div
                        className={`
                            relative
                            flex
                            aspect-square
                            h-[calc(var(--card-width)-18px)]
                            w-[calc(var(--card-width)-18px)]
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-md

                            ${
                                isPerformance
                                    ? "bg-[#D2232A]"
                                    : "bg-neutral-100"
                            }
                        `}
                    >
                        {image ? (
                            <img
                                src={image}
                                alt={name}
                                draggable={false}
                                loading="lazy"
                                className={`
                                    block
                                    transition-all
                                    duration-300

                                    ${
                                        isFallback
                                            ? "h-[75%] w-[75%] object-contain"
                                            : "h-full w-full object-cover"
                                    }

                                    ${
                                        isPendingWholesaleProduct
                                            ? "opacity-50 grayscale"
                                            : ""
                                    }

                                    ${
                                        expanded
                                            ? "scale-[1.02]"
                                            : "scale-100"
                                    }
                                `}
                            />
                        ) : (
                            <span className="text-xs">
                                Sem imagem
                            </span>
                        )}

                        {isPerformance && (
                            <span
                                className="
                                    absolute
                                    bottom-2
                                    left-2
                                    max-w-[calc(100%-16px)]
                                    truncate
                                    rounded-full
                                    border
                                    border-black
                                    bg-[#FFFDE9]
                                    px-2
                                    py-1
                                    text-[9px]
                                    font-medium
                                    uppercase
                                    tracking-wide
                                    text-[#D2232A]
                                    shadow-[2px_2px_0_0_#000]
                                "
                            >
                                Próxima apresentação
                            </span>
                        )}

                        {product?.wholesale_only && (
                            <span
                                className="
                                    absolute
                                    bottom-2
                                    left-2
                                    max-w-[calc(100%-16px)]
                                    truncate
                                    rounded-full
                                    border
                                    border-black
                                    bg-[#FFFDE9]
                                    px-2
                                    py-1
                                    text-[9px]
                                    font-medium
                                    uppercase
                                    tracking-wide
                                    text-black
                                    shadow-[2px_2px_0_0_#000]
                                "
                            >
                                Exclusivo atacado
                            </span>
                        )}

                        {isPendingWholesaleProduct && (
                            <div
                                className="
                                    absolute
                                    inset-0
                                    flex
                                    items-center
                                    justify-center
                                    bg-[#FFFDE9]/30
                                "
                            >
                                <span
                                    className="
                                        rounded-full
                                        border
                                        border-black
                                        bg-[#FFFDE9]
                                        px-3
                                        py-2
                                        text-center
                                        text-[10px]
                                        font-medium
                                        text-black
                                    "
                                >
                                    Aguardando aprovação
                                </span>
                            </div>
                        )}
                    </div>

                    {/* INFORMAÇÕES COMPACTAS */}

                    <div
                        className="
                            flex
                            h-[72px]
                            min-h-[72px]
                            max-h-[72px]
                            w-full
                            min-w-0
                            shrink-0
                            flex-col
                            overflow-hidden
                        "
                    >
                        <h2
                            title={name}
                            className="
                                shrink-0
                                truncate
                                text-sm
                                font-medium
                                leading-4
                            "
                        >
                            {name}
                        </h2>

                        <p
                            title={artist}
                            className="
                                mt-1
                                shrink-0
                                truncate
                                text-xs
                                leading-4
                            "
                        >
                            {artist}
                        </p>

                        <div
                            className="
                                mt-auto
                                flex
                                w-full
                                min-w-0
                                shrink-0
                                items-center
                                justify-between
                                gap-1
                                overflow-hidden
                                text-xs
                            "
                        >
                            {product ? (
                                <>
                                    <div
                                        className="
                                            flex
                                            min-w-0
                                            items-center
                                            gap-1
                                            overflow-hidden
                                        "
                                    >
                                        <span className="truncate">
                                            {product.format}
                                        </span>

                                        {product.year && (
                                            <span className="shrink-0">
                                                · {product.year}
                                            </span>
                                        )}
                                    </div>

                                    <span
                                        className="
                                            shrink-0
                                            whitespace-nowrap
                                            text-xl
                                        "
                                    >
                                        {formatPrice(product.price)}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="truncate">
                                        {formatDate(
                                            performance?.performance_date ??
                                            null
                                        )}
                                    </span>

                                    <ArrowUpRight
                                        size={20}
                                        strokeWidth={1.5}
                                        className="shrink-0"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* LINK DESKTOP */}

                    {!isPendingWholesaleProduct && (
                        <Link
                            href={href}
                            tabIndex={duplicate ? -1 : 0}
                            aria-label={`Ver ${name}`}
                            className="
                                absolute
                                bottom-2
                                left-2
                                top-2
                                hidden
                                w-[calc(var(--card-width)-18px)]
                                rounded-md
                                md:block
                            "
                        />
                    )}

                    {/* EXPANSÃO MOBILE */}

                    <button
                        type="button"
                        onClick={onToggle}
                        tabIndex={duplicate ? -1 : 0}
                        aria-expanded={expanded}
                        aria-label={
                            expanded
                                ? `Recolher informações de ${name}`
                                : `Expandir informações de ${name}`
                        }
                        className="
                            absolute
                            bottom-2
                            left-2
                            top-2
                            w-[calc(var(--card-width)-18px)]
                            rounded-md
                            md:hidden
                        "
                    />
                </div>

                {/* PAINEL EXPANDIDO */}

                <div
                    aria-hidden={!expanded}
                    inert={!expanded}
                    className={`
                        flex
                        h-full
                        min-h-0
                        max-h-full
                        min-w-0
                        flex-1
                        flex-col
                        overflow-hidden

                        transition-[opacity,transform]
                        duration-300
                        motion-reduce:transition-none

                        ${
                            expanded
                                ? "translate-x-0 opacity-100 delay-150"
                                : "pointer-events-none translate-x-3 opacity-0"
                        }
                    `}
                >
                    <div
                        className="
                            ml-3
                            flex
                            h-full
                            min-h-0
                            max-h-full
                            min-w-0
                            flex-col
                            overflow-hidden
                            border-l
                            border-current/20
                            pl-3
                            pr-1
                            pt-1
                        "
                    >
                        {/* TÍTULO */}

                        <span
                            className="
                                shrink-0
                                truncate
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.12em]
                                opacity-60
                            "
                        >
                            {isPerformance
                                ? "Próxima apresentação"
                                : "Disco em destaque"}
                        </span>

                        <h3
                            className={`
                                mt-2
                                shrink-0
                                line-clamp-2
                                break-words
                                font-october
                                text-xl
                                uppercase
                                leading-none
                                md:text-2xl

                                ${
                                    isPerformance
                                        ? "text-[#FFFDE9]"
                                        : "text-[#D2232A]"
                                }
                            `}
                        >
                            {name}
                        </h3>

                        <p
                            className="
                                mt-1
                                shrink-0
                                truncate
                                text-xs
                                font-medium
                            "
                        >
                            {artist}
                        </p>

                        {/* METADADOS */}

                        <div
                            className="
                                mt-3
                                min-h-0
                                min-w-0
                                flex-1
                                space-y-1
                                overflow-x-hidden
                                overflow-y-auto
                                overscroll-contain
                            "
                        >
                            {availableDetails.map((detail) => (
                                <div
                                    key={detail.label}
                                    className="
                                        flex
                                        min-w-0
                                        items-start
                                        justify-between
                                        gap-2
                                        text-[10px]
                                        leading-tight
                                    "
                                >
                                    <span
                                        className="
                                            shrink-0
                                            opacity-50
                                        "
                                    >
                                        {detail.label}
                                    </span>

                                    <span
                                        className="
                                            min-w-0
                                            break-words
                                            text-right
                                            font-medium
                                        "
                                    >
                                        {detail.value}
                                    </span>
                                </div>
                            ))}

                            {description && (
                                <p
                                    className="
                                        mt-3
                                        line-clamp-4
                                        break-words
                                        text-[11px]
                                        leading-relaxed
                                        opacity-80
                                    "
                                >
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* LINK DO PAINEL */}

                        <div
                            className="
                                mt-auto
                                min-w-0
                                shrink-0
                                pt-3
                            "
                        >
                            {isPendingWholesaleProduct ? (
                                <span
                                    className="
                                        block
                                        border-t
                                        border-current
                                        pt-2
                                        text-[10px]
                                        font-medium
                                    "
                                >
                                    Aguardando aprovação
                                </span>
                            ) : (
                                <Link
                                    href={href}
                                    tabIndex={duplicate ? -1 : 0}
                                    className="
                                        flex
                                        min-w-0
                                        items-center
                                        justify-between
                                        gap-2
                                        border-t
                                        border-current
                                        pt-2
                                        text-xs
                                        font-medium
                                        transition-opacity
                                        hover:opacity-60
                                    "
                                >
                                    <span className="truncate">
                                        {isPerformance
                                            ? "Ver apresentação"
                                            : "Ver disco"}
                                    </span>

                                    <ArrowUpRight
                                        size={16}
                                        strokeWidth={1.5}
                                        className="shrink-0"
                                    />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

export function FeaturedProductsCarousel({
    products,
    performances,
    isWholesale = false,
    wholesaleStatus = null,
}: FeaturedProductsCarouselProps) {
    const viewportRef =
        useRef<HTMLDivElement>(null);

    const trackRef =
        useRef<HTMLDivElement>(null);

    const groupRef =
        useRef<HTMLDivElement>(null);

    const positionRef =
        useRef(0);

    const groupWidthRef =
        useRef(0);

    const isHoveredRef =
        useRef(false);

    const isFocusedRef =
        useRef(false);

    const isPlayingRef =
        useRef(true);

    const expandedCardRef =
        useRef<string | null>(null);

    const resumeAtRef =
        useRef(0);

    const [isPlaying, setIsPlaying] =
        useState(true);

    const [repeatCount, setRepeatCount] =
        useState(1);

    const [reducedMotion, setReducedMotion] =
        useState(false);

    const [expandedCard, setExpandedCard] =
        useState<string | null>(null);

    const visibleProducts = products.filter(
        (product) =>
            !product.wholesale_only ||
            isWholesale ||
            wholesaleStatus === "pending"
    );

    const items: CarouselItem[] = [];

    let performanceIndex = 0;

    visibleProducts.forEach((product, index) => {
        items.push({
            id: `product-${product.id}`,
            type: "product",
            product,
        });

        if (
            (index + 1) % 3 === 0 &&
            performanceIndex < performances.length
        ) {
            const performance =
                performances[performanceIndex];

            items.push({
                id: `performance-${performance.id}`,
                type: "performance",
                performance,
            });

            performanceIndex += 1;
        }
    });

    while (performanceIndex < performances.length) {
        const performance =
            performances[performanceIndex];

        items.push({
            id: `performance-${performance.id}`,
            type: "performance",
            performance,
        });

        performanceIndex += 1;
    }

    const itemCount = items.length;

    const itemsKey = items
        .map((item) => item.id)
        .join("|");

    function expandCard(key: string) {
        expandedCardRef.current = key;
        setExpandedCard(key);
    }

    function collapseCard(key: string) {
        if (expandedCardRef.current !== key) {
            return;
        }

        expandedCardRef.current = null;

        resumeAtRef.current =
            performance.now() + 500;

        setExpandedCard(null);
    }

    function collapseAll() {
        expandedCardRef.current = null;

        resumeAtRef.current =
            performance.now() + 500;

        setExpandedCard(null);
    }

    function toggleCard(key: string) {
        if (expandedCardRef.current === key) {
            collapseCard(key);
        } else {
            expandCard(key);
        }
    }

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        function updatePreference() {
            setReducedMotion(mediaQuery.matches);
        }

        updatePreference();

        mediaQuery.addEventListener(
            "change",
            updatePreference
        );

        return () => {
            mediaQuery.removeEventListener(
                "change",
                updatePreference
            );
        };
    }, []);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        positionRef.current = 0;
        expandedCardRef.current = null;
        resumeAtRef.current = 0;

        setExpandedCard(null);

        if (trackRef.current) {
            trackRef.current.style.transform =
                "translate3d(0, 0, 0)";
        }
    }, [itemsKey, reducedMotion]);

    useEffect(() => {
        const viewport = viewportRef.current;
        const group = groupRef.current;

        if (!viewport || !group || !itemCount) {
            return;
        }

        function measure() {
            if (
                !viewport ||
                !group ||
                expandedCardRef.current !== null ||
                performance.now() < resumeAtRef.current
            ) {
                return;
            }

            const viewportWidth =
                viewport.clientWidth;

            const groupWidth =
                group.getBoundingClientRect().width;

            if (!groupWidth) {
                return;
            }

            groupWidthRef.current = groupWidth;

            setRepeatCount(
                Math.max(
                    1,
                    Math.ceil(viewportWidth / groupWidth)
                )
            );

            positionRef.current =
                positionRef.current % groupWidth;
        }

        measure();

        const observer =
            new ResizeObserver(measure);

        observer.observe(viewport);
        observer.observe(group);

        const timeout = window.setTimeout(
            measure,
            550
        );

        return () => {
            observer.disconnect();
            window.clearTimeout(timeout);
        };
    }, [
        itemCount,
        itemsKey,
        expandedCard,
        reducedMotion,
    ]);

    useEffect(() => {
        if (itemCount <= 1 || reducedMotion) {
            return;
        }

        let frameId = 0;
        let previousTime = 0;

        function animate(currentTime: number) {
            if (!previousTime) {
                previousTime = currentTime;
            }

            const delta = Math.min(
                (currentTime - previousTime) / 1000,
                0.05
            );

            previousTime = currentTime;

            const canAnimate =
                isPlayingRef.current &&
                !isHoveredRef.current &&
                !isFocusedRef.current &&
                expandedCardRef.current === null &&
                currentTime >= resumeAtRef.current &&
                groupWidthRef.current > 0;

            if (canAnimate && trackRef.current) {
                positionRef.current =
                    (
                        positionRef.current +
                        SCROLL_SPEED * delta
                    ) % groupWidthRef.current;

                trackRef.current.style.transform =
                    `translate3d(-${positionRef.current}px, 0, 0)`;
            }

            frameId =
                requestAnimationFrame(animate);
        }

        frameId =
            requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [
        itemCount,
        itemsKey,
        reducedMotion,
    ]);

    if (!itemCount) {
        return null;
    }

    const totalGroups =
        itemCount > 1 && !reducedMotion
            ? repeatCount + 1
            : 1;

    return (
        <section
            className="
                w-full
                min-w-0
                overflow-hidden
                pb-4
                pt-2
            "
        >
            {/* HEADER */}

            <div
                className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-4
                    px-4
                    md:px-6
                "
            >
                <h2
                    className="
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-[0.15em]
                        text-black
                    "
                >
                    Destaques
                </h2>

                {itemCount > 1 && !reducedMotion && (
                    <button
                        type="button"
                        onClick={() =>
                            setIsPlaying((current) => !current)
                        }
                        aria-label={
                            isPlaying
                                ? "Pausar destaques"
                                : "Reproduzir destaques"
                        }
                        className="
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-md
                            border
                            border-black
                            bg-white
                            text-black
                            shadow-[-2px_2px_0_0_#000]
                            transition-all
                            duration-200
                            hover:translate-x-0.5
                            hover:-translate-y-0.5
                            hover:shadow-[-4px_4px_0_0_#000]
                        "
                    >
                        {isPlaying ? (
                            <Pause size={13} />
                        ) : (
                            <Play size={13} />
                        )}
                    </button>
                )}
            </div>

            {/* CARROSSEL */}

            <div
                ref={viewportRef}
                onMouseEnter={() => {
                    isHoveredRef.current = true;
                }}
                onMouseLeave={() => {
                    isHoveredRef.current = false;
                    collapseAll();
                }}
                onFocusCapture={() => {
                    isFocusedRef.current = true;
                }}
                onBlurCapture={(event) => {
                    if (
                        !event.currentTarget.contains(
                            event.relatedTarget as Node | null
                        )
                    ) {
                        isFocusedRef.current = false;
                        collapseAll();
                    }
                }}
                className={`
                    relative
                    w-full
                    min-w-0
                    py-3

                    ${
                        reducedMotion || itemCount === 1
                            ? "overflow-x-auto"
                            : "overflow-hidden"
                    }
                `}
            >
                <div
                    ref={trackRef}
                    className="
                        flex
                        w-max
                        items-start
                        pl-4
                        md:pl-6
                    "
                    style={{
                        willChange:
                            itemCount > 1 && !reducedMotion
                                ? "transform"
                                : undefined,
                    }}
                >
                    {Array.from(
                        { length: totalGroups },
                        (_, groupIndex) => (
                            <div
                                key={groupIndex}
                                ref={
                                    groupIndex === 0
                                        ? groupRef
                                        : undefined
                                }
                                className="
                                    flex
                                    shrink-0
                                    items-start
                                    gap-4
                                    pr-4
                                    md:gap-5
                                    md:pr-5
                                "
                            >
                                {items.map((item) => {
                                    const cardKey =
                                        `${groupIndex}-${item.id}`;

                                    return (
                                        <FeaturedCard
                                            key={cardKey}
                                            item={item}
                                            expanded={
                                                expandedCard === cardKey
                                            }
                                            isWholesale={isWholesale}
                                            wholesaleStatus={wholesaleStatus}
                                            duplicate={groupIndex > 0}
                                            onExpand={() =>
                                                expandCard(cardKey)
                                            }
                                            onCollapse={() =>
                                                collapseCard(cardKey)
                                            }
                                            onToggle={() =>
                                                toggleCard(cardKey)
                                            }
                                        />
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}