"use client";

import {
    usePathname,
} from "next/navigation";

export function Footer() {
    const pathname =
        usePathname();

    const isTodaTercaTem =
        pathname.startsWith(
            "/toda-terca-tem",
        );

    return (
        <footer
            className={`
                border-t
                px-6
                py-6
                transition-colors
                duration-500

                ${
                    isTodaTercaTem
                        ? "border-white bg-black text-white"
                        : "border-black bg-[#f8f7ef] text-black"
                }
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
                    >
                        Instagram
                    </a>

                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        YouTube
                    </a>
                </div>
            </div>
        </footer>
    );
}