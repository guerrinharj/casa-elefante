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

type NavbarClientProps = {
    isLoggedIn: boolean;
};

export function NavbarClient({
    isLoggedIn,
}: NavbarClientProps) {
    const pathname =
        usePathname();

    const isTodaTercaTem =
        pathname.startsWith(
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
        after:transition-transform
        after:duration-300
        after:ease-out
        hover:after:scale-x-100

        ${
            isTodaTercaTem
                ? "after:bg-white"
                : "after:bg-black"
        }
    `;

    return (
        <header
            className={`
                animate-navbar-in
                sticky
                top-0
                z-50
                border-b
                transition-colors
                duration-500

                ${
                    isTodaTercaTem
                        ? "border-white bg-black text-white"
                        : "border-black bg-[#f8f7ef] text-black"
                }
            `}
        >
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
                <InteractiveLogo
                    text={
                        isTodaTercaTem
                            ? "Toda Terça Tem"
                            : "Casa Elefante"
                    }
                />

                <nav className="hidden md:block">
                    <ul className="flex gap-6">
                        <li>
                            <Link
                                href="/"
                                className={
                                    linkClassName
                                }
                            >
                                Loja
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/toda-terca-tem"
                                className={
                                    linkClassName
                                }
                            >
                                Toda Terça Tem
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/sobre"
                                className={
                                    linkClassName
                                }
                            >
                                Sobre
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/newsletter"
                                className={
                                    linkClassName
                                }
                            >
                                Newsletter
                            </Link>
                        </li>

                        <li>
                            <CartIcon />
                        </li>

                        {isLoggedIn && (
                            <li className="text-blue-400">
                                <Link
                                    href="/admin"
                                    className={
                                        linkClassName
                                    }
                                >
                                    Admin
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
                    isLoggedIn={
                        isLoggedIn
                    }
                    dark={
                        isTodaTercaTem
                    }
                />
            </div>
        </header>
    );
}