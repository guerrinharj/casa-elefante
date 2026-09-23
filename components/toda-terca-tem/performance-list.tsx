"use client";

import Link from "next/link";

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
        playPerformance,
    } = useAudioPlayer();

    if (
        performances.length === 0
    ) {
        return (
            <section className="border-t border-white p-4 md:p-6">
                <p className="text-sm uppercase">
                    Nenhuma apresentação
                    disponível no momento.
                </p>
            </section>
        );
    }

    return (
        <section className="border-t border-white">
            <div className="p-4 md:p-6">
                <p className="text-sm uppercase">
                    Apresentações Passadas
                </p>
            </div>

            <div>
                {performances.map(
                    (
                        performance,
                    ) => {
                        const isActive =
                            currentPerformance
                                ?.id ===
                            performance.id;

                        const hasAudio =
                            Boolean(
                                performance.audio_url,
                            );

                        return (
                            <div
                                key={performance.id}
                                className={`
                                    group
                                    grid
                                    w-full
                                    grid-cols-[1fr_auto]
                                    items-center
                                    gap-4
                                    border-t
                                    border-white
                                    p-4
                                    transition-colors
                                    duration-300
                                    hover:bg-white
                                    hover:text-black
                                    md:grid-cols-[30%_1fr_auto]
                                    md:p-6
                                    ${
                                        isActive
                                            ? "bg-white text-black"
                                            : "bg-black text-white"
                                    }
                                `}
                            >
                                <span className="hidden text-sm md:block">
                                    {formatDate(
                                        performance.performance_date,
                                    )}
                                </span>

                                <Link
                                    href={`/toda-terca-tem/${performance.slug}`}
                                    className="
                                        font-anton
                                        text-xl
                                        uppercase
                                        transition-opacity
                                        duration-200
                                        hover:opacity-60
                                        md:text-5xl
                                    "
                                >
                                    {
                                        performance.name
                                    }
                                </Link>

                                <button
                                    type="button"
                                    disabled={
                                        !hasAudio
                                    }
                                    onClick={() =>
                                        playPerformance(
                                            performance,
                                        )
                                    }
                                    aria-label={
                                        isActive
                                            ? `Tocando ${performance.name}`
                                            : `Ouvir ${performance.name}`
                                    }
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        border-current
                                        transition-transform
                                        duration-200
                                        hover:scale-110
                                        disabled:cursor-default
                                        disabled:opacity-30
                                        md:h-14
                                        md:w-14
                                    "
                                >
                                    {isActive ? (
                                        <span className="flex gap-1">
                                            <span className="h-4 w-1 bg-current" />
                                            <span className="h-4 w-1 bg-current" />
                                        </span>
                                    ) : (
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="ml-1 h-5 w-5 fill-current md:h-6 md:w-6"
                                            aria-hidden="true"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        );
                    },
                )}
            </div>
        </section>
    );
}