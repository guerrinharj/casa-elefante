import Link from "next/link";
import { notFound } from "next/navigation";

import { EditProductForm } from "@/components/admin/edit-product-form";
import { createClient } from "@/lib/supabase/server";

type EditProductPageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditProductPage({
    params,
}: EditProductPageProps) {
    const { id } = await params;

    const supabase = await createClient();

    const { data: product, error } = await supabase
        .from("products")
        .select(`
            id,
            name,
            slug,
            artist,
            price,
            format,
            year,
            stock,
            genre,
            label,
            images
        `)
        .eq("id", id)
        .single();

    if (error || !product) {
        notFound();
    }

    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-medium">
                            Editar produto
                        </h1>

                        <p className="mt-1 text-sm text-black/60">
                            {product.artist} — {product.name}
                        </p>
                    </div>

                    <Link
                        href="/admin/produtos"
                        className="text-sm underline underline-offset-4"
                    >
                        Voltar
                    </Link>
                </div>

                <EditProductForm product={product} />
            </div>
        </main>
    );
}