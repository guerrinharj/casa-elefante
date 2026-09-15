"use client";

import {
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    createClient,
} from "@/lib/supabase/client";

type DeletePerformanceButtonProps = {
    id: string;
    name: string;
    audioUrl: string | null;
};

function getStoragePathFromUrl(
    url: string | null,
) {
    if (!url) {
        return null;
    }

    const marker =
        "/storage/v1/object/public/musicas/";

    const index =
        url.indexOf(
            marker,
        );

    if (index === -1) {
        return null;
    }

    return decodeURIComponent(
        url.slice(
            index +
                marker.length,
        ),
    );
}

export function DeletePerformanceButton({
    id,
    name,
    audioUrl,
}: DeletePerformanceButtonProps) {
    const router =
        useRouter();

    const supabase =
        createClient();

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    async function handleDelete() {
        const confirmed =
            window.confirm(
                `Tem certeza que deseja excluir "${name}"?`,
            );

        if (!confirmed) {
            return;
        }

        setDeleting(true);

        try {
            const {
                error:
                    deleteError,
            } =
                await supabase
                    .from(
                        "performances",
                    )
                    .delete()
                    .eq(
                        "id",
                        id,
                    );

            if (deleteError) {
                throw deleteError;
            }

            /*
             * Depois que o registro foi
             * excluído com sucesso,
             * removemos o MP3 do Storage.
             */
            const audioPath =
                getStoragePathFromUrl(
                    audioUrl,
                );

            if (audioPath) {
                const {
                    error:
                        storageError,
                } =
                    await supabase.storage
                        .from(
                            "musicas",
                        )
                        .remove([
                            audioPath,
                        ]);

                if (
                    storageError
                ) {
                    console.error(
                        "Delete audio error:",
                        storageError,
                    );
                }
            }

            router.refresh();
        } catch (
            error
        ) {
            console.error(
                "Delete performance error:",
                error,
            );

            window.alert(
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir a apresentação.",
            );
        } finally {
            setDeleting(
                false,
            );
        }
    }

    return (
        <button
            type="button"
            onClick={
                handleDelete
            }
            disabled={
                deleting
            }
            className="rounded-md border border-red-600 bg-white px-4 py-2 text-sm text-red-600 shadow-[3px_3px_0_#dc2626] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {deleting
                ? "Excluindo..."
                : "Excluir"}
        </button>
    );
}