import {
    NewsletterEditor,
} from "@/components/admin/newsletter-editor";

import {
    createClient,
} from "@/lib/supabase/server";

export default async function AdminNewsletterPage() {
    const supabase =
        await createClient();

    const {
        data: products,
        error,
    } = await supabase
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
        );

    if (error) {
        console.error(
            "Newsletter products error:",
            error,
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
                        products ?? []
                    }
                />
            </div>
        </main>
    );
}