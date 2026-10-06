"use client";

import {
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    createCollaborator,
} from "@/app/admin/colaboradores/actions";

export function NewCollaboratorForm() {
    const router = useRouter();

    const [
        name,
        setName,
    ] = useState("");

    const [
        email,
        setEmail,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setLoading(true);
        setError(null);

        const result =
            await createCollaborator({
                name,
                email,
            });

        if (!result.success) {
            setError(result.error);
            setLoading(false);
            return;
        }

        router.push(
            "/admin/colaboradores",
        );

        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
        >
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="name"
                    className="text-sm"
                >
                    Nome
                </label>

                <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) =>
                        setName(
                            event.target.value,
                        )
                    }
                    className="border border-black bg-transparent px-3 py-2 outline-none"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label
                    htmlFor="email"
                    className="text-sm"
                >
                    E-mail
                </label>

                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) =>
                        setEmail(
                            event.target.value,
                        )
                    }
                    className="border border-black bg-transparent px-3 py-2 outline-none"
                />
            </div>

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="border border-black px-4 py-2 transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {loading
                    ? "Adicionando..."
                    : "Adicionar colaborador"}
            </button>
        </form>
    );
}