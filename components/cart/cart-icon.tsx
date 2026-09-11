"use client";

import Link from "next/link";

import {
    useEffect,
    useState,
} from "react";

import { useCart } from "@/components/cart/cart-provider";

export function CartIcon() {
    const {
        items,
    } = useCart();

    const [mounted, setMounted] =
        useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const itemCount = items.reduce(
        (total, item) => {
            return total + item.quantity;
        },
        0,
    );

    return (
        <Link
            href="/carrinho"
            className="flex items-center gap-1"
            aria-label="Carrinho"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <circle
                    cx="9"
                    cy="20"
                    r="1"
                />

                <circle
                    cx="19"
                    cy="20"
                    r="1"
                />

                <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" />
            </svg>

            {mounted && itemCount > 0 && (
                <p className="text-sm">
                    {itemCount}
                </p>
            )}
        </Link>
    );
}