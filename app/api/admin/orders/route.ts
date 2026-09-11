import {
    NextRequest,
    NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ORDERS_PER_PAGE = 20;

export async function GET(
    request: NextRequest,
) {
    /*
     * Client normal apenas para verificar
     * se existe usuário autenticado.
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
     * Client admin para acessar orders,
     * order_items e products sem problemas
     * de RLS.
     */

    const supabase =
        createAdminClient();

    /*
     * Paginação.
     */

    const pageParam =
        request.nextUrl.searchParams.get(
            "page",
        );

    const page = Math.max(
        Number(
            pageParam ?? "0",
        ),
        0,
    );

    const from =
        page * ORDERS_PER_PAGE;

    const to =
        from +
        ORDERS_PER_PAGE -
        1;

    /*
     * Filtro de enviados.
     *
     * Exemplos:
     *
     * /api/admin/orders?page=0&shipped=false
     *
     * /api/admin/orders?page=0&shipped=true
     */

    const shippedParam =
        request.nextUrl.searchParams.get(
            "shipped",
        );

    let shippedFilter:
        boolean | null = null;

    if (shippedParam === "true") {
        shippedFilter = true;
    }

    if (shippedParam === "false") {
        shippedFilter = false;
    }

    /*
     * Monta a query de pedidos.
     */

    let ordersQuery =
        supabase
            .from("orders")
            .select("*")
            .order("created_at", {
                ascending: false,
            });

    /*
     * Só aplica o filtro caso
     * shipped tenha sido informado.
     */

    if (shippedFilter !== null) {
        ordersQuery =
            ordersQuery.eq(
                "shipped",
                shippedFilter,
            );
    }

    /*
     * Aplica paginação depois
     * dos filtros.
     */

    const {
        data: orders,
        error: ordersError,
    } = await ordersQuery.range(
        from,
        to,
    );

    if (ordersError) {
        console.error(
            "Erro ao carregar pedidos:",
            ordersError,
        );

        return NextResponse.json(
            {
                error:
                    ordersError.message,
            },
            {
                status: 500,
            },
        );
    }

    /*
     * Nenhum pedido encontrado.
     */

    if (
        !orders ||
        orders.length === 0
    ) {
        return NextResponse.json({
            orders: [],
            hasMore: false,
        });
    }

    /*
     * IDs dos pedidos encontrados.
     */

    const orderIds =
        orders.map(
            (order) =>
                order.id,
        );

    /*
     * Busca os itens pertencentes
     * aos pedidos encontrados.
     */

    const {
        data: orderItems,
        error: itemsError,
    } = await supabase
        .from("order_items")
        .select(`
            id,
            order_id,
            product_id,
            quantity
        `)
        .in(
            "order_id",
            orderIds,
        );

    if (itemsError) {
        console.error(
            "Erro ao carregar order_items:",
            itemsError,
        );

        return NextResponse.json(
            {
                error:
                    itemsError.message,
            },
            {
                status: 500,
            },
        );
    }

    /*
     * Pega todos os IDs dos produtos
     * presentes nesses pedidos.
     */

    const productIds = [
        ...new Set(
            (orderItems ?? [])
                .map(
                    (item) =>
                        item.product_id,
                )
                .filter(
                    (
                        productId,
                    ): productId is string =>
                        Boolean(
                            productId,
                        ),
                ),
        ),
    ];

    /*
     * Busca os dados dos produtos.
     *
     * Esses dados serão mostrados
     * no OrderCard.
     */

    const {
        data: products,
        error: productsError,
    } = productIds.length
        ? await supabase
              .from("products")
              .select(`
                  id,
                  name,
                  artist,
                  slug,
                  format
              `)
              .in(
                  "id",
                  productIds,
              )
        : {
              data: [],
              error: null,
          };

    if (productsError) {
        console.error(
            "Erro ao carregar produtos:",
            productsError,
        );

        return NextResponse.json(
            {
                error:
                    productsError.message,
            },
            {
                status: 500,
            },
        );
    }

    /*
     * Mapa:
     *
     * product_id -> produto
     *
     * Isso evita ficar procurando
     * o produto inteiro várias vezes.
     */

    const productsMap =
        new Map(
            (products ?? []).map(
                (product) => [
                    product.id,
                    product,
                ],
            ),
        );

    /*
     * Junta:
     *
     * pedido
     * +
     * itens
     * +
     * informações dos produtos
     */

    const ordersWithItems =
        orders.map(
            (order) => {
                const items =
                    (
                        orderItems ??
                        []
                    )
                        .filter(
                            (item) =>
                                item.order_id ===
                                order.id,
                        )
                        .map(
                            (item) => ({
                                id:
                                    item.id,

                                product_id:
                                    item.product_id,

                                quantity:
                                    item.quantity,

                                product:
                                    item.product_id
                                        ? productsMap.get(
                                              item.product_id,
                                          ) ??
                                          null
                                        : null,
                            }),
                        );

                return {
                    ...order,
                    items,
                };
            },
        );

    /*
     * Retorna os pedidos já completos.
     */

    return NextResponse.json({
        orders:
            ordersWithItems,

        hasMore:
            orders.length ===
            ORDERS_PER_PAGE,
    });
}