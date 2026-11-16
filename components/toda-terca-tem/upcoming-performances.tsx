
import Image from "next/image";
import Link from "next/link";

import tttLogo from "@/app/images/ttt-3-preto.png";

import type {
    Performance,
} from "@/lib/performances";

type UpcomingPerformancesProps = {
    performances: Performance[];
};

function formatDate(date: string | null) {
    if (!date) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        },
    ).format(new Date(date));
}

export function UpcomingPerformances({
    performances,
}: UpcomingPerformancesProps) {
    if (performances.length === 0) {
        return null;
    }

    return (
        <section className="mb-4 flex flex-col gap-6 px-[5px] pb-[5px]">
            {performances.map((performance) => (
                <Link
                    key={performance.id}
                    href={`/toda-terca-tem/${performance.slug}`}
                    className="
                        group
                        relative
                        block
                        rounded-xl
                        border
                        border-black
                        bg-white
                        text-black
                        shadow-[-5px_5px_0_0_#000]
                        transition-transform
                        duration-300
                        hover:-translate-y-1
                    "
                >
                    <div className="relative overflow-hidden rounded-[11px]">
                        {/* IMAGEM NO HOVER */}

                        {performance.cover_image && (
                            <div
                                className="
                                    absolute
                                    inset-0
                                    scale-100
                                    bg-cover
                                    bg-center
                                    grayscale
                                    opacity-0
                                    transition-all
                                    duration-500
                                    ease-out
                                    group-hover:scale-[1.02]
                                    group-hover:opacity-100
                                "
                                style={{
                                    backgroundImage: `url("${performance.cover_image}")`,
                                }}
                            />
                        )}

                        {/* CAMADA BRANCA PARA LEGIBILIDADE */}

                        {performance.cover_image && (
                            <div
                                className="
                                    absolute
                                    inset-0
                                    bg-white/60
                                    opacity-0
                                    transition-opacity
                                    duration-500
                                    group-hover:opacity-100
                                "
                            />
                        )}

                        {/* CONTEÚDO */}

                        <div
                            className="
                                relative
                                z-10
                                grid
                                min-h-[230px]
                                grid-rows-[auto_1fr_auto]
                                p-4
                                md:min-h-[270px]
                                md:p-6
                            "
                        >
                            {/* DATA, TÍTULO E LOCAL */}

                            <div className="grid grid-cols-3 items-start gap-2">
                                <p className="text-sm leading-tight md:text-base">
                                    {formatDate(
                                        performance.performance_date,
                                    )}
                                </p>

                                <p
                                    className="
                                        text-center
                                        font-october
                                        text-lg
                                        uppercase
                                        leading-none
                                        md:text-2xl
                                    "
                                >
                                    Próxima apresentação
                                </p>

                                {performance.location && (
                                    <p
                                        className="
                                            text-right
                                            text-sm
                                            leading-tight
                                            md:text-base
                                        "
                                    >
                                        {performance.location}
                                    </p>
                                )}
                            </div>

                            {/* NOME DO ARTISTA */}

                            <div
                                className="
                                    flex
                                    min-h-0
                                    items-center
                                    justify-center
                                    py-6
                                "
                            >
                                <h2
                                    className="
                                        max-w-full
                                        break-words
                                        text-center
                                        font-october
                                        text-5xl
                                        uppercase
                                        leading-[0.85]
                                        text-[#D2232A]
                                        [-webkit-text-stroke:1px_#000]
                                        sm:text-6xl
                                        md:text-8xl
                                        lg:text-9xl
                                        xl:text-[10rem]
                                    "
                                >
                                    {performance.name}
                                </h2>
                            </div>

                            {/* RODAPÉ */}

                            <div className="flex items-end justify-between gap-4">
                                <Image
                                    src={tttLogo}
                                    alt="Toda Terça Tem"
                                    width={80}
                                    height={80}
                                    className="
                                        h-auto
                                        w-12
                                        shrink-0
                                        object-contain
                                        brightness-0
                                        md:w-16
                                    "
                                />

                                <span
                                    aria-hidden="true"
                                    className="
                                        text-3xl
                                        leading-none
                                        transition-transform
                                        duration-300
                                        group-hover:translate-x-1
                                        group-hover:-translate-y-1
                                        md:text-4xl
                                    "
                                >
                                    ↗
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </section>
    );
}
