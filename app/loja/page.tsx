import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function LojaPage() {
    const supabase = await createClient();

    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
    }

    return (
        <div className="flex">
            <Sidebar />

            <section className="flex-1 p-6">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-4xl font-bold uppercase">
                        Loja
                    </h1>

                    <span className="text-sm">
                        {products?.length ?? 0} produtos
                    </span>
                </div>

                {!products?.length ? (
                    <p>Nenhum produto cadastrado ainda.</p>
                ) : (
                    <pre className="text-xs">
                        {JSON.stringify(products, null, 2)}
                    </pre>
                )}
            </section>
        </div>
    );
}