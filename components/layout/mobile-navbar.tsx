"use client";

import Link from "next/link";
import { useState } from "react";

export function MobileNavbar() {
    const [open, setOpen] = useState(false);

    function closeMenu() {
        setOpen(false);
    }

    return (
        <div className="md:hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative flex h-8 w-8 flex-col items-center justify-center gap-1.5"
                aria-label="Abrir menu"
                aria-expanded={open}
            >
                <span
                    className={`block h-px w-6 bg-black transition-all duration-300 ${
                        open
                            ? "translate-y-[3.5px] rotate-45"
                            : ""
                    }`}
                />

                <span
                    className={`block h-px w-6 bg-black transition-all duration-300 ${
                        open
                            ? "-translate-y-[3.5px] -rotate-45"
                            : ""
                    }`}
                />
            </button>

            <div
                className={`absolute left-0 top-full z-50 w-full overflow-hidden border-b border-black bg-white transition-all duration-300 ease-out ${
                    open
                        ? "max-h-[500px] opacity-100"
                        : "pointer-events-none max-h-0 opacity-0"
                }`}
            >
                <nav className="px-4 py-6">
                    <ul className="space-y-4 text-xl uppercase">
                        <li>
                            <Link
                                href="/"
                                onClick={closeMenu}
                            >
                                Loja
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/toda-terca-tem"
                                onClick={closeMenu}
                            >
                                Toda Terça Tem
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/sobre"
                                onClick={closeMenu}
                            >
                                Sobre
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/contato"
                                onClick={closeMenu}
                            >
                                Contato
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/newsletter"
                                onClick={closeMenu}
                            >
                                Newsletter
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/carrinho"
                                onClick={closeMenu}
                            >
                                Carrinho
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
}