
import Link from "next/link";

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
        <main className="min-h-screen bg-[#FFFDE9] p-6 text-black md:p-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <Link
                            href="/admin"
                            className="inline-flex w-fit items-center justify-center rounded-xl border border-black bg-white px-6 py-3 text-sm font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]"
                        >
                            ← Admin
                        </Link>
                    </div>

                    <div>
                        <h1 className="font-october text-5xl uppercase leading-none text-black md:text-6xl">
                            Newsletter
                        </h1>

                        <p className="mt-3 text-sm text-black/70 md:text-base">
                            Crie e organize newsletters com produtos
                            e apresentações da Casa Elefante.
                        </p>
                    </div>
                </div>

                <div className="border-t border-black/20" />

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
