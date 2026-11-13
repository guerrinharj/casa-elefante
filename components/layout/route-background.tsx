"use client";

import {
    usePathname,
} from "next/navigation";

import {
    useEffect,
} from "react";

const RED = "#D2232A";
const CREAM = "#FFFDE9";

export function RouteBackground() {
    const pathname = usePathname();

    useEffect(() => {
        const isTodaTercaTem =
            pathname === "/toda-terca-tem" ||
            pathname.startsWith("/toda-terca-tem/");

        const background = isTodaTercaTem
            ? RED
            : CREAM;

        const html = document.documentElement;
        const body = document.body;

        html.style.backgroundColor = background;
        body.style.backgroundColor = background;

        html.style.setProperty(
            "--background",
            background,
        );

        body.style.setProperty(
            "--background",
            background,
        );

        return () => {
            html.style.backgroundColor = "";
            body.style.backgroundColor = "";

            html.style.removeProperty(
                "--background",
            );

            body.style.removeProperty(
                "--background",
            );
        };
    }, [pathname]);

    return null;
}