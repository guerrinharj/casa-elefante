import {
    NextRequest,
    NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(
    request: NextRequest,
    context: RouteContext,
) {
    /*
     * Verifica se existe usuário autenticado.
     */

    const authClient =
        await createClient();

    const {
        data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
        return NextResponse.json(
            {
                error: "Não autorizado.",
            },
            {
                status: 401,
            },
        );
    }

    /*
     * Pega o ID do pedido pela URL.
     */

    const {
        id,
    } = await context.params;

    /*
     * Lê o novo valor de shipped
     * enviado pelo frontend.
     */

    const body =
        await request.json();

    const shipped =
        body.shipped === true;

    /*
     * Usa o client admin para atualizar
     * sem problemas com RLS.
     */

    const supabase =
        createAdminClient();

    const {
        data: order,
        error,
    } = await supabase
        .from("orders")
        .update({
            shipped,
        })
        .eq(
            "id",
            id,
        )
        .select(`
            id,
            shipped,
            status
        `)
        .single();

    if (error) {
        console.error(
            "Erro ao atualizar pedido:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    error.message,
            },
            {
                status: 500,
            },
        );
    }

    return NextResponse.json({
        order,
    });
}