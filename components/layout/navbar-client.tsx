
"use client";

import Link from "next/link";

import {
    usePathname,
} from "next/navigation";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { CartIcon } from "@/components/cart/cart-icon";
import { LogoutButton } from "@/components/logout-button";
import { FileTabs } from "@/components/layout/file-tabs";

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

    const [accountOpen, setAccountOpen] = useState(false);

    const accountRef = useRef<HTMLDivElement>(null);

    const isTodaTercaTem = pathname.startsWith(
        "/toda-terca-tem",
    );

    const foreground = isTodaTercaTem
        ? "#FFFDE9"
        : "#D2232A";

    const background = isTodaTercaTem
        ? "#D2232A"
        : "#FFFDE9";

    const accountHref = isAdmin
        ? "/admin"
        : isCollaborator
          ? "/admin/produtos"
          : "/minha-conta";

    const accountLabel = isAdmin
        ? "Painel administrativo"
        : isCollaborator
          ? "Painel de produtos"
          : "Minha conta";

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (
                accountRef.current &&
                !accountRef.current.contains(
                    event.target as Node,
                )
            ) {
                setAccountOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setAccountOpen(false);
            }
        }

        document.addEventListener(
            "pointerdown",
            handleOutsideClick,
        );

        document.addEventListener(
            "keydown",
            handleEscape,
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick,
            );

            document.removeEventListener(
                "keydown",
                handleEscape,
            );
        };
    }, []);

    useEffect(() => {
        setAccountOpen(false);
    }, [pathname]);

    return (
        <>
            <div
                className="
                    fixed
                    right-4
                    top-4
                    z-[110]
                    flex
                    items-center
                    gap-4
                    md:right-6
                    md:top-6
                "
                style={{
                    color: foreground,
                }}
            >
                <CartIcon />

                <div
                    ref={accountRef}
                    className="relative"
                >
                    <button
                        type="button"
                        aria-label={
                            accountOpen
                                ? "Fechar menu da conta"
                                : "Abrir menu da conta"
                        }
                        aria-expanded={accountOpen}
                        aria-haspopup="menu"
                        onClick={() => {
                            setAccountOpen(!accountOpen);
                        }}
                        className="
                            flex
                            h-10
                            items-center
                            justify-center
                            gap-2
                            rounded-full
                            border
                            border-current
                            px-4
                            text-sm
                            font-bold
                            uppercase
                            tracking-wide
                            transition-colors
                            duration-200
                            hover:opacity-70
                        "
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle
                                cx="12"
                                cy="8"
                                r="3.5"
                            />

                            <path
                                d="M4.5 20c0-4 3-6 7.5-6s7.5 2 7.5 6"
                            />
                        </svg>

                        <span>
                            {isLoggedIn
                                ? "Minha conta"
                                : "Entrar"}
                        </span>
                    </button>

                    {accountOpen && (
                        <div
                            role="menu"
                            className="
                                absolute
                                right-0
                                top-12
                                flex
                                w-[230px]
                                flex-col
                                gap-4
                                rounded-xl
                                border
                                p-5
                                text-sm
                            "
                            style={{
                                backgroundColor: background,
                                color: foreground,
                                borderColor: foreground,
                            }}
                        >
                            {!isLoggedIn ? (
                                <Link
                                    href="/login"
                                    role="menuitem"
                                    onClick={() => {
                                        setAccountOpen(false);
                                    }}
                                    className="
                                        transition-opacity
                                        hover:opacity-60
                                    "
                                >
                                    Fazer login
                                </Link>
                            ) : (
                                <>
                                    {name && (
                                        <div
                                            className="
                                                border-b
                                                pb-3
                                                text-sm
                                                font-bold
                                            "
                                            style={{
                                                borderColor: foreground,
                                            }}
                                        >
                                            {name}
                                        </div>
                                    )}

                                    <Link
                                        href={accountHref}
                                        role="menuitem"
                                        onClick={() => {
                                            setAccountOpen(false);
                                        }}
                                        className="
                                            transition-opacity
                                            hover:opacity-60
                                        "
                                    >
                                        {accountLabel}
                                    </Link>

                                    {!isAdmin &&
                                        !isCollaborator &&
                                        isWholesale &&
                                        wholesaleStatus === "pending" && (
                                            <Link
                                                href="/minha-conta"
                                                role="menuitem"
                                                onClick={() => {
                                                    setAccountOpen(false);
                                                }}
                                            >
                                                Atacado pendente
                                            </Link>
                                        )}

                                    {!isAdmin &&
                                        !isCollaborator &&
                                        isWholesale &&
                                        wholesaleStatus === "rejected" && (
                                            <Link
                                                href="/minha-conta"
                                                role="menuitem"
                                                onClick={() => {
                                                    setAccountOpen(false);
                                                }}
                                            >
                                                Atacado recusado
                                            </Link>
                                        )}

                                    <div
                                        className="border-t pt-3"
                                        style={{
                                            borderColor: foreground,
                                        }}
                                    >
                                        <LogoutButton />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <FileTabs />
        </>
    );
}
