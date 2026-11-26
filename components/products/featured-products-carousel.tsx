"use client";

import {
    useEffect,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";
import tttArtwork from "@/app/images/ttt-2.png";

import {
    ArrowRight,
    ArrowUpRight,
    ChevronDown,
    ChevronUp,
    Disc3,
    Pause,
    Play,
    Star,
} from "lucide-react";

type WholesaleStatus =
    | "pending"
    | "approved"
    | "rejected"
    | null;

type FeaturedProduct = {
    id: string;
    name: string;
    slug: string;
    artist: string;
    price: number;
    format: string | null;
    year: number | null;
    images: string[] | null;
    stock: number;
    wholesale_only?: boolean | null;
    is_featured: boolean;
    is_record_of_the_week: boolean;
    editorial_comment: string | null;
};

type FeaturedPerformance = {
    id: string;
    name: string;
    slug: string;
    cover_image: string | null;
    location: string | null;
};

type FeaturedItem =
    | { kind: "product"; item: FeaturedProduct }
    | { kind: "performance"; item: FeaturedPerformance };

type FeaturedProductsCarouselProps = {
    products: FeaturedProduct[];
    performances?: FeaturedPerformance[];
    isWholesale?: boolean;
    wholesaleStatus?: WholesaleStatus;
};

const ROTATION_INTERVAL = 5000;

const priceFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

function subscribeReducedMotion(
    callback: () => void,
) {
    const media = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    );

    media.addEventListener("change", callback);

    return () => {
        media.removeEventListener("change", callback);
    };
}

function getReducedMotion() {
    return window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches;
}

function getServerReducedMotion() {
    return true;
}

function PreviewImage({
    src,
    alt,
    fallback,
    locked = false,
}: {
    src?: string | null;
    alt: string;
    fallback?: ReactNode;
    locked?: boolean;
}) {

    return (
        <div
            className={`
                relative
                aspect-square
                w-full
                overflow-hidden
                border
                border-black
                bg-white

                ${
                    locked
                        ? "opacity-50 grayscale"
                        : ""
                }
            `}
        >
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt={alt}
                    className="
                        block
                        h-full
                        w-full
                        object-contain
                    "
                    draggable={false}
                />
            ) : fallback ?? (
                <div
                    className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        bg-black/5
                    "
                >
                    <Disc3
                        aria-hidden="true"
                        size={28}
                        className="opacity-40"
                    />
                </div>
            )}
        </div>
    );
}

function ProductInformation({
    product,
    locked = false,
    showPrice = false,
}: {
    product: FeaturedProduct;
    locked?: boolean;
    showPrice?: boolean;
}) {
    const metadata = [
        product.year,
        product.format,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <div
            className="
                flex
                min-w-0
                flex-1
                flex-col
                items-start
                gap-1
            "
        >
            <p
                className="
                    w-full
                    truncate
                    text-[9px]
                    uppercase
                    leading-tight
                    sm:text-xs
                "
            >
                {product.artist}
            </p>

            <h3
                className="
                    line-clamp-3
                    break-words
                    text-sm
                    uppercase
                    leading-[0.95]
                    sm:text-xl
                    lg:text-2xl
                "
            >
                {product.name}
            </h3>

            {metadata && (
                <p
                    className="
                        text-[9px]
                        leading-tight
                        opacity-60
                        sm:text-xs
                    "
                >
                    {metadata}
                </p>
            )}

            {showPrice && !locked && (
                <p
                    className="
                        mt-1
                        text-xs
                        font-medium
                        sm:text-sm
                    "
                >
                    {priceFormatter.format(
                        product.price,
                    )}
                </p>
            )}

            {locked && (
                <p
                    className="
                        mt-1
                        text-[9px]
                        leading-tight
                        opacity-60
                        sm:text-xs
                    "
                >
                    Cadastro em análise
                </p>
            )}
        </div>
    );
}

function ProductPreview({
    product,
    locked,
    showPrice = false,
}: {
    product: FeaturedProduct;
    locked: boolean;
    showPrice?: boolean;
}) {
    const className = `
        group
        flex
        min-w-0
        items-start
        gap-2
        sm:gap-3
    `;

    const content = (
        <>
            <div
                className="
                    w-[38%]
                    max-w-[130px]
                    shrink-0
                    transition-transform
                    duration-200
                    group-hover:-translate-y-0.5
                "
            >
                <PreviewImage
                    src={product.images?.[0]}
                    alt={`${product.artist} — ${product.name}`}
                    locked={locked}
                />
            </div>

            <ProductInformation
                product={product}
                locked={locked}
                showPrice={showPrice}
            />
        </>
    );

    if (locked) {
        return (
            <div className={className}>
                {content}
            </div>
        );
    }

    return (
        <Link
            href={`/produtos/${product.slug}`}
            className={className}
        >
            {content}
        </Link>
    );
}

