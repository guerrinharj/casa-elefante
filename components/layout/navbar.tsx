import Link from "next/link";

import { MobileNavbar } from "@/components/layout/mobile-navbar";

const linkClassName =
    "relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100";

export function Navbar() {
    return (
        <header className="relative z-50 border-b border-black bg-white">
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
                <Link
                    href="/"
                    className="text-xl font-bold uppercase"
                >
                    Casa Elefante
                </Link>

                <nav className="hidden md:block">
                    <ul className="flex gap-6">
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
                                href="/contato"
                                className={linkClassName}
                            >
                                Contato
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
                            <Link
                                href="/carrinho"
                                className={linkClassName}
                            >
                                Carrinho
                            </Link>
                        </li>
                    </ul>
                </nav>

                <MobileNavbar />
            </div>
        </header>
    );
}