"use client";

import {
    FormEvent,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { createOrder } from "@/app/checkout/actions";
import { useCart } from "@/components/cart/cart-provider";

export function CheckoutForm() {
    const router = useRouter();

    const {
        items,
        subtotal,
        clearCart,
    } = useCart();

    const [name, setName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [error, setError] =
        useState<string | null>(
            null,
        );

    const [loading, setLoading] =
        useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (loading) {
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const result =
                await createOrder({
                    customerName:
                        name,
                    customerEmail:
                        email,
                    items: items.map(
                        (item) => ({
                            productId:
                                item.id,
                            quantity:
                                item.quantity,
                        }),
                    ),
                });

            if (!result.success) {
                setError(
                    result.error,
                );

                return;
            }

            clearCart();

            router.push("/");
            router.refresh();
            
        } catch (error) {
            console.error(error);

            setError(
                "Ocorreu um erro ao finalizar o pedido.",
            );
        } finally {
            setLoading(false);
        }
    }

    if (items.length === 0) {
        return (
            <div className="py-12">
                <p>
                    Seu carrinho está vazio.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        router.push("/")
                    }
                    className="mt-6 border border-black px-6 py-3 uppercase"
                >
                    Continuar comprando
                </button>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="grid gap-10 md:grid-cols-[1fr_400px]"
        >
            <div>
                <h2 className="font-grotesque text-2xl font-bold uppercase">
                    Seus dados
                </h2>

                <div className="mt-6 flex flex-col gap-6">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm uppercase">
                            Nome
                        </span>

                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(
                                event,
                            ) =>
                                setName(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="border border-black bg-transparent px-4 py-3 outline-none"
                        />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm uppercase">
                            E-mail
                        </span>

                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(
                                event,
                            ) =>
                                setEmail(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="border border-black bg-transparent px-4 py-3 outline-none"
                        />
                    </label>
                </div>
            </div>

            <div>
                <h2 className="font-grotesque text-2xl font-bold uppercase">
                    Pedido
                </h2>

                <div className="mt-6 flex flex-col">
                    {items.map(
                        (item) => (
                            <div
                                key={
                                    item.id
                                }
                                className="flex gap-4 border-b border-black py-4 first:pt-0"
                            >
                                <div className="h-20 w-20 shrink-0 overflow-hidden bg-neutral-100">
                                    {item.image && (
                                        <img
                                            src={
                                                item.image
                                            }
                                            alt={
                                                item.name
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>

                                <div className="flex flex-1 justify-between gap-4">
                                    <div>
                                        <p className="font-medium">
                                            {
                                                item.name
                                            }
                                        </p>

                                        <p className="text-sm">
                                            {
                                                item.artist
                                            }
                                        </p>

                                        <p className="mt-1 text-sm">
                                            Quantidade:{" "}
                                            {
                                                item.quantity
                                            }
                                        </p>
                                    </div>

                                    <p>
                                        {(
                                            item.price *
                                            item.quantity
                                        ).toLocaleString(
                                            "pt-BR",
                                            {
                                                style: "currency",
                                                currency:
                                                    "BRL",
                                            },
                                        )}
                                    </p>
                                </div>
                            </div>
                        ),
                    )}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    <div className="flex justify-between">
                        <span>
                            Subtotal
                        </span>

                        <span>
                            {subtotal.toLocaleString(
                                "pt-BR",
                                {
                                    style: "currency",
                                    currency:
                                        "BRL",
                                },
                            )}
                        </span>
                    </div>

                    <div className="flex justify-between">
                        <span>
                            Frete
                        </span>

                        <span>
                            Grátis
                        </span>
                    </div>

                    <div className="flex justify-between border-t border-black pt-4 text-xl">
                        <span>
                            Total
                        </span>

                        <span>
                            {subtotal.toLocaleString(
                                "pt-BR",
                                {
                                    style: "currency",
                                    currency:
                                        "BRL",
                                },
                            )}
                        </span>
                    </div>
                </div>

                {error && (
                    <p className="mt-6 text-sm">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full border border-black px-6 py-4 uppercase transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Criando pedido..."
                        : "Finalizar pedido"}
                </button>

                <p className="mt-3 text-xs">
                    Pagamento temporariamente em modo de teste.
                </p>
            </div>
        </form>
    );
}