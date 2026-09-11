"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";

export default function CartPage() {
    const {
        items,
        removeItem,
        updateQuantity,
        subtotal,
    } = useCart();

    if (items.length === 0) {
        return (
            <main className="p-4 md:p-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-4xl font-bold uppercase">
                        Carrinho
                    </h1>

                    <p className="mt-8">
                        Seu carrinho está vazio.
                    </p>

                    <Link
                        href="/"
                        className="mt-6 inline-block border border-black px-6 py-3 uppercase transition-colors hover:bg-black hover:text-white"
                    >
                        Continuar comprando
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="p-4 md:p-6">
            <div className="mx-auto max-w-5xl">
                <h1 className="font-grotesque text-4xl font-bold uppercase">
                    Carrinho
                </h1>

                <div className="mt-8 flex flex-col gap-6">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className="animate-cart-item opacity-0 grid grid-cols-[100px_1fr] gap-4 border-b border-black pb-6 md:grid-cols-[120px_1fr_auto]"
                            style={{
                                animationDelay: `${index * 70}ms`,
                            }}
                        >
                            <div className="aspect-square rounded-xl border border-black bg-white p-2 shadow-[6px_6px_0_0_#000]">
                                <div className="h-full w-full overflow-hidden">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs">
                                            Sem imagem
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col justify-between">
                                <div>
                                    <Link
                                        href={`/produtos/${item.slug}`}
                                        className="font-grotesque text-2xl font-bold uppercase"
                                    >
                                        {item.name}
                                    </Link>

                                    <p className="mt-1">
                                        {item.artist}
                                    </p>

                                    <p className="mt-2">
                                        {item.price.toLocaleString(
                                            "pt-BR",
                                            {
                                                style: "currency",
                                                currency: "BRL",
                                            },
                                        )}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeItem(
                                            item.id,
                                        )
                                    }
                                    className="mt-4 w-fit text-sm underline"
                                >
                                    Remover
                                </button>
                            </div>

                            <div className="col-span-2 flex items-center justify-between md:col-span-1 md:flex-col md:items-end">
                                <div className="flex items-center border border-black">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQuantity(
                                                item.id,
                                                item.quantity -
                                                    1,
                                            )
                                        }
                                        className="px-3 py-2"
                                    >
                                        −
                                    </button>

                                    <span className="min-w-10 text-center">
                                        {item.quantity}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQuantity(
                                                item.id,
                                                item.quantity +
                                                    1,
                                            )
                                        }
                                        className="px-3 py-2"
                                    >
                                        +
                                    </button>
                                </div>

                                <p className="mt-4 text-lg">
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
                    ))}
                </div>

                <div className="mt-8 ml-auto max-w-sm">
                    <div className="flex items-center justify-between border-b border-black pb-4">
                        <span className="uppercase">
                            Subtotal
                        </span>

                        <span className="text-xl">
                            {subtotal.toLocaleString(
                                "pt-BR",
                                {
                                    style: "currency",
                                    currency: "BRL",
                                },
                            )}
                        </span>
                    </div>

                    <Link
                        href="/checkout"
                        className="
                            mt-6
                            block
                            rounded-xl
                            border
                            border-black
                            bg-white
                            px-6
                            py-4
                            text-center
                            uppercase
                            shadow-[6px_6px_0_0_#000]
                            transition-all
                            duration-200
                            ease-out
                            hover:-translate-x-1
                            hover:-translate-y-1
                            hover:shadow-[10px_10px_0_0_#000]
                        "
                    >
                        Finalizar compra
                    </Link>
                </div>
            </div>
        </main>
    );
}