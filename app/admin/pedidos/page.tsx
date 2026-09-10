"use client";

import Link from "next/link";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    OrderCard,
    type Order,
} from "@/components/admin/order-card";

const ORDERS_PER_PAGE = 20;

export default function AdminOrdersPage() {
    const [orders, setOrders] =
        useState<Order[]>([]);

    const [page, setPage] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [hasMore, setHasMore] =
        useState(true);

    const loaderRef =
        useRef<HTMLDivElement | null>(
            null,
        );

    async function loadOrders(
        pageToLoad: number,
    ) {
        if (
            loading &&
            pageToLoad !== 0
        ) {
            return;
        }

        setLoading(true);

        try {
            const response =
                await fetch(
                    `/api/admin/orders?page=${pageToLoad}`,
                );

            if (!response.ok) {
                throw new Error(
                    "Erro ao carregar pedidos.",
                );
            }

            const data =
                await response.json();

            const newOrders: Order[] =
                data.orders ?? [];

            setOrders(
                (currentOrders) => {
                    if (
                        pageToLoad === 0
                    ) {
                        return newOrders;
                    }

                    const existingIds =
                        new Set(
                            currentOrders.map(
                                (order) =>
                                    order.id,
                            ),
                        );

                    const uniqueOrders =
                        newOrders.filter(
                            (order) =>
                                !existingIds.has(
                                    order.id,
                                ),
                        );

                    return [
                        ...currentOrders,
                        ...uniqueOrders,
                    ];
                },
            );

            setHasMore(
                newOrders.length ===
                    ORDERS_PER_PAGE,
            );
        } catch (error) {
            console.error(
                "Erro ao carregar pedidos:",
                error,
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleShippedChange(
        orderId: string,
        shipped: boolean,
    ) {
        try {
            const response =
                await fetch(
                    `/api/admin/orders/${orderId}/shipped`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            shipped,
                        }),
                    },
                );

            if (!response.ok) {
                throw new Error(
                    "Erro ao atualizar pedido.",
                );
            }

            setOrders(
                (currentOrders) =>
                    currentOrders.map(
                        (order) =>
                            order.id ===
                            orderId
                                ? {
                                      ...order,
                                      shipped,
                                  }
                                : order,
                    ),
            );
        } catch (error) {
            console.error(
                "Erro ao atualizar envio:",
                error,
            );
        }
    }

    useEffect(() => {
        loadOrders(0);
    }, []);

    useEffect(() => {
        const loader =
            loaderRef.current;

        if (!loader) {
            return;
        }

        const observer =
            new IntersectionObserver(
                (entries) => {
                    const entry =
                        entries[0];

                    if (
                        entry.isIntersecting &&
                        !loading &&
                        hasMore
                    ) {
                        const nextPage =
                            page + 1;

                        setPage(
                            nextPage,
                        );

                        loadOrders(
                            nextPage,
                        );
                    }
                },
                {
                    rootMargin:
                        "300px",
                },
            );

        observer.observe(loader);

        return () => {
            observer.disconnect();
        };
    }, [
        page,
        loading,
        hasMore,
    ]);

    return (
        <main className="p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div>
                    <Link
                        href="/admin"
                        className="text-sm underline"
                    >
                        ← Admin
                    </Link>

                    <h1 className="mt-4 text-3xl font-medium">
                        Pedidos
                    </h1>

                    <p className="mt-1 text-sm">
                        Gerencie os pedidos da loja.
                    </p>
                </div>

                {orders.length === 0 &&
                    !loading && (
                        <p className="text-sm">
                            Nenhum pedido encontrado.
                        </p>
                    )}

                <div className="grid gap-4">
                    {orders.map(
                        (order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onShippedChange={
                                    handleShippedChange
                                }
                            />
                        ),
                    )}
                </div>

                {loading && (
                    <div className="py-8 text-center text-sm">
                        Carregando pedidos...
                    </div>
                )}

                {hasMore && (
                    <div
                        ref={loaderRef}
                        className="h-10"
                    />
                )}

                {!hasMore &&
                    orders.length > 0 && (
                        <div className="py-8 text-center text-sm">
                            Todos os pedidos foram carregados.
                        </div>
                    )}
            </div>
        </main>
    );
}