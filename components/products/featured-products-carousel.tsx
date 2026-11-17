
"use client";

import Link from "next/link";

import tttFallback from "@/app/images/ttt-2.png";

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
    performances: FeaturedPerformance[];
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
                image: product.images?.[0] ?? null,
                href: `/produtos/${product.slug}`,
                eyebrow: "Destaque",
                secondary: product.artist,
            }),
        ),

        ...performances.map(
            (performance): CarouselSlide => ({
                id: `performance-${performance.id}`,
                type: "performance",
                name: performance.name,
                image:
                    performance.cover_image ||
                    tttFallback.src,
                href: `/toda-terca-tem/${performance.slug}`,
                eyebrow: "Próxima apresentação",
                secondary: [
                    formatDate(performance.performance_date),
                    performance.location,
                ]
                    .filter(Boolean)
                    .join(" · "),
            }),
        ),
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = useCallback(() => {
        if (slides.length <= 1) {
            return;
        }

        setCurrentIndex(
            (current) => (current + 1) % slides.length,
        );
    }, [slides.length]);

    useEffect(() => {
        if (slides.length <= 1) {
            return;
        }

        const interval = window.setInterval(
            nextSlide,
            6000,
        );

        return () => {
            window.clearInterval(interval);
        };
    }, [
        nextSlide,
        slides.length,
    ]);

    useEffect(() => {
        if (currentIndex >= slides.length) {
            setCurrentIndex(0);
        }
    }, [
        currentIndex,
        slides.length,
    ]);

    if (slides.length === 0) {
        return null;
    }

    const slide = slides[currentIndex];

    return (
        <section className="w-full">
            <div
                className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-black
                    bg-white
                    text-black
                    shadow-[-5px_5px_0_0_#000]
                "
            >
                {/* IMAGEM */}

                <div
                    className="
                        relative
                        h-[300px]
                        overflow-hidden
                        bg-[#D2232A]
                        sm:h-[400px]
                        md:h-[520px]
                    "
                >
                    {slides.map((item, index) => {
                        if (!item.image) {
                            return null;
                        }

                        const isFallback =
                            item.type === "performance" &&
                            item.image === tttFallback.src;

                        return (
                            <div
                                key={item.id}
                                className={`
                                    absolute
                                    inset-0
                                    bg-center
                                    bg-no-repeat
                                    transition-all
                                    duration-[1400ms]
                                    ease-in-out
                                    ${
                                        isFallback
                                            ? "bg-[length:auto_60%]"
                                            : "bg-cover"
                                    }
                                    ${
                                        index === currentIndex
                                            ? "scale-100 opacity-100"
                                            : "scale-[1.03] opacity-0"
                                    }
                                `}
                                style={{
                                    backgroundColor: isFallback
                                        ? "#D2232A"
                                        : undefined,
                                    backgroundImage: `url("${item.image}")`,
                                }}
                            />
                        );
                    })}

                    <Link
                        href={slide.href}
                        aria-label={`Ver ${slide.name}`}
                        className="
                            absolute
                            inset-0
                            z-10
                        "
                    />
                </div>

                {/* FAIXA COMPACTA DE INFORMAÇÕES */}

                <div
                    className="
                        flex
                        min-h-20
                        items-center
                        justify-between
                        gap-4
                        border-t
                        border-black
                        px-4
                        py-3
                        md:px-6
                    "
                >
                    {/* INFORMAÇÕES */}

                    <div
                        key={slide.id}
                        className="
                            min-w-0
                            flex-1
                            animate-[fadeIn_700ms_ease-out]
                        "
                    >
                        <p
                            className="
                                mb-1
                                text-[10px]
                                uppercase
                                tracking-[0.15em]
                                text-black/60
                            "
                        >
                            {slide.eyebrow}
                        </p>

                        <Link
                            href={slide.href}
                            className="group block w-fit max-w-full"
                        >
                            
                            <h2
                                className="
                                    font-october
                                    text-4xl
                                    uppercase
                                    leading-[0.85]
                                    tracking-tight
                                    text-black
                                    transition-opacity
                                    group-hover:opacity-60
                                    sm:text-5xl
                                    md:text-6xl
                                    lg:text-7xl
                                "
                            >
                                {slide.name}
                            </h2>

                        </Link>

                        {slide.secondary && (
                            <p
                                className="
                                    mt-1
                                    truncate
                                    text-xs
                                    text-black/70
                                    md:text-sm
                                "
                            >
                                {slide.secondary}
                            </p>
                        )}
                    </div>

                    {/* INDICADORES */}

                    {slides.length > 1 && (
                        <div
                            className="
                                flex
                                max-w-[100px]
                                shrink-0
                                items-center
                                gap-1.5
                                overflow-x-auto
                                py-2
                                [scrollbar-width:none]
                                [&::-webkit-scrollbar]:hidden
                            "
                        >
                            {slides.map((item, index) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        setCurrentIndex(index);
                                    }}
                                    aria-label={`Ir para destaque ${index + 1}`}
                                    aria-current={
                                        index === currentIndex
                                            ? "true"
                                            : undefined
                                    }
                                    className={`
                                        h-2
                                        w-2
                                        shrink-0
                                        rounded-full
                                        border
                                        border-black
                                        transition-colors
                                        duration-300
                                        ${
                                            index === currentIndex
                                                ? "bg-black"
                                                : "bg-white hover:bg-black/30"
                                        }
                                    `}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
