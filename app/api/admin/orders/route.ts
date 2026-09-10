import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const ORDERS_PER_PAGE = 20;

export async function GET(
    request: NextRequest,
) {
    const supabase =
        await createClient();

    /*
     * Verificamos se existe um usuário
     * autenticado antes de retornar
     * dados administrativos.
     */
    const {
        data: { user },
    } = await supabase.auth.getUser();

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
     * A página vem pela URL:
     *
     * /api/admin/orders?page=0
     * /api/admin/orders?page=1
     * /api/admin/orders?page=2
     */
    const page = Number(
        request.nextUrl.searchParams.get(
            "page",
        ) ?? "0",
    );

    const from =
        page * ORDERS_PER_PAGE;

    const to =
        from +
        ORDERS_PER_PAGE -
        1;

    const {
        data: orders,
        error,
    } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", {
            ascending: false,
        })
        .range(from, to);

    if (error) {
        console.error(
            "Erro ao carregar pedidos:",
            error,
        );

        return NextResponse.json(
            {
                error: error.message,
            },
            {
                status: 500,
            },
        );
    }

    return NextResponse.json({
        orders: orders ?? [],
    });
}