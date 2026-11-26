"use server";

import {
    revalidatePath,
} from "next/cache";

import {
    requireProductManager,
} from "@/lib/auth";

import {
    createClient,
} from "@/lib/supabase/server";

import {
    createAdminClient,
} from "@/lib/supabase/admin";

/*
 * SEARCH RECORD PRODUCTS
 */

export async function searchRecordProducts(
    _previous: unknown,
    formData: FormData,
) {
    await requireProductManager();

    const query = String(
        formData.get("query") ?? "",
    )
        .trim()
        .slice(0, 120);

    if (!query) {
        return {
            products: [],
            message:
                "Digite o nome do produto ou do artista.",
        };
    }

    const supabase = await createClient();

    const pattern = JSON.stringify(
        `%${query.replace(/[\\%_]/g, "\\$&")}%`,
    );

    const {
        data,
        error,
    } = await supabase
        .from("products")
        .select(`
            id,
            name,
            artist,
            format,
            stock,
            wholesale_only
        `)
        .or(
            `name.ilike.${pattern},artist.ilike.${pattern}`,
        )
        .order("name")
        .order("id")
        .limit(20);

    if (error) {
        console.error(
            "Erro ao pesquisar candidatos a Disco da Semana:",
            error,
        );

        return {
            products: [],
            message:
                "Não foi possível pesquisar os produtos.",
        };
    }

    return {
        products: data ?? [],
        message: data?.length
            ? ""
            : "Nenhum produto encontrado.",
    };
}

/*
 * SAVE RECORD OF THE WEEK
 */

export async function saveRecordOfTheWeek(
    _previous: string,
    formData: FormData,
) {
    await requireProductManager();

    const operation =
        formData.get("operation");

    const productId =
        formData.get("productId");

    const expectedProductId =
        formData.get("expectedProductId");

    const editorialComment = String(
        formData.get("comment") ?? "",
    ).trim();

    /*
     * VALIDATE OPERATION
     */

    if (
        operation !== "save" &&
        operation !== "remove"
    ) {
        return "Operação inválida.";
    }

    /*
     * VALIDATE PRODUCT
     */

    if (
        operation === "save" &&
        (
            typeof productId !== "string" ||
            !productId
        )
    ) {
        return "Selecione um produto.";
    }

    /*
     * VALIDATE EDITORIAL COMMENT
     */

    if (operation === "save") {
        if (!editorialComment) {
            return "Escreva um comentário editorial.";
        }

        if (editorialComment.length > 2000) {
            return "O comentário deve ter até 2.000 caracteres.";
        }
    }

    /*
     * ADMIN CLIENT
     *
     * A função RPC possui permissão
     * exclusiva para service_role.
     *
     * A autorização é verificada acima
     * por requireProductManager().
     */

    const supabase = createAdminClient();

    /*
     * EXECUTE RPC
     */

    const {
        error,
    } = await supabase.rpc(
        "set_record_of_the_week",
        {
            p_product_id:
                operation === "save"
                    ? productId
                    : null,

            p_editorial_comment:
                operation === "save"
                    ? editorialComment
                    : null,

            p_expected_product_id:
                typeof expectedProductId === "string"
                    ? expectedProductId || null
                    : null,
        },
    );

    /*
     * CONCURRENT UPDATE
     */

    if (error?.code === "40001") {
        revalidatePath("/admin/produtos");

        return "A seleção foi alterada. Confira o Disco da Semana atual e tente novamente.";
    }

    /*
     * PRODUCT NOT AVAILABLE
     */

    if (error?.code === "P0002") {
        return "O produto não está mais disponível no catálogo.";
    }

    /*
     * RPC NOT AVAILABLE
     */

    if (error?.code === "PGRST202") {
        console.error(
            "RPC do Disco da Semana indisponível no Supabase:",
            error,
        );

        return "A função do Disco da Semana está indisponível. Verifique a migration no Supabase e o cache de esquema da API.";
    }

    /*
     * PERMISSION ERROR
     */

    if (error?.code === "42501") {
        console.error(
            "Erro de permissão ao atualizar Disco da Semana:",
            error,
        );

        return "Não foi possível executar a função por falta de permissão.";
    }

    /*
     * GENERIC ERROR
     */

    if (error) {
        console.error(
            "Erro ao atualizar Disco da Semana:",
            error,
        );

        return "Não foi possível atualizar o Disco da Semana.";
    }

    /*
     * REVALIDATE PAGES
     */

    revalidatePath("/admin/produtos");
    revalidatePath("/");

    /*
     * SUCCESS
     */

    return operation === "remove"
        ? "Seleção removida."
        : "Disco da Semana salvo.";
}