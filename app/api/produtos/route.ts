import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    getUserAccess,
} from "@/lib/auth";

import {
    createClient,
} from "@/lib/supabase/server";

const PRODUCTS_PER_PAGE = 24;

export async function GET(
    request: NextRequest,
) {
    const supabase =
        await createClient();

    const {
        isWholesale,
        isAdmin,
        wholesaleStatus,
    } = await getUserAccess();

    /*
     * Quem pode receber produtos
     * exclusivos na listagem:
     *
     * admin     -> sim
     * approved  -> sim
     * pending   -> sim
     * rejected  -> não
     * comum     -> não
     *
     * Pending recebe o produto porque
     * o ProductCard irá mostrá-lo
     * bloqueado.
     */
    const canSeeWholesaleOnly =
        isAdmin ||
        isWholesale ||
        wholesaleStatus ===
            "pending";

    const searchParams =
        request.nextUrl.searchParams;

    const page =
        Math.max(
            Number(
                searchParams.get(
                    "page",
                ) ?? "1",
            ),
            1,
        );

    const genre =
        searchParams.get(
            "genre",
        );

    const format =
        searchParams.get(
            "format",
        );

    const year =
        searchParams.get(
            "year",
        );

    const artist =
        searchParams.get(
            "artist",
        );

    const label =
        searchParams.get(
            "label",
        );

    const search =
        searchParams.get(
            "search",
        );

    const condition =
        searchParams.get(
            "condition",
        );

    const availability =
        searchParams.get(
            "availability",
        );

    const preOrder =
        searchParams.get(
            "pre_order",
        );

    const from =
        page *
        PRODUCTS_PER_PAGE;

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
            year,
            format,
            images,
            stock,
            condition,
            pre_order,
            wholesale_only
        `)
        .gt(
            "stock",
            0,
        )
        .order(
            "created_at",
            {
                ascending: false,
            },
        );

    /*
     * Rejected e usuários comuns
     * não recebem produtos exclusivos.
     */
    if (!canSeeWholesaleOnly) {
        query = query.eq(
            "wholesale_only",
            false,
        );
    }

    if (genre) {
        query = query.eq(
            "genre",
            genre,
        );
    }

    if (format) {
        query = query.eq(
            "format",
            format,
        );
    }

    if (year) {
        const numericYear =
            Number(year);

        if (
            !Number.isNaN(
                numericYear,
            )
        ) {
            query = query.eq(
                "year",
                numericYear,
            );
        }
    }

    if (artist) {
        query = query.ilike(
            "artist",
            `%${artist}%`,
        );
    }

    if (label) {
        query = query.ilike(
            "label",
            `%${label}%`,
        );
    }

    if (condition) {
        query = query.eq(
            "condition",
            condition,
        );
    }

    if (availability) {
        if (
            availability ===
            "pre_order"
        ) {
            query = query.eq(
                "pre_order",
                true,
            );
        }

        if (
            availability ===
            "ready"
        ) {
            query = query.eq(
                "pre_order",
                false,
            );
        }
    }

    if (
        preOrder !== null
    ) {
        query = query.eq(
            "pre_order",
            preOrder === "true",
        );
    }

    if (search) {
        query = query.or(
            `name.ilike.%${search}%,artist.ilike.%${search}%`,
        );
    }

    const {
        data,
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
        data ?? [],
    );
}