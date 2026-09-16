"use client";

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
                                    playPerformance(
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

                                <span className="text-xl font-anton uppercase md:text-3xl">
                                    {
                                        performance.name
                                    }
                                </span>

                                <span className="hidden text-sm md:block">
                                    {formatDate(
                                            performance.performance_date,
                                        )}
                                </span>

                                <div className="flex items-center gap-4">
                                    <span className="text-sm tabular-nums">
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
    );
}