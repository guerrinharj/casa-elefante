import {
    revalidatePath,
} from "next/cache";

import {
    requireAdmin,
} from "@/lib/auth";

import {
    createClient,
} from "@/lib/supabase/server";

type WholesaleApplication = {
    id: string;
    user_id: string;
    company_name: string;
    document: string;
    phone: string;
    instagram: string | null;
    website: string | null;
    city: string;
    state: string;
    business_description: string | null;
    status:
        | "pending"
        | "approved"
        | "rejected";
    admin_notes: string | null;
    created_at: string;
    reviewed_at: string | null;
};

async function updateApplicationStatus(
    formData: FormData,
) {
    "use server";

    await requireAdmin();

    const applicationId =
        formData.get(
            "applicationId",
        );

    const status =
        formData.get(
            "status",
        );

    if (
        typeof applicationId !==
        "string"
    ) {
        return;
    }

    if (
        status !== "approved" &&
        status !== "rejected"
    ) {
        return;
    }

    const supabase =
        await createClient();

    const {
        error,
    } = await supabase
        .from(
            "wholesale_applications",
        )
        .update({
            status,
            reviewed_at:
                new Date().toISOString(),
        })
        .eq(
            "id",
            applicationId,
        );

    if (error) {
        throw new Error(
            `Erro ao atualizar cadastro: ${error.message}`,
        );
    }

    revalidatePath(
        "/admin/atacadistas",
    );

    revalidatePath(
        "/",
    );

    revalidatePath(
        "/minha-conta",
    );
}

function StatusBadge({
    status,
}: {
    status:
        WholesaleApplication["status"];
}) {
    const labels = {
        pending: "Pendente",
        approved: "Aprovado",
        rejected: "Recusado",
    };

    return (
        <span className="inline-flex rounded-full border border-black px-3 py-1 text-xs uppercase">
            {labels[status]}
        </span>
    );
}

