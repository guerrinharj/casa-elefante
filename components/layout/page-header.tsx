type PageHeaderProps = {
    title: string;
    variant?: "default" | "ttt";
    className?: string;
};

const ROW_COUNT = 12;
const REPEAT_COUNT = 6;

export function PageHeader({
    title,
    variant = "default",
    className = "",
}: PageHeaderProps) {
    const isTTT = variant === "ttt";

    const textColor = isTTT
        ? "text-[#D2232A]"
        : "text-[#FFFDE9]";

    const panelClassName = isTTT
        ? "bg-[#FFFDE9]"
        : "bg-[#D2232A]";

    return (
        <header
            className={`
                mb-8
                w-full
                min-w-0
                px-4
                pt-8
                md:px-6
                md:pt-12
                ${className}
            `}
        >
            {/* TÍTULO ACESSÍVEL */}

            <h1 className="sr-only">
                {title}
            </h1>

            {/* CAIXA PRINCIPAL */}

            <div
                className={`
                    relative
                    isolate
                    h-[160px]
                    w-full
                    overflow-hidden
                    rounded-xl
                    border
                    border-black
                    shadow-[-5px_5px_0_0_#000]
                    md:h-[220px]
                    lg:h-[260px]
                    ${panelClassName}
                `}
            >
                {/* PADRÃO DIAGONAL */}

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-1/2
                        flex
                        w-[200%]
                        -translate-x-1/2
                        -translate-y-1/2
                        -rotate-[17deg]
                        flex-col
                        items-start
                        justify-center
                    "
                >
                    {Array.from(
                        { length: ROW_COUNT },
                        (_, rowIndex) => {
                            const isReverse =
                                rowIndex % 2 !== 0;

                            return (
                                <div
                                    key={rowIndex}
                                    className="
                                        page-header-marquee
                                        flex
                                        w-max
                                        shrink-0
                                        items-center
                                        whitespace-nowrap
                                        motion-reduce:animate-none
                                    "
                                    style={{
                                        animationDirection:
                                            isReverse
                                                ? "reverse"
                                                : "normal",

                                        animationDuration:
                                            isReverse
                                                ? "30s"
                                                : "24s",

                                        animationDelay:
                                            `-${rowIndex * 2.5}s`,
                                    }}
                                >
                                    {Array.from(
                                        { length: 2 },
                                        (_, groupIndex) => (
                                            <div
                                                key={groupIndex}
                                                className="
                                                    flex
                                                    shrink-0
                                                    items-center
                                                "
                                            >
                                                {Array.from(
                                                    {
                                                        length: REPEAT_COUNT,
                                                    },
                                                    (_, index) => (
                                                        <div
                                                            key={index}
                                                            className={`
                                                                flex
                                                                shrink-0
                                                                items-center
                                                                font-october
                                                                text-[42px]
                                                                uppercase
                                                                leading-[0.95]
                                                                tracking-tight
                                                                sm:text-[56px]
                                                                md:text-[72px]
                                                                lg:text-[90px]
                                                                xl:text-[110px]
                                                                ${textColor}
                                                            `}
                                                        >
                                                            <span
                                                                className="
                                                                    shrink-0
                                                                    px-3
                                                                    md:px-5
                                                                "
                                                            >
                                                                {title}
                                                            </span>

                                                            <span
                                                                className="
                                                                    shrink-0
                                                                    px-1
                                                                    text-[0.45em]
                                                                    leading-none
                                                                    md:px-2
                                                                "
                                                            >
                                                                ✳
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>
            </div>
        </header>
    );
}