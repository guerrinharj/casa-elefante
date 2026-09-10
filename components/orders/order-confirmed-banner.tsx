"use client";

import { useEffect, useState } from "react";

import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

export function OrderConfirmedBanner() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const confirmed =
        searchParams.get("pedido") ===
        "confirmado";

    const [visible, setVisible] =
        useState(confirmed);

    useEffect(() => {
        if (!confirmed) {
            return;
        }

        setVisible(true);

        const timeout =
            window.setTimeout(() => {
                setVisible(false);

                const params =
                    new URLSearchParams(
                        searchParams.toString(),
                    );

                params.delete("pedido");

                const query =
                    params.toString();

                router.replace(
                    query
                        ? `${pathname}?${query}`
                        : pathname,
                    {
                        scroll: false,
                    },
                );
            }, 5000);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [
        confirmed,
        pathname,
        router,
        searchParams,
    ]);

    if (!visible) {
        return null;
    }

    return (
        <div className="bg-green-600 px-4 py-4 text-center text-white">
            <p className="font-medium">
                Seu pedido foi confirmado!
            </p>
        </div>
    );
}