
"use client";

import {
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    ChevronDown,
} from "lucide-react";

export function NewsletterSection() {
    const [expanded, setExpanded] = useState(false);
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
            className="
                px-2
                py-8
                md:py-12
            "
        >
            <div
                className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-black
                    bg-white
                    text-black
                    shadow-[-5px_5px_0_0_#000]
                "
            >
                {/* CABEÇALHO */}

                <button
                    type="button"
                    onClick={() => {
                        setExpanded((current) => !current);
                    }}
                    aria-expanded={expanded}
                    aria-controls="newsletter-section-content"
                    className="
                        flex
                        w-full
                        items-center
                        justify-between
                        gap-4
                        p-5
                        text-left
                        transition-colors
                        duration-200
                        hover:bg-black/5
                        md:p-7
                    "
                >
                    <h2
                        className="
                            font-october
                            text-4xl
                            uppercase
                            leading-none
                            md:text-5xl
                        "
                    >
                        Newsletter
                    </h2>

                    <span
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                        "
                    >
                        <ChevronDown
                            size={28}
                            strokeWidth={2}
                            className={`
                                transition-transform
                                duration-300
                                ease-in-out
                                ${
                                    expanded
                                        ? "rotate-180"
                                        : "rotate-0"
                                }
                            `}
                        />
                    </span>
                </button>

                {/* CONTEÚDO EXPANSÍVEL */}

                <div
                    id="newsletter-section-content"
                    className={`
                        grid
                        transition-[grid-template-rows,opacity]
                        duration-300
                        ease-in-out
                        ${
                            expanded
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                        }
                    `}
                    aria-hidden={!expanded}
                    inert={!expanded}
                >
                    <div className="min-h-0 overflow-hidden">
                        <div
                            className="
                                mx-5
                                border-t
                                border-black
                                pb-7
                                pt-7
                                md:mx-7
                                md:pb-10
                                md:pt-10
                            "
                        >
                            <div className="grid gap-10 md:grid-cols-12">
                                {/* FORMULÁRIO */}

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
                                            <p
                                                className="
                                                    max-w-xl
                                                    text-xl
                                                    leading-relaxed
                                                    md:text-2xl
                                                "
                                            >
                                                Receba novidades, discos que acabaram
                                                de chegar e outras notícias da
                                                Casa Elefante.
                                            </p>

                                            <form
                                                onSubmit={handleSubmit}
                                                className="
                                                    mt-10
                                                    flex
                                                    max-w-xl
                                                    flex-col
                                                    gap-6
                                                "
                                            >
                                                {/* NOME */}

                                                <div className="flex flex-col gap-2">
                                                    <label
                                                        htmlFor="newsletter-name"
                                                        className="font-medium"
                                                    >
                                                        Nome
                                                    </label>

                                                    <input
                                                        id="newsletter-name"
                                                        type="text"
                                                        value={name}
                                                        onChange={(event) => {
                                                            setName(event.target.value);
                                                        }}
                                                        className="
                                                            rounded-xl
                                                            border
                                                            border-black
                                                            bg-white
                                                            p-3
                                                            text-black
                                                            outline-none
                                                            transition-shadow
                                                            duration-200
                                                            focus:shadow-[3px_3px_0_0_#000]
                                                        "
                                                    />
                                                </div>

                                                {/* EMAIL */}

                                                <div className="flex flex-col gap-2">
                                                    <label
                                                        htmlFor="newsletter-email"
                                                        className="font-medium"
                                                    >
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
                                                        className="
                                                            rounded-xl
                                                            border
                                                            border-black
                                                            bg-white
                                                            p-3
                                                            text-black
                                                            outline-none
                                                            transition-shadow
                                                            duration-200
                                                            focus:shadow-[3px_3px_0_0_#000]
                                                        "
                                                    />
                                                </div>

                                                {/* ERRO */}

                                                {error && (
                                                    <p
                                                        role="alert"
                                                        className="text-sm"
                                                    >
                                                        {error}
                                                    </p>
                                                )}

                                                {/* BOTÃO */}

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
                                                        font-medium
                                                        text-black
                                                        shadow-[-5px_5px_0_0_#000]
                                                        transition-all
                                                        duration-200
                                                        ease-out
                                                        hover:translate-x-1
                                                        hover:-translate-y-1
                                                        hover:shadow-[-9px_9px_0_0_#000]
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
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
