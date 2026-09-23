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
                            block
                            border-b
                            border-white
                            bg-black
                            text-white
                            transition-colors
                            duration-300
                            hover:bg-white
                            hover:text-black
                        "
                    >
                        <div
                            className="
                                grid
                                min-h-[55vh]
                                grid-rows-[auto_1fr_auto]
                                p-4
                                md:p-6
                            "
                        >
                            <div className="flex items-start justify-between gap-6">
                                <p className="text-right text-sm uppercase">
                                    {formatDate(
                                        performance.performance_date,
                                    )}
                                </p>
                            </div>

                            <div
                                className="
                                    flex
                                    items-center
                                    py-12
                                    md:py-16
                                "
                            >
                                <h2
                                    className="
                                        max-w-6xl
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

                            <div className="flex items-end justify-between gap-6">
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