"use client";

import Link from "next/link";

type InteractiveLogoProps = {
    text?: string;
};

export function InteractiveLogo({
    text = "Casa Elefante",
}: InteractiveLogoProps) {
    return (
        <Link
            href="/"
            className="
                font-october
                uppercase
                relative
                z-[60]
                text-6xl
                font-bold
            "
        >
            {text}
        </Link>
    );
}