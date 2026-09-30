import {
    NewsletterEditor,
} from "@/components/admin/newsletter-editor";

import {
    createClient,
} from "@/lib/supabase/server";

export default async function AdminNewsletterPage() {
    const supabase =
        await createClient();

    const [
        productsResult,
        performancesResult,
    ] = await Promise.all([
        supabase
            .from("products")
            .select(`
                id,
                name,
                slug,
                artist,
                price,
                images,
                stock
            `)
            .gt("stock", 0)
            .order(
                "created_at",
                {
                    ascending: false,
                },
            ),

        supabase
            .from("performances")
            .select(`
                id,
                name,
                slug,
                description,
                performance_date,
                cover_image,
                video_url,
                audio_url
            `)
            .eq(
                "published",
                true,
            )
            .order(
                "performance_date",
                {
                    ascending: false,
                },
            ),
    ]);

    if (productsResult.error) {
        console.error(
            "Newsletter products error:",
            productsResult.error,
        );
    }

    if (performancesResult.error) {
        console.error(
            "Newsletter performances error:",
            performancesResult.error,
        );
    }

    return (
        <main className="p-4 md:p-6">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-4xl font-bold uppercase">
                    Newsletter
                </h1>

                <NewsletterEditor
                    products={
                        productsResult.data ??
                        []
                    }
                    performances={
                        performancesResult.data ??
                        []
                    }
                />
            </div>
        </main>
    );
}