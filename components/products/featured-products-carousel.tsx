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

type FeaturedProductsCarouselProps = {
    products: FeaturedProduct[];
};

export function FeaturedProductsCarousel({
    products,
}: FeaturedProductsCarouselProps) {
    const [
        currentIndex,
        setCurrentIndex,
    ] = useState(0);

    const nextSlide =
        useCallback(() => {
            if (
                products.length <= 1
            ) {
                return;
            }

            setCurrentIndex(
                (current) =>
                    (current + 1) %
                    products.length,
            );
        }, [products.length]);

    const previousSlide =
        useCallback(() => {
            if (
                products.length <= 1
            ) {
                return;
            }

            setCurrentIndex(
                (current) =>
                    (current -
                        1 +
                        products.length) %
                    products.length,
            );
        }, [products.length]);

    useEffect(() => {
        if (
            products.length <= 1
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
        products.length,
    ]);

    if (
        products.length === 0
    ) {
        return null;
    }

    const product =
        products[currentIndex];

    return (
        <section className="w-full">
            <div className="relative overflow-hidden rounded-lg border border-black">
                <div className="relative min-h-[420px] overflow-hidden md:min-h-[520px]">
                    {/* BACKGROUNDS */}

                    <div className="absolute inset-0">
                        {products.map(
                            (
                                item,
                                index,
                            ) => {
                                const image =
                                    item
                                        .images?.[0] ??
                                    null;

                                if (
                                    !image
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
                                            backgroundImage:
                                                `url("${image}")`,
                                        }}
                                    />
                                );
                            },
                        )}
                    </div>

                    {/* BLUR */}

                    <div className="absolute inset-0 backdrop-blur-[3px]" />

                    {/* CLICKABLE PRODUCT AREA */}

                    <Link
                        href={`/produtos/${product.slug}`}
                        aria-label={`Ver ${product.name}`}
                        className="absolute inset-0 z-10 cursor-pointer"
                    >
                        <div className="flex min-h-[420px] items-end p-6 text-white md:min-h-[520px] md:p-8 lg:p-10">
                            <div
                                key={
                                    product.id
                                }
                                className="animate-[fadeIn_700ms_ease-out]"
                            >
                                <p className="mb-3 text-xs uppercase tracking-[0.2em]">
                                    Destaque
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
                                    {product.artist && (
                                        <p className="mb-2 text-lg md:text-xl">
                                            {
                                                product.artist
                                            }
                                        </p>
                                    )}

                                    <h2 className="font-anton text-4xl leading-none uppercase md:text-6xl lg:text-7xl">
                                        {
                                            product.name
                                        }
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* CAROUSEL CONTROLS */}

                    {products.length >
                        1 && (
                        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 rounded-full border border-white/50 bg-black/20 px-3 py-2 text-white backdrop-blur-md md:bottom-10 md:right-10 lg:bottom-12 lg:right-12">
                            <button
                                type="button"
                                onClick={
                                    previousSlide
                                }
                                aria-label="Produto anterior"
                                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white hover:text-black"
                            >
                                ←
                            </button>

                            <div className="flex items-center gap-2">
                                {products.map(
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
                                            aria-label={`Ir para destaque ${index + 1}`}
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
                                aria-label="Próximo produto"
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