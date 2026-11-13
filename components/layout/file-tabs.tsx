
"use client";

import {
    usePathname,
    useRouter,
} from "next/navigation";

import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";

import type {
    PointerEvent as ReactPointerEvent,
    WheelEvent as ReactWheelEvent,
} from "react";

import {
    createClient,
} from "@/lib/supabase/client";

import {
    ShoppingCart,
    UserRound,
    LogOut,
    UserPlus,
} from "lucide-react";

const RED = "#D2232A";
const CREAM = "#FFFDE9";

const SIZE = 440;
const CENTER = SIZE / 2;

const OUTER_RADIUS = 210;
const OUTER_INNER_RADIUS = 155;

const INNER_RADIUS = 155;
const HUB_RADIUS = 57;

const INNER_SEGMENT = 60;
const OUTER_SEGMENT = 45;

const DRAG_THRESHOLD = 7;

const tabs = [
    {
        label: "Loja",
        href: "/",
        lines: ["LOJA"],
    },
    {
        label: "Toda Terça Tem",
        href: "/toda-terca-tem",
        lines: ["TODA TERÇA", "TEM"],
    },
    {
        label: "Newsletter",
        href: "/newsletter",
        lines: ["NEWSLETTER"],
    },
    {
        label: "Sobre",
        href: "/sobre",
        lines: ["SOBRE"],
    },
];

type FileTabsProps = {
    name: string | null;
    isLoggedIn: boolean;
    accountHref: string;
};

type DialRing = "inner" | "outer";

type AccountAction = {
    label: string;
    action: "cart" | "account" | "logout" | "register";
    icon: typeof ShoppingCart;
};

function polar(
    radius: number,
    degrees: number,
) {
    const radians = degrees * Math.PI / 180;

    return {
        x: CENTER + radius * Math.cos(radians),
        y: CENTER + radius * Math.sin(radians),
    };
}

function sectorPath(
    innerRadius: number,
    outerRadius: number,
    start: number,
    end: number,
) {
    const outerStart = polar(outerRadius, start);
    const outerEnd = polar(outerRadius, end);
    const innerEnd = polar(innerRadius, end);
    const innerStart = polar(innerRadius, start);

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
        "Z",
    ].join(" ");
}

function arcPath(
    radius: number,
    start: number,
    end: number,
) {
    const a = polar(radius, start);
    const b = polar(radius, end);

    return [
        `M ${a.x} ${a.y}`,
        `A ${radius} ${radius} 0 0 1 ${b.x} ${b.y}`,
    ].join(" ");
}

function normalizeAngle(
    degrees: number,
) {
    return ((degrees % 360) + 360) % 360;
}

function normalizeDifference(
    difference: number,
) {
    if (difference > 180) {
        return difference - 360;
    }

    if (difference < -180) {
        return difference + 360;
    }

    return difference;
}

