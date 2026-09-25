"use client";

import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";

type AddToCartButtonProps = {
    product: {
        id: string;
        name: string;
        slug: string;
        artist: string;
        price: number;
        image?: string;
        stock: number;
        minimumQuantity?: number;
    };
};

export function AddToCartButton({
    product,
}: AddToCartButtonProps) {
    const router =
        useRouter();

    const {
        addItem,
    } = useCart();

    const minimumQuantity =
        product.minimumQuantity ?? 1;

    /*
     * Produto completamente
     * sem estoque.
     */
    const soldOut =
        product.stock <= 0;

    /*
     * Existe estoque, mas não
     * o suficiente para atingir
     * a quantidade mínima.
     *
     * Exemplo atacado:
     * estoque = 1
     * mínimo = 2
     */
    const unavailableForMinimumQuantity =
        !soldOut &&
        product.stock <
            minimumQuantity;

    const unavailable =
        soldOut ||
        unavailableForMinimumQuantity;

    /*
     * Adiciona o produto
     * ao carrinho.
     */
    function handleAddToCart() {
        if (unavailable) {
            return;
        }

        addItem(
            product,
        );

        router.push(
            "/carrinho",
        );
    }

    function getButtonLabel() {
        if (soldOut) {
            return "Esgotado";
        }

        if (
            unavailableForMinimumQuantity
        ) {
            return "Indisponível para atacado";
        }

        return "Adicionar ao carrinho";
    }

    return (
        <button
            type="button"
            onClick={
                handleAddToCart
            }
            disabled={
                unavailable
            }
            className="
                w-full
                rounded-xl
                border
                border-black
                bg-white
                px-6
                py-4
                uppercase
                shadow-[6px_6px_0_0_#000]
                transition-all
                duration-200
                ease-out
                hover:-translate-x-1
                hover:-translate-y-1
                hover:shadow-[10px_10px_0_0_#000]
                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:hover:translate-x-0
                disabled:hover:translate-y-0
                disabled:hover:shadow-[6px_6px_0_0_#000]
            "
        >
            {getButtonLabel()}
        </button>
    );
}