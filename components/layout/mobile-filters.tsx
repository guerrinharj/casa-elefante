
"use client";

import {
    ReactNode,
    useEffect,
    useState,
} from "react";

import {
    usePathname,
    useSearchParams,
} from "next/navigation";

import {
    ChevronLeft,
    SlidersHorizontal,
} from "lucide-react";

type MobileFiltersProps = {
    children: ReactNode;
};

export function MobileFilters({
    children,
}: MobileFiltersProps) {
    const [open, setOpen] = useState(false);

    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setOpen(false);
    }, [pathname, searchParams]);

    return (
        <div
            className="
                pointer-events-none
                fixed
                left-4
                top-4
                z-40
                md:hidden
            "
        >
            <div
                className={`
                    pointer-events-auto
                    flex
                    max-h-[calc(100dvh-32px)]
                    flex-col
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
                        open
                            ? "w-[min(288px,calc(100vw-32px))]"
                            : "w-14"
                    }
                `}
            >
                {/* CABEÇALHO */}

                <div
                    className={`
                        flex
                        h-14
                        shrink-0
                        items-center
                        ${
                            open
                                ? "justify-between px-4"
                                : "justify-center"
                        }
                    `}
                >
                    {open && (
                        <h2
                            className="
                                font-october
                                text-3xl
                                uppercase
                                leading-none
                            "
                        >
                            Filtros
                        </h2>
                    )}

                    <button
                        type="button"
                        onClick={() => setOpen((current) => !current)}
                        aria-label={
                            open
                                ? "Recolher filtros"
                                : "Expandir filtros"
                        }
                        aria-expanded={open}
                        aria-controls="mobile-filters-content"
                        title={
                            open
                                ? "Recolher filtros"
                                : "Expandir filtros"
                        }
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            transition-colors
                            hover:bg-black/5
                        "
                    >
                        {open ? (
                            <ChevronLeft
                                size={24}
                                strokeWidth={2}
                            />
                        ) : (
                            <SlidersHorizontal
                                size={24}
                                strokeWidth={2}
                            />
                        )}
                    </button>
                </div>

                {/* CONTEÚDO DOS FILTROS */}

                <div
                    id="mobile-filters-content"
                    className={`
                        min-h-0
                        overflow-x-hidden
                        overflow-y-auto
                        overscroll-contain
                        transition-opacity
                        duration-200
                        ${
                            open
                                ? "px-4 pb-4 opacity-100"
                                : "pointer-events-none h-0 opacity-0"
                        }
                    `}
                    aria-hidden={!open}
                    inert={!open}
                >
                    <div
                        className="
                            w-[254px]
                            border-t
                            border-black
                            pt-4
                        "
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
