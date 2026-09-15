"use client";

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    Performance,
} from "@/lib/performances";

type AudioPlayerContextType = {
    currentPerformance:
        Performance | null;

    playPerformance: (
        performance: Performance,
    ) => void;

    clearPerformance:
        () => void;
};

const AudioPlayerContext =
    createContext<
        AudioPlayerContextType | undefined
    >(undefined);

function formatTime(
    seconds: number,
) {
    if (
        !Number.isFinite(
            seconds,
        )
    ) {
        return "0:00";
    }

    const minutes =
        Math.floor(
            seconds / 60,
        );

    const remainingSeconds =
        Math.floor(
            seconds % 60,
        );

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(
            2,
            "0",
        )}`;
}

function formatDate(
    date:
        | string
        | null
        | undefined,
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

export function AudioPlayerProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const audioRef =
        useRef<HTMLAudioElement>(
            null,
        );

    const [
        currentPerformance,
        setCurrentPerformance,
    ] =
        useState<Performance | null>(
            null,
        );

    const [
        isPlaying,
        setIsPlaying,
    ] = useState(false);

    const [
        currentTime,
        setCurrentTime,
    ] = useState(0);

    const [
        duration,
        setDuration,
    ] = useState(0);

    const [
        volume,
        setVolume,
    ] = useState(1);

    const [
        previousVolume,
        setPreviousVolume,
    ] = useState(1);

    useEffect(() => {
        const audio =
            audioRef.current;

        if (!audio) {
            return;
        }

        const handleTimeUpdate =
            () => {
                setCurrentTime(
                    audio.currentTime,
                );
            };

        const handleLoadedMetadata =
            () => {
                setDuration(
                    audio.duration,
                );
            };

        const handlePlay =
            () => {
                setIsPlaying(
                    true,
                );
            };

        const handlePause =
            () => {
                setIsPlaying(
                    false,
                );
            };

        const handleEnded =
            () => {
                setIsPlaying(
                    false,
                );

                setCurrentTime(
                    0,
                );
            };

        audio.addEventListener(
            "timeupdate",
            handleTimeUpdate,
        );

        audio.addEventListener(
            "loadedmetadata",
            handleLoadedMetadata,
        );

        audio.addEventListener(
            "play",
            handlePlay,
        );

        audio.addEventListener(
            "pause",
            handlePause,
        );

        audio.addEventListener(
            "ended",
            handleEnded,
        );

        return () => {
            audio.removeEventListener(
                "timeupdate",
                handleTimeUpdate,
            );

            audio.removeEventListener(
                "loadedmetadata",
                handleLoadedMetadata,
            );

            audio.removeEventListener(
                "play",
                handlePlay,
            );

            audio.removeEventListener(
                "pause",
                handlePause,
            );

            audio.removeEventListener(
                "ended",
                handleEnded,
            );
        };
    }, [
        currentPerformance,
    ]);

    async function playPerformance(
        performance: Performance,
    ) {
        if (
            !performance.audio_url
        ) {
            return;
        }

        const samePerformance =
            currentPerformance
                ?.id ===
            performance.id;

        if (samePerformance) {
            const audio =
                audioRef.current;

            if (!audio) {
                return;
            }

            if (audio.paused) {
                try {
                    await audio.play();
                } catch {
                    setIsPlaying(
                        false,
                    );
                }
            }

            return;
        }

        setCurrentPerformance(
            performance,
        );

        setCurrentTime(0);
        setDuration(0);
    }

    useEffect(() => {
        const audio =
            audioRef.current;

        if (
            !audio ||
            !currentPerformance
                ?.audio_url
        ) {
            return;
        }

        audio.load();

        audio.play().catch(
            () => {
                setIsPlaying(
                    false,
                );
            },
        );
    }, [
        currentPerformance,
    ]);

    function clearPerformance() {
        const audio =
            audioRef.current;

        if (audio) {
            audio.pause();
        }

        setCurrentPerformance(
            null,
        );

        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }

    async function togglePlay() {
        const audio =
            audioRef.current;

        if (!audio) {
            return;
        }

        if (audio.paused) {
            try {
                await audio.play();
            } catch {
                setIsPlaying(
                    false,
                );
            }

            return;
        }

        audio.pause();
    }

    function handleSeek(
        event:
            React.ChangeEvent<HTMLInputElement>,
    ) {
        const audio =
            audioRef.current;

        if (!audio) {
            return;
        }

        const newTime =
            Number(
                event.target.value,
            );

        audio.currentTime =
            newTime;

        setCurrentTime(
            newTime,
        );
    }

    function handleVolume(
        event:
            React.ChangeEvent<HTMLInputElement>,
    ) {
        const audio =
            audioRef.current;

        if (!audio) {
            return;
        }

        const newVolume =
            Number(
                event.target.value,
            );

        audio.volume =
            newVolume;

        setVolume(
            newVolume,
        );

        if (newVolume > 0) {
            setPreviousVolume(
                newVolume,
            );
        }
    }

    function toggleMute() {
        const audio =
            audioRef.current;

        if (!audio) {
            return;
        }

        if (volume > 0) {
            setPreviousVolume(
                volume,
            );

            audio.volume = 0;

            setVolume(0);

            return;
        }

        const restoredVolume =
            previousVolume ||
            1;

        audio.volume =
            restoredVolume;

        setVolume(
            restoredVolume,
        );
    }

    return (
        <AudioPlayerContext.Provider
            value={{
                currentPerformance,
                playPerformance,
                clearPerformance,
            }}
        >
            {children}

            {currentPerformance &&
                currentPerformance.audio_url && (
                    <div className="fixed bottom-0 left-0 z-[100] w-full border-t border-white bg-black text-white">
                        <audio
                            ref={
                                audioRef
                            }
                            src={
                                currentPerformance.audio_url
                            }
                            preload="metadata"
                        />

                        <div className="flex items-center gap-4 p-4 md:gap-6 md:p-6">
                            {currentPerformance.cover_image && (
                                <div className="hidden h-16 w-16 shrink-0 overflow-hidden md:block">
                                    <img
                                        src={
                                            currentPerformance.cover_image
                                        }
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={
                                    togglePlay
                                }
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white transition-colors duration-300 hover:bg-white hover:text-black"
                                aria-label={
                                    isPlaying
                                        ? "Pausar"
                                        : "Reproduzir"
                                }
                            >
                                {isPlaying
                                    ? "Ⅱ"
                                    : "▶"}
                            </button>

                            <div className="hidden w-52 min-w-0 md:block">
                                <p className="truncate text-sm font-bold uppercase">
                                    {
                                        currentPerformance.name
                                    }
                                </p>

                                {currentPerformance.performance_date && (
                                    <p className="mt-1 text-xs">
                                        {formatDate(
                                            currentPerformance.performance_date,
                                        )}
                                    </p>
                                )}
                            </div>

                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <span className="w-10 shrink-0 text-xs tabular-nums">
                                    {formatTime(
                                        currentTime,
                                    )}
                                </span>

                                <input
                                    type="range"
                                    min={
                                        0
                                    }
                                    max={
                                        duration ||
                                        0
                                    }
                                    step="0.1"
                                    value={
                                        currentTime
                                    }
                                    onChange={
                                        handleSeek
                                    }
                                    aria-label="Progresso do áudio"
                                    className="h-px min-w-0 flex-1 cursor-pointer appearance-none bg-white"
                                />

                                <span className="w-10 shrink-0 text-right text-xs tabular-nums">
                                    {formatTime(
                                        duration,
                                    )}
                                </span>
                            </div>

                            <div className="hidden items-center gap-3 lg:flex">
                                <button
                                    type="button"
                                    onClick={
                                        toggleMute
                                    }
                                    className="w-8 text-xs uppercase"
                                >
                                    {volume ===
                                    0
                                        ? "Mudo"
                                        : "Vol"}
                                </button>

                                <input
                                    type="range"
                                    min={
                                        0
                                    }
                                    max={
                                        1
                                    }
                                    step="0.01"
                                    value={
                                        volume
                                    }
                                    onChange={
                                        handleVolume
                                    }
                                    aria-label="Volume"
                                    className="h-px w-20 cursor-pointer appearance-none bg-white"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={
                                    clearPerformance
                                }
                                className="flex h-8 w-8 shrink-0 items-center justify-center text-xl"
                                aria-label="Fechar player"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
        </AudioPlayerContext.Provider>
    );
}

export function useAudioPlayer() {
    const context =
        useContext(
            AudioPlayerContext,
        );

    if (!context) {
        throw new Error(
            "useAudioPlayer must be used inside AudioPlayerProvider",
        );
    }

    return context;
}