import {
    PerformanceList,
} from "@/components/toda-terca-tem/performance-list";

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

    return (
        <main className="min-h-screen bg-black text-white">
            <section className="flex min-h-[70vh] flex-col justify-between p-4 md:p-6">

                <div className="mt-16 max-w-xl">
                    <p className="text-lg md:text-xl">
                        Apresentações gravadas
                        ao vivo na Casa Elefante.
                    </p>
                </div>
            </section>

            <PerformanceList
                performances={
                    performances ?? []
                }
            />
        </main>
    );
}