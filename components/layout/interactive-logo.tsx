"use client";

import Link from "next/link";

import {
    useEffect,
    useRef,
} from "react";

export function InteractiveLogo() {
    const logoRef =
        useRef<HTMLAnchorElement>(null);

    const cursorRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        const logo = logoRef.current;
        const cursor = cursorRef.current;

        if (!logo || !cursor) {
            return;
        }

        let mouseX =
            window.innerWidth / 2;

        let mouseY =
            window.innerHeight / 2;

        let currentScaleY = 1;
        let currentLetterSpacing = 0;

        let targetScaleY = 1;
        let targetLetterSpacing = 0;

        let animationFrameId: number;

        const handleMouseMove = (
            event: MouseEvent,
        ) => {
            mouseX = event.clientX;
            mouseY = event.clientY;

            const normalizedX =
                mouseX /
                window.innerWidth;

            const normalizedY =
                mouseY /
                window.innerHeight;

            /*
             * Quanto mais para a direita,
             * maior o espaçamento das letras.
             */
            targetLetterSpacing =
                normalizedX * 12;

            /*
             * Quanto mais para baixo,
             * maior a escala vertical.
             */
            targetScaleY =
                1 +
                normalizedY * 0.8;
        };

        const animate = () => {
            /*
             * Suaviza a transformação
             * do logo.
             */
            currentScaleY +=
                (targetScaleY -
                    currentScaleY) *
                0.08;

            currentLetterSpacing +=
                (targetLetterSpacing -
                    currentLetterSpacing) *
                0.08;

            logo.style.transform =
                `scaleY(${currentScaleY})`;

            logo.style.letterSpacing =
                `${currentLetterSpacing}px`;

            /*
             * Elefante acompanha o mouse.
             *
             * scaleX(-1) deixa a tromba
             * virada para a direita.
             */
            cursor.style.transform = `
                translate3d(
                    ${mouseX}px,
                    ${mouseY}px,
                    0
                )
                translate(
                    -50%,
                    -50%
                )
                scaleX(-1)
            `;

            animationFrameId =
                requestAnimationFrame(
                    animate,
                );
        };

        window.addEventListener(
            "mousemove",
            handleMouseMove,
        );

        animationFrameId =
            requestAnimationFrame(
                animate,
            );

        return () => {
            window.removeEventListener(
                "mousemove",
                handleMouseMove,
            );

            cancelAnimationFrame(
                animationFrameId,
            );
        };
    }, []);

    return (
        <>
            <Link
                ref={logoRef}
                href="/"
                className="
                    font-grotesque
                    relative
                    z-[60]
                    origin-left
                    text-4xl
                    font-bold
                    uppercase
                    will-change-transform
                "
            >
                Casa Elefante
            </Link>

            <div
                ref={cursorRef}
                className="
                    pointer-events-none
                    fixed
                    left-0
                    top-0
                    z-[70]
                    hidden
                    select-none
                    text-3xl
                    md:block
                "
            >
                🐘
            </div>
        </>
    );
}