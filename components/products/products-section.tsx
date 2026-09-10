import { createClient } from "@/lib/supabase/server";

type ProductsSectionProps = {
    searchParams: Promise<{
        genre?: string;
        format?: string;
        year?: string;
        artist?: string;
        label?: string;
    }>;
};

export async function ProductsSection({
    searchParams,
}: ProductsSectionProps) {
    const filters = await searchParams;

    const supabase = await createClient();

    let query = supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (filters.genre) {
        query = query.eq("genre", filters.genre);
    }

    if (filters.format) {
        query = query.eq("format", filters.format);
    }

    if (filters.year) {
        query = query.eq(
            "year",
            Number(filters.year)
        );
    }

    if (filters.artist) {
        query = query.ilike(
            "artist",
            `%${filters.artist}%`
        );
    }

    if (filters.label) {
        query = query.ilike(
            "label",
            `%${filters.label}%`
        );
    }

    const { data: products, error } = await query;

    if (error) {
        console.error(error);

        return (
            <p>
                Erro ao carregar produtos.
            </p>
        );
    }

    const activeFilters = [
        filters.genre,
        filters.format,
        filters.year,
        filters.artist,
        filters.label,
    ].filter(Boolean);

    const title = activeFilters.length > 0
        ? activeFilters.join(" / ")
        : "Loja";

    return (
        <>
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-4xl font-bold uppercase font-grotesque">
                    {title}
                </h1>

                <span className="text-sm">
                    {products.length} produtos
                </span>
            </div>

            {products.length === 0 ? (
                <p>
                    Nenhum produto encontrado.
                </p>
            ) : (
                <pre className="text-xs">
                    {JSON.stringify(products, null, 2)}
                </pre>
            )}
        </>
    );
}