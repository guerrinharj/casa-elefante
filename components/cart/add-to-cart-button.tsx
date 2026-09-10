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
    const router = useRouter();
    const { addItem } = useCart();

    function handleAddToCart() {
        addItem(product);

        router.push("/carrinho");
    }

    return (
        <button
            type="button"
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
            className="border border-black px-6 py-3 uppercase transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
            Adicionar ao carrinho
        </button>
    );
}