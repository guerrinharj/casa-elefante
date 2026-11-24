
"use client";

import {
    useRef,
} from "react";

import {
    Search,
    X,
} from "lucide-react";

type PerformancesSearchProps = {
    value: string;
    onChange: (value: string) => void;
};

export function PerformancesSearch({
    value,
    onChange,
}: PerformancesSearchProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="w-full min-w-0">
            <div
                className="
                    flex
                    h-14
                    w-full
                    min-w-0
                    max-w-full
                    items-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-black
                    bg-white
                    text-black
                    shadow-[-5px_5px_0_0_#000]
                "
            >
                {/* CAMPO DE BUSCA */}

                <div
                    className="
                        flex
                        min-w-0
                        flex-1
                        items-center
                        gap-2
                        pl-4
                    "
                >
                    <input
                        ref={inputRef}
                        type="search"
                        value={value}
                        onChange={(event) => {
                            onChange(event.target.value);
                        }}
                        placeholder="Buscar apresentação..."
                        aria-label="Buscar apresentações"
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

                    {value && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange("");
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

                {/* LUPA À DIREITA */}

                <button
                    type="button"
                    onClick={() => {
                        inputRef.current?.focus();
                    }}
                    aria-label="Focar pesquisa"
                    title="Pesquisar apresentações"
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
        </div>
    );
}
