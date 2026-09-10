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

    /*
     * Produto sem estoque.
     */

    const soldOut =
        product.stock <= 0;

    /*
     * Adiciona o produto
     * ao carrinho.
     */

    function handleAddToCart() {
        if (soldOut) {
            return;
        }

        addItem(
            product,
        );

        router.push(
            "/carrinho",
        );
    }

    return (
        <button
            type="button"
            onClick={
                handleAddToCart
            }
            disabled={
                soldOut
            }
            className="w-full border border-black px-6 py-4 uppercase transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-black"
        >
            {soldOut
                ? "Esgotado"
                : "Adicionar ao carrinho"}
        </button>
    );
}