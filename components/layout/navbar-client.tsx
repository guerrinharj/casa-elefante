"use client";

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
    const accountHref = isAdmin
        ? "/admin"
        : isCollaborator
          ? "/admin/produtos"
          : "/minha-conta";

    return (
        <FileTabs
            name={name}
            isLoggedIn={isLoggedIn}
            accountHref={accountHref}
        />
    );
}