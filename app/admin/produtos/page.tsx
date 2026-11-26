
import Link from "next/link";
import { RecordOfTheWeek } from "@/components/admin/record-of-the-week";

import {
    ArrowLeft,
} from "lucide-react";

import {
    AdminInfiniteProductList,
} from "@/components/admin/admin-infinite-product-list";

import {
    AdminProductSearch,
} from "@/components/admin/admin-product-search";

import {
    createClient,
} from "@/lib/supabase/server";

import {
    requireProductManager,
} from "@/lib/auth";

const PRODUCTS_PER_PAGE = 24;

type AdminProductsPageProps = {
    searchParams: Promise<{
        search?: string;
    }>;
};

export default async function AdminProductsPage({
    searchParams,
}: AdminProductsPageProps) {
    await requireProductManager();

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
            created_at,
            wholesale_only
        `)
        .order("created_at", {
            ascending: false,
        });

    if (filters.search) {
        query = query.or(
            `name.ilike.%${filters.search}%,artist.ilike.%${filters.search}%`,
        );
    }

    const [
        { data: products, error },
        { data: currentRecord, error: recordError },
    ] = await Promise.all([
        query.range(0, PRODUCTS_PER_PAGE - 1),
        supabase
            .from("products")
            .select("id, name, artist, format, stock, wholesale_only, editorial_comment")
            .eq("is_record_of_the_week", true)
            .order("created_at", { ascending: false })
            .order("id", { ascending: false })
            .limit(1)
            .maybeSingle(),
    ]);

    if (recordError) {
        console.error("Erro ao carregar Disco da Semana:", recordError);
    }

    if (error) {
        console.error(
            "Erro ao carregar produtos:",
            error,
        );
    }

    return (
        <main className="p-4 text-black md:p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                {/* VOLTAR AO ADMIN */}

                <div>
                    <Link
                        href="/admin"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-black
                            bg-white
                            px-4
                            py-3
                            text-sm
                            font-medium
                            text-black
                            shadow-[-5px_5px_0_0_#000]
                            transition-all
                            duration-200
                            hover:-translate-y-1
                            hover:shadow-[-5px_9px_0_0_#000]
                        "
                    >
                        <ArrowLeft
                            size={18}
                            strokeWidth={2}
                        />

                        Voltar
                    </Link>
                </div>

                {/* HEADER */}

                <div
                    className="
                        flex
                        flex-col
                        gap-5
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >
                    <h1
                        className="
                            font-october
                            text-5xl
                            uppercase
                            leading-none
                            text-black
                            md:text-6xl
                        "
                    >
                        Produtos
                    </h1>

                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            gap-3
                        "
                    >
                        <Link
                            href="/admin/produtos/importar"
                            className="
                                rounded-xl
                                border
                                border-black
                                bg-white
                                px-4
                                py-3
                                text-sm
                                font-medium
                                text-black
                                shadow-[-5px_5px_0_0_#000]
                                transition-all
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-[-5px_9px_0_0_#000]
                            "
                        >
                            Importar planilha
                        </Link>

                        <Link
                            href="/admin/produtos/novo"
                            className="
                                rounded-xl
                                border
                                border-black
                                bg-white
                                px-4
                                py-3
                                text-sm
                                font-medium
                                text-black
                                shadow-[-5px_5px_0_0_#000]
                                transition-all
                                duration-200
                                hover:-translate-y-1
                                hover:shadow-[-5px_9px_0_0_#000]
                            "
                        >
                            + Adicionar produto
                        </Link>
                    </div>
                </div>

                <RecordOfTheWeek
                    current={currentRecord}
                    loadFailed={Boolean(recordError)}
                />

                {/* SEARCH */}

                <AdminProductSearch
                    initialSearch={filters.search ?? ""}
                />

                {/* PRODUCTS */}

                {!products || products.length === 0 ? (
                    <div
                        className="
                            rounded-xl
                            border
                            border-black
                            bg-white
                            p-6
                            text-black
                            shadow-[-5px_5px_0_0_#000]
                        "
                    >
                        <p className="text-sm text-black/70">
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
