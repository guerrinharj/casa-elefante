"use client";
import { DraggableComponent } from "@/components/layout/draggable-component";
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
        <DraggableComponent
            id="file-tabs"
            defaultPosition={{
                bottom: 24,
                right: 24,
            }}
            width="min(560px, calc(100vw - 48px))"
            zIndex={100}
        >
            <FileTabs
                name={name}
                isLoggedIn={isLoggedIn}
                accountHref={accountHref}
            />
        </DraggableComponent>
    );
}