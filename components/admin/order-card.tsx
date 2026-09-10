"use client";

import Link from "next/link";

type ShippingAddress = {
    postalCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
};

type OrderItem = {
    id?: string;
    product_id?: string;
    quantity: number;

    product?: {
        name?: string | null;
        artist?: string | null;
        slug?: string | null;
        format?: string | null;
    } | null;
};

export type Order = {
    id: string;
    customer_name?: string | null;
    customer_email?: string | null;
    total?: number | null;
    status?: string | null;
    shipped?: boolean;
    shipping_address?: ShippingAddress | null;
    items?: OrderItem[];
    created_at?: string | null;
};

type OrderCardProps = {
    order: Order;

    onShippedChange: (
        orderId: string,
        shipped: boolean,
    ) => void;
};

export function OrderCard({
    order,
    onShippedChange,
}: OrderCardProps) {
    function formatPrice(
        value?: number | null,
    ) {
        if (
            value === null ||
            value === undefined
        ) {
            return "—";
        }

        return Number(
            value,
        ).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL",
            },
        );
    }

    function formatDate(
        value?: string | null,
    ) {
        if (!value) {
            return "—";
        }

        return new Date(
            value,
        ).toLocaleString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            },
        );
    }

    function formatPostalCode(
        value?: string,
    ) {
        if (!value) {
            return "—";
        }

        const numbers =
            value.replace(
                /\D/g,
                "",
            );

        if (
            numbers.length !== 8
        ) {
            return value;
        }

        return `${numbers.slice(
            0,
            5,
        )}-${numbers.slice(
            5,
            8,
        )}`;
    }

    return (
        <div className="border border-black p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-lg font-medium hover:underline"
                    >
                        {order.customer_name ||
                            "Cliente"}
                    </Link>

                    <p className="mt-1 text-sm">
                        {order.customer_email ||
                            "Sem e-mail"}
                    </p>
                </div>

                <div className="flex flex-col gap-1 text-left md:text-right">
                    <p className="font-medium">
                        {formatPrice(
                            order.total,
                        )}
                    </p>

                    <p className="text-sm">
                        {order.status ||
                            "Pendente"}
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-6 border-t border-black pt-4 md:grid-cols-2">
                <div>
                    <p className="text-xs uppercase">
                        Endereço de entrega
                    </p>

                    {order.shipping_address ? (
                        <div className="mt-2 text-sm">
                            <p>
                                {order
                                    .shipping_address
                                    .street ||
                                    "—"}

                                {order
                                    .shipping_address
                                    .number
                                    ? `, ${order.shipping_address.number}`
                                    : ""}
                            </p>

                            {order
                                .shipping_address
                                .complement && (
                                <p>
                                    {
                                        order
                                            .shipping_address
                                            .complement
                                    }
                                </p>
                            )}

                            {order
                                .shipping_address
                                .neighborhood && (
                                <p>
                                    {
                                        order
                                            .shipping_address
                                            .neighborhood
                                    }
                                </p>
                            )}

                            <p>
                                {order
                                    .shipping_address
                                    .city ||
                                    "—"}

                                {order
                                    .shipping_address
                                    .state
                                    ? ` - ${order.shipping_address.state}`
                                    : ""}
                            </p>

                            <p className="mt-1">
                                CEP:{" "}
                                {formatPostalCode(
                                    order
                                        .shipping_address
                                        .postalCode,
                                )}
                            </p>
                        </div>
                    ) : (
                        <p className="mt-2 text-sm">
                            Sem endereço
                        </p>
                    )}
                </div>

                <div>
                    <p className="text-xs uppercase">
                        Produtos
                    </p>

                    {order.items?.length ? (
                        <div className="mt-2 flex flex-col gap-2 text-sm">
                            {order.items.map(
                                (
                                    item,
                                    index,
                                ) => (
                                    <div
                                        key={
                                            item.id ??
                                            item.product_id ??
                                            index
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            {item.product?.slug ? (
                                                <Link
                                                    href={`/produtos/${item.product.slug}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {item.product.name ||
                                                        "Produto"}
                                                </Link>
                                            ) : (
                                                <p className="font-medium">
                                                    {item.product?.name ||
                                                        "Produto"}
                                                </p>
                                            )}

                                            <span className="text-xs">
                                                × {item.quantity}
                                            </span>
                                        </div>

                                        <p className="text-xs opacity-70">
                                            {item.product?.artist ||
                                                "Artista não informado"}
                                        </p>

                                        {item.product?.format && (
                                            <p className="text-xs opacity-70">
                                                ({item.product.format})
                                            </p>
                                        )}
                                    </div>
                                ),
                            )}
                        </div>
                    ) : (
                        <p className="mt-2 text-sm">
                            Sem produtos
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-black pt-4 md:flex-row md:items-center md:justify-between">
                <div className="text-xs">
                    <p>
                        Pedido{" "}
                        {order.id.slice(
                            0,
                            8,
                        )}
                    </p>

                    <p className="mt-1">
                        {formatDate(
                            order.created_at,
                        )}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        onShippedChange(
                            order.id,
                            !order.shipped,
                        )
                    }
                    className={`border border-black px-4 py-2 text-sm transition-opacity hover:opacity-60 ${
                        order.shipped
                            ? "bg-black text-white"
                            : ""
                    }`}
                >
                    {order.shipped
                        ? "Enviado"
                        : "Marcar como enviado"}
                </button>
            </div>
        </div>
    );
}