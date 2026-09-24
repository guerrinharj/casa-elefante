import {
    NavbarClient,
} from "@/components/layout/navbar-client";

import {
    getUserAccess,
} from "@/lib/auth";

export async function Navbar() {
    const {
        isLoggedIn,
        isAdmin,
        isWholesale,
    } = await getUserAccess();

    return (
        <NavbarClient
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            isWholesale={isWholesale}
        />
    );
}