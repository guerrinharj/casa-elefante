"use client";

import Link from "next/link";
import { useState } from "react";

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

    const [search, setSearch] =
        useState("");

    const normalizedSearch =
        search
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                "",
            );

    const filteredPerformances =
        performances.filter(
            (performance) => {
                const searchableText = [
                    performance.name,
                    performance.location,
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

    if (
        performances.length === 0
    ) {
        return (
            <section className="border-t p-4 md:p-6">
                <p className="text-sm uppercase">
                    Nenhuma apresentação
                    disponível no momento.
                </p>
            </section>
        );
    }

    return (
        <section>
            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-6
                    p-4
                    md:p-6
                "
            >
                <p className="shrink-0 text-sm uppercase">
                    Apresentações Passadas
                </p>

                <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Buscar apresentação"
                    aria-label="Buscar apresentações"
                    className="
                        w-full
                        max-w-sm
                        border-b
                        border-white
                        bg-transparent
                        py-2
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-white/50
                    "
                />
            </div>

            <div>
                {filteredPerformances.length ===
                0 ? (
                    <div className="p-4 md:p-6">
                        <p className="text-sm uppercase">
                            Nenhuma apresentação
                            encontrada.
                        </p>
                    </div>
                ) : (
                    filteredPerformances.map(
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
                                    key={
                                        performance.id
                                    }
                                    className={`
                                        group
                                        grid
                                        w-full
                                        grid-cols-[1fr_auto]
                                        items-center
                                        gap-4
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
                                    <div
                                        className="
                                            hidden
                                            flex-col
                                            gap-1
                                            md:flex
                                        "
                                    >
                                        <span className="text-sm">
                                            {formatDate(
                                                performance.performance_date,
                                            )}
                                        </span>

                                        {performance.location && (
                                            <span
                                                className="
                                                    font-windsor
                                                    text-xl
                                                    leading-none
                                                "
                                            >
                                                {
                                                    performance.location
                                                }
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        href={`/toda-terca-tem/${performance.slug}`}
                                        className="
                                            font-windsor
                                            text-xl
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
                    )
                )}
            </div>
        </section>
    );
}