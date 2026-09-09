"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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
        <div className="border-b border-black md:hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-4 py-3 uppercase"
                aria-expanded={open}
            >
                <span>
                    Filtros
                </span>

                <span
                    className={`transition-transform duration-300 ${
                        open
                            ? "rotate-45"
                            : ""
                    }`}
                >
                    +
                </span>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                    open
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0"
                }`}
            >
                {children}
            </div>
        </div>
    );
}