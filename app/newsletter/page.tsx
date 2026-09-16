"use client";

import {
    FormEvent,
    useState,
} from "react";

export default function NewsletterPage() {
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
        success,
        setSuccess,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response =
                await fetch(
                    "/api/newsletter/subscribe",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            name,
                            email,
                        }),
                    },
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Não foi possível realizar a inscrição.",
                );
            }

            setSuccess(true);
            setName("");
            setEmail("");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível realizar a inscrição.",
            );
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <main className="p-4 md:p-6">
                <div className="mx-auto max-w-3xl">
                    <div className="mt-10 rounded-xl border border-black bg-white p-6 shadow-[4px_4px_0_#000]">
                        <p className="text-lg">
                            Inscrição realizada.
                        </p>

                        <p className="mt-2">
                            Você agora faz parte da
                            newsletter da Casa Elefante.
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="p-4 md:p-6">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-anton uppercase">
                    Newsletter
                </h1>

                <p className="mt-6 max-w-xl">
                    Receba novidades, discos que
                    acabaram de chegar e outras
                    notícias da Casa Elefante.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-10 flex max-w-xl flex-col gap-6"
                >
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name">
                            Nome
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value,
                                )
                            }
                            className="rounded-xl border border-black bg-white p-3 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="email">
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
                            className="rounded-xl border border-black bg-white p-3 outline-none"
                        />
                    </div>

                    {error && (
                        <p className="text-sm">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-fit rounded-xl border border-black bg-white px-6 py-3 shadow-[4px_4px_0_#000] transition-transform hover:-translate-x-1 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading
                            ? "Inscrevendo..."
                            : "Assinar newsletter"}
                    </button>
                </form>
            </div>
        </main>
    );
}