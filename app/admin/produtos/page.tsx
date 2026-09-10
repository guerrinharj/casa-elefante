import Link from "next/link";

export default function AdminProductsPage() {
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

                <div className="border-t border-black">
                    <p className="py-6 text-sm">
                        Nenhum produto cadastrado ainda.
                    </p>
                </div>
            </div>
        </main>
    );
}