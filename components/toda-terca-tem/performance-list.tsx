"use client";

import {
    useState,
} from "react";

import {
    AudioPlayer,
} from "@/components/toda-terca-tem/audio-player";

import type {
    Performance,
} from "@/app/toda-terca-tem/page";

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
    const [
        currentPerformance,
        setCurrentPerformance,
    ] = useState<Performance | null>(
        null,
    );

    const handlePerformanceClick = (
        performance: Performance,
    ) => {
        if (!performance.audio_url) {
            return;
        }

        setCurrentPerformance(
            performance,
        );
    };

    if (performances.length === 0) {
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
        <>
            <section className="border-t border-white">
                <div className="p-4 md:p-6">
                    <p className="text-sm uppercase">
                        Apresentações
                    </p>
                </div>

                <div>
                    {performances.map(
                        (
                            performance,
                            index,
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
                                <button
                                    key={
                                        performance.id
                                    }
                                    type="button"
                                    disabled={
                                        !hasAudio
                                    }
                                    onClick={() =>
                                        handlePerformanceClick(
                                            performance,
                                        )
                                    }
                                    className={`
                                        group
                                        grid
                                        w-full
                                        grid-cols-[40px_1fr_auto]
                                        items-center
                                        gap-4
                                        border-t
                                        border-white
                                        p-4
                                        text-left
                                        transition-colors
                                        duration-300
                                        md:grid-cols-[60px_1fr_1fr_auto]
                                        md:p-6

                                        ${
                                            isActive
                                                ? "bg-white text-black"
                                                : "bg-black text-white"
                                        }

                                        ${
                                            hasAudio
                                                ? "cursor-pointer hover:bg-white hover:text-black"
                                                : "cursor-default opacity-40"
                                        }
                                    `}
                                >
                                    <span className="text-sm tabular-nums">
                                        {String(
                                            index +
                                                1,
                                        ).padStart(
                                            2,
                                            "0",
                                        )}
                                    </span>

                                    <span className="text-xl font-bold uppercase md:text-3xl">
                                        {
                                            performance.name
                                        }
                                    </span>

                                    <span className="hidden text-sm md:block">
                                        {performance.description ??
                                            "Toda Terça Tem"}
                                    </span>

                                    <div className="flex items-center gap-4">
                                        <span className="text-sm tabular-nums">
                                            {formatDate(
                                                performance.performance_date,
                                            )}
                                        </span>

                                        {hasAudio && (
                                            <span className="hidden text-xs uppercase md:block">
                                                {isActive
                                                    ? "Tocando"
                                                    : "Ouvir"}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        },
                    )}
                </div>
            </section>

            {currentPerformance &&
                currentPerformance.audio_url && (
                    <div className="sticky bottom-0 z-40">
                        <AudioPlayer
                            key={
                                currentPerformance.id
                            }
                            name={
                                currentPerformance.name
                            }
                            audioUrl={
                                currentPerformance.audio_url
                            }
                            coverImage={
                                currentPerformance.cover_image
                            }
                            date={
                                currentPerformance.performance_date
                            }
                            autoPlay
                        />
                    </div>
                )}
        </>
    );
}