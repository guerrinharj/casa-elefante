
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

    const cardClassName = `
        rounded-xl
        border
        border-black
        bg-white
        p-6
        text-black
        shadow-[-5px_5px_0_0_#000]
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-[-5px_9px_0_0_#000]
    `;

    const disabledCardClassName = `
        rounded-xl
        border
        border-black
        bg-white
        p-6
        text-black
        shadow-[-5px_5px_0_0_#000]
        cursor-not-allowed
        opacity-30
    `;

    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                {/* HEADER */}

                <div className="flex items-center justify-between">
                    <div>
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
                            Admin
                        </h1>

                        <p className="mt-2 text-sm text-black/60">
                            {user.email}
                        </p>
                    </div>
                </div>

                {/* CARDS */}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* PRODUTOS */}

                    <Link
                        href="/admin/produtos"
                        className={cardClassName}
                    >
                        <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                            Produtos
                        </h2>

                        <p className="mt-3 text-sm text-black/70">
                            Adicionar, editar e remover produtos.
                        </p>
                    </Link>

                    {/* PEDIDOS */}

                    {isCollaborator ? (
                        <div className={disabledCardClassName}>
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Pedidos
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Visualizar e gerenciar pedidos.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/admin/pedidos"
                            className={cardClassName}
                        >
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Pedidos
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Visualizar e gerenciar pedidos.
                            </p>
                        </Link>
                    )}

                    {/* CUPONS */}

                    {isCollaborator ? (
                        <div className={disabledCardClassName}>
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Cupons
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Criar e gerenciar cupons de desconto.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/admin/cupons"
                            className={cardClassName}
                        >
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Cupons
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Criar e gerenciar cupons de desconto.
                            </p>
                        </Link>
                    )}

                    {/* ATACADISTAS */}

                    {isCollaborator ? (
                        <div className={disabledCardClassName}>
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Atacadistas
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Aprovar e gerenciar cadastros de atacadistas.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/admin/atacadistas"
                            className={cardClassName}
                        >
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Atacadistas
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Aprovar e gerenciar cadastros de atacadistas.
                            </p>
                        </Link>
                    )}

                    {/* COLABORADORES */}

                    {isCollaborator ? (
                        <div className={disabledCardClassName}>
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Colaboradores
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Criar e gerenciar colaboradores.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/admin/colaboradores"
                            className={cardClassName}
                        >
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Colaboradores
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Criar e gerenciar colaboradores.
                            </p>
                        </Link>
                    )}

                    {/* TODA TERÇA TEM */}

                    {isCollaborator ? (
                        <div className={disabledCardClassName}>
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Toda Terça Tem
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Adicionar, editar e remover apresentações.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/admin/performances"
                            className={cardClassName}
                        >
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Toda Terça Tem
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Adicionar, editar e remover apresentações.
                            </p>
                        </Link>
                    )}

                    {/* NEWSLETTER */}

                    {isCollaborator ? (
                        <div className={disabledCardClassName}>
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Newsletter
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Criar e enviar newsletters para os assinantes.
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/admin/newsletter"
                            className={cardClassName}
                        >
                            <h2 className="font-october text-4xl uppercase leading-none md:text-5xl">
                                Newsletter
                            </h2>

                            <p className="mt-3 text-sm text-black/70">
                                Criar e enviar newsletters para os assinantes.
                            </p>
                        </Link>
                    )}
                </div>
            </div>
        </main>
    );
}
