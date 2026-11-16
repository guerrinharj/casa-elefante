
"use client";

import Image from "next/image";
import Link from "next/link";

import {
    useParams,
} from "next/navigation";

import {
    useEffect,
    useState,
} from "react";

import tttFallback from "@/app/images/ttt-3-preto.png";

import {
    useAudioPlayer,
} from "@/components/toda-terca-tem/audio-player-provider";

import {
    createClient,
} from "@/lib/supabase/client";

import type {
    Performance,
} from "@/lib/performances";

function formatDate(date: string | null) {
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
    ).format(new Date(date));
}

const boxStyle = `
    rounded-xl
    border
    border-black
    bg-white
    text-black
    shadow-[-5px_5px_0_0_#000]
`;

const buttonStyle = `
    rounded-xl
    border
    border-black
    bg-white
    text-black
    shadow-[-4px_4px_0_0_#000]
    transition-all
    duration-200
    ease-out
    hover:-translate-x-1
    hover:-translate-y-1
    hover:shadow-[-7px_7px_0_0_#000]
`;

export default function PerformancePage() {
    const params = useParams<{
        slug: string;
    }>();

    const {
        playPerformance,
        currentPerformance,
    } = useAudioPlayer();

    const [performance, setPerformance] =
        useState<Performance | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPerformance() {
            setLoading(true);

            const supabase = createClient();

            const {
                data,
                error,
            } = await supabase
                .from("performances")
                .select(`
                    id,
                    name,
                    slug,
                    description,
                    performance_date,
                    location,
                    video_url,
                    audio_url,
                    cover_image,
                    published,
                    created_at,
                    updated_at
                `)
                .eq(
                    "slug",
                    params.slug,
                )
                .eq(
                    "published",
                    true,
                )
                .single();

            if (error || !data) {
                setPerformance(null);
                setLoading(false);

                return;
            }

            setPerformance(data as Performance);
            setLoading(false);
        }

        void loadPerformance();
    }, [params.slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#D2232A]" />
        );
    }

    if (!performance) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#D2232A] p-4 md:p-6">
                <div
                    className={`
                        w-full
                        max-w-xl
                        p-6
                        text-center
                        md:p-8
                        ${boxStyle}
                    `}
                >
                    <h1 className="font-october text-4xl uppercase">
                        Apresentação não encontrada
                    </h1>

                    <Link
                        href="/toda-terca-tem"
                        className={`
                            mt-6
                            inline-block
                            px-5
                            py-3
                            text-sm
                            uppercase
                            ${buttonStyle}
                        `}
                    >
                        ← Todas as apresentações
                    </Link>
                </div>
            </main>
        );
    }

    const isCurrentPerformance =
        currentPerformance?.id === performance.id;

    return (
        <main className="min-h-screen bg-[#D2232A] p-4 md:p-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
                {/* VOLTAR */}

                <div>
                    <Link
                        href="/toda-terca-tem"
                        className={`
                            inline-block
                            px-4
                            py-3
                            text-xs
                            uppercase
                            ${buttonStyle}
                        `}
                    >
                        ← Todas as apresentações
                    </Link>
                </div>

                {/* BOX 1 — INFORMAÇÕES */}

                <section
                    className={`
                        flex
                        flex-col
                        gap-4
                        p-5
                        md:p-6
                        ${boxStyle}
                    `}
                >
                    {/* DATA E IDENTIFICAÇÃO */}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs font-medium uppercase tracking-wide">
                            Toda Terça Tem
                        </span>

                        {performance.performance_date && (
                            <span className="text-xs font-medium uppercase">
                                {formatDate(
                                    performance.performance_date,
                                )}
                            </span>
                        )}
                    </div>

                    {/* ARTISTA — VERMELHO COM OUTLINE PRETO */}

                    <h1
                        className="
                            font-october
                            text-5xl
                            uppercase
                            leading-[0.9]
                            text-[#D2232A]
                            [-webkit-text-stroke:1px_#000]
                            md:text-6xl
                            lg:text-7xl
                        "
                    >
                        {performance.name}
                    </h1>

                    {/* LOCAL */}

                    {performance.location && (
                        <p className="text-sm font-medium uppercase">
                            {performance.location}
                        </p>
                    )}

                    {/* DESCRIÇÃO */}

                    {performance.description && (
                        <p
                            className="
                                max-w-4xl
                                whitespace-pre-line
                                text-sm
                                leading-relaxed
                                md:text-base
                            "
                        >
                            {performance.description}
                        </p>
                    )}

                    {/* BOTÃO DE PLAY */}

                    {performance.audio_url && (
                        <div className="pt-1">
                            <button
                                type="button"
                                onClick={() =>
                                    playPerformance(performance)
                                }
                                aria-label={`Reproduzir ${performance.name}`}
                                className={`
                                    flex
                                    items-center
                                    justify-center
                                    gap-3
                                    px-5
                                    py-3
                                    text-xs
                                    font-semibold
                                    uppercase
                                    ${buttonStyle}
                                `}
                            >
                                <span className="text-base leading-none">
                                    ▶
                                </span>

                                <span>
                                    {isCurrentPerformance
                                        ? "Reproduzindo no player"
                                        : "Reproduzir áudio"}
                                </span>
                            </button>
                        </div>
                    )}
                </section>

                {/* BOX 2 — VÍDEO OU IMAGEM */}

                <section
                    className={`
                        overflow-hidden
                        p-3
                        md:p-4
                        ${boxStyle}
                    `}
                >
                    {performance.video_url ? (
                        <div
                            className="
                                aspect-video
                                w-full
                                overflow-hidden
                                rounded-lg
                                bg-black
                            "
                        >
                            <iframe
                                src={performance.video_url}
                                title={performance.name}
                                className="h-full w-full"
                                allow="
                                    accelerometer;
                                    autoplay;
                                    clipboard-write;
                                    encrypted-media;
                                    gyroscope;
                                    picture-in-picture
                                "
                                allowFullScreen
                            />
                        </div>
                    ) : performance.cover_image ? (
                        <div
                            className="
                                aspect-video
                                w-full
                                overflow-hidden
                                rounded-lg
                                bg-white
                            "
                        >
                            <img
                                src={performance.cover_image}
                                alt={performance.name}
                                className="
                                    h-full
                                    w-full
                                    object-cover
                                "
                            />
                        </div>
                    ) : (
                        <div
                            className="
                                flex
                                aspect-video
                                w-full
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-lg
                                bg-white
                                p-8
                                md:p-16
                            "
                        >
                            <Image
                                src={tttFallback}
                                alt="Toda Terça Tem"
                                className="
                                    h-auto
                                    w-full
                                    max-w-md
                                    object-contain
                                "
                                priority
                            />
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
