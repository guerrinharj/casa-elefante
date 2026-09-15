import {
    createClient,
} from "@/lib/supabase/server";

import {
    NavbarClient,
} from "@/components/layout/navbar-client";

export async function Navbar() {
    const supabase =
        await createClient();

    const {
        data: { user },
    } =
        await supabase.auth.getUser();

    const isLoggedIn =
        !!user;

    return (
        <NavbarClient
            isLoggedIn={
                isLoggedIn
            }
        />
    );
}