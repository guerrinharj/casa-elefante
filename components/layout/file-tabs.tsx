
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
    ShoppingCart,
    UserRound,
    LogOut,
    UserPlus,
    Play,
    Pause,
    Volume2,
    VolumeX,
    X,
} from "lucide-react";

import {
    createClient,
} from "@/lib/supabase/client";

import {
    useAudioPlayer,
} from "@/components/toda-terca-tem/audio-player-provider";

import {
    usePageTransition,
} from "@/components/layout/page-transition-provider";

import tttPlaceholder from "@/app/images/ttt-2.png";

type FileTabsProps = {
    name: string | null;
    isLoggedIn: boolean;
    accountHref: string;
};

function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const remaining = total % 60;

    return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

export function FileTabs({
    name,
    isLoggedIn,
    accountHref,
}: FileTabsProps) {
    const router = useRouter();

    const {
        navigate,
        isTransitioning,
    } = usePageTransition();

    const {
        currentPerformance,
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        seekTo,
        changeVolume,
        toggleMute,
        clearPerformance,
    } = useAudioPlayer();

    const [mounted, setMounted] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const hasPlayer = Boolean(
        currentPerformance?.audio_url,
    );

    const performanceImage = currentPerformance?.cover_image;

    const imageSrc = performanceImage && !imageFailed
        ? performanceImage
        : tttPlaceholder;

    const progress = duration > 0
        ? Math.min(100, Math.max(0, currentTime / duration * 100))
        : 0;

    const title = currentPerformance?.name || "APRESENTAÇÃO";

    const date = formatDate(
        currentPerformance?.performance_date,
    );

    async function handleLogout() {
        if (loggingOut) {
            return;
        }

        setLoggingOut(true);

        try {
            const supabase = createClient();

            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            router.replace("/");
            router.refresh();
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
            setLoggingOut(false);
        }
    }

    function handleNavigation(href: string) {
        if (isTransitioning) {
            return;
        }

        void navigate(href);
    }

    if (!mounted) {
        return null;
    }

    return (
        <div
            className="
                pointer-events-none
                fixed
                bottom-4
                right-4
                z-[100]
                w-[calc(100%-2rem)]
                max-w-[560px]
                md:bottom-6
                md:right-6
            "
        >
            <div
                data-page-transition-origin
                className="
                    pointer-events-auto
                    overflow-hidden
                    rounded-xl
                    border
                    border-black
                    bg-white
                    p-4
                    text-black
                    shadow-[-5px_5px_0_0_#000]
                    transition-all
                    duration-200
                    ease-out
                    md:p-5
                "
            >
                {/* NAVEGAÇÃO PRINCIPAL */}

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => handleNavigation("/")}
                        disabled={isTransitioning}
                        className="
                            shrink-0
                            whitespace-nowrap
                            text-left
                            font-black
                            uppercase
                            leading-none
                            tracking-tight
                            transition-opacity
                            hover:opacity-60
                            disabled:opacity-50
                        "
                        style={{
                            fontFamily: "var(--font-anton), sans-serif",
                            fontSize: "clamp(16px, 3vw, 22px)",
                        }}
                    >
                        CASA ELEFANTE
                    </button>

                    <div className="h-8 w-px shrink-0 bg-black" />

                    <button
                        type="button"
                        onClick={() => handleNavigation("/toda-terca-tem")}
                        disabled={isTransitioning}
                        className="
                            min-w-0
                            flex-1
                            text-left
                            text-base
                            font-black
                            uppercase
                            leading-none
                            transition-opacity
                            hover:opacity-60
                            disabled:opacity-50
                            md:text-xl
                        "
                        style={{
                            fontFamily: "var(--font-anton), sans-serif",
                        }}
                    >
                        TODA TERÇA TEM
                    </button>

                    {/* 3 ÍCONES */}

                    <div className="flex shrink-0 items-center gap-3">
                        <Link
                            href="/carrinho"
                            aria-label="Carrinho"
                            title="Carrinho"
                            className="transition-opacity hover:opacity-50"
                        >
                            <ShoppingCart size={24} strokeWidth={2} />
                        </Link>

                        <button
                            type="button"
                            onClick={() => {
                                router.push(
                                    isLoggedIn ? accountHref : "/login",
                                );
                            }}
                            aria-label={
                                isLoggedIn
                                    ? name?.trim() || "Minha conta"
                                    : "Entrar"
                            }
                            title={
                                isLoggedIn
                                    ? name?.trim() || "Minha conta"
                                    : "Entrar"
                            }
                            className="transition-opacity hover:opacity-50"
                        >
                            <UserRound size={23} strokeWidth={2} />
                        </button>

                        {isLoggedIn ? (
                            <button
                                type="button"
                                onClick={() => void handleLogout()}
                                disabled={loggingOut}
                                aria-label="Sair"
                                title="Sair"
                                className="
                                    transition-opacity
                                    hover:opacity-50
                                    disabled:opacity-50
                                "
                            >
                                <LogOut size={23} strokeWidth={2} />
                            </button>
                        ) : (
                            <Link
                                href="/cadastro"
                                aria-label="Criar conta"
                                title="Criar conta"
                                className="transition-opacity hover:opacity-50"
                            >
                                <UserPlus size={23} strokeWidth={2} />
                            </Link>
                        )}
                    </div>
                </div>

                {/* PLAYER */}

                {hasPlayer && (
                    <div className="mt-4 border-t border-black pt-4">
                        <div className="flex items-start gap-3">
                            {/* IMAGEM DA PERFORMANCE */}

                            <div
                                className="
                                    relative
                                    h-[76px]
                                    w-[76px]
                                    shrink-0
                                    overflow-hidden
                                    rounded-lg
                                    bg-[#D2232A]
                                "
                            >
                                <Image
                                    key={String(imageSrc)}
                                    src={imageSrc}
                                    alt={title}
                                    fill
                                    sizes="76px"
                                    className="object-cover"
                                    unoptimized={
                                        typeof imageSrc === "string"
                                    }
                                    onError={() => {
                                        setImageFailed(true);
                                    }}
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p
                                    className="
                                        text-xs
                                        font-black
                                        uppercase
                                        tracking-wide
                                    "
                                >
                                    TODA TERÇA TEM
                                </p>

                                <h2
                                    className="
                                        mt-1
                                        line-clamp-2
                                        text-xl
                                        font-black
                                        leading-tight
                                        md:text-2xl
                                    "
                                    style={{
                                        fontFamily:
                                            "var(--font-anton), sans-serif",
                                    }}
                                >
                                    {title}
                                </h2>

                                {date && (
                                    <p className="mt-1 text-xs">
                                        {date}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={clearPerformance}
                                aria-label="Fechar player"
                                className="
                                    shrink-0
                                    transition-opacity
                                    hover:opacity-50
                                "
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* CONTROLES */}

                        <div className="mt-4 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={togglePlay}
                                aria-label={
                                    isPlaying ? "Pausar" : "Reproduzir"
                                }
                                className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-black
                                    text-white
                                    transition-transform
                                    hover:scale-105
                                "
                            >
                                {isPlaying ? (
                                    <Pause size={20} fill="currentColor" />
                                ) : (
                                    <Play size={20} fill="currentColor" />
                                )}
                            </button>

                            <span className="shrink-0 text-xs tabular-nums">
                                {formatTime(currentTime)}
                            </span>

                            <input
                                type="range"
                                min={0}
                                max={duration || 1}
                                step={0.1}
                                value={Math.min(currentTime, duration || 1)}
                                onChange={(event) => {
                                    seekTo(Number(event.target.value));
                                }}
                                disabled={duration <= 0}
                                aria-label="Progresso da apresentação"
                                className="
                                    h-1.5
                                    min-w-0
                                    flex-1
                                    cursor-pointer
                                    accent-black
                                    disabled:cursor-not-allowed
                                "
                                style={{
                                    background: `linear-gradient(to right, #000 ${progress}%, #d4d4d4 ${progress}%)`,
                                }}
                            />

                            <span className="shrink-0 text-xs tabular-nums">
                                {formatTime(duration)}
                            </span>
                        </div>

                        {/* VOLUME */}

                        <div className="mt-3 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={toggleMute}
                                aria-label={
                                    volume === 0
                                        ? "Ativar som"
                                        : "Silenciar"
                                }
                                className="transition-opacity hover:opacity-50"
                            >
                                {volume === 0 ? (
                                    <VolumeX size={19} />
                                ) : (
                                    <Volume2 size={19} />
                                )}
                            </button>

                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.01}
                                value={volume}
                                onChange={(event) => {
                                    changeVolume(Number(event.target.value));
                                }}
                                aria-label="Volume"
                                className="w-24 cursor-pointer accent-black"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
