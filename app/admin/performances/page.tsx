
import Link from "next/link";

import {
    DeletePerformanceButton,
} from "@/components/admin/performances/delete-performance-button";

import {
    createClient,
} from "@/lib/supabase/server";

const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-white px-5 py-3 text-sm font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]";

const actionButtonClassName =
    "inline-flex items-center justify-center rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black shadow-[-3px_3px_0_0_#000] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[-3px_5px_0_0_#000]";

function formatDate(
    date: string | null,
) {
    if (!date) {
        return "Sem data";
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

export default async function AdminPerformancesPage() {
    const supabase =
        await createClient();

    const {
        data: performances,
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
            created_at
        `)
        .order(
            "performance_date",
            {
                ascending: false,
                nullsFirst: false,
            },
        );

    if (error) {
        console.error(
            "Admin performances error:",
            error,
        );
    }

    return (
        <main className="min-h-screen bg-[#D2232A] p-6 text-[#FFFDE9] md:p-10">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <Link
                            href="/admin"
                            className={buttonClassName}
                        >
                            ← Admin
                        </Link>
                    </div>

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="font-october text-5xl uppercase leading-none text-[#FFFDE9] md:text-6xl">
                                Toda Terça Tem
                            </h1>

                            <p className="mt-3 text-sm text-[#FFFDE9]/80 md:text-base">
                                Gerencie as apresentações, gravações e publicações.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link
                                href="/admin/performances/novo"
                                className={buttonClassName}
                            >
                                + Nova apresentação
                            </Link>

                            <Link
                                href="/admin/performances/import"
                                className={buttonClassName}
                            >
                                + Adicionar em massa
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#FFFDE9]/40" />

                {!performances ||
                performances.length === 0 ? (
                    <div className="rounded-xl border border-black bg-[#FFFDE9] p-8 text-black shadow-[-5px_5px_0_0_#000]">
                        <h2 className="font-october text-3xl uppercase leading-none">
                            Nenhuma apresentação
                        </h2>

                        <p className="mt-3 text-sm text-black/60">
                            Nenhuma apresentação cadastrada.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {performances.map(
                            (performance) => (
                                <article
                                    key={performance.id}
                                    className="rounded-xl border border-black bg-[#FFFDE9] p-5 text-black shadow-[-5px_5px_0_0_#000] md:p-6"
                                >
                                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                        <div className="flex min-w-0 items-center gap-4">
                                            {performance.cover_image && (
                                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-black bg-white md:h-24 md:w-24">
                                                    <img
                                                        src={performance.cover_image}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <h2 className="font-october text-2xl uppercase leading-none text-black md:text-3xl">
                                                    {performance.name}
                                                </h2>

                                                <p className="mt-2 text-sm text-black/60">
                                                    {formatDate(
                                                        performance.performance_date,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="inline-flex items-center rounded-lg border border-black bg-white px-3 py-1.5 text-xs font-medium text-black">
                                                {performance.audio_url
                                                    ? "Com áudio"
                                                    : "Sem áudio"}
                                            </span>

                                            <span
                                                className={`inline-flex items-center rounded-lg border border-black px-3 py-1.5 text-xs font-medium ${
                                                    performance.published
                                                        ? "bg-[#D2232A] text-white"
                                                        : "bg-white text-black"
                                                }`}
                                            >
                                                {performance.published
                                                    ? "Publicado"
                                                    : "Rascunho"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-black/20 pt-5">
                                        <Link
                                            href={`/admin/performances/${performance.id}/editar`}
                                            className={actionButtonClassName}
                                        >
                                            Editar
                                        </Link>

                                        <DeletePerformanceButton
                                            id={performance.id}
                                            name={performance.name}
                                            audioUrl={performance.audio_url}
                                        />
                                    </div>
                                </article>
                            ),
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
