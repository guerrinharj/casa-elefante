"use client";

import Link from "next/link";

type ShippingAddress = {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
};

export type Order = {
    id: string;
    customer_name?: string | null;
    customer_email?: string | null;
    total?: number | null;
    status?: string | null;
    shipped?: boolean;
    shipping_address?: ShippingAddress | null;
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

    return (
        <div className="border border-black p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="text-lg font-medium hover:underline"
                    >
                        {order.customer_name || "Cliente"}
                    </Link>

                    <p className="mt-1 text-sm">
                        {order.customer_email || "Sem e-mail"}
                    </p>
                </div>

                <div className="flex flex-col gap-1 text-left md:text-right">
                    <p className="font-medium">
                        {formatPrice(order.total)}
                    </p>

                    <p className="text-sm">
                        {order.status || "Pendente"}
                    </p>
                </div>
            </div>

            {order.shipping_address && (
                <div className="mt-6 border-t border-black pt-4">
                    <p className="text-xs uppercase">
                        Endereço de entrega
                    </p>

                    <div className="mt-2 text-sm">
                        <p>
                            {order.shipping_address.street || "—"}
                            {order.shipping_address.number
                                ? `, ${order.shipping_address.number}`
                                : ""}
                        </p>

                        {order.shipping_address.complement && (
                            <p>
                                {order.shipping_address.complement}
                            </p>
                        )}

                        {order.shipping_address.neighborhood && (
                            <p>
                                {order.shipping_address.neighborhood}
                            </p>
                        )}

                        <p>
                            {order.shipping_address.city || "—"}
                            {order.shipping_address.state
                                ? ` - ${order.shipping_address.state}`
                                : ""}
                        </p>

                        <p className="mt-1">
                            CEP:{" "}
                            {order.shipping_address.zipCode || "—"}
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-6 flex flex-col gap-4 border-t border-black pt-4 md:flex-row md:items-center md:justify-between">
                <div className="text-xs">
                    <p>
                        Pedido {order.id.slice(0, 8)}
                    </p>

                    <p className="mt-1">
                        {formatDate(order.created_at)}
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