export function FileTabs({
    name,
    isLoggedIn,
    accountHref,
}: FileTabsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const uniqueId = useId().replace(/:/g, "");

    const dialRef = useRef<HTMLDivElement>(null);

    const innerAngleRef = useRef(0);
    const outerAngleRef = useRef(0);

    const innerVelocityRef = useRef(0);
    const outerVelocityRef = useRef(0);

    const draggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const lastPointerAngleRef = useRef(0);

    const pointerRingRef = useRef<DialRing | null>(null);

    const pointerStartRef = useRef({
        x: 0,
        y: 0,
    });

    const frameRef = useRef<number | null>(null);

    const [innerAngle, setInnerAngle] = useState(0);
    const [outerAngle, setOuterAngle] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const isTodaTercaTem = pathname.startsWith(
        "/toda-terca-tem",
    );

    const foreground = isTodaTercaTem
        ? CREAM
        : RED;

    const background = isTodaTercaTem
        ? RED
        : CREAM;

    const displayName = isLoggedIn
        ? (
            name?.trim() && !name.includes("@")
                ? name.trim()
                : "CONTA"
        ).toLocaleUpperCase("pt-BR")
        : "ENTRAR";

    const accountActions: AccountAction[] = [
        {
            label: "Carrinho",
            action: "cart",
            icon: ShoppingCart,
        },
        {
            label: isLoggedIn ? displayName : "Entrar",
            action: "account",
            icon: UserRound,
        },
        {
            label: isLoggedIn ? "Logout" : "Cadastro",
            action: isLoggedIn ? "logout" : "register",
            icon: isLoggedIn ? LogOut : UserPlus,
        },
    ];

    const setInnerRotation = useCallback((next: number) => {
        innerAngleRef.current = next;
        setInnerAngle(next);
    }, []);

    const setOuterRotation = useCallback((next: number) => {
        outerAngleRef.current = next;
        setOuterAngle(next);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    /*
     * ANIMAÇÃO INDEPENDENTE DOS DOIS ANÉIS
     */

    useEffect(() => {
        if (!mounted) {
            return;
        }

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;

        if (reducedMotion) {
            return;
        }

        let lastTime = 0;

        function animate(time: number) {
            const delta = lastTime
                ? Math.min(
                    (time - lastTime) / 16.67,
                    2,
                )
                : 1;

            lastTime = time;

            const draggingInner =
                draggingRef.current &&
                pointerRingRef.current === "inner";

            const draggingOuter =
                draggingRef.current &&
                pointerRingRef.current === "outer";

            /*
             * ANEL INTERNO
             * Carrinho / Conta / Logout
             */

            if (!draggingInner) {
                const restingMotion =
                    Math.sin(time * 0.00065) * 1.2;

                const difference =
                    restingMotion - innerAngleRef.current;

                innerVelocityRef.current +=
                    difference * 0.018 * delta;

                innerVelocityRef.current *= Math.pow(
                    0.88,
                    delta,
                );

                const next = Math.max(
                    -45,
                    Math.min(
                        45,
                        innerAngleRef.current +
                            innerVelocityRef.current * delta,
                    ),
                );

                setInnerRotation(next);
            }

            /*
             * ANEL EXTERNO
             * Menu principal
             */

            if (!draggingOuter) {
                const difference =
                    -outerAngleRef.current;

                outerVelocityRef.current +=
                    difference * 0.008 * delta;

                outerVelocityRef.current *= Math.pow(
                    0.94,
                    delta,
                );

                const next = Math.max(
                    -40,
                    Math.min(
                        40,
                        outerAngleRef.current +
                            outerVelocityRef.current * delta,
                    ),
                );

                setOuterRotation(next);
            }

            frameRef.current = requestAnimationFrame(
                animate,
            );
        }

        frameRef.current = requestAnimationFrame(
            animate,
        );

        return () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(
                    frameRef.current,
                );
            }
        };
    }, [
        mounted,
        setInnerRotation,
        setOuterRotation,
    ]);

    /*
     * POSIÇÃO DO PONTEIRO
     */

    function getPointerPosition(
        clientX: number,
        clientY: number,
    ) {
        const rect =
            dialRef.current?.getBoundingClientRect();

        if (!rect) {
            return {
                radius: 0,
                degrees: 0,
            };
        }

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        const scale = SIZE / rect.width;

        return {
            radius: Math.sqrt(
                dx * dx + dy * dy,
            ) * scale,
            degrees: normalizeAngle(
                Math.atan2(dy, dx) *
                    (180 / Math.PI),
            ),
        };
    }

    function getRing(
        clientX: number,
        clientY: number,
    ): DialRing | null {
        const position = getPointerPosition(
            clientX,
            clientY,
        );

        if (
            position.radius >= OUTER_INNER_RADIUS &&
            position.radius <= OUTER_RADIUS
        ) {
            return "outer";
        }

        if (
            position.radius >= HUB_RADIUS &&
            position.radius < INNER_RADIUS
        ) {
            return "inner";
        }

        return null;
    }

    /*
     * IDENTIFICAÇÃO DOS SETORES
     */

    function getInnerIndex(
        clientX: number,
        clientY: number,
    ) {
        const position = getPointerPosition(
            clientX,
            clientY,
        );

        const degrees = normalizeAngle(
            position.degrees - innerAngleRef.current,
        );

        if (degrees < 180) {
            return -1;
        }

        const index = Math.floor(
            (degrees - 180) / INNER_SEGMENT,
        );

        return index >= 0 && index < accountActions.length
            ? index
            : -1;
    }

    function getOuterIndex(
        clientX: number,
        clientY: number,
    ) {
        const position = getPointerPosition(
            clientX,
            clientY,
        );

        const degrees = normalizeAngle(
            position.degrees - outerAngleRef.current,
        );

        if (degrees < 180) {
            return -1;
        }

        const index = Math.floor(
            (degrees - 180) / OUTER_SEGMENT,
        );

        return index >= 0 && index < tabs.length
            ? index
            : -1;
    }

    /*
     * AÇÕES DO ANEL INTERNO
     */

    async function handleAccountAction(
        index: number,
    ) {
        const action = accountActions[index]?.action;

        if (action === "cart") {
            router.push("/carrinho");
            return;
        }

        if (action === "account") {
            router.push(
                isLoggedIn ? accountHref : "/login",
            );
            return;
        }

        if (action === "register") {
            router.push("/cadastro");
            return;
        }

        if (action === "logout") {
            if (loggingOut) {
                return;
            }

            setLoggingOut(true);

            try {
                const supabase = createClient();

                const {
                    error,
                } = await supabase.auth.signOut();

                if (error) {
                    throw error;
                }

                router.replace("/");
                router.refresh();
            } catch (error) {
                console.error(
                    "Erro ao fazer logout:",
                    error,
                );

                setLoggingOut(false);
            }
        }
    }

    /*
     * INTERAÇÃO COM O PONTEIRO
     */

    function handlePointerDown(
        event: ReactPointerEvent<HTMLDivElement>,
    ) {
        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {
            return;
        }

        const ring = getRing(
            event.clientX,
            event.clientY,
        );

        if (!ring) {
            return;
        }

        pointerRingRef.current = ring;
        draggingRef.current = true;
        hasDraggedRef.current = false;

        if (ring === "inner") {
            innerVelocityRef.current = 0;
        } else {
            outerVelocityRef.current = 0;
        }

        pointerStartRef.current = {
            x: event.clientX,
            y: event.clientY,
        };

        lastPointerAngleRef.current =
            getPointerPosition(
                event.clientX,
                event.clientY,
            ).degrees;

        event.currentTarget.setPointerCapture(
            event.pointerId,
        );
    }

    function handlePointerMove(
        event: ReactPointerEvent<HTMLDivElement>,
    ) {
        if (!draggingRef.current) {
            return;
        }

        const dx =
            event.clientX - pointerStartRef.current.x;

        const dy =
            event.clientY - pointerStartRef.current.y;

        const distance = Math.sqrt(
            dx * dx + dy * dy,
        );

        if (distance >= DRAG_THRESHOLD) {
            hasDraggedRef.current = true;
        }

        if (!hasDraggedRef.current) {
            return;
        }

        const current = getPointerPosition(
            event.clientX,
            event.clientY,
        ).degrees;

        const difference = normalizeDifference(
            current - lastPointerAngleRef.current,
        );

        if (pointerRingRef.current === "inner") {
            const next = Math.max(
                -45,
                Math.min(
                    45,
                    innerAngleRef.current + difference,
                ),
            );

            innerVelocityRef.current =
                difference * 0.65;

            setInnerRotation(next);
        }

        if (pointerRingRef.current === "outer") {
            const next = Math.max(
                -40,
                Math.min(
                    40,
                    outerAngleRef.current +
                        difference * 0.55,
                ),
            );

            outerVelocityRef.current =
                difference * 0.3;

            setOuterRotation(next);
        }

        lastPointerAngleRef.current = current;
    }

    function handlePointerUp(
        event: ReactPointerEvent<HTMLDivElement>,
    ) {
        if (!draggingRef.current) {
            return;
        }

        draggingRef.current = false;

        if (!hasDraggedRef.current) {
            const ring = getRing(
                event.clientX,
                event.clientY,
            );

            if (
                ring === "inner" &&
                pointerRingRef.current === "inner"
            ) {
                const index = getInnerIndex(
                    event.clientX,
                    event.clientY,
                );

                if (index >= 0) {
                    void handleAccountAction(index);
                }
            }

            if (
                ring === "outer" &&
                pointerRingRef.current === "outer"
            ) {
                const index = getOuterIndex(
                    event.clientX,
                    event.clientY,
                );

                if (index >= 0) {
                    router.push(tabs[index].href);
                }
            }
        }

        pointerRingRef.current = null;

        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId,
            )
        ) {
            event.currentTarget.releasePointerCapture(
                event.pointerId,
            );
        }
    }

    function handlePointerCancel() {
        draggingRef.current = false;
        hasDraggedRef.current = false;
        pointerRingRef.current = null;
    }

    /*
     * TRACKPAD / MOUSE WHEEL
     */

    function handleWheel(
        event: ReactWheelEvent<HTMLDivElement>,
    ) {
        const ring = getRing(
            event.clientX,
            event.clientY,
        );

        if (!ring) {
            return;
        }

        const difference =
            Math.abs(event.deltaX) > Math.abs(event.deltaY)
                ? event.deltaX
                : event.deltaY;

        if (ring === "inner") {
            const next = Math.max(
                -45,
                Math.min(
                    45,
                    innerAngleRef.current +
                        difference * 0.045,
                ),
            );

            innerVelocityRef.current =
                difference * 0.004;

            setInnerRotation(next);
        }

        if (ring === "outer") {
            const next = Math.max(
                -40,
                Math.min(
                    40,
                    outerAngleRef.current +
                        difference * 0.025,
                ),
            );

            outerVelocityRef.current =
                difference * 0.002;

            setOuterRotation(next);
        }
    }

    if (!mounted) {
        return null;
    }

    return (
        <div
            className="
                pointer-events-none
                fixed
                bottom-0
                left-0
                z-[100]
                h-[160px]
                w-full
                overflow-hidden
                md:left-auto
                md:right-6
                md:h-[190px]
                md:w-[380px]
            "
        >
            <div
                ref={dialRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onWheel={handleWheel}
                className="
                    pointer-events-auto
                    absolute
                    top-0
                    left-1/2
                    aspect-square
                    h-[320px]
                    w-[320px]
                    -translate-x-1/2
                    touch-none
                    select-none
                    md:h-[380px]
                    md:w-[380px]
                "
            >
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="h-full w-full"
                    aria-label="Navegação Casa Elefante"
                >
                    {/* ANEL EXTERNO — MENU PRINCIPAL */}

                    <g
                        transform={`rotate(${outerAngle} ${CENTER} ${CENTER})`}
                    >
                        {tabs.map((tab, index) => {
                            const start =
                                180 + index * OUTER_SEGMENT;

                            const end =
                                start + OUTER_SEGMENT;

                            const hasTwoLines =
                                tab.lines.length > 1;

                            return (
                                <g key={tab.href}>
                                    <path
                                        d={sectorPath(
                                            OUTER_INNER_RADIUS,
                                            OUTER_RADIUS,
                                            start,
                                            end,
                                        )}
                                        fill={background}
                                        stroke={foreground}
                                        strokeWidth="2"
                                        className="
                                            cursor-grab
                                            active:cursor-grabbing
                                        "
                                    />

                                    {tab.lines.map(
                                        (line, lineIndex) => {
                                            const radius =
                                                hasTwoLines
                                                    ? lineIndex === 0
                                                        ? 198
                                                        : 174
                                                    : 183;

                                            const fontSize =
                                                hasTwoLines
                                                    ? lineIndex === 0
                                                        ? 14
                                                        : 20
                                                    : index === 2
                                                      ? 16
                                                      : 23;

                                            const pathId =
                                                `${uniqueId}-outer-${index}-${lineIndex}`;

                                            return (
                                                <g key={pathId}>
                                                    <path
                                                        id={pathId}
                                                        d={arcPath(
                                                            radius,
                                                            start + 2,
                                                            end - 2,
                                                        )}
                                                        fill="none"
                                                    />

                                                    <text
                                                        fill={foreground}
                                                        fontSize={fontSize}
                                                        fontWeight="900"
                                                        textAnchor="middle"
                                                        pointerEvents="none"
                                                        style={{
                                                            fontFamily:
                                                                "var(--font-anton), sans-serif",
                                                        }}
                                                    >
                                                        <textPath
                                                            href={`#${pathId}`}
                                                            startOffset="50%"
                                                        >
                                                            {line}
                                                        </textPath>
                                                    </text>
                                                </g>
                                            );
                                        },
                                    )}
                                </g>
                            );
                        })}
                    </g>

                    {/* ANEL INTERNO — APENAS ÍCONES */}

                    <g
                        transform={`rotate(${innerAngle} ${CENTER} ${CENTER})`}
                    >
                        {accountActions.map((item, index) => {
                            const start =
                                180 + index * INNER_SEGMENT;

                            const end =
                                start + INNER_SEGMENT;

                            const middle =
                                (start + end) / 2;

                            const iconPosition = polar(
                                111,
                                middle,
                            );

                            const Icon = item.icon;

                            return (
                                <g key={item.action}>
                                    <path
                                        d={sectorPath(
                                            HUB_RADIUS,
                                            INNER_RADIUS,
                                            start,
                                            end,
                                        )}
                                        fill={background}
                                        stroke={foreground}
                                        strokeWidth="1.5"
                                        className="
                                            cursor-grab
                                            active:cursor-grabbing
                                        "
                                    />

                                    <g
                                        transform={`
                                            translate(
                                                ${iconPosition.x - 13}
                                                ${iconPosition.y - 13}
                                            )
                                        `}
                                        pointerEvents="none"
                                    >
                                        <Icon
                                            size={26}
                                            strokeWidth={2.5}
                                            color={foreground}
                                        />
                                    </g>
                                </g>
                            );
                        })}
                    </g>

                    {/* CENTRO */}

                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={HUB_RADIUS}
                        fill={background}
                        stroke={foreground}
                        strokeWidth="2.5"
                        pointerEvents="none"
                    />

                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r="9"
                        fill={foreground}
                        pointerEvents="none"
                    />
                </svg>
            </div>
        </div>
    );
}
