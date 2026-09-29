"use client";

import {
    useEffect,
    useState,
} from "react";

export function ScrollBackground() {
    const [isWhite, setIsWhite] =
        useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const interval = 700;

            const currentSection =
                Math.floor(
                    window.scrollY /
                        interval,
                );

            setIsWhite(
                currentSection % 2 === 0,
            );
        };

        handleScroll();

        window.addEventListener(
            "scroll",
            handleScroll,
            {
                passive: true,
            },
        );

        return () =>
            window.removeEventListener(
                "scroll",
                handleScroll,
            );
    }, []);

    return (
        <div
            className={`
                fixed
                inset-0
                -z-10
                transition-colors
                duration-700
                ease-in-out
                ${
                    isWhite
                        ? "bg-white"
                        : "bg-white"
                }
            `}
        />
    );
}