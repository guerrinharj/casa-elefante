
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
    ChevronDown,
    ChevronUp,
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
                relative
                z-40
                w-full
                md:hidden
            "
        >
            <div
                className="
                    flex
                    w-full
                    max-h-[calc(100dvh-100px)]
                    flex-col
                    overflow-hidden
                    rounded-xl
                    border
                    border-black
                    bg-white
                    text-black
                    shadow-[-5px_5px_0_0_#000]
                "
            >
                <button
                    type="button"
                    onClick={() => setOpen(
                        (current) => !current
                    )}
                    aria-label={
                        open
                            ? "Recolher filtros"
                            : "Expandir filtros"
                    }
                    aria-expanded={open}
                    aria-controls="mobile-filters-content"
                    className="
                        flex
                        h-10
                        w-full
                        shrink-0
                        items-center
                        justify-between
                        gap-2
                        px-4
                        text-left
                        transition-colors
                        hover:bg-black/5
                    "
                >
                    <span
                        className="
                            font-questrial
                            text-base
                            font-normal
                            uppercase
                            leading-none
                            tracking-wide
                        "
                    >
                        FILTROS
                    </span>

                    {open ? (
                        <ChevronUp
                            size={18}
                            strokeWidth={1.5}
                        />
                    ) : (
                        <ChevronDown
                            size={18}
                            strokeWidth={1.5}
                        />
                    )}
                </button>

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
                            w-full
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
