"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

type AudioPlayerProps = {
    name: string;
    audioUrl: string;
    coverImage?: string | null;
    date?: string | null;
    autoPlay?: boolean;
};

function formatTime(
    seconds: number,
) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(
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
    date: string | null | undefined,
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

export function AudioPlayer({
    name,
    audioUrl,
    coverImage,
    date,
    autoPlay = false,
}: AudioPlayerProps) {
    const audioRef =
        useRef<HTMLAudioElement>(
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

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
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
    }, []);

    useEffect(() => {
        const audio =
            audioRef.current;

        if (
            !audio ||
            !autoPlay
        ) {
            return;
        }

        audio.play().catch(
            () => {
                setIsPlaying(
                    false,
                );
            },
        );
    }, [
        audioUrl,
        autoPlay,
    ]);

    const togglePlay =
        async () => {
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
        };

    const handleSeek = (
        event:
            React.ChangeEvent<HTMLInputElement>,
    ) => {
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
    };

    const handleVolume = (
        event:
            React.ChangeEvent<HTMLInputElement>,
    ) => {
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
    };

    const toggleMute = () => {
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
            previousVolume || 1;

        audio.volume =
            restoredVolume;

        setVolume(
            restoredVolume,
        );
    };

    return (
        <div className="border-t border-white bg-black text-white">
            <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
            />

            <div className="flex items-center gap-4 p-4 md:gap-6 md:p-6">
                {coverImage && (
                    <div className="hidden h-16 w-16 shrink-0 overflow-hidden md:block">
                        <img
                            src={
                                coverImage
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

                <div className="hidden min-w-0 w-52 md:block">
                    <p className="truncate text-sm font-bold uppercase">
                        {name}
                    </p>

                    {date && (
                        <p className="mt-1 text-xs">
                            {formatDate(
                                date,
                            )}
                        </p>
                    )}
                </div>

                <div className="flex flex-1 items-center gap-3">
                    <span className="w-10 text-xs tabular-nums">
                        {formatTime(
                            currentTime,
                        )}
                    </span>

                    <input
                        type="range"
                        min={0}
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

                    <span className="w-10 text-right text-xs tabular-nums">
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
                        {volume === 0
                            ? "Mudo"
                            : "Vol"}
                    </button>

                    <input
                        type="range"
                        min={0}
                        max={1}
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
            </div>
        </div>
    );
}