
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import type {
    Performance,
} from "@/lib/performances";

type AudioPlayerContextType = {
    currentPerformance: Performance | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playPerformance: (performance: Performance) => void;
    clearPerformance: () => void;
    togglePlay: () => void;
    seekTo: (seconds: number) => void;
    changeVolume: (value: number) => void;
    toggleMute: () => void;
};

const AudioPlayerContext =
    createContext<AudioPlayerContextType | undefined>(
        undefined,
    );

export function AudioPlayerProvider({
    children,
}: {
    children: ReactNode;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [
        currentPerformance,
        setCurrentPerformance,
    ] = useState<Performance | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    const previousVolume = useRef(1);

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        const onTime = () => {
            setCurrentTime(audio.currentTime);
        };

        const onMetadata = () => {
            setDuration(
                Number.isFinite(audio.duration)
                    ? audio.duration
                    : 0,
            );
        };

        const onPlay = () => {
            setIsPlaying(true);
        };

        const onPause = () => {
            setIsPlaying(false);
        };

        const onEnded = () => {
            setIsPlaying(false);
        };

        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("loadedmetadata", onMetadata);
        audio.addEventListener("durationchange", onMetadata);
        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener(
                "loadedmetadata",
                onMetadata,
            );
            audio.removeEventListener(
                "durationchange",
                onMetadata,
            );
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        audio.pause();

        setCurrentTime(0);
        setDuration(0);

        if (!currentPerformance?.audio_url) {
            audio.removeAttribute("src");
            audio.load();
            return;
        }

        audio.src = currentPerformance.audio_url;
        audio.load();

        void audio.play().catch(() => {
            setIsPlaying(false);
        });
    }, [currentPerformance]);

    function playPerformance(performance: Performance) {
        if (!performance.audio_url) {
            return;
        }

        if (currentPerformance?.id === performance.id) {
            const audio = audioRef.current;

            if (audio?.paused) {
                void audio.play().catch(() => {
                    setIsPlaying(false);
                });
            }

            return;
        }

        setCurrentPerformance(performance);
    }

    function clearPerformance() {
        audioRef.current?.pause();
        setIsPlaying(false);
        setCurrentPerformance(null);
    }

    function togglePlay() {
        const audio = audioRef.current;

        if (!audio || !currentPerformance?.audio_url) {
            return;
        }

        if (audio.paused) {
            void audio.play().catch(() => {
                setIsPlaying(false);
            });
        } else {
            audio.pause();
        }
    }

    function seekTo(seconds: number) {
        const audio = audioRef.current;

        if (!audio || !Number.isFinite(audio.duration)) {
            return;
        }

        const next = Math.max(
            0,
            Math.min(seconds, audio.duration),
        );

        audio.currentTime = next;
        setCurrentTime(next);
    }

    function changeVolume(value: number) {
        const next = Math.max(
            0,
            Math.min(1, value),
        );

        if (next > 0) {
            previousVolume.current = next;
        }

        if (audioRef.current) {
            audioRef.current.volume = next;
        }

        setVolume(next);
    }

    function toggleMute() {
        changeVolume(
            volume === 0
                ? previousVolume.current || 1
                : 0,
        );
    }

    return (
        <AudioPlayerContext.Provider
            value={{
                currentPerformance,
                isPlaying,
                currentTime,
                duration,
                volume,
                playPerformance,
                clearPerformance,
                togglePlay,
                seekTo,
                changeVolume,
                toggleMute,
            }}
        >
            {children}

            <audio
                ref={audioRef}
                preload="metadata"
                className="hidden"
            />
        </AudioPlayerContext.Provider>
    );
}

export function useAudioPlayer() {
    const context = useContext(AudioPlayerContext);

    if (!context) {
        throw new Error(
            "useAudioPlayer deve ser usado dentro de AudioPlayerProvider",
        );
    }

    return context;
}
