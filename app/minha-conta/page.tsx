import Link from "next/link";

import {
    redirect,
} from "next/navigation";

import {
    createClient,
} from "@/lib/supabase/server";

type OrderItem = {
    id: string;
    product_id: string | null;
    product_name: string;
    artist: string | null;
    format: string | null;
    quantity: number;
    unit_price: number;
};

type Order = {
    id: string;
    user_id: string | null;
    wholesale_application_id:
        string | null;
    status: string;
    subtotal: number;
    shipping: number;
    total: number;
    shipped: boolean;
    invoice_number:
        string | null;
    shipping_service:
        string | null;
    shipping_company:
        string | null;
    delivery_time:
        string | null;
    created_at: string;
    order_items: OrderItem[];
};

const currencyFormatter =
    new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL",
        },
    );

const dateFormatter =
    new Intl.DateTimeFormat(
        "pt-BR",
        {
            dateStyle: "long",
        },
    );

function getStatusLabel(
    status: string,
) {
    switch (status) {
        case "pending":
            return "Pendente";

        case "paid":
            return "Pago";

        case "processing":
            return "Em processamento";

        case "shipped":
            return "Enviado";

        case "cancelled":
            return "Cancelado";

        case "refunded":
            return "Reembolsado";

        default:
            return status;
    }
}

