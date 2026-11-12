
"use client";

import Link from "next/link";

import {
    useState,
} from "react";

import {
    LogoutButton,
} from "@/components/logout-button";

type MobileNavbarProps = {
    name: string | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    isCollaborator: boolean;
    isWholesale: boolean;
    dark?: boolean;
};

export function MobileNavbar({
    name,
    isLoggedIn,
    isAdmin,
    isCollaborator,
    isWholesale,
    dark = false,
}: MobileNavbarProps) {
    const [open, setOpen] = useState(false);

    function closeMenu() {
        setOpen(false);
    }

    const menuColors = dark
        ? "border-[#FFFDE9] bg-[#D2232A] text-[#FFFDE9]"
        : "border-[#D2232A] bg-[#FFFDE9] text-[#D2232A]";

    return (
        <div className="md:hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative flex h-8 w-8 flex-col items-center justify-center gap-1.5"
                aria-label={open ? "Fechar menu" : "Abrir menu"}
                aria-expanded={open}
            >
                <span
                    className={`
                        block
                        h-px
                        w-6
                        bg-current
                        transition-all
                        duration-300
                        ${
                            open
                                ? "translate-y-[3.5px] rotate-45"
                                : ""
                        }
                    `}
                />

                <span
                    className={`
                        block
                        h-px
                        w-6
                        bg-current
                        transition-all
                        duration-300
                        ${
                            open
                                ? "-translate-y-[3.5px] -rotate-45"
                                : ""
                        }
                    `}
                />
            </button>

            <div
                className={`
                    absolute
                    left-0
                    top-full
                    z-50
                    w-full
                    overflow-hidden
                    border-b
                    transition-all
                    duration-300
                    ease-out
                    ${menuColors}
                    ${
                        open
                            ? "max-h-[600px] opacity-100"
                            : "pointer-events-none max-h-0 opacity-0"
                    }
                `}
            >
                <nav className="px-4 py-6">
                    <ul className="space-y-4 text-xl">
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

                        {!isLoggedIn && (
                            <li>
                                <Link
                                    href="/login"
                                    onClick={closeMenu}
                                >
                                    Login
                                </Link>
                            </li>
                        )}

                        {isWholesale &&
                            !isAdmin &&
                            !isCollaborator && (
                                <li>
                                    <Link
                                        href="/minha-conta"
                                        onClick={closeMenu}
                                    >
                                        {name ?? "Atacadista"}
                                    </Link>
                                </li>
                            )}

                        {isAdmin && (
                            <li>
                                <Link
                                    href="/admin"
                                    onClick={closeMenu}
                                >
                                    Admin
                                </Link>
                            </li>
                        )}

                        {isCollaborator &&
                            !isAdmin && (
                                <li>
                                    <Link
                                        href="/admin/produtos"
                                        onClick={closeMenu}
                                    >
                                        {name ?? "Colaborador"}
                                    </Link>
                                </li>
                            )}

                        {isLoggedIn && (
                            <li>
                                <LogoutButton />
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </div>
    );
}
