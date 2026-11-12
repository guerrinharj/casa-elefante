
"use client";

import Link from "next/link";

import {
    usePathname,
} from "next/navigation";

import {
    MobileNavbar,
} from "@/components/layout/mobile-navbar";

import {
    InteractiveLogo,
} from "@/components/layout/interactive-logo";

import {
    LogoutButton,
} from "@/components/logout-button";

import {
    CartIcon,
} from "@/components/cart/cart-icon";

type WholesaleStatus =
    | "pending"
    | "approved"
    | "rejected"
    | null;

type NavbarClientProps = {
    name: string | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    isCollaborator: boolean;
    isWholesale: boolean;
    wholesaleStatus: WholesaleStatus;
};

export function NavbarClient({
    name,
    isLoggedIn,
    isAdmin,
    isCollaborator,
    isWholesale,
    wholesaleStatus,
}: NavbarClientProps) {
    const pathname = usePathname();

    const isTodaTercaTem = pathname.startsWith(
        "/toda-terca-tem",
    );

    const linkClassName = `
        relative
        pb-1
        after:absolute
        after:bottom-0
        after:left-0
        after:h-px
        after:w-full
        after:origin-left
        after:scale-x-0
        after:bg-current
        after:transition-transform
        after:duration-300
        after:ease-out
        hover:after:scale-x-100
    `;

    const navbarBackground = isTodaTercaTem
        ? "bg-[#D2232A] text-[#FFFDE9] border-white/20"
        : "bg-[#FFFDE9] text-[#D2232A] border-black/20";

    return (
        <header
            className={`
                animate-navbar-in
                sticky
                top-0
                z-50
                border-b
                transition-colors
                duration-700
                ease-in-out
                ${navbarBackground}
            `}
        >
            <div className="flex items-center justify-between px-4 py-2 md:px-6">
                <InteractiveLogo
                    text={
                        isTodaTercaTem
                            ? "Toda Terça Tem"
                            : "Casa Elefante"
                    }
                />

                <nav className="hidden md:block">
                    <ul className="flex items-center gap-6">
                        <li>
                            <Link
                                href="/"
                                className={linkClassName}
                            >
                                Loja
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/toda-terca-tem"
                                className={linkClassName}
                            >
                                Toda Terça Tem
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/sobre"
                                className={linkClassName}
                            >
                                Sobre
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/newsletter"
                                className={linkClassName}
                            >
                                Newsletter
                            </Link>
                        </li>

                        <li>
                            <CartIcon />
                        </li>

                        {!isLoggedIn && (
                            <li>
                                <Link
                                    href="/login"
                                    className={linkClassName}
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
                                        className={linkClassName}
                                    >
                                        {name ?? "Atacadista"}
                                    </Link>
                                </li>
                            )}

                        {isAdmin && (
                            <li>
                                <Link
                                    href="/admin"
                                    className={linkClassName}
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
                                        className={linkClassName}
                                    >
                                        {name ?? "Colaborador"}
                                    </Link>
                                </li>
                            )}

                        {isLoggedIn &&
                            !isAdmin &&
                            !isCollaborator &&
                            wholesaleStatus ===
                                "pending" && (
                                <li>
                                    <Link
                                        href="/minha-conta"
                                        className="text-xs uppercase opacity-50"
                                    >
                                        Atacado pendente
                                    </Link>
                                </li>
                            )}

                        {isLoggedIn &&
                            !isAdmin &&
                            !isCollaborator &&
                            wholesaleStatus ===
                                "rejected" && (
                                <li>
                                    <Link
                                        href="/minha-conta"
                                        className="text-xs uppercase opacity-50"
                                    >
                                        Atacado recusado
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

                <MobileNavbar
                    name={name}
                    isLoggedIn={isLoggedIn}
                    isAdmin={isAdmin}
                    isCollaborator={isCollaborator}
                    isWholesale={isWholesale}
                    dark={isTodaTercaTem}
                />
            </div>
        </header>
    );
}
