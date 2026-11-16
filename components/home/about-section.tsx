
"use client";

import {
    useState,
} from "react";

import {
    ChevronDown,
} from "lucide-react";

export function AboutSection() {
    const [expanded, setExpanded] = useState(false);

    return (
        <section
            id="sobre"
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
                    aria-controls="about-section-content"
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
                        Sobre
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
                    id="about-section-content"
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
                                px-0
                                pb-7
                                pt-7
                                md:mx-7
                                md:pb-10
                                md:pt-10
                            "
                        >
                            <div className="grid gap-10 md:grid-cols-12">
                                <div className="md:col-span-8">
                                    <p
                                        className="
                                            text-2xl
                                            leading-tight
                                            md:text-4xl
                                        "
                                    >
                                        A Casa Elefante é mais que uma loja de discos.
                                        Somos um ponto de encontro para amantes da música
                                        independente, um espaço para descobrir novos sons e
                                        reviver clássicos.
                                    </p>

                                    <div
                                        className="
                                            mt-12
                                            max-w-2xl
                                            space-y-6
                                            text-base
                                            leading-relaxed
                                            md:text-lg
                                        "
                                    >
                                        <p>
                                            Nascemos em São Paulo com a missão de fortalecer
                                            a cena da música independente, oferecendo uma
                                            curadoria especial de livros, discos de vinil,
                                            CDs e K7s.
                                        </p>

                                        <p>
                                            Acreditamos no poder da cultura e da música para
                                            conectar pessoas e criar experiências
                                            memoráveis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
