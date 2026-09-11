"use client";

import Link from "next/link";
import {
    useEffect,
    useRef,
} from "react";

export function InteractiveLogo() {
    const logoRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        const logo = logoRef.current;

        if (!logo) {
            return;
        }

        let currentScaleY = 1;
        let currentLetterSpacing = 0;

        let targetScaleY = 1;
        let targetLetterSpacing = 0;

        let animationFrameId: number;

        const handleMouseMove = (
            event: MouseEvent,
        ) => {
            const normalizedX =
                event.clientX /
                window.innerWidth;

            const normalizedY =
                event.clientY /
                window.innerHeight;

            /*
             * Eixo X:
             * esquerda = 0px
             * direita = 8px
             */
            targetLetterSpacing =
                normalizedX * 8;

            /*
             * Eixo Y:
             * topo = scaleY(1)
             * baixo = scaleY(1.6)
             *
             * Uso scaleY para o texto crescer
             * verticalmente sem ficar largo demais.
             */
            targetScaleY =
                1 +
                normalizedY * 0.6;
        };

        const animate = () => {
            /*
             * Interpolação para deixar
             * o movimento suave.
             */
            currentScaleY +=
                (targetScaleY -
                    currentScaleY) *
                0.08;

            currentLetterSpacing +=
                (targetLetterSpacing -
                    currentLetterSpacing) *
                0.08;

            logo.style.transform = `scaleY(${currentScaleY})`;

            logo.style.letterSpacing =
                `${currentLetterSpacing}px`;

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
        <Link
            ref={logoRef}
            href="/"
            className="
                font-grotesque
                origin-left
                text-4xl
                font-bold
                uppercase
                will-change-transform
            "
        >
            Casa Elefante
        </Link>
    );
}