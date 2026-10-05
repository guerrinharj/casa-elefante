"use client";

import Link from "next/link";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

export type FeaturedProduct = {
    id: string;
    name: string;
    slug: string;
    artist: string | null;
    price: number;
    format: string | null;
    year: number | null;
    images: string[] | null;
};

export type FeaturedPerformance = {
    id: string;
    name: string;
    slug: string;
    performance_date: string | null;
    cover_image: string | null;
    location: string | null;
};

type FeaturedProductsCarouselProps = {
    products: FeaturedProduct[];
    performances?: FeaturedPerformance[];
};

type CarouselSlide = {
    id: string;
    type: "product" | "performance";
    name: string;
    image: string | null;
    href: string;
    eyebrow: string;
    secondary: string | null;
};

function formatDate(
    date: string | null,
) {
    if (!date) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        },
    ).format(
        new Date(date),
    );
}

export function FeaturedProductsCarousel({
    products,
    performances,
}: FeaturedProductsCarouselProps) {
    const slides: CarouselSlide[] = [
        ...products.map(
            (product): CarouselSlide => ({
                id: `product-${product.id}`,
                type: "product",
                name: product.name,
                image:
                    product.images?.[0] ??
                    null,
                href: `/produtos/${product.slug}`,
                eyebrow: "Destaque",
                secondary:
                    product.artist,
            }),
        ),

        ...performances.map(
            (
                performance,
            ): CarouselSlide => ({
                id: `performance-${performance.id}`,
                type: "performance",
                name: performance.name,
                image:
                    performance.cover_image,
                href: `/toda-terca-tem/${performance.slug}`,
                eyebrow:
                    "Próxima apresentação",
                secondary: [
                    formatDate(
                        performance.performance_date,
                    ),
                    performance.location,
                ]
                    .filter(Boolean)
                    .join(" · "),
            }),
        ),
    ];

    const [
        currentIndex,
        setCurrentIndex,
    ] = useState(0);

    const nextSlide =
        useCallback(() => {
            if (
                slides.length <= 1
            ) {
                return;
            }

            setCurrentIndex(
                (current) =>
                    (current + 1) %
                    slides.length,
            );
        }, [slides.length]);

    const previousSlide =
        useCallback(() => {
            if (
                slides.length <= 1
            ) {
                return;
            }

            setCurrentIndex(
                (current) =>
                    (current -
                        1 +
                        slides.length) %
                    slides.length,
            );
        }, [slides.length]);

    useEffect(() => {
        if (
            slides.length <= 1
        ) {
            return;
        }

        const interval =
            window.setInterval(
                () => {
                    nextSlide();
                },
                6000,
            );

        return () => {
            window.clearInterval(
                interval,
            );
        };
    }, [
        nextSlide,
        slides.length,
    ]);

    useEffect(() => {
        if (
            currentIndex >=
            slides.length
        ) {
            setCurrentIndex(0);
        }
    }, [
        currentIndex,
        slides.length,
    ]);

    if (
        slides.length === 0
    ) {
        return null;
    }

    const slide =
        slides[currentIndex];

    return (
        <section className="w-full">
            <div className="relative overflow-hidden rounded-lg border">
                <div className="relative min-h-[420px] overflow-hidden md:min-h-[520px]">
                    {/* BACKGROUNDS */}

                    <div className="absolute inset-0">
                        {slides.map(
                            (
                                item,
                                index,
                            ) => {
                                if (
                                    !item.image
                                ) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={
                                            item.id
                                        }
                                        className={`
                                            absolute
                                            inset-0
                                            bg-cover
                                            bg-center
                                            transition-all
                                            duration-[1400ms]
                                            ease-in-out
                                            ${
                                                index ===
                                                currentIndex
                                                    ? "scale-100 opacity-100"
                                                    : "scale-[1.03] opacity-0"
                                            }
                                        `}
                                        style={{
                                            backgroundImage: `url("${item.image}")`,
                                        }}
                                    />
                                );
                            },
                        )}
                    </div>

                    <div className="absolute inset-0" />

                    {/* CLICKABLE AREA */}

                    <Link
                        href={
                            slide.href
                        }
                        aria-label={`Ver ${slide.name}`}
                        className="absolute inset-0 z-10 cursor-pointer"
                    >
                        <div className="flex min-h-[420px] items-end p-6 text-white md:min-h-[520px] md:p-8 lg:p-10">
                            <div
                                key={
                                    slide.id
                                }
                                className="animate-[fadeIn_700ms_ease-out]"
                            >
                                <p className="mb-3 text-xs uppercase tracking-[0.2em]">
                                    {
                                        slide.eyebrow
                                    }
                                </p>

                                <div
                                    className="
                                        w-fit
                                        max-w-3xl
                                        bg-black/35
                                        p-5
                                        shadow-[8px_8px_0_rgba(0,0,0,0.55)]
                                        backdrop-blur-sm
                                        transition-transform
                                        duration-300
                                        hover:-translate-y-1
                                        md:p-6
                                    "
                                >
                                    {slide.secondary && (
                                        <p className="mb-2 text-lg md:text-xl">
                                            {
                                                slide.secondary
                                            }
                                        </p>
                                    )}

                                    <h2 className="font-windsor text-4xl leading-none md:text-6xl lg:text-7xl">
                                        {
                                            slide.name
                                        }
                                    </h2>

                                    {slide.type ===
                                        "performance" && (
                                        <p className="mt-4 text-xs uppercase tracking-[0.2em]">
                                            Toda
                                            Terça
                                            Tem
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* CAROUSEL CONTROLS */}

                    {slides.length >
                        1 && (
                        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 rounded-full border border-white/50 bg-black/20 px-3 py-2 text-white backdrop-blur-md md:bottom-10 md:right-10 lg:bottom-12 lg:right-12">
                            <button
                                type="button"
                                onClick={
                                    previousSlide
                                }
                                aria-label="Destaque anterior"
                                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white hover:text-black"
                            >
                                ←
                            </button>

                            <div className="flex items-center gap-2">
                                {slides.map(
                                    (
                                        item,
                                        index,
                                    ) => (
                                        <button
                                            key={
                                                item.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                setCurrentIndex(
                                                    index,
                                                )
                                            }
                                            aria-label={`Ir para destaque ${
                                                index +
                                                1
                                            }`}
                                            className={`h-2 w-2 rounded-full border border-white transition-colors duration-300 ${
                                                index ===
                                                currentIndex
                                                    ? "bg-white"
                                                    : "bg-transparent"
                                            }`}
                                        />
                                    ),
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={
                                    nextSlide
                                }
                                aria-label="Próximo destaque"
                                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white hover:text-black"
                            >
                                →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}