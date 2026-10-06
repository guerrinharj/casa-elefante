import Link from "next/link";

import {
    requireProductManager,
} from "@/lib/auth";

export default async function AdminPage() {
    const {
        user,
        profile,
    } = await requireProductManager();

    const isCollaborator =
        profile.role === "collaborator";

    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-medium">
                            Admin
                        </h1>

                        <p className="mt-1 text-sm">
                            {user.email}
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

                    {isCollaborator ? (
                        <div className="cursor-not-allowed border border-black p-6 opacity-30">
                            <h2 className="text-xl">
                                Pedidos
                            </h2>

                            <p className="mt-2 text-sm">
                                Visualizar e gerenciar pedidos.
                            </p>
                        </div>
                    ) : (
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
                    )}

                    {isCollaborator ? (
                        <div className="cursor-not-allowed border border-black p-6 opacity-30">
                            <h2 className="text-xl">
                                Cupons
                            </h2>

                            <p className="mt-2 text-sm">
                                Criar e gerenciar cupons de desconto.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/admin/cupons"
                            className="border border-black p-6 transition-opacity hover:opacity-60"
                        >
                            <h2 className="text-xl">
                                Cupons
                            </h2>

                            <p className="mt-2 text-sm">
                                Criar e gerenciar cupons de desconto.
                            </p>
                        </Link>
                    )}

                    {isCollaborator ? (
                        <div className="cursor-not-allowed border border-black p-6 opacity-30">
                            <h2 className="text-xl">
                                Atacadistas
                            </h2>

                            <p className="mt-2 text-sm">
                                Aprovar e gerenciar cadastros de atacadistas.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/admin/atacadistas"
                            className="border border-black p-6 transition-opacity hover:opacity-60"
                        >
                            <h2 className="text-xl">
                                Atacadistas
                            </h2>

                            <p className="mt-2 text-sm">
                                Aprovar e gerenciar cadastros de atacadistas.
                            </p>
                        </Link>
                    )}

                    {isCollaborator ? (
                        <div className="cursor-not-allowed border border-black p-6 opacity-30">
                            <h2 className="text-xl">
                                Toda Terça Tem
                            </h2>

                            <p className="mt-2 text-sm">
                                Adicionar, editar e remover apresentações.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/admin/performances"
                            className="border border-black p-6 transition-opacity hover:opacity-60"
                        >
                            <h2 className="text-xl">
                                Toda Terça Tem
                            </h2>

                            <p className="mt-2 text-sm">
                                Adicionar, editar e remover apresentações.
                            </p>
                        </Link>
                    )}

                    {isCollaborator ? (
                        <div className="cursor-not-allowed border border-black p-6 opacity-30">
                            <h2 className="text-xl">
                                Newsletter
                            </h2>

                            <p className="mt-2 text-sm">
                                Criar e enviar newsletters para os assinantes.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/admin/newsletter"
                            className="border border-black p-6 transition-opacity hover:opacity-60"
                        >
                            <h2 className="text-xl">
                                Newsletter
                            </h2>

                            <p className="mt-2 text-sm">
                                Criar e enviar newsletters para os assinantes.
                            </p>
                        </Link>
                    )}
                </div>
            </div>
        </main>
    );
}