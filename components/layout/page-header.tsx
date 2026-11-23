
type PageHeaderProps = {
    title: string;
    variant?: "default" | "ttt";
    className?: string;
};

export function PageHeader({
    title,
    variant = "default",
    className = "",
}: PageHeaderProps) {
    const textColor =
        variant === "ttt"
            ? "text-[#FFFDE9]"
            : "text-[#D2232A]";

    const repeatedTitle = Array.from(
        { length: 4 },
        (_, index) => index,
    );

    return (
        <header
            className={`
                mb-8
                w-full
                overflow-hidden
                pt-4
                md:pt-0
                ${className}
            `}
        >
            <h1 className="sr-only">
                {title}
            </h1>

            <div
                className={`
                    page-header-marquee
                    flex
                    w-max
                    items-center
                    ${textColor}
                `}
                aria-hidden="true"
            >
                {Array.from(
                    { length: 2 },
                    (_, copyIndex) => (
                        <div
                            key={copyIndex}
                            className="
                                flex
                                shrink-0
                                items-center
                                gap-6
                                pr-6
                            "
                        >
                            {repeatedTitle.map((index) => (
                                <div
                                    key={index}
                                    className="
                                        flex
                                        shrink-0
                                        items-center
                                        gap-6
                                    "
                                >
                                    <span
                                        className="
                                            font-october
                                            text-5xl
                                            uppercase
                                            leading-none
                                            md:text-7xl
                                        "
                                    >
                                        {title}
                                    </span>

                                    <span
                                        className="
                                            text-2xl
                                            leading-none
                                            md:text-3xl
                                        "
                                    >
                                        ✳
                                    </span>
                                </div>
                            ))}
                        </div>
                    ),
                )}
            </div>

            <style>{`
                @keyframes page-header-scroll {
                    from {
                        transform: translate3d(0, 0, 0);
                    }

                    to {
                        transform: translate3d(-50%, 0, 0);
                    }
                }

                .page-header-marquee {
                    animation: page-header-scroll 20s linear infinite;
                    will-change: transform;
                }

                @media (prefers-reduced-motion: reduce) {
                    .page-header-marquee {
                        animation: none;
                    }
                }
            `}</style>
        </header>
    );
}
