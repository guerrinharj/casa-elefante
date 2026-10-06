"use client";

import Link from "next/link";

import {
    useCart,
} from "@/components/cart/cart-provider";

import {
    useState,
} from "react";


export default function CartPage() {
    const {
        items,
        subtotal,
        coupon,
        discountAmount,
        discountedSubtotal,
        couponLoading,
        couponError,
        applyCoupon,
        removeCoupon,
        removeItem,
        updateQuantity,
        clearCart
    } = useCart();

    const [
        couponCode,
        setCouponCode,
    ] = useState(
        coupon?.code ?? "",
    );

    async function handleApplyCoupon() {
        const applied =
            await applyCoupon(
                couponCode,
            );

        if (applied) {
            setCouponCode(
                couponCode
                    .trim()
                    .toUpperCase(),
            );
        }
    }

    if (items.length === 0) {
        return (
            <main className="p-4 md:p-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="font-windsor text-4xl font-bold">
                        Carrinho
                    </h1>

                    <p className="mt-8 mb-8">
                        Seu carrinho está vazio.
                    </p>

                    <Link
                        href="/"
                        className="
                            mt-20
                            rounded-xl
                            border
                            border-black
                            bg-white
                            px-4
                            py-2
                            text-sm
                            shadow-[4px_4px_0_0_#000]
                            transition-all
                            duration-200
                            ease-out
                            hover:-translate-x-1
                            hover:-translate-y-1
                            hover:shadow-[7px_7px_0_0_#000]
                        "
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
                <h1 className="font-windsor text-4xl font-bold">
                    Carrinho
                </h1>

                <div className="mt-8 flex flex-col gap-6">
                    {items.map(
                        (
                            item,
                            index,
                        ) => {
                            const isAtMinimum =
                                item.quantity <=
                                1;

                            const isAtMaximum =
                                item.quantity >=
                                item.stock;

                            return (
                                <div
                                    key={
                                        item.id
                                    }
                                    className="animate-cart-item grid grid-cols-[100px_1fr] gap-4 border-b border-black pb-6 opacity-0 md:grid-cols-[120px_1fr_auto]"
                                    style={{
                                        animationDelay: `${index * 70}ms`,
                                    }}
                                >
                                    <div className="aspect-square rounded-xl border border-black bg-white p-2 shadow-[6px_6px_0_0_#000]">
                                        <div className="h-full w-full overflow-hidden">
                                            {item.image ? (
                                                <img
                                                    src={
                                                        item.image
                                                    }
                                                    alt={
                                                        item.name
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs">
                                                    Sem
                                                    imagem
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <Link
                                                href={`/produtos/${item.slug}`}
                                                className="font-windsor text-2xl font-bold"
                                            >
                                                {
                                                    item.name
                                                }
                                            </Link>

                                            <p className="mt-1">
                                                {
                                                    item.artist
                                                }
                                            </p>

                                            <p className="mt-2">
                                                {item.price.toLocaleString(
                                                    "pt-BR",
                                                    {
                                                        style: "currency",
                                                        currency:
                                                            "BRL",
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
                                                disabled={
                                                    isAtMinimum
                                                }
                                                className="
                                                    px-3
                                                    py-2
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-30
                                                "
                                            >
                                                −
                                            </button>

                                            <span className="min-w-10 text-center">
                                                {
                                                    item.quantity
                                                }
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
                                                disabled={
                                                    isAtMaximum
                                                }
                                                className="
                                                    px-3
                                                    py-2
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-30
                                                "
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="mt-4 text-right">
                                            <p className="text-lg">
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
                                </div>
                            );
                        },
                    )}
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
                                    currency:
                                        "BRL",
                                },
                            )}
                        </span>
                    </div>

                    {coupon && (
                        <div className="flex justify-between">
                            <span>
                                Cupom {coupon.code}
                            </span>

                            <span>
                                -{" "}
                                {discountAmount.toLocaleString(
                                    "pt-BR",
                                    {
                                        style: "currency",
                                        currency:
                                            "BRL",
                                    },
                                )}
                            </span>
                        </div>
                    )}

                    <div className="border-t border-black pt-6">
                        <p className="mb-3 text-sm">
                            Cupom de desconto
                        </p>

                        {!coupon ? (
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(event) =>
                                        setCouponCode(
                                            event.target.value.toUpperCase(),
                                        )
                                    }
                                    onKeyDown={(event) => {
                                        if (
                                            event.key ===
                                            "Enter"
                                        ) {
                                            event.preventDefault();

                                            void handleApplyCoupon();
                                        }
                                    }}
                                    placeholder="CÓDIGO"
                                    disabled={
                                        couponLoading
                                    }
                                    className="min-w-0 flex-1 border border-black bg-transparent px-3 py-2 uppercase outline-none"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        void handleApplyCoupon()
                                    }
                                    disabled={
                                        couponLoading ||
                                        !couponCode.trim()
                                    }
                                    className="border border-black px-4 py-2 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {couponLoading
                                        ? "Aplicando..."
                                        : "Aplicar"}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium">
                                        {coupon.code}
                                    </p>

                                    <p className="text-sm opacity-60">
                                        Cupom aplicado
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        removeCoupon();
                                        setCouponCode("");
                                    }}
                                    className="text-sm underline transition-opacity hover:opacity-60"
                                >
                                    Remover
                                </button>
                            </div>
                        )}

                        {couponError && (
                            <p className="mt-3 text-sm text-red-600">
                                {couponError}
                            </p>
                        )}
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

                <button
                    type="button"
                    onClick={
                        clearCart
                    }
                    className="
                        rounded-xl
                        border
                        border-black
                        bg-white
                        px-4
                        py-2
                        text-sm
                        uppercase
                        shadow-[4px_4px_0_0_#000]
                        transition-all
                        duration-200
                        ease-out
                        hover:-translate-x-1
                        hover:-translate-y-1
                        hover:shadow-[7px_7px_0_0_#000]
                    "
                >
                    Limpar carrinho
                </button>
            </div>
        </main>
    );
}