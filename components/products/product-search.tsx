"use client";

import { useEffect, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ProductSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get("search") ?? "";

    const [search, setSearch] = useState(currentSearch);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (search.trim()) {
                params.set("search", search.trim());
            } else {
                params.delete("search");
            }

            router.replace(
                `${pathname}?${params.toString()}`,
                {
                    scroll: false,
                },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [
        search,
        pathname,
        router,
        searchParams,
    ]);

    return (
        <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar"
            className="
                w-48
                border-b
                border-black
                bg-transparent
                py-1
                text-sm
                outline-none
                placeholder:text-black/40
                md:w-64
            "
        />
    );
}