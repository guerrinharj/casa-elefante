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
                font-grotesque
                relative
                z-[60]
                text-4xl
                font-bold
                uppercase
            "
        >
            {text}
        </Link>
    );
}