export default async function MinhaContaPage() {
    const supabase =
        await createClient();

    /*
     * Usuário autenticado.
     */

    const {
        data: {
            user,
        },
    } =
        await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    /*
     * Busca profile e cadastro
     * de atacado pertencentes ao
     * usuário autenticado.
     */

    const [
        profileResult,
        wholesaleResult,
    ] = await Promise.all([
        supabase
            .from("profiles")
            .select(`
                name,
                phone,
                role,
                created_at
            `)
            .eq(
                "id",
                user.id,
            )
            .single(),

        supabase
            .from(
                "wholesale_applications",
            )
            .select(`
                id,
                company_name,
                document,
                phone,
                instagram,
                website,
                city,
                state,
                business_description,
                status,
                created_at,
                reviewed_at
            `)
            .eq(
                "user_id",
                user.id,
            )
            .maybeSingle(),
    ]);

    const profile =
        profileResult.data;

    const wholesale =
        wholesaleResult.data;


    if (!profile) {
        redirect("/");
    }

    /*
     * Os pedidos de atacado pertencem
     * à wholesale_application.
     *
     * user.id
     *     ↓
     * wholesale_applications.user_id
     *     ↓
     * wholesale.id
     *     ↓
     * orders.wholesale_application_id
     */

    let orders: Order[] = [];

    let ordersError:
        | Error
        | null = null;

    if (wholesale) {
        const ordersResult =
            await supabase
                .from("orders")
                .select(`
                    id,
                    user_id,
                    wholesale_application_id,
                    status,
                    subtotal,
                    shipping,
                    total,
                    shipped,
                    invoice_number,
                    shipping_service,
                    shipping_company,
                    delivery_time,
                    created_at,
                    order_items (
                        id,
                        product_id,
                        product_name,
                        artist,
                        format,
                        quantity,
                        unit_price
                    )
                `)
                .eq(
                    "wholesale_application_id",
                    wholesale.id,
                )
                .order(
                    "created_at",
                    {
                        ascending: false,
                    },
                );

        orders =
            (ordersResult.data ??
                []) as Order[];

        ordersError =
            ordersResult.error;
    }

    return (
        <main className="px-4 py-10 md:px-6">
            <div className="mx-auto max-w-5xl">
                <div className="mb-10">
                    <p className="mb-2 text-sm uppercase opacity-50">
                        Minha conta
                    </p>

                    <h1 className="text-4xl font-medium">
                        {profile.name ??
                            user.email}
                    </h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <section className="border border-black bg-white p-6">
                        <h2 className="mb-6 text-2xl font-medium">
                            Dados da conta
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <p className="text-xs uppercase opacity-50">
                                    Nome
                                </p>

                                <p>
                                    {profile.name ??
                                        "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase opacity-50">
                                    E-mail
                                </p>

                                <p>
                                    {
                                        user.email
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase opacity-50">
                                    Telefone
                                </p>

                                <p>
                                    {profile.phone ??
                                        wholesale?.phone ??
                                        "—"}
                                </p>
                            </div>
                        </div>
                    </section>

                    {wholesale && (
                        <section className="border border-black bg-white p-6">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <h2 className="text-2xl font-medium">
                                    Atacado
                                </h2>

                                <span className="border border-black px-3 py-1 text-xs uppercase">
                                    {wholesale.status ===
                                    "approved"
                                        ? "Aprovado"
                                        : wholesale.status ===
                                            "pending"
                                          ? "Pendente"
                                          : "Recusado"}
                                </span>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <p className="text-xs uppercase opacity-50">
                                        Empresa
                                    </p>

                                    <p>
                                        {
                                            wholesale.company_name
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase opacity-50">
                                        CPF / CNPJ
                                    </p>

                                    <p>
                                        {
                                            wholesale.document
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs uppercase opacity-50">
                                        Localização
                                    </p>

                                    <p>
                                        {
                                            wholesale.city
                                        }

                                        {" — "}

                                        {
                                            wholesale.state
                                        }
                                    </p>
                                </div>

                                {wholesale.instagram && (
                                    <div>
                                        <p className="text-xs uppercase opacity-50">
                                            Instagram
                                        </p>

                                        <p>
                                            {
                                                wholesale.instagram
                                            }
                                        </p>
                                    </div>
                                )}

                                {wholesale.website && (
                                    <div>
                                        <p className="text-xs uppercase opacity-50">
                                            Site
                                        </p>

                                        <a
                                            href={
                                                wholesale.website
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline underline-offset-4"
                                        >
                                            {
                                                wholesale.website
                                            }
                                        </a>
                                    </div>
                                )}

                                {wholesale.business_description && (
                                    <div>
                                        <p className="text-xs uppercase opacity-50">
                                            Atividade
                                        </p>

                                        <p>
                                            {
                                                wholesale.business_description
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                <section className="mt-12">
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            <p className="mb-2 text-sm uppercase opacity-50">
                                Histórico
                            </p>

                            <h2 className="text-3xl font-medium">
                                Compras
                            </h2>
                        </div>

                        <p className="text-sm opacity-50">
                            {orders.length}{" "}
                            {orders.length ===
                            1
                                ? "pedido"
                                : "pedidos"}
                        </p>
                    </div>

                    {ordersError ? (
                        <div className="border border-black p-6">
                            <p>
                                Não foi possível
                                carregar seus
                                pedidos.
                            </p>
                        </div>
                    ) : !wholesale ? (
                        <div className="border border-black p-8">
                            <p className="text-lg">
                                Nenhum cadastro de
                                atacado encontrado
                                para esta conta.
                            </p>
                        </div>
                    ) : orders.length ===
                      0 ? (
                        <div className="border border-black p-8">
                            <p className="text-lg">
                                Você ainda não
                                realizou nenhuma
                                compra.
                            </p>

                            <Link
                                href="/"
                                className="mt-5 inline-block underline underline-offset-4"
                            >
                                Ir para a loja
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {orders.map(
                                (
                                    order,
                                ) => {
                                    const isWholesaleOrder =
                                        Boolean(
                                            order.wholesale_application_id,
                                        );

                                    return (
                                        <article
                                            key={
                                                order.id
                                            }
                                            className="border border-black bg-white p-6"
                                        >
                                            <div className="flex flex-col gap-4 border-b border-black/20 pb-5 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-xs uppercase opacity-50">
                                                            Pedido
                                                        </p>

                                                        {isWholesaleOrder && (
                                                            <span className="border border-black bg-black px-2 py-0.5 text-[10px] uppercase text-white">
                                                                Atacado
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 font-medium">
                                                        #
                                                        {order.id
                                                            .slice(
                                                                0,
                                                                8,
                                                            )
                                                            .toUpperCase()}
                                                    </p>

                                                    <p className="mt-1 text-sm opacity-50">
                                                        {dateFormatter.format(
                                                            new Date(
                                                                order.created_at,
                                                            ),
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className="border border-black px-3 py-1 text-xs uppercase">
                                                        {getStatusLabel(
                                                            order.status,
                                                        )}
                                                    </span>

                                                    <p className="text-xl font-medium">
                                                        {currencyFormatter.format(
                                                            Number(
                                                                order.total,
                                                            ),
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="divide-y divide-black/10">
                                                {order.order_items.map(
                                                    (
                                                        item,
                                                    ) => (
                                                        <div
                                                            key={
                                                                item.id
                                                            }
                                                            className="flex justify-between gap-6 py-4"
                                                        >
                                                            <div>
                                                                {item.product_id ? (
                                                                    <Link
                                                                        href={`/produtos/${item.product_id}`}
                                                                        className="font-medium hover:underline"
                                                                    >
                                                                        {
                                                                            item.product_name
                                                                        }
                                                                    </Link>
                                                                ) : (
                                                                    <p className="font-medium">
                                                                        {
                                                                            item.product_name
                                                                        }
                                                                    </p>
                                                                )}

                                                                <div className="mt-1 flex flex-wrap gap-x-3 text-sm opacity-50">
                                                                    {item.artist && (
                                                                        <span>
                                                                            {
                                                                                item.artist
                                                                            }
                                                                        </span>
                                                                    )}

                                                                    {item.format && (
                                                                        <span>
                                                                            {
                                                                                item.format
                                                                            }
                                                                        </span>
                                                                    )}

                                                                    <span>
                                                                        Qtd.{" "}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <p className="shrink-0">
                                                                {currencyFormatter.format(
                                                                    Number(
                                                                        item.unit_price,
                                                                    ) *
                                                                        item.quantity,
                                                                )}
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>

                                            <div className="border-t border-black/20 pt-5">
                                                <div className="ml-auto max-w-xs space-y-2 text-sm">
                                                    <div className="flex justify-between gap-6">
                                                        <span className="opacity-50">
                                                            Subtotal
                                                        </span>

                                                        <span>
                                                            {currencyFormatter.format(
                                                                Number(
                                                                    order.subtotal,
                                                                ),
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between gap-6">
                                                        <span className="opacity-50">
                                                            Frete
                                                        </span>

                                                        <span>
                                                            {currencyFormatter.format(
                                                                Number(
                                                                    order.shipping,
                                                                ),
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between gap-6 border-t border-black/20 pt-2 text-base font-medium">
                                                        <span>
                                                            Total
                                                        </span>

                                                        <span>
                                                            {currencyFormatter.format(
                                                                Number(
                                                                    order.total,
                                                                ),
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {order.shipped && (
                                                <div className="mt-5 border-t border-black/20 pt-5">
                                                    <p className="text-sm">
                                                        Pedido
                                                        enviado
                                                        {order.shipping_company
                                                            ? ` por ${order.shipping_company}`
                                                            : ""}
                                                        .
                                                    </p>
                                                </div>
                                            )}
                                        </article>
                                    );
                                },
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}