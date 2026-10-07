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
        <main className="p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-medium">
                            Colaboradores
                        </h1>

                        <p className="mt-1 text-sm">
                            Gerencie quem pode
                            adicionar, editar e
                            remover produtos.
                        </p>
                    </div>

                    <Link
                        href="/admin/colaboradores/novo"
                        className="border border-black px-4 py-2 transition-opacity hover:opacity-60"
                    >
                        + Adicionar colaborador
                    </Link>
                </div>

                {!collaborators ||
                collaborators.length ===
                    0 ? (
                    <div className="border-t border-black">
                        <p className="py-6 text-sm">
                            Nenhum colaborador
                            cadastrado.
                        </p>
                    </div>
                ) : (
                    <div className="border-t border-black">
                        {collaborators.map(
                            (
                                collaborator,
                            ) => (
                                <div
                                    key={
                                        collaborator.id
                                    }
                                    className="flex items-center justify-between gap-6 border-b border-black py-4"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {collaborator.name ||
                                                "Sem nome"}
                                        </p>

                                        {collaborator.email && (
                                            <p className="mt-1 text-sm opacity-60">
                                                {
                                                    collaborator.email
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <form
                                            action={
                                                handleResendInvite
                                            }
                                        >
                                            <input
                                                type="hidden"
                                                name="collaboratorId"
                                                value={
                                                    collaborator.id
                                                }
                                            />

                                            <button
                                                type="submit"
                                                className="text-sm underline underline-offset-4 transition-opacity hover:opacity-50"
                                            >
                                                Reenviar convite
                                            </button>
                                        </form>

                                        <form
                                            action={
                                                handleRemoveCollaborator
                                            }
                                        >
                                            <input
                                                type="hidden"
                                                name="collaboratorId"
                                                value={
                                                    collaborator.id
                                                }
                                            />

                                            <button
                                                type="submit"
                                                className="text-sm underline underline-offset-4 transition-opacity hover:opacity-50"
                                            >
                                                Remover
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}

                <div>
                    <Link
                        href="/admin"
                        className="text-sm underline underline-offset-4 transition-opacity hover:opacity-50"
                    >
                        ← Voltar para Admin
                    </Link>
                </div>
            </div>
        </main>
    );
}