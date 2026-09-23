import Link from "next/link";

import type {
    Performance,
} from "@/lib/performances";

type UpcomingPerformancesProps = {
    performances: Performance[];
};

function formatDate(
    date: string | null,
) {
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
    ).format(
        new Date(date),
    );
}

export function UpcomingPerformances({
    performances,
}: UpcomingPerformancesProps) {
    if (
        performances.length === 0
    ) {
        return null;
    }

    return (
        <section>
            {performances.map(
                (performance) => (
                    <Link
                        key={
                            performance.id
                        }
                        href={`/toda-terca-tem/${performance.slug}`}
                        className="
                            group
                            relative
                            block
                            overflow-hidden
                            border-b
                            border-white
                            bg-black
                            text-white
                            transition-colors
                            duration-500
                            hover:bg-white
                            hover:text-black
                        "
                    >
                        {performance.cover_image && (
                            <div
                                className="
                                    absolute
                                    inset-0
                                    bg-cover
                                    bg-center
                                    grayscale
                                    opacity-100
                                    transition-all
                                    duration-500
                                    ease-out
                                    group-hover:scale-[1.02]
                                    group-hover:opacity-0
                                "
                                style={{
                                    backgroundImage:
                                        `url("${performance.cover_image}")`,
                                }}
                            />
                        )}

                        <div
                            className="
                                absolute
                                inset-0
                                bg-black/35
                                opacity-100
                                transition-opacity
                                duration-500
                                group-hover:opacity-0
                            "
                        />

                        <div
                            className="
                                relative
                                z-10
                                grid
                                min-h-[55vh]
                                grid-rows-[auto_1fr_auto]
                                p-4
                                md:min-h-[65vh]
                                md:p-6
                            "
                        >
                            <div>
                                <p
                                    className="
                                        font-anton
                                        text-3xl
                                        uppercase
                                        leading-none
                                        md:text-5xl
                                        lg:text-6xl
                                    "
                                >
                                    {formatDate(
                                        performance.performance_date,
                                    )}
                                </p>
                            </div>

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-end
                                    py-12
                                    md:py-16
                                "
                            >
                                <h2
                                    className="
                                        max-w-6xl
                                        text-right
                                        font-anton
                                        text-6xl
                                        uppercase
                                        leading-[0.85]
                                        md:text-8xl
                                        lg:text-9xl
                                        xl:text-[10rem]
                                    "
                                >
                                    {
                                        performance.name
                                    }
                                </h2>
                            </div>

                            <div
                                className="
                                    flex
                                    items-end
                                    justify-between
                                    gap-6
                                "
                            >
                                <p
                                    className="
                                        max-w-xl
                                        text-sm
                                        uppercase
                                    "
                                >
                                    {performance.description ??
                                        ""}
                                </p>

                                <div
                                    className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        border
                                        border-current
                                        transition-transform
                                        duration-300
                                        group-hover:translate-x-1
                                        md:h-14
                                        md:w-14
                                    "
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-5 w-5 fill-current"
                                        aria-hidden="true"
                                    >
                                        <path d="M8.5 5.5 15 12l-6.5 6.5 1.5 1.5 8-8-8-8-1.5 1.5Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>
                ),
            )}
        </section>
    );
}