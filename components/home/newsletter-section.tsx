
"use client";

import {
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

export function NewsletterSection() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "/api/newsletter/subscribe",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                    }),
                },
            );

            const data = await response.json();

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

    return (
        <section
            id="newsletter"
            className="border-t-2 border-[#D2232A] px-2 py-16 md:py-24"
        >
            <div className="grid gap-10 md:grid-cols-12">
                <div className="md:col-span-4">
                    <h2 className="font-october text-6xl uppercase leading-none md:text-7xl">
                        Newsletter
                    </h2>
                </div>

                <div className="md:col-span-8">
                    {success ? (
                        <div className="max-w-xl">
                            <p className="text-2xl md:text-3xl">
                                Inscrição realizada.
                            </p>

                            <p className="mt-4 text-lg">
                                Você agora faz parte da newsletter
                                da Casa Elefante.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="max-w-xl text-xl leading-relaxed md:text-2xl">
                                Receba novidades, discos que acabaram
                                de chegar e outras notícias da
                                Casa Elefante.
                            </p>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-10 flex max-w-xl flex-col gap-6"
                            >
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="newsletter-name">
                                        Nome
                                    </label>

                                    <input
                                        id="newsletter-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) => {
                                            setName(event.target.value);
                                        }}
                                        className="rounded-xl border border-[#D2232A] bg-[#FFFDE9] p-3 outline-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="newsletter-email">
                                        E-mail
                                    </label>

                                    <input
                                        id="newsletter-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                        }}
                                        className="rounded-xl border border-[#D2232A] bg-[#FFFDE9] p-3 outline-none"
                                    />
                                </div>

                                {error && (
                                    <p
                                        role="alert"
                                        className="text-sm"
                                    >
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        w-fit
                                        rounded-xl
                                        border
                                        border-black
                                        bg-white
                                        px-6
                                        py-3
                                        text-black
                                        shadow-[4px_4px_0_#000]
                                        transition-transform
                                        duration-200
                                        hover:-translate-x-1
                                        hover:-translate-y-1
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {loading
                                        ? "Inscrevendo..."
                                        : "Assinar newsletter"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
