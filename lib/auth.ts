import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const {
        data: profile,
        error,
    } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (
        error ||
        !profile ||
        profile.role !== "admin"
    ) {
        redirect("/");
    }

    return {
        user,
        profile,
    };
}

export async function getUserAccess() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return {
            user: null,
            isLoggedIn: false,
            isAdmin: false,
            isWholesale: false,
            canSeeWholesalePrice: false,
        };
    }

    const [
        profileResult,
        wholesaleResult,
    ] = await Promise.all([
        supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single(),

        supabase
            .from("wholesale_applications")
            .select("status")
            .eq("user_id", user.id)
            .maybeSingle(),
    ]);

    const isAdmin =
        profileResult.data?.role === "admin";

    const isWholesale =
        wholesaleResult.data?.status === "approved";

    return {
        user,
        isLoggedIn: true,
        isAdmin,
        isWholesale,
        canSeeWholesalePrice:
            isAdmin || isWholesale,
    };
}