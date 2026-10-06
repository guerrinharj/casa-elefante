import Link from "next/link";

import {
    NewCollaboratorForm,
} from "@/components/admin/new-collaborator-form";

import {
    requireAdmin,
} from "@/lib/auth";

export default async function NewCollaboratorPage() {
    await requireAdmin();

    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-2xl flex-col gap-8">
                <div>
                    <Link
                        href="/admin/colaboradores"
                        className="text-sm underline underline-offset-4 transition-opacity hover:opacity-50"
                    >
                        ← Voltar para colaboradores
                    </Link>
                </div>

                <div>
                    <h1 className="text-3xl font-medium">
                        Adicionar colaborador
                    </h1>

                    <p className="mt-2 text-sm">
                        O colaborador receberá um e-mail
                        para criar sua senha e acessar
                        o painel.
                    </p>
                </div>

                <NewCollaboratorForm />
            </div>
        </main>
    );
}