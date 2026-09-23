import Link from "next/link";

import {
    notFound,
} from "next/navigation";

import {
    createClient,
} from "@/lib/supabase/server";

type PerformancePageProps = {
    params: Promise<{
        slug: string;
    }>;
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

export default async function PerformancePage({
    params,
}: PerformancePageProps) {
    const {
        slug,
    } = await params;

    const supabase =
        await createClient();

    const {
        data: performance,
        error,
    } = await supabase
        .from("performances")
        .select(`
            id,
            name,
            slug,
            description,
            performance_date,
            video_url,
            audio_url,
            cover_image,
            published,
            created_at,
            updated_at
        `)
        .eq(
            "slug",
            slug,
        )
        .eq(
            "published",
            true,
        )
        .single();

    if (
        error ||
        !performance
    ) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <section className="border-b border-white">
                <div className="p-4 md:p-6">
                    <Link
                        href="/toda-terca-tem"
                        className="
                            inline-block
                            text-sm
                            uppercase
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
                    border-white
                    md:grid-cols-[30%_1fr]
                "
            >
                <div
                    className="
                        border-b
                        border-white
                        p-4
                        md:border-b-0
                        md:border-r
                        md:p-6
                    "
                >
                    <p className="text-sm uppercase">
                        {formatDate(
                            performance.performance_date,
                        )}
                    </p>
                </div>

                <div className="p-4 md:p-6">
                    <h1
                        className="
                            font-anton
                            text-5xl
                            uppercase
                            leading-[0.9]
                            md:text-7xl
                            lg:text-8xl
                            xl:text-9xl
                        "
                    >
                        {
                            performance.name
                        }
                    </h1>
                </div>
            </section>

            {performance.cover_image && (
                <section className="border-b border-white">
                    <img
                        src={
                            performance.cover_image
                        }
                        alt={
                            performance.name
                        }
                        className="
                            aspect-video
                            w-full
                            object-cover
                        "
                    />
                </section>
            )}

            {performance.description && (
                <section
                    className="
                        grid
                        border-b
                        border-white
                        md:grid-cols-[30%_1fr]
                    "
                >
                    <div
                        className="
                            border-b
                            border-white
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

                    <div className="p-4 md:p-6">
                        <p
                            className="
                                max-w-3xl
                                text-xl
                                leading-relaxed
                                md:text-2xl
                            "
                        >
                            {
                                performance.description
                            }
                        </p>
                    </div>
                </section>
            )}

            {performance.video_url && (
                <section
                    className="
                        grid
                        border-b
                        border-white
                        md:grid-cols-[30%_1fr]
                    "
                >
                    <div
                        className="
                            border-b
                            border-white
                            p-4
                            md:border-b-0
                            md:border-r
                            md:p-6
                        "
                    >
                        <p className="text-sm uppercase">
                            Vídeo
                        </p>
                    </div>

                    <div className="p-4 md:p-6">
                        <div
                            className="
                                aspect-video
                                overflow-hidden
                                bg-neutral-900
                            "
                        >
                            <iframe
                                src={
                                    performance.video_url
                                }
                                title={
                                    performance.name
                                }
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
                    </div>
                </section>
            )}
        </main>
    );
}