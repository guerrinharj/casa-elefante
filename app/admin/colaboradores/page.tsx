
import Link from "next/link";

import {
    redirect,
} from "next/navigation";

import {
    requireAdmin,
} from "@/lib/auth";

import {
    createAdminClient,
} from "@/lib/supabase/admin";

import {
    removeCollaborator,
    resendCollaboratorInvite,
} from "@/app/admin/colaboradores/actions";

const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-white px-5 py-3 text-sm font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]";

const actionButtonClassName =
    "inline-flex items-center justify-center rounded-lg border border-black bg-white px-4 py-2 text-sm font-medium text-black shadow-[-3px_3px_0_0_#000] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[-3px_5px_0_0_#000]";

export default async function AdminCollaboratorsPage() {
    await requireAdmin();

    const supabase =
        createAdminClient();

    const {
        data: collaborators,
        error,
    } = await supabase
        .from("profiles")
        .select(`
            id,
            name,
            email,
            role
        `)
        .eq(
            "role",
            "collaborator",
        )
        .order(
            "name",
            {
                ascending: true,
            },
        );

    if (error) {
        console.error(
            "Erro ao carregar colaboradores:",
            error,
        );
    }

    async function handleResendInvite(
        formData: FormData,
    ) {
        "use server";

        const collaboratorId =
            formData.get(
                "collaboratorId",
            );

        if (
            typeof collaboratorId !==
            "string"
        ) {
            return;
        }

        const result =
            await resendCollaboratorInvite(
                collaboratorId,
            );

        if (!result.success) {
            console.error(
                "Erro ao reenviar convite:",
                result.error,
            );
        }

        redirect(
            "/admin/colaboradores",
        );
    }

    async function handleRemoveCollaborator(
        formData: FormData,
    ) {
        "use server";

        const collaboratorId =
            formData.get(
                "collaboratorId",
            );

        if (
            typeof collaboratorId !==
            "string"
        ) {
            return;
        }

        const result =
            await removeCollaborator(
                collaboratorId,
            );

        if (!result.success) {
            console.error(
                "Erro ao remover colaborador:",
                result.error,
            );

            return;
        }

        redirect(
            "/admin/colaboradores",
        );
    }

    return (
        <main className="min-h-screen p-6 text-black md:p-10">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="font-october text-5xl uppercase leading-none text-black md:text-6xl">
                            Colaboradores
                        </h1>

                        <p className="mt-3 text-sm text-black/70 md:text-base">
                            Gerencie quem pode adicionar, editar e remover produtos.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/admin"
                            className={buttonClassName}
                        >
                            ← Admin
                        </Link>

                        <Link
                            href="/admin/colaboradores/novo"
                            className={buttonClassName}
                        >
                            + Adicionar colaborador
                        </Link>
                    </div>
                </div>

                <div className="border-t border-black/20" />

                {!collaborators ||
                collaborators.length === 0 ? (
                    <div className="rounded-xl border border-black bg-white p-8 shadow-[-5px_5px_0_0_#000]">
                        <h2 className="font-october text-3xl uppercase leading-none text-black">
                            Nenhum colaborador
                        </h2>

                        <p className="mt-3 text-sm text-black/60">
                            Nenhum colaborador cadastrado.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-black bg-white shadow-[-5px_5px_0_0_#000]">
                        <div className="flex items-center justify-between gap-4 border-b border-black bg-white px-6 py-5">
                            <h2 className="font-october text-2xl uppercase leading-none text-black">
                                Colaboradores cadastrados
                            </h2>

                            <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-black bg-white px-3 py-1 text-sm font-medium text-black">
                                {collaborators.length}
                            </span>
                        </div>

                        <div className="divide-y divide-black/20">
                            {collaborators.map(
                                (collaborator) => (
                                    <div
                                        key={collaborator.id}
                                        className="flex flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <h3 className="font-october text-2xl uppercase leading-none text-black">
                                                {collaborator.name ||
                                                    "Sem nome"}
                                            </h3>

                                            {collaborator.email && (
                                                <p className="mt-2 break-all text-sm text-black/60">
                                                    {collaborator.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            <form
                                                action={handleResendInvite}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="collaboratorId"
                                                    value={collaborator.id}
                                                />

                                                <button
                                                    type="submit"
                                                    className={actionButtonClassName}
                                                >
                                                    Reenviar convite
                                                </button>
                                            </form>

                                            <form
                                                action={handleRemoveCollaborator}
                                            >
                                                <input
                                                    type="hidden"
                                                    name="collaboratorId"
                                                    value={collaborator.id}
                                                />

                                                <button
                                                    type="submit"
                                                    className={actionButtonClassName}
                                                >
                                                    Remover
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
