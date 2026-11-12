
"use client";

import {
    usePathname,
} from "next/navigation";

export function Footer() {
    const pathname = usePathname();

    const isTodaTercaTem = pathname.startsWith(
        "/toda-terca-tem",
    );

    const footerColors = isTodaTercaTem
        ? "bg-[#D2232A] text-[#FFFDE9] border-white/20"
        : "bg-[#FFFDE9] text-[#D2232A] border-black/20";

    return (
        <footer
            className={`
                border-t
                px-6
                py-6
                transition-colors
                duration-500
                ${footerColors}
            `}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm md:pl-24 md:pr-6">
                </p>

                <div className="flex gap-4 text-sm">
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity duration-200 hover:opacity-60"
                    >
                        Instagram
                    </a>

                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity duration-200 hover:opacity-60"
                    >
                        YouTube
                    </a>
                </div>
            </div>
        </footer>
    );
}
