
"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";

import {
    ChevronRight,
    Search,
    X,
} from "lucide-react";

export function ProductSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSearch =
        searchParams.get("search") ?? "";

    const [search, setSearch] = useState(
        currentSearch,
    );

    const [expanded, setExpanded] = useState(
        Boolean(currentSearch),
    );

    const inputRef = useRef<HTMLInputElement>(null);

    /*
     * Sincroniza a pesquisa com a URL.
     */
    useEffect(() => {
        setSearch(currentSearch);
    }, [currentSearch]);

    /*
     * Foca o campo ao expandir.
     */
    useEffect(() => {
        if (expanded) {
            inputRef.current?.focus();
        }
    }, [expanded]);

    /*
     * Busca com debounce de 300ms.
     * Preserva os filtros existentes.
     */
    useEffect(() => {
        if (search.trim() === currentSearch) {
            return;
        }

        const timeout = setTimeout(() => {
            const params = new URLSearchParams(
                searchParams.toString(),
            );

            if (search.trim()) {
                params.set(
                    "search",
                    search.trim(),
                );
            } else {
                params.delete("search");
            }

            const query = params.toString();

            router.replace(
                query
                    ? `${pathname}?${query}`
                    : pathname,
                {
                    scroll: false,
                },
            );
        }, 300);

        return () => {
            clearTimeout(timeout);
        };
    }, [
        search,
        currentSearch,
        pathname,
        router,
        searchParams,
    ]);

    return (
        <div
            className={`
                ml-auto
                flex
                h-14
                max-w-full
                items-center
                overflow-hidden
                rounded-xl
                border
                border-black
                bg-white
                text-black
                shadow-[-5px_5px_0_0_#000]
                transition-[width]
                duration-300
                ease-in-out
                ${
                    expanded
                        ? "w-[min(320px,calc(100vw-48px))]"
                        : "w-14"
                }
            `}
        >
            {/* CAMPO DE PESQUISA */}

            <div
                className={`
                    flex
                    min-w-0
                    flex-1
                    items-center
                    gap-1
                    pl-3
                    transition-opacity
                    duration-200
                    ${
                        expanded
                            ? "opacity-100"
                            : "pointer-events-none opacity-0"
                    }
                `}
                aria-hidden={!expanded}
                inert={!expanded}
            >
                {/* RECOLHER */}

                <button
                    type="button"
                    onClick={() => {
                        setExpanded(false);
                    }}
                    aria-label="Recolher pesquisa"
                    title="Recolher pesquisa"
                    className="
                        flex
                        h-9
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        transition-colors
                        hover:bg-black/5
                    "
                >
                    <ChevronRight
                        size={20}
                        strokeWidth={2}
                    />
                </button>

                <input
                    ref={inputRef}
                    type="search"
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                    }}
                    placeholder="Pesquisar discos..."
                    aria-label="Pesquisar produtos"
                    className="
                        min-w-0
                        w-full
                        flex-1
                        bg-transparent
                        py-3
                        text-sm
                        text-black
                        outline-none
                        placeholder:text-black/40
                        [&::-webkit-search-cancel-button]:hidden
                    "
                />

                {/* LIMPAR PESQUISA */}

                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            inputRef.current?.focus();
                        }}
                        aria-label="Limpar pesquisa"
                        title="Limpar pesquisa"
                        className="
                            flex
                            h-9
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            transition-colors
                            hover:bg-black/5
                        "
                    >
                        <X
                            size={18}
                            strokeWidth={2}
                        />
                    </button>
                )}
            </div>

            {/* LUPA FIXA À DIREITA */}

            <button
                type="button"
                onClick={() => {
                    if (!expanded) {
                        setExpanded(true);
                    } else {
                        inputRef.current?.focus();
                    }
                }}
                aria-label={
                    expanded
                        ? "Focar pesquisa"
                        : "Expandir pesquisa"
                }
                aria-expanded={expanded}
                title="Pesquisar produtos"
                className="
                    flex
                    h-[54px]
                    w-[54px]
                    shrink-0
                    items-center
                    justify-center
                    transition-colors
                    duration-200
                    hover:bg-black/5
                "
            >
                <Search
                    size={24}
                    strokeWidth={2}
                />
            </button>
        </div>
    );
}
