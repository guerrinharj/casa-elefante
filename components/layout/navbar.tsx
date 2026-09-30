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
        isWholesale,
        wholesaleStatus,
    } = await getUserAccess();

    return (
        <NavbarClient
            name={name}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            isWholesale={isWholesale}
            wholesaleStatus={wholesaleStatus}
        />
    );
}