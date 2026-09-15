import Link from "next/link";

import {
    DeletePerformanceButton,
} from "@/components/admin/performances/delete-performance-button";

import {
    createClient,
} from "@/lib/supabase/server";

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
        .from(
            "performances",
        )
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
        <main className="p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <Link
                            href="/admin"
                            className="text-sm hover:opacity-60"
                        >
                            ← Admin
                        </Link>

                        <h1 className="mt-4 text-3xl font-medium">
                            Toda Terça Tem
                        </h1>
                    </div>

                    <Link
                        href="/admin/performances/novo"
                        className="rounded-md border border-black bg-white px-4 py-3 shadow-[3px_3px_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                    >
                        Nova apresentação
                    </Link>
                </div>

                {!performances ||
                performances.length ===
                    0 ? (
                    <div className="border border-black p-6">
                        <p>
                            Nenhuma apresentação cadastrada.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {performances.map(
                            (
                                performance,
                            ) => (
                                <div
                                    key={
                                        performance.id
                                    }
                                    className="grid items-center gap-4 border-t border-black py-5 md:grid-cols-[1fr_auto_auto_auto]"
                                >
                                    <div className="flex items-center gap-4">
                                        {performance.cover_image && (
                                            <div className="h-16 w-16 shrink-0 overflow-hidden bg-neutral-100">
                                                <img
                                                    src={
                                                        performance.cover_image
                                                    }
                                                    alt=""
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <h2 className="text-lg font-medium">
                                                {
                                                    performance.name
                                                }
                                            </h2>

                                            <p className="mt-1 text-sm opacity-60">
                                                {formatDate(
                                                    performance.performance_date,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-sm">
                                        {performance.audio_url
                                            ? "Com áudio"
                                            : "Sem áudio"}
                                    </div>

                                    <div>
                                        <span
                                            className={`
                                                border
                                                border-black
                                                px-2
                                                py-1
                                                text-xs
                                                uppercase

                                                ${
                                                    performance.published
                                                        ? "bg-black text-white"
                                                        : "bg-white text-black"
                                                }
                                            `}
                                        >
                                            {performance.published
                                                ? "Publicado"
                                                : "Rascunho"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/admin/performances/${performance.id}/editar`}
                                            className="rounded-md border border-black bg-white px-4 py-2 text-sm shadow-[3px_3px_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                                        >
                                            Editar
                                        </Link>

                                        <DeletePerformanceButton
                                            id={
                                                performance.id
                                            }
                                            name={
                                                performance.name
                                            }
                                            audioUrl={
                                                performance.audio_url
                                            }
                                        />
                                    </div>
                                </div>
                            ),
                        )}

                        <div className="border-t border-black" />
                    </div>
                )}
            </div>
        </main>
    );
}