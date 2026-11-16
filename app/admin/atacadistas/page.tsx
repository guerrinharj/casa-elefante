
import Link from "next/link";

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

const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-white px-5 py-3 text-sm font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]";

const actionButtonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-white px-5 py-2.5 text-sm font-medium text-black shadow-[-4px_4px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-4px_7px_0_0_#000]";

async function updateApplicationStatus(
    formData: FormData,
) {
    "use server";

    await requireAdmin();

    const applicationId =
        formData.get("applicationId");

    const status =
        formData.get("status");

    if (
        typeof applicationId !== "string"
    ) {
        return;
    }

    if (
        status !== "approved" &&
        status !== "rejected" &&
        status !== "pending"
    ) {
        return;
    }

    const supabase =
        await createClient();

    const {
        error,
    } = await supabase
        .from("wholesale_applications")
        .update({
            status,
            reviewed_at:
                status === "pending"
                    ? null
                    : new Date().toISOString(),
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
    status: WholesaleApplication["status"];
}) {
    const labels = {
        pending: "Pendente",
        approved: "Aprovado",
        rejected: "Recusado",
    };

    const statusClassName = {
        pending: "bg-[#FFFDE9] text-black",
        approved: "bg-white text-black",
        rejected: "bg-[#D2232A] text-white",
    };

    return (
        <span
            className={`inline-flex w-fit items-center rounded-lg border border-black px-3 py-1.5 text-xs font-medium ${statusClassName[status]}`}
        >
            {labels[status]}
        </span>
    );
}

function StatusForm({
    applicationId,
    status,
    label,
    primary = false,
}: {
    applicationId: string;
    status:
        | "pending"
        | "approved"
        | "rejected";
    label: string;
    primary?: boolean;
}) {
    return (
        <form
            action={updateApplicationStatus}
        >
            <input
                type="hidden"
                name="applicationId"
                value={applicationId}
            />

            <input
                type="hidden"
                name="status"
                value={status}
            />

            <button
                type="submit"
                className={`${actionButtonClassName} ${
                    primary
                        ? "bg-[#FFFDE9]"
                        : "bg-white"
                }`}
            >
                {label}
            </button>
        </form>
    );
}

function ApplicationCard({
    application,
}: {
    application: WholesaleApplication;
}) {
    return (
        <article className="rounded-xl border border-black bg-white p-6 shadow-[-5px_5px_0_0_#000] md:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h3 className="font-october text-3xl uppercase leading-none text-black md:text-4xl">
                        {application.company_name}
                    </h3>

                    <p className="mt-3 text-sm text-black/60">
                        Solicitação enviada em{" "}
                        {new Intl.DateTimeFormat(
                            "pt-BR",
                            {
                                dateStyle: "long",
                            },
                        ).format(
                            new Date(
                                application.created_at,
                            ),
                        )}
                    </p>
                </div>

                <StatusBadge
                    status={application.status}
                />
            </div>

            <div className="grid gap-x-8 gap-y-6 border-t border-black/15 pt-6 md:grid-cols-2">
                <div>
                    <p className="mb-2 font-october text-lg uppercase leading-none text-black/60">
                        CPF / CNPJ
                    </p>

                    <p className="text-sm font-medium text-black md:text-base">
                        {application.document}
                    </p>
                </div>

                <div>
                    <p className="mb-2 font-october text-lg uppercase leading-none text-black/60">
                        Telefone / WhatsApp
                    </p>

                    <p className="text-sm font-medium text-black md:text-base">
                        {application.phone}
                    </p>
                </div>

                <div>
                    <p className="mb-2 font-october text-lg uppercase leading-none text-black/60">
                        Localização
                    </p>

                    <p className="text-sm font-medium text-black md:text-base">
                        {application.city}
                        {" — "}
                        {application.state}
                    </p>
                </div>

                {application.instagram && (
                    <div>
                        <p className="mb-2 font-october text-lg uppercase leading-none text-black/60">
                            Instagram
                        </p>

                        <p className="break-words text-sm font-medium text-black md:text-base">
                            {application.instagram}
                        </p>
                    </div>
                )}

                {application.website && (
                    <div>
                        <p className="mb-2 font-october text-lg uppercase leading-none text-black/60">
                            Site
                        </p>

                        <a
                            href={application.website}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-sm font-medium text-black underline underline-offset-4 transition-opacity hover:opacity-60 md:text-base"
                        >
                            {application.website}
                        </a>
                    </div>
                )}
            </div>

            {application.business_description && (
                <div className="mt-6 border-t border-black/15 pt-6">
                    <p className="mb-3 font-october text-lg uppercase leading-none text-black/60">
                        Sobre a loja / atividade
                    </p>

                    <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-black md:text-base">
                        {application.business_description}
                    </p>
                </div>
            )}

            {application.status === "pending" && (
                <div className="mt-6 flex flex-wrap gap-4 border-t border-black/15 pt-6">
                    <StatusForm
                        applicationId={application.id}
                        status="approved"
                        label="Aprovar"
                        primary
                    />

                    <StatusForm
                        applicationId={application.id}
                        status="rejected"
                        label="Recusar"
                    />
                </div>
            )}

            {application.status === "approved" && (
                <div className="mt-6 flex flex-wrap gap-4 border-t border-black/15 pt-6">
                    <StatusForm
                        applicationId={application.id}
                        status="pending"
                        label="Remover acesso ao atacado"
                    />
                </div>
            )}

            {application.status === "rejected" && (
                <div className="mt-6 flex flex-wrap gap-4 border-t border-black/15 pt-6">
                    <StatusForm
                        applicationId={application.id}
                        status="approved"
                        label="Aprovar"
                        primary
                    />

                    <StatusForm
                        applicationId={application.id}
                        status="pending"
                        label="Voltar para pendente"
                    />
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
        .from("wholesale_applications")
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
        (data ?? []) as WholesaleApplication[];

    const pending =
        applications.filter(
            (application) =>
                application.status === "pending",
        );

    const approved =
        applications.filter(
            (application) =>
                application.status === "approved",
        );

    const rejected =
        applications.filter(
            (application) =>
                application.status === "rejected",
        );

    return (
        <main className="min-h-screen p-6 text-black md:p-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="font-october text-5xl uppercase leading-none text-black md:text-6xl">
                            Atacadistas
                        </h1>

                        <p className="mt-3 text-sm text-black/70 md:text-base">
                            Gerencie as solicitações de acesso ao atacado.
                        </p>
                    </div>

                    <Link
                        href="/admin"
                        className={buttonClassName}
                    >
                        ← Admin
                    </Link>
                </div>

                <div className="border-t border-black/20" />

                <section>
                    <div className="mb-6 flex items-center gap-4">
                        <h2 className="font-october text-3xl uppercase leading-none text-black md:text-4xl">
                            Pendentes
                        </h2>

                        <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-black bg-white px-3 py-1 text-sm font-medium">
                            {pending.length}
                        </span>
                    </div>

                    {pending.length === 0 ? (
                        <div className="rounded-xl border border-black bg-white p-6 shadow-[-5px_5px_0_0_#000]">
                            <p className="text-sm text-black/60">
                                Nenhuma solicitação pendente.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {pending.map(
                                (application) => (
                                    <ApplicationCard
                                        key={application.id}
                                        application={application}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </section>

                {approved.length > 0 && (
                    <section>
                        <div className="mb-6 flex items-center gap-4">
                            <h2 className="font-october text-3xl uppercase leading-none text-black md:text-4xl">
                                Aprovados
                            </h2>

                            <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-black bg-white px-3 py-1 text-sm font-medium">
                                {approved.length}
                            </span>
                        </div>

                        <div className="grid gap-8">
                            {approved.map(
                                (application) => (
                                    <ApplicationCard
                                        key={application.id}
                                        application={application}
                                    />
                                ),
                            )}
                        </div>
                    </section>
                )}

                {rejected.length > 0 && (
                    <section>
                        <div className="mb-6 flex items-center gap-4">
                            <h2 className="font-october text-3xl uppercase leading-none text-black md:text-4xl">
                                Recusados
                            </h2>

                            <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-black bg-white px-3 py-1 text-sm font-medium">
                                {rejected.length}
                            </span>
                        </div>

                        <div className="grid gap-8">
                            {rejected.map(
                                (application) => (
                                    <ApplicationCard
                                        key={application.id}
                                        application={application}
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
