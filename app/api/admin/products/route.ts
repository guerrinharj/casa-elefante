import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const PRODUCTS_PER_PAGE = 24;

export async function GET(
    request: NextRequest,
) {
    const supabase = await createClient();

    const searchParams =
        request.nextUrl.searchParams;

    const page = Number(
        searchParams.get("page") ?? 1,
    );

    const search =
        searchParams.get("search");

    const from =
        page * PRODUCTS_PER_PAGE;

    const to =
        from +
        PRODUCTS_PER_PAGE -
        1;

    let query = supabase
        .from("products")
        .select(`
            id,
            name,
            slug,
            artist,
            price,
            format,
            year,
            stock,
            images,
            created_at
        `)
        .order("created_at", {
            ascending: false,
        });

    if (search) {
        query = query.or(
            `name.ilike.%${search}%,artist.ilike.%${search}%`,
        );
    }

    const {
        data: products,
        error,
    } = await query.range(
        from,
        to,
    );

    if (error) {
        console.error(
            "Erro ao carregar produtos:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Erro ao carregar produtos.",
            },
            {
                status: 500,
            },
        );
    }

    return NextResponse.json(
        products ?? [],
    );
}