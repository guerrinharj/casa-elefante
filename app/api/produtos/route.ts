
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
    try {
        const supabase = await createClient();

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
            wholesaleStatus === "pending";

        const searchParams =
            request.nextUrl.searchParams;

        /*
         * Paginação
         *
         * Página 0: produtos 0–23
         * Página 1: produtos 24–47
         * Página 2: produtos 48–71
         */

        const rawPage = Number(
            searchParams.get("page") ?? "1",
        );

        if (
            !Number.isSafeInteger(rawPage) ||
            rawPage < 0
        ) {
            return NextResponse.json(
                {
                    error: "Número de página inválido.",
                },
                {
                    status: 400,
                },
            );
        }

        const page = rawPage;

        const from =
            page * PRODUCTS_PER_PAGE;

        const to =
            from + PRODUCTS_PER_PAGE - 1;

        /*
         * Filtros
         */

        const genre =
            searchParams.get("genre");

        const format =
            searchParams.get("format");

        const year =
            searchParams.get("year");

        const artist =
            searchParams.get("artist");

        const label =
            searchParams.get("label");

        const search =
            searchParams.get("search");

        const condition =
            searchParams.get("condition");

        const availability =
            searchParams.get("availability");

        const preOrder =
            searchParams.get("pre_order");

        const country =
            searchParams.get("country");

        /*
         * Consulta principal
         */

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
            )
            .order(
                "id",
                {
                    ascending: false,
                },
            );

        /*
         * Permissões de atacado
         */

        if (!canSeeWholesaleOnly) {
            query = query.eq(
                "wholesale_only",
                false,
            );
        }

        /*
         * Gênero
         */

        if (genre) {
            query = query.eq(
                "genre",
                genre,
            );
        }

        /*
         * Formato
         */

        if (format) {
            query = query.eq(
                "format",
                format,
            );
        }

        /*
         * Ano
         */

        if (year) {
            const numericYear = Number(year);

            if (
                Number.isInteger(numericYear)
            ) {
                query = query.eq(
                    "year",
                    numericYear,
                );
            }
        }

        /*
         * Artista
         */

        if (artist) {
            query = query.ilike(
                "artist",
                `%${artist}%`,
            );
        }

        /*
         * Gravadora
         */

        if (label) {
            query = query.ilike(
                "label",
                `%${label}%`,
            );
        }

        /*
         * País
         */

        if (country) {
            query = query.eq(
                "country",
                country,
            );
        }

        /*
         * Condição
         */

        if (condition) {
            query = query.eq(
                "condition",
                condition,
            );
        }

        /*
         * Disponibilidade
         */

        if (availability === "pre_order") {
            query = query.eq(
                "pre_order",
                true,
            );
        }

        if (availability === "ready") {
            query = query.eq(
                "pre_order",
                false,
            );
        }

        /*
         * Pré-venda
         */

        if (preOrder !== null) {
            query = query.eq(
                "pre_order",
                preOrder === "true",
            );
        }

        /*
         * Busca por nome ou artista
         *
         * Remove caracteres especiais
         * que podem interferir na sintaxe
         * do filtro OR do PostgREST.
         */

        if (search) {
            const safeSearch = search
                .trim()
                .replace(/[%_,()."\\]/g, " ")
                .replace(/\s+/g, " ")
                .trim();

            if (safeSearch) {
                query = query.or(
                    `name.ilike.%${safeSearch}%,artist.ilike.%${safeSearch}%`,
                );
            }
        }

        /*
         * Executar consulta paginada
         */

        const {
            data,
            error,
        } = await query.range(
            from,
            to,
        );

        /*
         * Tratamento de erros
         */

        if (error) {
            console.error(
                "[API PRODUCTS] Erro no Supabase:",
                {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    page,
                    from,
                    to,
                },
            );

            return NextResponse.json(
                {
                    error: "Erro ao carregar produtos.",
                    code: error.code,
                    details:
                        process.env.NODE_ENV === "development"
                            ? error.message
                            : undefined,
                },
                {
                    status: 500,
                },
            );
        }

        /*
         * Resposta
         */

        return NextResponse.json(
            data ?? [],
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            },
        );
    } catch (error) {
        console.error(
            "[API PRODUCTS] Erro inesperado:",
            error,
        );

        return NextResponse.json(
            {
                error: "Erro interno ao carregar produtos.",
                details:
                    process.env.NODE_ENV === "development" &&
                    error instanceof Error
                        ? error.message
                        : undefined,
            },
            {
                status: 500,
            },
        );
    }
}