function ApplicationCard({
    application,
}: {
    application:
        WholesaleApplication;
}) {
    return (
        <article className="rounded-lg border border-black bg-white p-6 shadow">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-2xl font-medium">
                        {
                            application.company_name
                        }
                    </h2>

                    <p className="mt-1 text-sm opacity-60">
                        Solicitação enviada em{" "}
                        {new Intl.DateTimeFormat(
                            "pt-BR",
                            {
                                dateStyle:
                                    "long",
                            },
                        ).format(
                            new Date(
                                application.created_at,
                            ),
                        )}
                    </p>
                </div>

                <StatusBadge
                    status={
                        application.status
                    }
                />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <p className="text-xs uppercase opacity-50">
                        CPF / CNPJ
                    </p>

                    <p>
                        {
                            application.document
                        }
                    </p>
                </div>

                <div>
                    <p className="text-xs uppercase opacity-50">
                        Telefone / WhatsApp
                    </p>

                    <p>
                        {
                            application.phone
                        }
                    </p>
                </div>

                <div>
                    <p className="text-xs uppercase opacity-50">
                        Localização
                    </p>

                    <p>
                        {
                            application.city
                        }
                        {" — "}
                        {
                            application.state
                        }
                    </p>
                </div>

                {application.instagram && (
                    <div>
                        <p className="text-xs uppercase opacity-50">
                            Instagram
                        </p>

                        <p>
                            {
                                application.instagram
                            }
                        </p>
                    </div>
                )}

                {application.website && (
                    <div>
                        <p className="text-xs uppercase opacity-50">
                            Site
                        </p>

                        <a
                            href={
                                application.website
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-4"
                        >
                            {
                                application.website
                            }
                        </a>
                    </div>
                )}
            </div>

            {application.business_description && (
                <div className="mt-6 border-t border-black/20 pt-6">
                    <p className="mb-2 text-xs uppercase opacity-50">
                        Sobre a loja /
                        atividade
                    </p>

                    <p className="max-w-3xl whitespace-pre-line">
                        {
                            application.business_description
                        }
                    </p>
                </div>
            )}

            {application.status ===
                "pending" && (
                <div className="mt-6 flex flex-wrap gap-3 border-t border-black/20 pt-6">
                    <form
                        action={
                            updateApplicationStatus
                        }
                    >
                        <input
                            type="hidden"
                            name="applicationId"
                            value={
                                application.id
                            }
                        />

                        <input
                            type="hidden"
                            name="status"
                            value="approved"
                        />

                        <button
                            type="submit"
                            className="rounded-md border border-black bg-black px-5 py-2 text-sm uppercase text-white transition-opacity hover:opacity-70"
                        >
                            Aprovar
                        </button>
                    </form>

                    <form
                        action={
                            updateApplicationStatus
                        }
                    >
                        <input
                            type="hidden"
                            name="applicationId"
                            value={
                                application.id
                            }
                        />

                        <input
                            type="hidden"
                            name="status"
                            value="rejected"
                        />

                        <button
                            type="submit"
                            className="rounded-md border border-black px-5 py-2 text-sm uppercase transition-colors hover:bg-black hover:text-white"
                        >
                            Recusar
                        </button>
                    </form>
                </div>
            )}
        </article>
    );
}

export default async function AdminAtacadistasPage() {
    await requireAdmin();

    const supabase =
        await createClient();

    const {
        data,
        error,
    } = await supabase
        .from(
            "wholesale_applications",
        )
        .select(`
            id,
            user_id,
            company_name,
            document,
            phone,
            instagram,
            website,
            city,
            state,
            business_description,
            status,
            admin_notes,
            created_at,
            reviewed_at
        `)
        .order(
            "created_at",
            {
                ascending: false,
            },
        );

    if (error) {
        throw new Error(
            `Erro ao carregar atacadistas: ${error.message}`,
        );
    }

    const applications =
        (data ??
            []) as WholesaleApplication[];

    const pending =
        applications.filter(
            (application) =>
                application.status ===
                "pending",
        );

    const approved =
        applications.filter(
            (application) =>
                application.status ===
                "approved",
        );

    const rejected =
        applications.filter(
            (application) =>
                application.status ===
                "rejected",
        );

    return (
        <main className="px-4 py-10 md:px-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-10">
                    <h1 className="text-4xl font-medium">
                        Atacadistas
                    </h1>

                    <p className="mt-2 opacity-60">
                        Gerencie as
                        solicitações de
                        acesso ao atacado.
                    </p>
                </div>

                <section>
                    <div className="mb-5 flex items-center gap-3">
                        <h2 className="text-2xl font-medium">
                            Pendentes
                        </h2>

                        <span className="rounded-full border border-black px-2 py-0.5 text-xs">
                            {
                                pending.length
                            }
                        </span>
                    </div>

                    {pending.length ===
                    0 ? (
                        <p className="opacity-50">
                            Nenhuma
                            solicitação
                            pendente.
                        </p>
                    ) : (
                        <div className="grid gap-5">
                            {pending.map(
                                (
                                    application,
                                ) => (
                                    <ApplicationCard
                                        key={
                                            application.id
                                        }
                                        application={
                                            application
                                        }
                                    />
                                ),
                            )}
                        </div>
                    )}
                </section>

                {approved.length > 0 && (
                    <section className="mt-14">
                        <div className="mb-5 flex items-center gap-3">
                            <h2 className="text-2xl font-medium">
                                Aprovados
                            </h2>

                            <span className="rounded-full border border-black px-2 py-0.5 text-xs">
                                {
                                    approved.length
                                }
                            </span>
                        </div>

                        <div className="grid gap-5">
                            {approved.map(
                                (
                                    application,
                                ) => (
                                    <ApplicationCard
                                        key={
                                            application.id
                                        }
                                        application={
                                            application
                                        }
                                    />
                                ),
                            )}
                        </div>
                    </section>
                )}

                {rejected.length > 0 && (
                    <section className="mt-14">
                        <div className="mb-5 flex items-center gap-3">
                            <h2 className="text-2xl font-medium">
                                Recusados
                            </h2>

                            <span className="rounded-full border border-black px-2 py-0.5 text-xs">
                                {
                                    rejected.length
                                }
                            </span>
                        </div>

                        <div className="grid gap-5">
                            {rejected.map(
                                (
                                    application,
                                ) => (
                                    <ApplicationCard
                                        key={
                                            application.id
                                        }
                                        application={
                                            application
                                        }
                                    />
                                ),
                            )}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}