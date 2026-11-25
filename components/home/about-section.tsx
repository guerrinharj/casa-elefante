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
                    aria-controls="about-section-content"
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
                            text-black
                        "
                    >
                        Sobre
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
                                mx-3
                                border-t
                                border-black
                                pb-4
                                pt-4
                            "
                        >
                            <p
                                className="
                                    text-sm
                                    leading-snug
                                "
                            >
                                A Casa Elefante é mais que uma loja de discos.
                                Somos um ponto de encontro para amantes da
                                música independente, um espaço para descobrir
                                novos sons e reviver clássicos.
                            </p>

                            <div
                                className="
                                    mt-4
                                    space-y-3
                                    text-xs
                                    leading-relaxed
                                "
                            >
                                <p>
                                    Nascemos em São Paulo com a missão de
                                    fortalecer a cena da música independente,
                                    oferecendo uma curadoria especial de
                                    livros, discos de vinil, CDs e K7s.
                                </p>

                                <p>
                                    Acreditamos no poder da cultura e da
                                    música para conectar pessoas e criar
                                    experiências memoráveis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}