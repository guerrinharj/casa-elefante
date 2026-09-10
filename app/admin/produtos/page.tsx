import Link from "next/link";

import { AdminInfiniteProductList } from "@/components/admin/admin-infinite-product-list";
import { AdminProductSearch } from "@/components/admin/admin-product-search";

import { createClient } from "@/lib/supabase/server";

const PRODUCTS_PER_PAGE = 24;

type AdminProductsPageProps = {
    searchParams: Promise<{
        search?: string;
    }>;
};

export default async function AdminProductsPage({
    searchParams,
}: AdminProductsPageProps) {
    const filters = await searchParams;

    const supabase = await createClient();

    let query = supabase
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
            images,
            created_at
        `)
        .order("created_at", {
            ascending: false,
        });

    if (filters.search) {
        query = query.or(
            `name.ilike.%${filters.search}%,artist.ilike.%${filters.search}%`,
        );
    }

    const { data: products, error } = await query.range(
        0,
        PRODUCTS_PER_PAGE - 1,
    );

    if (error) {
        console.error(
            "Erro ao carregar produtos:",
            error,
        );
    }

    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-medium">
                            Produtos
                        </h1>

                        <p className="mt-1 text-sm">
                            Gerencie os produtos da loja.
                        </p>
                    </div>

                    <Link
                        href="/admin/produtos/novo"
                        className="border border-black px-4 py-2 transition-opacity hover:opacity-60"
                    >
                        + Adicionar produto
                    </Link>
                </div>

                <AdminProductSearch />

                {!products || products.length === 0 ? (
                    <div className="border-t border-black">
                        <p className="py-6 text-sm">
                            Nenhum produto encontrado.
                        </p>
                    </div>
                ) : (
                    <AdminInfiniteProductList
                        initialProducts={products}
                        search={filters.search}
                    />
                )}
            </div>
        </main>
    );
}