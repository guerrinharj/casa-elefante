
"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    ChevronRight,
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
    const [expanded, setExpanded] = useState(
        Boolean(value),
    );

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (expanded) {
            inputRef.current?.focus();
        }
    }, [expanded]);

    return (
        <div className="pointer-events-none w-full">
            <div
                className={`
                    pointer-events-auto
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
                {/* CAMPO DE BUSCA */}

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
                    <button
                        type="button"
                        onClick={() => setExpanded(false)}
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

                {/* BOTÃO DE BUSCA */}

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
