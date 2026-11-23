
"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    usePathname,
    useRouter,
} from "next/navigation";

import {
    motion,
    useAnimationControls,
} from "motion/react";

import type {
    ReactNode,
} from "react";

type PageTransitionContextType = {
    navigate: (href: string) => Promise<void>;
    isTransitioning: boolean;
};

const PageTransitionContext =
    createContext<PageTransitionContextType | null>(null);

const RED = "#D2232A";
const CREAM = "#FFFDE9";

const EXPAND_DURATION = 0.55;
const COLLAPSE_DURATION = 0.65;

const CASCADE_ANGLE = -24;
const CASCADE_ROWS = 18;
const CASCADE_REPETITIONS = 8;

function TransitionCascade({
    title,
    color,
}: {
    title: string;
    color: string;
}) {
    return (
        <div
            className="
                absolute
                inset-0
                overflow-hidden
                pointer-events-none
            "
            aria-hidden="true"
        >
            <div
                className="
                    absolute
                    flex
                    flex-col
                    justify-center
                "
                style={{
                    left: "-70%",
                    top: "-100%",
                    width: "240%",
                    height: "300%",
                    gap: "13px",
                    transform: `rotate(${CASCADE_ANGLE}deg)`,
                    color,
                }}
            >
                {Array.from({
                    length: CASCADE_ROWS,
                }).map((_, rowIndex) => (
                    <motion.div
                        key={rowIndex}
                        className="
                            flex
                            w-max
                            shrink-0
                            whitespace-nowrap
                            font-black
                            uppercase
                            leading-none
                        "
                        style={{
                            gap: "25px",
                            marginLeft:
                                rowIndex % 2 === 0
                                    ? "0px"
                                    : "-140px",
                            fontFamily:
                                'Impact, "Arial Narrow", sans-serif',
                            fontSize:
                                "clamp(30px, 6vw, 65px)",
                            letterSpacing: "-1.5px",
                        }}
                        animate={{
                            x:
                                rowIndex % 2 === 0
                                    ? [0, -180]
                                    : [-180, 0],
                        }}
                        transition={{
                            duration: 1.5,
                            ease: "linear",
                            repeat: Infinity,
                        }}
                    >
                        {Array.from({
                            length: CASCADE_REPETITIONS,
                        }).map((_, repetitionIndex) => (
                            <span
                                key={repetitionIndex}
                                className="shrink-0"
                            >
                                {title}
                            </span>
                        ))}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export function PageTransitionProvider({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const controls = useAnimationControls();

    const [isTransitioning, setIsTransitioning] =
        useState(false);

    const [visible, setVisible] =
        useState(false);

    const [transitionColor, setTransitionColor] =
        useState(CREAM);

    const [transitionTitle, setTransitionTitle] =
        useState("CASA ELEFANTE");

    const [transitionTextColor, setTransitionTextColor] =
        useState(RED);

    const pendingPathRef = useRef<string | null>(null);
    const transitioningRef = useRef(false);

    const timeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const originRef = useRef({
        x: 0,
        y: 0,
        radius: 0,
    });

    const clearFallback = useCallback(() => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const finishTransition = useCallback(async () => {
        if (!transitioningRef.current) {
            return;
        }

        pendingPathRef.current = null;
        clearFallback();

        const {
            x,
            y,
        } = originRef.current;

        await controls.start({
            clipPath: `circle(0px at ${x}px ${y}px)`,
            transition: {
                duration: COLLAPSE_DURATION,
                ease: [0.76, 0, 0.24, 1],
            },
        });

        setVisible(false);
        setIsTransitioning(false);
        transitioningRef.current = false;
    }, [
        controls,
        clearFallback,
    ]);

    useEffect(() => {
        if (
            pendingPathRef.current !== null &&
            pathname === pendingPathRef.current
        ) {
            void finishTransition();
        }
    }, [
        pathname,
        finishTransition,
    ]);

    useEffect(() => {
        return () => {
            clearFallback();
        };
    }, [
        clearFallback,
    ]);

    const navigate = useCallback(async (
        href: string,
    ) => {
        if (transitioningRef.current) {
            return;
        }

        const url = new URL(
            href,
            window.location.origin,
        );

        if (url.origin !== window.location.origin) {
            window.location.assign(url.href);
            return;
        }

        if (url.pathname === pathname) {
            if (url.search || url.hash) {
                router.push(
                    url.pathname + url.search + url.hash,
                );
            }

            return;
        }

        // Define a identidade visual
        // pela página de destino.

        const isTodaTercaTem =
            url.pathname === "/toda-terca-tem" ||
            url.pathname.startsWith(
                "/toda-terca-tem/",
            );

        setTransitionColor(
            isTodaTercaTem ? RED : CREAM,
        );

        setTransitionTitle(
            isTodaTercaTem
                ? "TODA TERÇA TEM"
                : "CASA ELEFANTE",
        );

        setTransitionTextColor(
            isTodaTercaTem ? CREAM : RED,
        );

        transitioningRef.current = true;
        setIsTransitioning(true);

        // Localiza o dial para iniciar
        // a expansão exatamente do centro.

        const dial = document.querySelector(
            "[data-page-transition-origin]",
        );

        const rect = dial?.getBoundingClientRect();

        const x = rect
            ? rect.left + rect.width / 2
            : window.innerWidth / 2;

        const y = rect
            ? rect.top + rect.height / 2
            : window.innerHeight;

        // Calcula o raio necessário
        // para cobrir toda a janela.

        const radius = Math.max(
            Math.hypot(x, y),
            Math.hypot(
                window.innerWidth - x,
                y,
            ),
            Math.hypot(
                x,
                window.innerHeight - y,
            ),
            Math.hypot(
                window.innerWidth - x,
                window.innerHeight - y,
            ),
        ) + 20;

        originRef.current = {
            x,
            y,
            radius,
        };

        pendingPathRef.current = url.pathname;

        // Começa com o círculo fechado.

        controls.set({
            clipPath: `circle(0px at ${x}px ${y}px)`,
        });

        setVisible(true);

        // Expande o círculo com a cascata
        // tipográfica em movimento.

        await controls.start({
            clipPath: `circle(${radius}px at ${x}px ${y}px)`,
            transition: {
                duration: EXPAND_DURATION,
                ease: [0.76, 0, 0.24, 1],
            },
        });

        // Navega somente depois
        // da expansão completa.

        router.push(
            url.pathname + url.search + url.hash,
        );

        // Evita que a tela fique bloqueada
        // indefinidamente caso a navegação falhe.

        timeoutRef.current = setTimeout(() => {
            void finishTransition();
        }, 12000);
    }, [
        pathname,
        router,
        controls,
        finishTransition,
    ]);

    return (
        <PageTransitionContext.Provider
            value={{
                navigate,
                isTransitioning,
            }}
        >
            {children}

            <motion.div
                aria-hidden="true"
                initial={false}
                animate={controls}
                className="
                    pointer-events-none
                    fixed
                    inset-0
                    z-[9999]
                    overflow-hidden
                "
                style={{
                    backgroundColor: transitionColor,
                    visibility: visible
                        ? "visible"
                        : "hidden",
                    clipPath: "circle(0px at 50% 100%)",
                }}
            >
                <TransitionCascade
                    title={transitionTitle}
                    color={transitionTextColor}
                />
            </motion.div>
        </PageTransitionContext.Provider>
    );
}

export function usePageTransition() {
    const context = useContext(
        PageTransitionContext,
    );

    if (!context) {
        throw new Error(
            "usePageTransition deve ser usado dentro de PageTransitionProvider.",
        );
    }

    return context;
}
