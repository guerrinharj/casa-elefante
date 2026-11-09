
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

import tttFallback from "@/app/images/ttt-1.png";

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

        loadPerformance();
    }, [params.slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#D2232A] text-[#FFFDE9]" />
        );
    }

    if (!performance) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#D2232A] text-[#FFFDE9]">
                <p>
                    Apresentação não encontrada.
                </p>
            </main>
        );
    }

    const isCurrentPerformance =
        currentPerformance?.id === performance.id;

    return (
        <main className="min-h-screen bg-[#D2232A] text-[#FFFDE9]">
            <section className="border-b border-[#FFFDE9] bg-[#D2232A]">
                <div className="bg-[#D2232A] p-4 md:p-6">
                    <Link
                        href="/toda-terca-tem"
                        className="
                            inline-block
                            text-sm
                            transition-opacity
                            duration-200
                            hover:opacity-50
                        "
                    >
                        ← Todas as apresentações
                    </Link>
                </div>
            </section>

            <section
                className="
                    grid
                    border-b
                    border-[#FFFDE9]
                    bg-[#D2232A]
                    md:grid-cols-[30%_1fr]
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        justify-between
                        gap-4
                        border-b
                        border-[#FFFDE9]
                        bg-[#D2232A]
                        p-4
                        md:border-b-0
                        md:border-r
                        md:p-6
                    "
                >
                    {performance.performance_date && (
                        <p className="text-sm uppercase">
                            {formatDate(
                                performance.performance_date,
                            )}
                        </p>
                    )}

                    {performance.location && (
                        <p className="text-sm uppercase">
                            {performance.location}
                        </p>
                    )}
                </div>

                <div
                    className="
                        flex
                        items-center
                        gap-5
                        bg-[#D2232A]
                        p-4
                        md:p-6
                    "
                >
                    <h1
                        className="
                            font-october
                            text-5xl
                            leading-[0.9]
                            md:text-7xl
                            lg:text-8xl
                            xl:text-9xl
                        "
                    >
                        {performance.name}
                    </h1>

                    {performance.audio_url && (
                        <button
                            type="button"
                            onClick={() =>
                                playPerformance(performance)
                            }
                            aria-label={`Reproduzir ${performance.name}`}
                            className="
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                border-[#FFFDE9]
                                bg-[#D2232A]
                                text-base
                                text-[#FFFDE9]
                                transition-colors
                                duration-300
                                hover:bg-[#FFFDE9]
                                hover:text-[#D2232A]
                                md:h-14
                                md:w-14
                            "
                        >
                            ▶
                        </button>
                    )}
                </div>
            </section>

            <section className="border-b border-[#FFFDE9] bg-[#D2232A]">
                {performance.video_url ? (
                    <div
                        className="
                            aspect-video
                            w-full
                            overflow-hidden
                            bg-[#D2232A]
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
                    <img
                        src={performance.cover_image}
                        alt={performance.name}
                        className="
                            aspect-video
                            w-full
                            object-cover
                        "
                    />
                ) : (
                    <div
                        className="
                            flex
                            aspect-video
                            w-full
                            items-center
                            justify-center
                            bg-[#D2232A]
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
                        />
                    </div>
                )}
            </section>

            {performance.description && (
                <section
                    className="
                        grid
                        border-b
                        border-[#FFFDE9]
                        bg-[#D2232A]
                        md:grid-cols-[30%_1fr]
                    "
                >
                    <div
                        className="
                            border-b
                            border-[#FFFDE9]
                            bg-[#D2232A]
                            p-4
                            md:border-b-0
                            md:border-r
                            md:p-6
                        "
                    >
                        <p className="text-sm uppercase">
                            Sobre
                        </p>
                    </div>

                    <div className="bg-[#D2232A] p-4 md:p-6">
                        <p
                            className="
                                max-w-3xl
                                text-xl
                                leading-relaxed
                                md:text-2xl
                            "
                        >
                            {performance.description}
                        </p>
                    </div>
                </section>
            )}
        </main>
    );
}
