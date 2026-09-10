"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

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

type CartContextType = {
    items: CartItem[];
    addItem: (product: CartProduct) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (
        productId: string,
        quantity: number,
    ) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
};

const CartContext = createContext<
    CartContextType | undefined
>(undefined);

const STORAGE_KEY = "casa-elefante-cart";

export function CartProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const storedCart =
            localStorage.getItem(STORAGE_KEY);

        if (storedCart) {
            try {
                const parsedCart =
                    JSON.parse(storedCart);

                setItems(parsedCart);
            } catch {
                localStorage.removeItem(
                    STORAGE_KEY,
                );
            }
        }

        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded) {
            return;
        }

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(items),
        );
    }, [items, loaded]);

    function addItem(product: CartProduct) {
        setItems((currentItems) => {
            const existingItem =
                currentItems.find(
                    (item) =>
                        item.id === product.id,
                );

            if (existingItem) {
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
                            quantity: Math.min(
                                item.quantity + 1,
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
        });
    }

    function removeItem(productId: string) {
        setItems((currentItems) =>
            currentItems.filter(
                (item) =>
                    item.id !== productId,
            ),
        );
    }

    function updateQuantity(
        productId: string,
        quantity: number,
    ) {
        setItems((currentItems) =>
            currentItems.map((item) => {
                if (
                    item.id !== productId
                ) {
                    return item;
                }

                return {
                    ...item,
                    quantity: Math.max(
                        1,
                        Math.min(
                            quantity,
                            item.stock,
                        ),
                    ),
                };
            }),
        );
    }

    function clearCart() {
        setItems([]);
    }

    const totalItems = items.reduce(
        (total, item) =>
            total + item.quantity,
        0,
    );

    const subtotal = items.reduce(
        (total, item) =>
            total +
            item.price * item.quantity,
        0,
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
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context =
        useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCart deve ser usado dentro de CartProvider",
        );
    }

    return context;
}