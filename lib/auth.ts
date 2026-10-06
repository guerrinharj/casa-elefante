import {
    redirect,
} from "next/navigation";

import {
    createClient,
} from "@/lib/supabase/server";

export async function requireAdmin() {
    const supabase =
        await createClient();

    const {
        data: {
            user,
        },
    } =
        await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const {
        data: profile,
        error,
    } = await supabase
        .from("profiles")
        .select(
            "name, role",
        )
        .eq(
            "id",
            user.id,
        )
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

export async function requireProductManager() {
    const supabase =
        await createClient();

    const {
        data: {
            user,
        },
    } =
        await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const {
        data: profile,
        error,
    } = await supabase
        .from("profiles")
        .select(
            "name, role",
        )
        .eq(
            "id",
            user.id,
        )
        .single();

    if (
        error ||
        !profile ||
        ![
            "admin",
            "collaborator",
        ].includes(profile.role)
    ) {
        redirect("/");
    }

    return {
        user,
        profile,
    };
}

export async function getUserAccess() {
    const supabase =
        await createClient();

    const {
        data: {
            user,
        },
    } =
        await supabase.auth.getUser();

    if (!user) {
        return {
            user: null,
            name: null,
            isLoggedIn: false,
            isAdmin: false,
            isCollaborator: false,
            isWholesale: false,
            wholesaleStatus: null,
            canSeeWholesalePrice: false,
        };
    }

    const [
        profileResult,
        wholesaleResult,
    ] = await Promise.all([
        supabase
            .from("profiles")
            .select(
                "name, role",
            )
            .eq(
                "id",
                user.id,
            )
            .single(),

        supabase
            .from(
                "wholesale_applications",
            )
            .select(
                "status",
            )
            .eq(
                "user_id",
                user.id,
            )
            .maybeSingle(),
    ]);

    const name =
        profileResult.data?.name ??
        null;

    const role =
        profileResult.data?.role ??
        null;

    const isAdmin =
        role === "admin";

    const isCollaborator =
        role === "collaborator";

    const wholesaleStatus =
        wholesaleResult.data?.status ??
        null;

    const isWholesale =
        wholesaleStatus ===
        "approved";

    return {
        user,
        name,
        isLoggedIn: true,
        isAdmin,
        isCollaborator,
        isWholesale,
        wholesaleStatus,
        canSeeWholesalePrice:
            isAdmin ||
            isWholesale,
    };
}