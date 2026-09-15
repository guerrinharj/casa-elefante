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
            published
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
        <main className="p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
                <div>
                    <Link
                        href="/admin/performances"
                        className="text-sm transition-opacity hover:opacity-60"
                    >
                        ← Toda Terça Tem
                    </Link>

                    <h1 className="mt-4 text-3xl font-medium">
                        Editar apresentação
                    </h1>

                    <p className="mt-2 text-sm opacity-60">
                        {performance.name}
                    </p>
                </div>

                <EditPerformanceForm
                    performance={
                        performance
                    }
                />
            </div>
        </main>
    );
}