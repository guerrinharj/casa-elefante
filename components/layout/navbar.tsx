import {
    NavbarClient,
} from "@/components/layout/navbar-client";

import {
    getUserAccess,
} from "@/lib/auth";

export async function Navbar() {
    const {
        name,
        isLoggedIn,
        isAdmin,
        isCollaborator,
        isWholesale,
        wholesaleStatus,
    } = await getUserAccess();

    return (
        <NavbarClient
            name={name}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            isCollaborator={
                isCollaborator
            }
            isWholesale={
                isWholesale
            }
            wholesaleStatus={
                wholesaleStatus
            }
        />
    );
}