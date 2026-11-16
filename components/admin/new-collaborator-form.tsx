
"use client";

import {
    type FormEvent,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    createCollaborator,
} from "@/app/admin/colaboradores/actions";

const labelClassName =
    "font-october text-xl uppercase leading-none text-black";

const inputClassName =
    "w-full min-w-0 rounded-xl border border-black bg-white px-4 py-3 text-base text-black outline-none transition-colors placeholder:text-black/35 focus:ring-2 focus:ring-black/15";

const buttonClassName =
    "inline-flex items-center justify-center rounded-xl border border-black bg-white px-6 py-3 text-base font-medium text-black shadow-[-5px_5px_0_0_#000] transition-all duration-200 hover:-translate-y-1 hover:shadow-[-5px_9px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[-5px_5px_0_0_#000]";

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
        event: FormEvent<HTMLFormElement>,
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
            className="flex w-full flex-col gap-8 text-black"
        >
            <div className="flex flex-col gap-3">
                <label
                    htmlFor="name"
                    className={labelClassName}
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
                    className={inputClassName}
                />
            </div>

            <div className="flex flex-col gap-3">
                <label
                    htmlFor="email"
                    className={labelClassName}
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
                    className={inputClassName}
                />
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-black bg-white p-4 text-sm text-[#D2232A] shadow-[-3px_3px_0_0_#000]"
                >
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4 border-t border-black/20 pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className={buttonClassName}
                >
                    {loading
                        ? "Adicionando..."
                        : "Adicionar colaborador"}
                </button>
            </div>
        </form>
    );
}
