"use server";

import {
    revalidatePath,
} from "next/cache";

import {
    requireAdmin,
} from "@/lib/auth";

import {
    resend,
} from "@/lib/resend";

import {
    createAdminClient,
} from "@/lib/supabase/admin";

type ActionResult =
    | {
          success: true;
          message?: string;
      }
    | {
          success: false;
          error: string;
      };

type CreateCollaboratorInput = {
    name: string;
    email: string;
};

function escapeHtml(
    value: string,
) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function sendCollaboratorInvite({
    name,
    email,
}: {
    name: string;
    email: string;
}): Promise<ActionResult> {
    const supabase =
        createAdminClient();

    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ??
        "http://localhost:3000";

    const {
        data: linkData,
        error: linkError,
    } =
        await supabase.auth.admin.generateLink({
            type: "recovery",
            email,
            options: {
                redirectTo:
                    `${siteUrl}/auth/callback?next=/definir-senha`,
            },
        });

    if (linkError) {
        console.error(
            "Erro ao gerar link:",
            linkError,
        );

        return {
            success: false,
            error:
                "Não foi possível gerar o link de acesso.",
        };
    }

    const inviteUrl =
        linkData.properties.action_link;

    const {
        error: emailError,
    } = await resend.emails.send({
        from:
            process.env.RESEND_FROM_EMAIL ??
            "Casa Elefante <onboarding@resend.dev>",

        to: email,

        subject:
            "Você foi adicionado como colaborador da Casa Elefante",

        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 560px;
                margin: 0 auto;
                padding: 32px 20px;
                color: #000;
            ">
                <h1 style="
                    font-size: 24px;
                    font-weight: 500;
                    margin-bottom: 24px;
                ">
                    Casa Elefante
                </h1>

                <p>
                    Olá, ${escapeHtml(name)}.
                </p>

                <p>
                    Você foi adicionado como colaborador
                    da Casa Elefante.
                </p>

                <p>
                    Como colaborador, você poderá adicionar,
                    editar e remover produtos do catálogo.
                </p>

                <p style="margin: 32px 0;">
                    <a
                        href="${inviteUrl}"
                        style="
                            display: inline-block;
                            border: 1px solid #000;
                            padding: 12px 20px;
                            color: #000;
                            text-decoration: none;
                        "
                    >
                        Criar minha senha
                    </a>
                </p>

                <p style="
                    font-size: 12px;
                    opacity: 0.6;
                ">
                    Se você não esperava receber este convite,
                    pode ignorar este e-mail.
                </p>
            </div>
        `,
    });

    if (emailError) {
        console.error(
            "Erro ao enviar convite:",
            emailError,
        );

        return {
            success: false,
            error:
                "Não foi possível enviar o e-mail de convite.",
        };
    }

    return {
        success: true,
        message: "Convite enviado.",
    };
}

export async function createCollaborator({
    name,
    email,
}: CreateCollaboratorInput): Promise<ActionResult> {
    await requireAdmin();

    const cleanName =
        name.trim();

    const cleanEmail =
        email.trim().toLowerCase();

    if (
        !cleanName ||
        !cleanEmail
    ) {
        return {
            success: false,
            error:
                "Preencha nome e e-mail.",
        };
    }

    const supabase =
        createAdminClient();

    /*
     * Verifica primeiro se já existe
     * um profile com esse e-mail.
     */
    const {
        data: existingProfile,
    } = await supabase
        .from("profiles")
        .select(
            "id, role",
        )
        .ilike(
            "email",
            cleanEmail,
        )
        .maybeSingle();

    if (existingProfile) {
        return {
            success: false,
            error:
                existingProfile.role ===
                "collaborator"
                    ? "Este e-mail já pertence a um colaborador."
                    : "Já existe uma conta cadastrada com este e-mail.",
        };
    }

    /*
     * Cria o usuário no Supabase Auth.
     */
    const {
        data: userData,
        error: userError,
    } =
        await supabase.auth.admin.createUser({
            email: cleanEmail,
            email_confirm: true,
            user_metadata: {
                name: cleanName,
            },
        });

    if (
        userError ||
        !userData.user
    ) {
        console.error(
            "Erro ao criar usuário:",
            userError,
        );

        if (
            userError?.code ===
            "email_exists"
        ) {
            return {
                success: false,
                error:
                    "Já existe um usuário cadastrado com este e-mail.",
            };
        }

        return {
            success: false,
            error:
                userError?.message ??
                "Não foi possível criar o usuário.",
        };
    }

    const user =
        userData.user;

    /*
     * Cria/atualiza o profile.
     */
    const {
        error: profileError,
    } = await supabase
        .from("profiles")
        .upsert({
            id: user.id,
            name: cleanName,
            email: cleanEmail,
            role: "collaborator",
        });

    if (profileError) {
        console.error(
            "Erro ao criar profile:",
            profileError,
        );

        /*
         * Aqui ainda faz sentido rollback:
         * sem profile, a criação do colaborador
         * realmente não foi concluída.
         */
        await supabase.auth.admin.deleteUser(
            user.id,
        );

        return {
            success: false,
            error:
                "Não foi possível criar o perfil do colaborador.",
        };
    }

    /*
     * Agora o colaborador já existe.
     * Falha no e-mail NÃO remove o usuário.
     */
    const inviteResult =
        await sendCollaboratorInvite({
            name: cleanName,
            email: cleanEmail,
        });

    revalidatePath(
        "/admin/colaboradores",
    );

    if (!inviteResult.success) {
        return {
            success: true,
            message:
                "Colaborador criado, mas o convite não pôde ser enviado. Você poderá reenviar pela página de colaboradores.",
        };
    }

    return {
        success: true,
        message:
            "Colaborador criado e convite enviado.",
    };
}

export async function resendCollaboratorInvite(
    collaboratorId: string,
): Promise<ActionResult> {
    await requireAdmin();

    const supabase =
        createAdminClient();

    const {
        data: collaborator,
        error,
    } = await supabase
        .from("profiles")
        .select(
            "id, name, email, role",
        )
        .eq(
            "id",
            collaboratorId,
        )
        .eq(
            "role",
            "collaborator",
        )
        .single();

    if (
        error ||
        !collaborator
    ) {
        return {
            success: false,
            error:
                "Colaborador não encontrado.",
        };
    }

    if (!collaborator.email) {
        return {
            success: false,
            error:
                "Este colaborador não possui e-mail cadastrado.",
        };
    }

    const result =
        await sendCollaboratorInvite({
            name:
                collaborator.name ??
                "Colaborador",
            email:
                collaborator.email,
        });

    return result;
}

export async function removeCollaborator(
    collaboratorId: string,
): Promise<ActionResult> {
    await requireAdmin();

    const supabase =
        createAdminClient();

    /*
     * Primeiro confirmamos que o ID realmente
     * pertence a um collaborator.
     *
     * Isso evita que alguém tente passar
     * o ID de um admin para essa action.
     */
    const {
        data: collaborator,
        error: collaboratorError,
    } = await supabase
        .from("profiles")
        .select(
            "id, role",
        )
        .eq(
            "id",
            collaboratorId,
        )
        .eq(
            "role",
            "collaborator",
        )
        .single();

    if (
        collaboratorError ||
        !collaborator
    ) {
        return {
            success: false,
            error:
                "Colaborador não encontrado.",
        };
    }

    /*
     * Remove o usuário do Auth.
     */
    const {
        error: authError,
    } =
        await supabase.auth.admin.deleteUser(
            collaborator.id,
        );

    if (authError) {
        console.error(
            "Erro ao remover usuário:",
            authError,
        );

        return {
            success: false,
            error:
                "Não foi possível remover o colaborador.",
        };
    }

    /*
     * Dependendo da FK profiles -> auth.users,
     * o profile pode ser removido automaticamente
     * por ON DELETE CASCADE.
     *
     * O delete abaixo garante a remoção caso
     * isso não esteja configurado.
     */
    const {
        error: profileError,
    } = await supabase
        .from("profiles")
        .delete()
        .eq(
            "id",
            collaborator.id,
        );

    if (profileError) {
        console.error(
            "Erro ao remover profile:",
            profileError,
        );
    }

    revalidatePath(
        "/admin/colaboradores",
    );

    return {
        success: true,
        message:
            "Colaborador removido.",
    };
}