function PerformancePreview({ performance }: { performance: FeaturedPerformance }) {
    return (
        <Link
            href={`/toda-terca-tem/${performance.slug}`}
            className="group flex min-w-0 items-start gap-2 sm:gap-3"
        >
            <div className="w-[38%] max-w-[130px] shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5">
                <PreviewImage
                    src={performance.cover_image?.trim()}
                    alt=""
                    fallback={
                        <div className="relative h-full w-full bg-[#D2232A]">
                            <Image
                                src={tttArtwork}
                                alt=""
                                fill
                                sizes="130px"
                                className="object-contain"
                            />
                        </div>
                    }
                />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[9px] uppercase leading-tight sm:text-xs">Toda Terça Tem</p>
                <h3 className="line-clamp-3 break-words text-sm uppercase leading-[0.95] sm:text-xl lg:text-2xl">
                    {performance.name}
                </h3>
                {performance.location && (
                    <p className="break-words text-[9px] leading-tight opacity-60 sm:text-xs">
                        {performance.location}
                    </p>
                )}
            </div>
        </Link>
    );
}

export function FeaturedProductsCarousel({
    products,
    performances = [],
    isWholesale = false,
    wholesaleStatus = null,
}: FeaturedProductsCarouselProps) {
    const [expanded, setExpanded] = useState(true);

    const [activeIndex, setActiveIndex] = useState(0);

    const [isPlaying, setIsPlaying] = useState(true);

    const [isHovered, setIsHovered] = useState(false);

    const [isFocused, setIsFocused] = useState(false);

    const reducedMotion = useSyncExternalStore(
        subscribeReducedMotion,
        getReducedMotion,
        getServerReducedMotion,
    );

    /*
     * WHOLESALE ACCESS
     */

    const canSeeWholesaleOnly =
        isWholesale ||
        wholesaleStatus === "approved" ||
        wholesaleStatus === "pending";

    const visibleProducts = products.filter(
        (product) => {
            if (product.stock <= 0) {
                return false;
            }

            if (
                product.wholesale_only &&
                !canSeeWholesaleOnly
            ) {
                return false;
            }

            return true;
        },
    );

    /*
     * RECORD OF THE WEEK
     */

    const recordOfTheWeek =
        visibleProducts.find(
            (product) =>
                product.is_record_of_the_week,
        ) ?? null;

    /*
     * FEATURED PRODUCTS
     */

    const featuredItems: FeaturedItem[] = visibleProducts
        .filter((product) => product.is_featured)
        .map((product) => ({ kind: "product", item: product }));

    performances.forEach((performance, index) => {
        featuredItems.splice(index * 2, 0, { kind: "performance", item: performance });
    });

    const itemCount = featuredItems.length;
    const currentIndex = itemCount > 0 ? activeIndex % itemCount : 0;
    const currentItem = featuredItems[currentIndex];

    /*
     * WHOLESALE LOCK
     */

    function isProductLocked(
        product: FeaturedProduct | null,
    ) {
        return (
            Boolean(product?.wholesale_only) &&
            wholesaleStatus === "pending" &&
            !isWholesale
        );
    }

    /*
     * AUTOMATIC ROTATION
     */

    const shouldRotate =
        expanded &&
        isPlaying &&
        !isHovered &&
        !isFocused &&
        !reducedMotion &&
        itemCount > 1;

    useEffect(() => {
        if (!shouldRotate) {
            return;
        }

        const timer = window.setTimeout(() => {
            setActiveIndex(
                (current) =>
                    (current + 1) % itemCount,
            );
        }, ROTATION_INTERVAL);

        return () => {
            window.clearTimeout(timer);
        };
    }, [
        shouldRotate,
        currentIndex,
        itemCount,
    ]);

    function nextProduct() {
        if (itemCount <= 1) {
            return;
        }

        setActiveIndex(
            (current) =>
                (current + 1) % itemCount,
        );
    }

    /*
     * EMPTY STATE
     */

    if (
        !recordOfTheWeek &&
        itemCount === 0
    ) {
        return null;
    }

    return (
        <section
            aria-label="Destaques Casa Elefante"
            className="
                relative
                w-full
                min-w-0
                overflow-hidden
                rounded-xl
                border
                border-black
                bg-[#FFFDE9]
                text-black
                shadow-[-5px_5px_0_0_#000]
            "
        >
            {/* HEADER */}

            <button
                type="button"
                aria-expanded={expanded}
                onClick={() => {
                    setExpanded(
                        (current) => !current,
                    );
                }}
                className="
                    flex
                    w-full
                    items-center
                    justify-between
                    bg-[#D2232A]
                    px-3
                    py-3
                    text-[#FFFDE9]
                    transition-colors
                    duration-200
                    hover:bg-[#BE1F25]
                    sm:px-5
                "
            >
                <span
                    className="
                        text-xs
                        font-medium
                        uppercase
                        tracking-[0.12em]
                        sm:text-sm
                    "
                >
                    Destaques
                </span>

                {expanded ? (
                    <ChevronUp size={18} />
                ) : (
                    <ChevronDown size={18} />
                )}
            </button>

            {/* EXPANDABLE CONTENT */}

            <div
                inert={!expanded}
                className={`
                    grid
                    transition-[grid-template-rows,opacity]
                    duration-300
                    ease-in-out
                    motion-reduce:transition-none

                    ${
                        expanded
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                    }
                `}
            >
                <div className="min-h-0 overflow-hidden">
                    <div
                        className="
                            grid
                            min-w-0
                            grid-cols-[1.2fr_1fr]
                            divide-x
                            divide-black
                            bg-white
                            border-t
                            border-black
                            lg:grid-cols-[1.35fr_1fr]
                        "
                    >
                        {/* RECORD OF THE WEEK */}

                        <div
                            className="
                                flex
                                min-w-0
                                flex-col
                                gap-3
                                p-3
                                sm:gap-4
                                sm:p-5
                            "
                        >
                            {/* SECTION TITLE */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-1
                                "
                            >
                                <h2
                                    className="
                                        text-[9px]
                                        font-medium
                                        uppercase
                                        tracking-[0.08em]
                                        sm:text-xs
                                    "
                                >
                                    Disco da Semana
                                </h2>

                                <Star
                                    size={14}
                                    fill="currentColor"
                                    className="shrink-0"
                                />
                            </div>

                            {recordOfTheWeek ? (
                                <>
                                    {/* WEEKLY RECORD */}

                                    <ProductPreview
                                        product={recordOfTheWeek}
                                        locked={isProductLocked(
                                            recordOfTheWeek,
                                        )}
                                    />

                                    {/* EDITORIAL COMMENT */}

                                    <div
                                        tabIndex={
                                            recordOfTheWeek.editorial_comment
                                                ? 0
                                                : undefined
                                        }
                                        className="
                                            max-h-[110px]
                                            overflow-y-auto
                                            overscroll-contain
                                            break-words
                                            pr-1
                                            text-[10px]
                                            leading-relaxed
                                            sm:max-h-[130px]
                                            sm:text-xs
                                            lg:text-sm
                                            [&::-webkit-scrollbar]:w-[2px]
                                            [&::-webkit-scrollbar-thumb]:bg-black/30
                                        "
                                    >
                                        <p className="whitespace-pre-line">
                                            {recordOfTheWeek.editorial_comment ? (
                                                <em>“{recordOfTheWeek.editorial_comment}”</em>
                                            ) : (
                                                "Selecionado pela Casa Elefante."
                                            )}
                                        </p>
                                    </div>

                                    {/* WEEKLY FOOTER */}

                                    <div
                                        className="
                                            mt-auto
                                            flex
                                            items-center
                                            justify-between
                                            gap-1
                                            border-t
                                            border-black/20
                                            pt-2
                                        "
                                    >
                                        <span
                                            className="
                                                truncate
                                                text-[8px]
                                                opacity-60
                                                sm:text-[10px]
                                            "
                                        >
                                            Seleção Casa Elefante
                                        </span>

                                        {!isProductLocked(
                                            recordOfTheWeek,
                                        ) && (
                                            <Link
                                                href={`/produtos/${recordOfTheWeek.slug}`}
                                                aria-label={`Ver ${recordOfTheWeek.name}`}
                                                className="
                                                    shrink-0
                                                    transition-transform
                                                    hover:-translate-y-0.5
                                                    hover:translate-x-0.5
                                                "
                                            >
                                                <ArrowUpRight
                                                    size={18}
                                                />
                                            </Link>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="
                                        flex
                                        min-h-[100px]
                                        flex-1
                                        flex-col
                                        items-center
                                        justify-center
                                        gap-2
                                        text-center
                                    "
                                >
                                    <Disc3
                                        size={30}
                                        className="opacity-30"
                                    />

                                    <p className="text-[10px] opacity-60 sm:text-xs">
                                        Nova seleção em breve.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ROTATING FEATURED PRODUCT */}

                        <div
                            onMouseEnter={() => {
                                setIsHovered(true);
                            }}
                            onMouseLeave={() => {
                                setIsHovered(false);
                            }}
                            onFocusCapture={() => {
                                setIsFocused(true);
                            }}
                            onBlurCapture={(event) => {
                                if (
                                    !event.currentTarget.contains(
                                        event.relatedTarget as Node | null,
                                    )
                                ) {
                                    setIsFocused(false);
                                }
                            }}
                            className="
                                flex
                                min-w-0
                                flex-col
                                gap-3
                                p-3
                                sm:gap-4
                                sm:p-5
                            "
                        >
                            {/* SECTION TITLE */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-1
                                "
                            >
                                <h2
                                    className="
                                        text-[9px]
                                        font-medium
                                        uppercase
                                        tracking-[0.08em]
                                        sm:text-xs
                                    "
                                >
                                    Em Destaque
                                </h2>

                                {itemCount > 0 && (
                                    <span
                                        className="
                                            shrink-0
                                            whitespace-nowrap
                                            text-[8px]
                                            tabular-nums
                                            opacity-60
                                            sm:text-xs
                                        "
                                    >
                                        {String(
                                            currentIndex + 1,
                                        ).padStart(2, "0")}
                                        {" / "}
                                        {String(
                                            itemCount,
                                        ).padStart(2, "0")}
                                    </span>
                                )}
                            </div>

                            {currentItem ? (
                                <>
                                    {/* CURRENT PRODUCT */}

                                    <div
                                        key={`${currentItem.kind}-${currentItem.item.id}`}
                                        className="
                                            min-w-0
                                            flex-1
                                            motion-safe:animate-[featured-enter_400ms_ease-out_both]
                                        "
                                    >
                                        {currentItem.kind === "performance" ? (
                                            <PerformancePreview performance={currentItem.item} />
                                        ) : (
                                            <ProductPreview
                                                product={currentItem.item}
                                                locked={isProductLocked(currentItem.item)}
                                                showPrice
                                            />
                                        )}
                                    </div>

                                    {/* CAROUSEL CONTROLS */}

                                    <div
                                        className="
                                            mt-auto
                                            flex
                                            min-w-0
                                            items-center
                                            justify-between
                                            gap-2
                                            border-t
                                            border-black/20
                                            pt-2
                                        "
                                    >
                                        {/* DOTS */}

                                        <div
                                            className="
                                                flex
                                                min-w-0
                                                flex-1
                                                items-center
                                                gap-1
                                                overflow-x-auto
                                                [&::-webkit-scrollbar]:hidden
                                            "
                                        >
                                            {featuredItems.map(
                                                ({ kind, item }, index) => (
                                                    <button
                                                        key={`${kind}-${item.id}`}
                                                        type="button"
                                                        aria-label={`Destaque ${index + 1}: ${item.name}`}
                                                        aria-pressed={
                                                            currentIndex === index
                                                        }
                                                        onClick={() => {
                                                            setActiveIndex(
                                                                index,
                                                            );
                                                        }}
                                                        className="
                                                            flex
                                                            h-5
                                                            w-3
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                        "
                                                    >
                                                        <span
                                                            className={`
                                                                h-1.5
                                                                w-1.5
                                                                rounded-full
                                                                border
                                                                transition-colors
                                                                duration-200

                                                                ${
                                                                    currentIndex === index
                                                                        ? "border-[#D2232A] bg-[#D2232A]"
                                                                        : "border-black bg-transparent"
                                                                }
                                                            `}
                                                        />
                                                    </button>
                                                ),
                                            )}
                                        </div>

                                        {/* PLAY / PAUSE */}

                                        {itemCount > 1 && (
                                            <div
                                                className="
                                                    flex
                                                    shrink-0
                                                    items-center
                                                    gap-2
                                                "
                                            >
                                                {!reducedMotion && (
                                                    <button
                                                        type="button"
                                                        aria-label={
                                                            isPlaying
                                                                ? "Pausar destaques"
                                                                : "Reproduzir destaques"
                                                        }
                                                        onClick={() => {
                                                            setIsPlaying(
                                                                (current) =>
                                                                    !current,
                                                            );
                                                        }}
                                                        className="
                                                            transition-opacity
                                                            hover:opacity-50
                                                        "
                                                    >
                                                        {isPlaying ? (
                                                            <Pause size={13} />
                                                        ) : (
                                                            <Play size={13} />
                                                        )}
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={nextProduct}
                                                    aria-label="Próximo destaque"
                                                    className="
                                                        transition-transform
                                                        hover:translate-x-0.5
                                                    "
                                                >
                                                    <ArrowRight
                                                        size={18}
                                                    />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div
                                    className="
                                        flex
                                        min-h-[100px]
                                        flex-1
                                        flex-col
                                        items-center
                                        justify-center
                                        gap-2
                                        text-center
                                    "
                                >
                                    <Disc3
                                        size={30}
                                        className="opacity-30"
                                    />

                                    <p className="text-[10px] opacity-60 sm:text-xs">
                                        Novos destaques em breve.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes featured-enter {
                    from {
                        opacity: 0;
                        transform: translateY(12px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>
    );
}
