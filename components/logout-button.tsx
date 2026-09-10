"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
    onLogout?: () => void;
};

export function LogoutButton({
    onLogout,
}: LogoutButtonProps) {
    const router = useRouter();

    async function handleLogout() {
        const supabase = createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Erro ao fazer logout:", error);
            return;
        }

        onLogout?.();

        router.push("/");
        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="text-red-400"
        >
            Logout
        </button>
    );
}