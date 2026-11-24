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
                w-full
                min-w-0
            "
        >
            <div
                className="
                    w-full
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
                        gap-2
                        p-3
                        text-left
                        transition-colors
                        duration-200
                        hover:bg-black/5
                    "
                >
                    <h2
                        className="
                            font-october
                            text-xl
                            uppercase
                            leading-none
                            text-[#D2232A]
                        "
                    >
                        Newsletter
                    </h2>

                    <span
                        className="
                            flex
                            h-6
                            w-6
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                        "
                    >
                        <ChevronDown
                            size={18}
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
                                mx-3
                                border-t
                                border-black
                                pb-4
                                pt-4
                            "
                        >
                            {success ? (
                                <div>
                                    <p
                                        className="
                                            text-sm
                                            leading-tight
                                        "
                                    >
                                        Inscrição realizada.
                                    </p>

                                    <p
                                        className="
                                            mt-2
                                            text-xs
                                            leading-relaxed
                                        "
                                    >
                                        Você agora faz parte da newsletter
                                        da Casa Elefante.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p
                                        className="
                                            text-sm
                                            leading-snug
                                        "
                                    >
                                        Receba novidades, discos que acabaram
                                        de chegar e outras notícias da
                                        Casa Elefante.
                                    </p>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="
                                            mt-4
                                            flex
                                            flex-col
                                            gap-3
                                        "
                                    >
                                        {/* NOME */}

                                        <div className="flex flex-col gap-1">
                                            <label
                                                htmlFor="newsletter-name"
                                                className="
                                                    text-xs
                                                    font-medium
                                                "
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
                                                    w-full
                                                    min-w-0
                                                    rounded-lg
                                                    border
                                                    border-black
                                                    bg-white
                                                    p-2
                                                    text-sm
                                                    text-black
                                                    outline-none
                                                    transition-shadow
                                                    duration-200
                                                    focus:shadow-[3px_3px_0_0_#000]
                                                "
                                            />
                                        </div>

                                        {/* EMAIL */}

                                        <div className="flex flex-col gap-1">
                                            <label
                                                htmlFor="newsletter-email"
                                                className="
                                                    text-xs
                                                    font-medium
                                                "
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
                                                    w-full
                                                    min-w-0
                                                    rounded-lg
                                                    border
                                                    border-black
                                                    bg-white
                                                    p-2
                                                    text-sm
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
                                                className="text-xs"
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
                                                max-w-full
                                                rounded-lg
                                                border
                                                border-black
                                                bg-white
                                                px-3
                                                py-2
                                                text-xs
                                                font-medium
                                                text-black
                                                shadow-[-3px_3px_0_0_#000]
                                                transition-all
                                                duration-200
                                                ease-out
                                                hover:translate-x-1
                                                hover:-translate-y-1
                                                hover:shadow-[-5px_5px_0_0_#000]
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
        </section>
    );
}