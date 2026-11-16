
"use client";

import Link from "next/link";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    type Order,
    OrderCard,
} from "@/components/admin/order-card";

const ORDERS_PER_PAGE = 20;

export default function AdminShippedOrdersPage() {
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

    const loadingRef =
        useRef(false);

    /*
     * Carrega uma página de pedidos enviados.
     */
    async function loadOrders(
        pageToLoad: number,
    ) {
        if (loadingRef.current) {
            return;
        }

        loadingRef.current = true;
        setLoading(true);

        try {
            const response =
                await fetch(
                    `/api/admin/orders?page=${pageToLoad}&shipped=true`,
                );

            if (!response.ok) {
                throw new Error(
                    "Erro ao carregar pedidos enviados.",
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
                data.hasMore ??
                    newOrders.length ===
                        ORDERS_PER_PAGE,
            );
        } catch (error) {
            console.error(
                "Erro ao carregar pedidos enviados:",
                error,
            );

            setHasMore(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }

    /*
     * Carrega a primeira página.
     */
    useEffect(() => {
        loadOrders(0);
    }, []);

    /*
     * Infinite scroll.
     */
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
                        !entry.isIntersecting ||
                        loadingRef.current ||
                        !hasMore
                    ) {
                        return;
                    }

                    const nextPage =
                        page + 1;

                    setPage(
                        nextPage,
                    );

                    loadOrders(
                        nextPage,
                    );
                },
                {
                    rootMargin:
                        "300px",
                },
            );

        observer.observe(
            loader,
        );

        return () => {
            observer.disconnect();
        };
    }, [
        page,
        hasMore,
    ]);

    /*
     * Permite desfazer o envio.
     *
     * Se o pedido for marcado novamente
     * como não enviado, ele desaparece
     * desta página.
     */
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

            if (!shipped) {
                setOrders(
                    (currentOrders) =>
                        currentOrders.filter(
                            (order) =>
                                order.id !==
                                orderId,
                        ),
                );

                return;
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

    return (
        <main className="min-h-screen p-6 md:p-10">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="font-october text-5xl uppercase leading-none text-black md:text-6xl">
                            Pedidos enviados
                        </h1>

                        <p className="mt-3 text-sm text-black/70 md:text-base">
                            Pedidos que já foram enviados.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/admin"
                            className="inline-flex w-fit shrink-0 items-center justify-center rounded-xl border border-black bg-white px-6 py-3 text-xl  leading-none text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]"
                        >
                            ← Admin
                        </Link>

                        <Link
                            href="/admin/pedidos"
                            className="inline-flex w-fit shrink-0 items-center justify-center rounded-xl border border-black bg-white px-6 py-3  text-xl  leading-none text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000]"
                        >
                            Ver pedidos pendentes
                        </Link>
                    </div>
                </div>

                <div className="border-t border-black/20" />

                <div className="grid gap-6">
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

                {!loading &&
                    orders.length === 0 && (
                        <div className="rounded-xl border border-black bg-white p-6 shadow-[-5px_5px_0_0_#000]">
                            <p className="font-october text-2xl uppercase leading-none text-black">
                                Nenhum pedido enviado.
                            </p>
                        </div>
                    )}

                {loading && (
                    <div className="py-8 text-center font-october text-xl uppercase leading-none text-black/70">
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
                        <div className="py-8 text-center font-october text-xl uppercase leading-none text-black/70">
                            Todos os pedidos enviados foram carregados.
                        </div>
                    )}
            </div>
        </main>
    );
}
