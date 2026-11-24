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

    return (
        <header
            className={`
                mb-8
                w-full
                overflow-hidden
                px-4
                pt-8
                md:px-6
                md:pt-12
                ${className}
            `}
        >
            <h1
                className={`
                    w-full
                    text-center
                    font-october
                    text-[12vw]
                    uppercase
                    leading-[0.85]
                    tracking-tight
                    whitespace-nowrap
                    ${textColor}
                `}
            >
                {title}
            </h1>
        </header>
    );
}