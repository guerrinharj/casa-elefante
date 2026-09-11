"use client";

import Link from "next/link";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Order,
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
                                (
                                    order,
                                ) =>
                                    order.id,
                            ),
                        );

                    const uniqueOrders =
                        newOrders.filter(
                            (
                                order,
                            ) =>
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
            loadingRef.current =
                false;

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

            /*
             * Como esta página mostra somente
             * pedidos enviados, se shipped
             * virar false removemos o card.
             */
            if (!shipped) {
                setOrders(
                    (
                        currentOrders,
                    ) =>
                        currentOrders.filter(
                            (
                                order,
                            ) =>
                                order.id !==
                                orderId,
                        ),
                );

                return;
            }

            setOrders(
                (
                    currentOrders,
                ) =>
                    currentOrders.map(
                        (
                            order,
                        ) =>
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
        <main className="p-6">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
                {/*
                 * Cabeçalho.
                 */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="text-3xl font-medium">
                            Pedidos enviados
                        </h1>

                        <p className="mt-1 text-sm">
                            Pedidos que já foram enviados.
                        </p>
                    </div>

                    <Link
                        href="/admin/pedidos"
                        className="text-sm hover:underline"
                    >
                        Ver pedidos pendentes
                    </Link>
                </div>

                {/*
                 * Lista de pedidos.
                 */}
                <div className="flex flex-col gap-4">
                    {orders.map(
                        (order) => (
                            <OrderCard
                                key={
                                    order.id
                                }
                                order={
                                    order
                                }
                                onShippedChange={
                                    handleShippedChange
                                }
                            />
                        ),
                    )}
                </div>

                {/*
                 * Estado vazio.
                 */}
                {!loading &&
                    orders.length ===
                        0 && (
                        <div className="border border-black p-6">
                            <p className="text-sm">
                                Nenhum pedido enviado.
                            </p>
                        </div>
                    )}

                {/*
                 * Elemento observado pelo
                 * IntersectionObserver.
                 */}
                {hasMore && (
                    <div
                        ref={
                            loaderRef
                        }
                        className="flex min-h-16 items-center justify-center"
                    >
                        {loading && (
                            <p className="text-sm">
                                Carregando...
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}