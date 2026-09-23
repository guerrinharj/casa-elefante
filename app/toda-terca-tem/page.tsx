import {
    PerformanceList,
} from "@/components/toda-terca-tem/performance-list";

import {
    UpcomingPerformances,
} from "@/components/toda-terca-tem/upcoming-performances";

import {
    createClient,
} from "@/lib/supabase/server";

export type Performance = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    performance_date: string | null;
    video_url: string | null;
    audio_url: string | null;
    cover_image: string | null;
};

export default async function TodaTercaTemPage() {
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
            cover_image
        `)
        .eq(
            "published",
            true,
        )
        .order(
            "performance_date",
            {
                ascending: false,
                nullsFirst: false,
            },
        );

    if (error) {
        console.error(
            "Toda Terça Tem Supabase error:",
            {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            },
        );
    }

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const upcomingPerformances =
        (performances ?? [])
            .filter(
                (performance) =>
                    performance.performance_date &&
                    performance.performance_date >=
                        today,
            )
            .sort(
                (a, b) =>
                    (
                        a.performance_date ??
                        ""
                    ).localeCompare(
                        b.performance_date ??
                            "",
                    ),
            );

    const pastPerformances =
        (performances ?? []).filter(
            (performance) =>
                performance.performance_date &&
                performance.performance_date <
                    today,
        );

    return (
        <main className="min-h-screen bg-black text-white">
            <UpcomingPerformances
                performances={
                    upcomingPerformances
                }
            />

            <PerformanceList
                performances={
                    pastPerformances
                }
            />
        </main>
    );
}