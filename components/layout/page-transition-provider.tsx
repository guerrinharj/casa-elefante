
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

type TransitionTheme = {
    background: string;
    text: string;
    title: string;
};

const PageTransitionContext =
    createContext<PageTransitionContextType | null>(null);

const RED = "#D2232A";
const CREAM = "#FFFDE9";

const EXPAND_DURATION = 0.55;
const COLLAPSE_DURATION = 0.65;

const ENTRANCE_HOLD_DURATION = 0.8;
const ENTRANCE_EXIT_DURATION = 0.85;

const CASCADE_ANGLE = -24;
const CASCADE_ROWS = 18;
const CASCADE_REPETITIONS = 8;

function getTransitionTheme(
    pathname: string,
): TransitionTheme {
    const isTodaTercaTem =
        pathname === "/toda-terca-tem" ||
        pathname.startsWith("/toda-terca-tem/");

    return isTodaTercaTem
        ? {
            background: RED,
            text: CREAM,
            title: "TODA TERÇA TEM",
        }
        : {
            background: CREAM,
            text: RED,
            title: "CASA ELEFANTE",
        };
}

function getTransitionOrigin() {
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

    const radius = Math.max(
        Math.hypot(x, y),
        Math.hypot(window.innerWidth - x, y),
        Math.hypot(x, window.innerHeight - y),
        Math.hypot(
            window.innerWidth - x,
            window.innerHeight - y,
        ),
    ) + 20;

    return {
        x,
        y,
        radius,
    };
}

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

    const [theme, setTheme] = useState<
        TransitionTheme
    >(() => getTransitionTheme(pathname));

    const [isTransitioning, setIsTransitioning] =
        useState(true);

    const [visible, setVisible] =
        useState(true);

    const pendingPathRef = useRef<string | null>(null);
    const transitioningRef = useRef(true);

    const timeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const entranceTimeoutRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    const entranceFinishedRef = useRef(false);

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

    // Animação inicial:
    // aparece ao abrir diretamente qualquer rota.
    //
    // O cleanup cancela os timers corretamente,
    // inclusive no React Strict Mode.

    useEffect(() => {
        if (entranceFinishedRef.current) {
            return;
        }

        let cancelled = false;

        const origin = getTransitionOrigin();

        originRef.current = origin;

        const {
            x,
            y,
            radius,
        } = origin;

        controls.set({
            clipPath: `circle(${radius}px at ${x}px ${y}px)`,
        });

        setVisible(true);

        transitioningRef.current = true;
        setIsTransitioning(true);

        const completeEntrance = () => {
            if (cancelled) {
                return;
            }

            entranceFinishedRef.current = true;

            controls.set({
                clipPath: `circle(0px at ${x}px ${y}px)`,
            });

            setVisible(false);
            setIsTransitioning(false);
            transitioningRef.current = false;
        };

        entranceTimeoutRef.current = setTimeout(
            () => {
                if (cancelled) {
                    return;
                }

                void controls.start({
                    clipPath: `circle(0px at ${x}px ${y}px)`,
                    transition: {
                        duration: ENTRANCE_EXIT_DURATION,
                        ease: [0.76, 0, 0.24, 1],
                    },
                }).then(() => {
                    completeEntrance();
                });

                // Proteção adicional:
                // garante o fechamento caso a
                // animação seja interrompida.

                timeoutRef.current = setTimeout(
                    completeEntrance,
                    (ENTRANCE_EXIT_DURATION + 0.5) * 1000,
                );
            },
            ENTRANCE_HOLD_DURATION * 1000,
        );

        return () => {
            cancelled = true;

            if (entranceTimeoutRef.current !== null) {
                clearTimeout(entranceTimeoutRef.current);
                entranceTimeoutRef.current = null;
            }

            clearFallback();

            controls.stop();
        };
    }, [
        controls,
        clearFallback,
    ]);

    // Finaliza a transição quando a
    // página de destino estiver ativa.

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

    // Limpeza do fallback de navegação.

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

        const destinationTheme =
            getTransitionTheme(url.pathname);

        setTheme(destinationTheme);

        transitioningRef.current = true;
        setIsTransitioning(true);

        const origin = getTransitionOrigin();

        originRef.current = origin;

        const {
            x,
            y,
            radius,
        } = origin;

        pendingPathRef.current = url.pathname;

        controls.set({
            clipPath: `circle(0px at ${x}px ${y}px)`,
        });

        setVisible(true);

        await controls.start({
            clipPath: `circle(${radius}px at ${x}px ${y}px)`,
            transition: {
                duration: EXPAND_DURATION,
                ease: [0.76, 0, 0.24, 1],
            },
        });

        router.push(
            url.pathname + url.search + url.hash,
        );

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
                    backgroundColor: theme.background,
                    visibility: visible
                        ? "visible"
                        : "hidden",
                    clipPath: "circle(150vmax at 50% 50%)",
                }}
            >
                <TransitionCascade
                    title={theme.title}
                    color={theme.text}
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
