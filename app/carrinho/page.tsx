
"use client";

import Link from "next/link";

import {
    useState,
} from "react";

import {
    useCart,
} from "@/components/cart/cart-provider";

function formatPrice(value: number) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

const boxStyle = `
    rounded-xl
    border
    border-black
    bg-white
    text-black
    shadow-[-5px_5px_0_0_#000]
`;

const buttonStyle = `
    rounded-xl
    border
    border-black
    bg-white
    text-black
    shadow-[-4px_4px_0_0_#000]
    transition-all
    duration-200
    ease-out
    hover:-translate-x-1
    hover:-translate-y-1
    hover:shadow-[-7px_7px_0_0_#000]
    disabled:cursor-not-allowed
    disabled:opacity-40
    disabled:hover:translate-x-0
    disabled:hover:translate-y-0
`;

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
        clearCart,
    } = useCart();

    const [
        couponCode,
        setCouponCode,
    ] = useState(
        coupon?.code ?? "",
    );

    async function handleApplyCoupon() {
        const applied = await applyCoupon(
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
                    <h1 className="font-october text-5xl font-bold uppercase text-black md:text-6xl">
                        Carrinho
                    </h1>

                    <div
                        className={`
                            mt-8
                            flex
                            flex-col
                            items-start
                            gap-6
                            p-6
                            md:p-8
                            ${boxStyle}
                        `}
                    >
                        <h2 className="font-october text-3xl font-bold uppercase">
                            Seu carrinho está vazio
                        </h2>

                        <p className="text-sm">
                            Você ainda não adicionou nenhum produto ao carrinho.
                        </p>

                        <Link
                            href="/"
                            className={`
                                inline-block
                                px-5
                                py-3
                                text-sm
                                uppercase
                                ${buttonStyle}
                            `}
                        >
                            Continuar comprando
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="p-4 md:p-6">
            <div className="mx-auto max-w-5xl">
                <h1 className="font-october text-5xl font-bold uppercase text-black md:text-6xl">
                    Carrinho
                </h1>

                <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                    {/* PRODUTOS */}

                    <div className="flex flex-col gap-6">
                        {items.map(
                            (
                                item,
                                index,
                            ) => {
                                const isAtMinimum =
                                    item.quantity <= 1;

                                const isAtMaximum =
                                    item.quantity >= item.stock;

                                return (
                                    <div
                                        key={item.id}
                                        className={`
                                            animate-cart-item
                                            flex
                                            flex-col
                                            gap-5
                                            p-4
                                            opacity-0
                                            md:p-5
                                            ${boxStyle}
                                        `}
                                        style={{
                                            animationDelay: `${index * 70}ms`,
                                        }}
                                    >
                                        {/* IMAGEM E INFORMAÇÕES */}

                                        <div className="grid grid-cols-[100px_minmax(0,1fr)] gap-4 md:grid-cols-[140px_minmax(0,1fr)]">
                                            <Link
                                                href={`/produtos/${item.slug}`}
                                                className="aspect-square overflow-hidden rounded-lg border border-black bg-white"
                                            >
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center p-2 text-center text-xs">
                                                        Sem imagem
                                                    </div>
                                                )}
                                            </Link>

                                            <div className="flex min-w-0 flex-col gap-2">
                                                <Link
                                                    href={`/produtos/${item.slug}`}
                                                    className="font-october text-3xl font-bold uppercase leading-none transition-opacity hover:opacity-60 md:text-4xl"
                                                >
                                                    {item.name}
                                                </Link>

                                                <p className="text-sm md:text-base">
                                                    {item.artist}
                                                </p>

                                                <p className="mt-1 text-lg font-medium">
                                                    {formatPrice(item.price)}
                                                </p>

                                                <p className="text-xs opacity-60">
                                                    Preço por unidade
                                                </p>
                                            </div>
                                        </div>

                                        {/* QUANTIDADE E TOTAL */}

                                        <div className="border-t border-black/20 pt-4">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-xs font-medium uppercase">
                                                        Quantidade
                                                    </span>

                                                    <div
                                                        className={`
                                                            flex
                                                            w-fit
                                                            items-center
                                                            overflow-hidden
                                                            rounded-lg
                                                            border
                                                            border-black
                                                            bg-white
                                                            shadow-[-3px_3px_0_0_#000]
                                                        `}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    item.quantity - 1,
                                                                )
                                                            }
                                                            disabled={isAtMinimum}
                                                            className="
                                                                px-4
                                                                py-2
                                                                text-lg
                                                                transition-colors
                                                                hover:bg-[#FFFDE9]
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-30
                                                            "
                                                        >
                                                            −
                                                        </button>

                                                        <span className="min-w-10 text-center text-sm font-medium">
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    item.quantity + 1,
                                                                )
                                                            }
                                                            disabled={isAtMaximum}
                                                            className="
                                                                px-4
                                                                py-2
                                                                text-lg
                                                                transition-colors
                                                                hover:bg-[#FFFDE9]
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-30
                                                            "
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs font-medium uppercase">
                                                        Total
                                                    </p>

                                                    <p className="mt-2 text-xl font-medium">
                                                        {formatPrice(
                                                            item.price *
                                                            item.quantity,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* REMOVER PRODUTO */}

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(item.id)
                                                }
                                                className={`
                                                    px-4
                                                    py-2
                                                    text-xs
                                                    uppercase
                                                    ${buttonStyle}
                                                `}
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                );
                            },
                        )}

                        {/* AÇÕES DO CARRINHO */}

                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <Link
                                href="/"
                                className={`
                                    px-4
                                    py-3
                                    text-xs
                                    uppercase
                                    ${buttonStyle}
                                `}
                            >
                                Continuar comprando
                            </Link>

                            <button
                                type="button"
                                onClick={clearCart}
                                className={`
                                    px-4
                                    py-3
                                    text-xs
                                    uppercase
                                    ${buttonStyle}
                                `}
                            >
                                Limpar carrinho
                            </button>
                        </div>
                    </div>

                    {/* RESUMO DO PEDIDO */}

                    <div className="flex flex-col gap-6">
                        <div
                            className={`
                                flex
                                flex-col
                                gap-5
                                p-5
                                md:p-6
                                ${boxStyle}
                            `}
                        >
                            <h2 className="font-october text-3xl font-bold uppercase leading-none">
                                Resumo do pedido
                            </h2>

                            {/* SUBTOTAL */}

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm uppercase">
                                    Subtotal
                                </span>

                                <span className="text-base font-medium">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>

                            {/* DESCONTO */}

                            {coupon && (
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm">
                                        Cupom {coupon.code}
                                    </span>

                                    <span className="text-sm font-medium">
                                        - {formatPrice(discountAmount)}
                                    </span>
                                </div>
                            )}

                            {/* CUPOM */}

                            <div className="border-t border-black/20 pt-5">
                                <p className="mb-3 text-sm font-medium uppercase">
                                    Cupom de desconto
                                </p>

                                {!coupon ? (
                                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(event) =>
                                                setCouponCode(
                                                    event.target.value.toUpperCase(),
                                                )
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();

                                                    void handleApplyCoupon();
                                                }
                                            }}
                                            placeholder="CÓDIGO"
                                            disabled={couponLoading}
                                            className="
                                                min-w-0
                                                flex-1
                                                rounded-lg
                                                border
                                                border-black
                                                bg-white
                                                px-3
                                                py-3
                                                text-sm
                                                uppercase
                                                text-black
                                                shadow-[-3px_3px_0_0_#000]
                                                outline-none
                                                placeholder:text-black/40
                                                disabled:opacity-40
                                            "
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
                                            className={`
                                                px-4
                                                py-3
                                                text-sm
                                                uppercase
                                                ${buttonStyle}
                                            `}
                                        >
                                            {couponLoading
                                                ? "Aplicando..."
                                                : "Aplicar"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium">
                                                {coupon.code}
                                            </p>

                                            <p className="mt-1 text-xs opacity-60">
                                                Cupom aplicado
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                removeCoupon();
                                                setCouponCode("");
                                            }}
                                            className={`
                                                px-3
                                                py-2
                                                text-xs
                                                uppercase
                                                ${buttonStyle}
                                            `}
                                        >
                                            Remover
                                        </button>
                                    </div>
                                )}

                                {couponError && (
                                    <p className="mt-4 text-sm text-red-600">
                                        {couponError}
                                    </p>
                                )}
                            </div>

                            {/* TOTAL */}

                            <div className="border-t border-black pt-5">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="font-october text-2xl font-bold uppercase">
                                        Total
                                    </span>

                                    <span className="text-xl font-semibold">
                                        {formatPrice(discountedSubtotal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* FINALIZAR COMPRA */}

                        <Link
                            href="/checkout"
                            className={`
                                block
                                px-6
                                py-5
                                text-center
                                text-sm
                                font-semibold
                                uppercase
                                ${buttonStyle}
                            `}
                        >
                            Finalizar compra ↗
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
