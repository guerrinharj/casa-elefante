
import Link from "next/link";

import {
    notFound,
} from "next/navigation";

import {
    EditPerformanceForm,
} from "@/components/admin/performances/edit-performance-form";

import {
    createClient,
} from "@/lib/supabase/server";

type EditPerformancePageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditPerformancePage({
    params,
}: EditPerformancePageProps) {
    const {
        id,
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
            location
        `)
        .eq(
            "id",
            id,
        )
        .single();

    if (
        error ||
        !performance
    ) {
        console.error(
            "Edit performance error:",
            error,
        );

        notFound();
    }

    return (
        <main className="min-h-screen bg-[#D2232A] p-6 text-[#FFFDE9] md:p-10">
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <Link
                            href="/admin/performances"
                            className="inline-flex w-fit items-center justify-center rounded-xl border border-black bg-[#FFFDE9] px-6 py-3 text-sm font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]"
                        >
                            ← Toda Terça Tem
                        </Link>
                    </div>

                    <div>
                        <h1 className="font-october text-5xl uppercase leading-none text-[#FFFDE9] md:text-6xl">
                            Editar apresentação
                        </h1>

                        <p className="mt-3 text-sm text-[#FFFDE9]/80 md:text-base">
                            {performance.name}
                        </p>
                    </div>
                </div>

                <div className="border-t border-[#FFFDE9]/30" />

                <EditPerformanceForm
                    performance={performance}
                />
            </div>
        </main>
    );
}
