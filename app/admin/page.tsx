import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-medium">
                            Admin
                        </h1>

                        <p className="mt-1 text-sm">
                            {user?.email}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Link
                        href="/admin/produtos"
                        className="border border-black p-6 transition-opacity hover:opacity-60"
                    >
                        <h2 className="text-xl">
                            Produtos
                        </h2>

                        <p className="mt-2 text-sm">
                            Adicionar, editar e remover produtos.
                        </p>
                    </Link>

                    <Link
                        href="/admin/pedidos"
                        className="border border-black p-6 transition-opacity hover:opacity-60"
                    >
                        <h2 className="text-xl">
                            Pedidos
                        </h2>

                        <p className="mt-2 text-sm">
                            Visualizar e gerenciar pedidos.
                        </p>
                    </Link>
                </div>
            </div>
        </main>
    );
}