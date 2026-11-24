
"use client";

import Image from "next/image";
import Link from "next/link";

import {
    useState,
} from "react";

import {
    Play,
    Pause,
} from "lucide-react";

import tttPlaceholder from "@/app/images/ttt-3-preto.png";

import {
    DraggableComponent,
} from "@/components/layout/draggable-component";


import {
    useAudioPlayer,
} from "@/components/toda-terca-tem/audio-player-provider";

import type {
    Performance,
} from "@/lib/performances";

type PerformanceListProps = {
    performances: Performance[];
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
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC",
        },
    ).format(
        new Date(date),
    );
}

export function PerformanceList({
    performances,
}: PerformanceListProps) {
    const {
        currentPerformance,
        isPlaying,
        playPerformance,
    } = useAudioPlayer();

    const [search, setSearch] = useState("");

    const normalizedSearch = search
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            "",
        );

    const filteredPerformances = performances.filter(
        (performance) => {
            const searchableText = [
                performance.name,
                performance.location,
                performance.description,
                formatDate(
                    performance.performance_date,
                ),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    "",
                );

            return searchableText.includes(
                normalizedSearch,
            );
        },
    );

    return (
        <section className="w-full">

            {/* LISTAGEM */}

            {performances.length === 0 ? (
                <div className="py-8">
                    <p className="text-sm text-black">
                        Nenhuma apresentação disponível no momento.
                    </p>
                </div>
            ) : filteredPerformances.length === 0 ? (
                <div className="py-8">
                    <p className="text-sm text-black">
                        Nenhuma apresentação encontrada.
                    </p>
                </div>
            ) : (
                <div
                    className="
                        grid
                        grid-cols-2
                        gap-4
                        px-[5px]
                        pb-[10px]
                        mb-10
                        md:grid-cols-3
                        md:gap-6
                    "
                >
                    {filteredPerformances.map((performance) => {
                        const isActive =
                            currentPerformance?.id === performance.id;

                        const hasAudio = Boolean(
                            performance.audio_url,
                        );

                        const imageSrc =
                            performance.cover_image || tttPlaceholder;

                        return (
                            <article
                                key={performance.id}
                                className="
                                    group
                                    flex
                                    min-w-0
                                    flex-col
                                    overflow-hidden
                                    rounded-xl
                                    border
                                    border-black
                                    bg-white
                                    text-black
                                    shadow-[-5px_5px_0_0_#000]
                                    transition-transform
                                    duration-300
                                    hover:-translate-y-1
                                "
                            >
                                {/* CAPA */}

                                <Link
                                    href={`/toda-terca-tem/${performance.slug}`}
                                    className="
                                        relative
                                        block
                                        aspect-square
                                        w-full
                                        overflow-hidden
                                        border-b
                                        border-black
                                        bg-white
                                    "
                                    aria-label={`Ver apresentação ${performance.name}`}
                                >
                                    <Image
                                        src={imageSrc}
                                        alt={performance.name}
                                        fill
                                        sizes="
                                            (max-width: 767px) 50vw,
                                            33vw
                                        "
                                        className={`
                                            object-cover
                                            transition-transform
                                            duration-500
                                            group-hover:scale-105
                                            ${
                                                performance.cover_image
                                                    ? ""
                                                    : "object-contain p-8"
                                            }
                                        `}
                                        unoptimized={
                                            typeof imageSrc === "string"
                                        }
                                    />
                                </Link>

                                {/* INFORMAÇÕES */}

                                <div
                                    className="
                                        flex
                                        flex-1
                                        flex-col
                                        gap-3
                                        p-3
                                        md:p-4
                                    "
                                >
                                    {/* DATA E LOCAL */}

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-1
                                            text-xs
                                            leading-tight
                                            text-black/60
                                            md:text-sm
                                        "
                                    >
                                        <span>
                                            {formatDate(
                                                performance.performance_date,
                                            )}
                                        </span>

                                        {performance.location && (
                                            <span>
                                                {performance.location}
                                            </span>
                                        )}
                                    </div>

                                    {/* NOME DO ARTISTA */}

                                    <Link
                                        href={`/toda-terca-tem/${performance.slug}`}
                                        className="
                                            block
                                            font-october
                                            text-2xl
                                            uppercase
                                            leading-[0.9]
                                            transition-opacity
                                            duration-200
                                            hover:opacity-60
                                            md:text-4xl
                                            lg:text-5xl
                                        "
                                    >
                                        {performance.name}
                                    </Link>

                                    {/* DESCRIÇÃO */}

                                    {performance.description && (
                                        <p
                                            className="
                                                line-clamp-3
                                                text-xs
                                                leading-relaxed
                                                text-black/70
                                                md:text-sm
                                            "
                                        >
                                            {performance.description}
                                        </p>
                                    )}

                                    {/* RODAPÉ */}

                                    <div
                                        className="
                                            mt-auto
                                            flex
                                            items-center
                                            justify-between
                                            gap-2
                                            border-t
                                            border-black
                                            pt-3
                                        "
                                    >
                                        <Link
                                            href={`/toda-terca-tem/${performance.slug}`}
                                            className="
                                                text-xs
                                                font-semibold
                                                transition-opacity
                                                hover:opacity-60
                                            "
                                        >
                                            Ver apresentação ↗
                                        </Link>

                                        <button
                                            type="button"
                                            disabled={!hasAudio}
                                            onClick={() => {
                                                playPerformance(
                                                    performance,
                                                );
                                            }}
                                            aria-label={
                                                isActive
                                                    ? isPlaying
                                                        ? `Tocando ${performance.name}`
                                                        : `Reproduzir ${performance.name}`
                                                    : `Ouvir ${performance.name}`
                                            }
                                            title={
                                                hasAudio
                                                    ? `Ouvir ${performance.name}`
                                                    : "Áudio indisponível"
                                            }
                                            className={`
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-black
                                                transition-colors
                                                duration-200
                                                hover:bg-black
                                                hover:text-white
                                                disabled:cursor-not-allowed
                                                disabled:opacity-30
                                                disabled:hover:bg-white
                                                disabled:hover:text-black
                                                ${
                                                    isActive
                                                        ? "bg-black text-white"
                                                        : "bg-white text-black"
                                                }
                                            `}
                                        >
                                            {isActive && isPlaying ? (
                                                <Pause
                                                    size={18}
                                                    fill="currentColor"
                                                    strokeWidth={2}
                                                />
                                            ) : (
                                                <Play
                                                    size={18}
                                                    fill="currentColor"
                                                    strokeWidth={2}
                                                    className="ml-0.5"
                                                />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
