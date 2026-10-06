"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    validateCoupon,
} from "@/app/checkout/coupon-actions";

type CartProduct = {
    id: string;
    name: string;
    slug: string;
    artist: string;
    price: number;
    image?: string;
    stock: number;
};

export type CartItem = CartProduct & {
    quantity: number;
};

export type AppliedCoupon = {
    id: string;
    code: string;
    discountAmount: number;
};

type CartContextType = {
    items: CartItem[];

    addItem: (
        product: CartProduct,
    ) => void;

    removeItem: (
        productId: string,
    ) => void;

    updateQuantity: (
        productId: string,
        quantity: number,
    ) => void;

    clearCart: () => void;

    totalItems: number;

    subtotal: number;

    coupon: AppliedCoupon | null;

    discountAmount: number;

    discountedSubtotal: number;

    couponLoading: boolean;

    couponError: string | null;

    applyCoupon: (
        code: string,
    ) => Promise<boolean>;

    removeCoupon: () => void;
};

const CartContext =
    createContext<
        CartContextType | undefined
    >(undefined);

const STORAGE_KEY =
    "casa-elefante-cart";

const COUPON_STORAGE_KEY =
    "casa-elefante-coupon";

export function CartProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [
        items,
        setItems,
    ] = useState<CartItem[]>([]);

    const [
        coupon,
        setCoupon,
    ] =
        useState<AppliedCoupon | null>(
            null,
        );

    const [
        couponLoading,
        setCouponLoading,
    ] = useState(false);

    const [
        couponError,
        setCouponError,
    ] = useState<
        string | null
    >(null);

    const [
        loaded,
        setLoaded,
    ] = useState(false);

    /*
     * Carrega carrinho
     * e cupom do localStorage.
     */

    useEffect(() => {
        const storedCart =
            localStorage.getItem(
                STORAGE_KEY,
            );

        if (storedCart) {
            try {
                const parsedCart =
                    JSON.parse(
                        storedCart,
                    );

                if (
                    Array.isArray(
                        parsedCart,
                    )
                ) {
                    const normalizedCart =
                        parsedCart.map(
                            (item) => {
                                const stock =
                                    Math.max(
                                        0,
                                        Number(
                                            item.stock,
                                        ) || 0,
                                    );

                                const quantity =
                                    stock > 0
                                        ? Math.max(
                                              1,
                                              Math.min(
                                                  Number(
                                                      item.quantity,
                                                  ) ||
                                                      1,
                                                  stock,
                                              ),
                                          )
                                        : 1;

                                const {
                                    minimumQuantity:
                                        _minimumQuantity,
                                    ...cartItem
                                } =
                                    item;

                                return {
                                    ...cartItem,
                                    stock,
                                    quantity,
                                };
                            },
                        );

                    setItems(
                        normalizedCart,
                    );
                }
            } catch {
                localStorage.removeItem(
                    STORAGE_KEY,
                );
            }
        }

        const storedCoupon =
            localStorage.getItem(
                COUPON_STORAGE_KEY,
            );

        if (storedCoupon) {
            try {
                const parsedCoupon =
                    JSON.parse(
                        storedCoupon,
                    );

                if (
                    parsedCoupon &&
                    typeof parsedCoupon.code ===
                        "string"
                ) {
                    setCoupon(
                        parsedCoupon,
                    );
                }
            } catch {
                localStorage.removeItem(
                    COUPON_STORAGE_KEY,
                );
            }
        }

        setLoaded(true);
    }, []);

    /*
     * Salva carrinho.
     */

    useEffect(() => {
        if (!loaded) {
            return;
        }

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                items,
            ),
        );
    }, [
        items,
        loaded,
    ]);

    /*
     * Salva cupom.
     */

    useEffect(() => {
        if (!loaded) {
            return;
        }

        if (coupon) {
            localStorage.setItem(
                COUPON_STORAGE_KEY,
                JSON.stringify(
                    coupon,
                ),
            );
        } else {
            localStorage.removeItem(
                COUPON_STORAGE_KEY,
            );
        }
    }, [
        coupon,
        loaded,
    ]);

    function addItem(
        product: CartProduct,
    ) {
        setItems(
            (currentItems) => {
                const existingItem =
                    currentItems.find(
                        (item) =>
                            item.id ===
                            product.id,
                    );

                if (
                    existingItem
                ) {
                    return currentItems.map(
                        (item) => {
                            if (
                                item.id !==
                                product.id
                            ) {
                                return item;
                            }

                            return {
                                ...item,

                                price:
                                    product.price,

                                stock:
                                    product.stock,

                                quantity:
                                    Math.min(
                                        item.quantity +
                                            1,
                                        product.stock,
                                    ),
                            };
                        },
                    );
                }

                return [
                    ...currentItems,
                    {
                        ...product,
                        quantity: 1,
                    },
                ];
            },
        );
    }

    function removeItem(
        productId: string,
    ) {
        setItems(
            (currentItems) =>
                currentItems.filter(
                    (item) =>
                        item.id !==
                        productId,
                ),
        );
    }

    function updateQuantity(
        productId: string,
        quantity: number,
    ) {
        setItems(
            (currentItems) =>
                currentItems.map(
                    (item) => {
                        if (
                            item.id !==
                            productId
                        ) {
                            return item;
                        }

                        return {
                            ...item,

                            quantity:
                                Math.max(
                                    1,
                                    Math.min(
                                        quantity,
                                        item.stock,
                                    ),
                                ),
                        };
                    },
                ),
        );
    }

    function clearCart() {
        setItems([]);
        setCoupon(null);
        setCouponError(null);

        localStorage.removeItem(
            COUPON_STORAGE_KEY,
        );
    }

    const totalItems =
        items.reduce(
            (
                total,
                item,
            ) =>
                total +
                item.quantity,
            0,
        );

    const subtotal =
        items.reduce(
            (
                total,
                item,
            ) =>
                total +
                item.price *
                    item.quantity,
            0,
        );

    /*
     * Aplica e valida
     * um cupom no servidor.
     */

    async function applyCoupon(
        code: string,
    ) {
        const normalizedCode =
            code
                .trim()
                .toUpperCase();

        setCouponError(null);

        if (!normalizedCode) {
            setCouponError(
                "Informe um cupom.",
            );

            return false;
        }

        if (
            items.length === 0 ||
            subtotal <= 0
        ) {
            setCouponError(
                "Seu carrinho está vazio.",
            );

            return false;
        }

        setCouponLoading(true);

        try {
            const result =
                await validateCoupon(
                    {
                        code:
                            normalizedCode,
                        subtotal,
                    },
                );

            if (!result.success) {
                setCoupon(null);

                setCouponError(
                    result.error,
                );

                return false;
            }

            setCoupon(
                result.coupon,
            );

            setCouponError(null);

            return true;
        } catch (error) {
            console.error(
                "Erro ao aplicar cupom:",
                error,
            );

            setCoupon(null);

            setCouponError(
                "Não foi possível validar o cupom.",
            );

            return false;
        } finally {
            setCouponLoading(
                false,
            );
        }
    }

    function removeCoupon() {
        setCoupon(null);

        setCouponError(null);

        localStorage.removeItem(
            COUPON_STORAGE_KEY,
        );
    }

    /*
     * O desconto nunca pode
     * ultrapassar o subtotal.
     */

    const discountAmount =
        coupon
            ? Math.min(
                  coupon.discountAmount,
                  subtotal,
              )
            : 0;

    const discountedSubtotal =
        Math.max(
            0,
            subtotal -
                discountAmount,
        );

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                subtotal,

                coupon,
                discountAmount,
                discountedSubtotal,
                couponLoading,
                couponError,
                applyCoupon,
                removeCoupon,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context =
        useContext(
            CartContext,
        );

    if (!context) {
        throw new Error(
            "useCart deve ser usado dentro de CartProvider",
        );
    }

    return context;
}