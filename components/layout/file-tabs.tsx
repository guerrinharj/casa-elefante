
"use client";

import {
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
    useAudioPlayer,
} from "@/components/toda-terca-tem/audio-player-provider";

import {
    ShoppingCart,
    UserRound,
    LogOut,
    UserPlus,
    Play,
    Pause,
    Volume2,
    VolumeX,
    X,
} from "lucide-react";

const RED = "#D2232A";
const CREAM = "#FFFDE9";

const SIZE = 660;
const CENTER = SIZE / 2;

const HUB_RADIUS = 57;
const INNER_RADIUS = 155;
const OUTER_INNER_RADIUS = 155;
const OUTER_RADIUS = 210;

const CONTROL_OUTER = 258;
const PROGRESS_OUTER = 290;
const INFO_OUTER = 326;

const INNER_SEGMENT = 60;
const OUTER_SEGMENT = 90;
const DRAG_THRESHOLD = 7;

const tabs = [
    {
        label: "Casa Elefante",
        href: "/",
        lines: ["CASA ELEFANTE"],
    },
    {
        label: "Toda Terça Tem",
        href: "/toda-terca-tem",
        lines: ["TODA TERÇA TEM"],
    },
];

type FileTabsProps = {
    name: string | null;
    isLoggedIn: boolean;
    accountHref: string;
};

type DialRing =
    | "inner"
    | "outer"
    | "seek"
    | "control";

type AccountAction = {
    label: string;
    action:
        | "cart"
        | "account"
        | "logout"
        | "register";
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
    const a = polar(outerRadius, start);
    const b = polar(outerRadius, end);
    const c = polar(innerRadius, end);
    const d = polar(innerRadius, start);

    return [
        `M ${a.x} ${a.y}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${b.x} ${b.y}`,
        `L ${c.x} ${c.y}`,
        `A ${innerRadius} ${innerRadius} 0 0 0 ${d.x} ${d.y}`,
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

function normalizeAngle(degrees: number) {
    return ((degrees % 360) + 360) % 360;
}

function normalizeDifference(degrees: number) {
    if (degrees > 180) {
        return degrees - 360;
    }

    if (degrees < -180) {
        return degrees + 360;
    }

    return degrees;
}

function clamp(
    value: number,
    min: number,
    max: number,
) {
    return Math.max(min, Math.min(max, value));
}

function formatDate(
    value: string | null | undefined,
) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
    }).format(date);
}

export function FileTabs({
    name,
    isLoggedIn,
    accountHref,
}: FileTabsProps) {
    const router = useRouter();
    const uniqueId = useId().replace(/:/g, "");

    const {
        currentPerformance,
        isPlaying,
        currentTime,
        duration,
        volume,
        togglePlay,
        seekTo,
        changeVolume,
        toggleMute,
        clearPerformance,
    } = useAudioPlayer();

    const hasPlayer = Boolean(
        currentPerformance?.audio_url,
    );

    const dialRef = useRef<HTMLDivElement>(null);

    const innerAngleRef = useRef(0);
    const outerAngleRef = useRef(0);

    const innerVelocityRef = useRef(0);
    const outerVelocityRef = useRef(0);

    const draggingRef = useRef(false);
    const hasDraggedRef = useRef(false);
    const lastPointerAngleRef = useRef(0);

    const pointerRingRef = useRef<DialRing | null>(
        null,
    );

    const pointerStartRef = useRef({
        x: 0,
        y: 0,
    });

    const frameRef = useRef<number | null>(null);

    const [innerAngle, setInnerAngle] = useState(0);
    const [outerAngle, setOuterAngle] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [volumeOpen, setVolumeOpen] = useState(false);

    const foreground = RED;
    const background = CREAM;

    const accountActions: AccountAction[] = [
        {
            label: "Carrinho",
            action: "cart",
            icon: ShoppingCart,
        },
        {
            label: isLoggedIn
                ? name?.trim() || "Minha conta"
                : "Entrar",
            action: "account",
            icon: UserRound,
        },
        {
            label: isLoggedIn
                ? "Logout"
                : "Cadastro",
            action: isLoggedIn
                ? "logout"
                : "register",
            icon: isLoggedIn
                ? LogOut
                : UserPlus,
        },
    ];

    const setInnerRotation = useCallback(
        (next: number) => {
            innerAngleRef.current = next;
            setInnerAngle(next);
        },
        [],
    );

    const setOuterRotation = useCallback(
        (next: number) => {
            outerAngleRef.current = next;
            setOuterAngle(next);
        },
        [],
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) {
            return;
        }

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches
        ) {
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

            if (!draggingInner) {
                const restingMotion =
                    Math.sin(time * 0.00065) * 1.2;

                innerVelocityRef.current +=
                    (
                        restingMotion -
                        innerAngleRef.current
                    ) * 0.018 * delta;

                innerVelocityRef.current *= Math.pow(
                    0.88,
                    delta,
                );

                const next = clamp(
                    innerAngleRef.current +
                        innerVelocityRef.current * delta,
                    -45,
                    45,
                );

                setInnerRotation(next);
            }

            if (!draggingOuter) {
                outerVelocityRef.current +=
                    -outerAngleRef.current *
                    0.008 *
                    delta;

                outerVelocityRef.current *= Math.pow(
                    0.94,
                    delta,
                );

                const next = clamp(
                    outerAngleRef.current +
                        outerVelocityRef.current * delta,
                    -40,
                    40,
                );

                setOuterRotation(next);
            }

            frameRef.current =
                requestAnimationFrame(animate);
        }

        frameRef.current =
            requestAnimationFrame(animate);

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

        const dx =
            clientX - (rect.left + rect.width / 2);

        const dy =
            clientY - (rect.top + rect.height / 2);

        const svgScale = hasPlayer ? 1 : 1.5;

        return {
            radius:
                Math.hypot(dx, dy) *
                SIZE /
                rect.width /
                svgScale,
            degrees: normalizeAngle(
                Math.atan2(dy, dx) *
                180 /
                Math.PI,
            ),
        };
    }

    function getRing(
        clientX: number,
        clientY: number,
    ): DialRing | null {
        const {
            radius,
            degrees,
        } = getPointerPosition(clientX, clientY);

        if (degrees < 180) {
            return null;
        }

        if (
            hasPlayer &&
            radius >= CONTROL_OUTER &&
            radius <= PROGRESS_OUTER
        ) {
            return "seek";
        }

        if (
            hasPlayer &&
            radius >= OUTER_RADIUS &&
            radius < CONTROL_OUTER
        ) {
            return "control";
        }

        if (
            radius >= OUTER_INNER_RADIUS &&
            radius <= OUTER_RADIUS
        ) {
            return "outer";
        }

        if (
            radius >= HUB_RADIUS &&
            radius < INNER_RADIUS
        ) {
            return "inner";
        }

        return null;
    }

    function getInnerIndex(
        clientX: number,
        clientY: number,
    ) {
        const degrees = normalizeAngle(
            getPointerPosition(
                clientX,
                clientY,
            ).degrees - innerAngleRef.current,
        );

        if (degrees < 180) {
            return -1;
        }

        const index = Math.floor(
            (degrees - 180) / INNER_SEGMENT,
        );

        return index >= 0 &&
            index < accountActions.length
            ? index
            : -1;
    }

    function getOuterIndex(
        clientX: number,
        clientY: number,
    ) {
        const degrees = normalizeAngle(
            getPointerPosition(
                clientX,
                clientY,
            ).degrees - outerAngleRef.current,
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

    function seekFromPointer(
        clientX: number,
        clientY: number,
    ) {
        if (duration <= 0) {
            return;
        }

        const degrees = getPointerPosition(
            clientX,
            clientY,
        ).degrees;

        seekTo(
            clamp(
                (degrees - 180) / 180,
                0,
                1,
            ) * duration,
        );
    }

    async function handleAccountAction(
        index: number,
    ) {
        const action =
            accountActions[index]?.action;

        if (action === "cart") {
            router.push("/carrinho");
            return;
        }

        if (action === "account") {
            router.push(
                isLoggedIn
                    ? accountHref
                    : "/login",
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

    function handleControlClick(
        clientX: number,
        clientY: number,
    ) {
        const degrees = getPointerPosition(
            clientX,
            clientY,
        ).degrees;

        if (degrees < 240) {
            togglePlay();
        } else if (degrees < 300) {
            setVolumeOpen(!volumeOpen);
        } else {
            clearPerformance();
            setVolumeOpen(false);
        }
    }

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
        }

        if (ring === "outer") {
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

        if (ring === "seek") {
            seekFromPointer(
                event.clientX,
                event.clientY,
            );
        }

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
            event.clientX -
            pointerStartRef.current.x;

        const dy =
            event.clientY -
            pointerStartRef.current.y;

        const distance = Math.hypot(dx, dy);

        if (distance >= DRAG_THRESHOLD) {
            hasDraggedRef.current = true;
        }

        const current = getPointerPosition(
            event.clientX,
            event.clientY,
        ).degrees;

        if (pointerRingRef.current === "seek") {
            seekFromPointer(
                event.clientX,
                event.clientY,
            );

            return;
        }

        if (!hasDraggedRef.current) {
            return;
        }

        const difference = normalizeDifference(
            current -
            lastPointerAngleRef.current,
        );

        if (pointerRingRef.current === "inner") {
            const next = clamp(
                innerAngleRef.current + difference,
                -45,
                45,
            );

            innerVelocityRef.current =
                difference * 0.65;

            setInnerRotation(next);
        }

        if (pointerRingRef.current === "outer") {
            const next = clamp(
                outerAngleRef.current +
                    difference * 0.55,
                -40,
                40,
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

        const ring = getRing(
            event.clientX,
            event.clientY,
        );

        if (
            !hasDraggedRef.current &&
            ring === pointerRingRef.current
        ) {
            if (ring === "inner") {
                const index = getInnerIndex(
                    event.clientX,
                    event.clientY,
                );

                if (index >= 0) {
                    void handleAccountAction(index);
                }
            }

            if (ring === "outer") {
                const index = getOuterIndex(
                    event.clientX,
                    event.clientY,
                );

                if (index >= 0) {
                    router.push(tabs[index].href);
                }
            }

            if (ring === "control") {
                handleControlClick(
                    event.clientX,
                    event.clientY,
                );
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

    function handleWheel(
        event: ReactWheelEvent<HTMLDivElement>,
    ) {
        const ring = getRing(
            event.clientX,
            event.clientY,
        );

        const difference =
            Math.abs(event.deltaX) >
            Math.abs(event.deltaY)
                ? event.deltaX
                : event.deltaY;

        if (ring === "inner") {
            innerVelocityRef.current =
                difference * 0.004;

            setInnerRotation(
                clamp(
                    innerAngleRef.current +
                        difference * 0.045,
                    -45,
                    45,
                ),
            );
        }

        if (ring === "outer") {
            outerVelocityRef.current =
                difference * 0.002;

            setOuterRotation(
                clamp(
                    outerAngleRef.current +
                        difference * 0.025,
                    -40,
                    40,
                ),
            );
        }

        if (
            ring === "seek" &&
            duration > 0
        ) {
            seekTo(
                currentTime +
                (difference > 0 ? 5 : -5),
            );
        }
    }

    if (!mounted) {
        return null;
    }

    const progress = duration > 0
        ? clamp(currentTime / duration, 0, 1)
        : 0;

    const progressEnd =
        180 + Math.max(progress * 180, 0.01);

    const title =
        currentPerformance?.name ||
        "APRESENTAÇÃO";

    const date = formatDate(
        currentPerformance?.performance_date,
    );

    const dialPixels = hasPlayer
        ? "min(96vw, 590px)"
        : "min(96vw, 380px)";

    const halfHeight = hasPlayer
        ? "min(48vw, 295px)"
        : "min(48vw, 190px)";

    const svgScale = hasPlayer ? 1 : 1.5;

    return (
        <div
            className="
                pointer-events-none
                fixed
                bottom-0
                left-0
                z-[100]
                w-full
                md:left-auto
                md:right-6
                md:w-auto
            "
            style={{
                height: halfHeight,
            }}
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
                    left-1/2
                    top-0
                    aspect-square
                    -translate-x-1/2
                    touch-none
                    select-none
                    md:left-auto
                    md:right-0
                    md:translate-x-0
                "
                style={{
                    width: dialPixels,
                    height: dialPixels,
                }}
            >
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="h-full w-full"
                    aria-label="Dial Casa Elefante e player de áudio"
                >
                    <defs>
                        <path
                            id={`${uniqueId}-info-line`}
                            d={arcPath(309, 185, 355)}
                        />
                    </defs>

                    <g
                        transform={
                            hasPlayer
                                ? undefined
                                : `translate(${CENTER} ${CENTER}) scale(${svgScale}) translate(${-CENTER} ${-CENTER})`
                        }
                    >
                        {hasPlayer && (
                            <g>
                                {/* ANEL 5 — INFORMAÇÕES */}

                                <path
                                    d={sectorPath(
                                        PROGRESS_OUTER,
                                        INFO_OUTER,
                                        180,
                                        360,
                                    )}
                                    fill={CREAM}
                                    stroke={RED}
                                    strokeWidth="2"
                                />

                                <text
                                    fill={RED}
                                    fontSize="17"
                                    fontWeight="900"
                                    textAnchor="middle"
                                    pointerEvents="none"
                                    style={{
                                        fontFamily:
                                            "var(--font-anton), sans-serif",
                                    }}
                                >
                                    <textPath
                                        href={`#${uniqueId}-info-line`}
                                        startOffset="50%"
                                    >
                                        {date
                                            ? `${title.toUpperCase()}   •   ${date}`
                                            : title.toUpperCase()}
                                    </textPath>
                                </text>

                                {/* ANEL 4 — PROGRESSO */}

                                <path
                                    d={sectorPath(
                                        CONTROL_OUTER,
                                        PROGRESS_OUTER,
                                        180,
                                        360,
                                    )}
                                    fill={CREAM}
                                    stroke={RED}
                                    strokeWidth="2"
                                />

                                <path
                                    d={arcPath(
                                        274,
                                        180,
                                        360,
                                    )}
                                    fill="none"
                                    stroke={RED}
                                    strokeWidth="3"
                                    opacity="0.22"
                                />

                                <path
                                    d={arcPath(
                                        274,
                                        180,
                                        progressEnd,
                                    )}
                                    fill="none"
                                    stroke={RED}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                />

                                <circle
                                    cx={
                                        polar(
                                            274,
                                            progressEnd,
                                        ).x
                                    }
                                    cy={
                                        polar(
                                            274,
                                            progressEnd,
                                        ).y
                                    }
                                    r="6"
                                    fill={RED}
                                />

                                {/* ANEL 3 — CONTROLES */}

                                {[0, 1, 2].map((index) => {
                                    const start =
                                        180 + index * 60;

                                    const end = start + 60;

                                    const p = polar(
                                        234,
                                        (start + end) / 2,
                                    );

                                    const Icon = index === 0
                                        ? isPlaying
                                            ? Pause
                                            : Play
                                        : index === 1
                                            ? volume === 0
                                                ? VolumeX
                                                : Volume2
                                            : X;

                                    return (
                                        <g
                                            key={index}
                                            className="group cursor-pointer"
                                        >
                                            <path
                                                d={sectorPath(
                                                    OUTER_RADIUS,
                                                    CONTROL_OUTER,
                                                    start,
                                                    end,
                                                )}
                                                fill={CREAM}
                                                stroke={RED}
                                                strokeWidth="2"
                                                className="
                                                    transition-colors
                                                    duration-200
                                                    group-hover:fill-[#D2232A]
                                                "
                                            />

                                            <g
                                                transform={`translate(${p.x - 13} ${p.y - 13})`}
                                                pointerEvents="none"
                                            >
                                                <Icon
                                                    size={26}
                                                    className="
                                                        text-[#D2232A]
                                                        transition-colors
                                                        duration-200
                                                        group-hover:text-[#FFFDE9]
                                                    "
                                                />
                                            </g>
                                        </g>
                                    );
                                })}
                            </g>
                        )}

                        {/* ANEL 2 — NAVEGAÇÃO */}

                        <g
                            transform={`rotate(${outerAngle} ${CENTER} ${CENTER})`}
                        >
                            {tabs.map((tab, index) => {
                                const start =
                                    180 +
                                    index * OUTER_SEGMENT;

                                const end =
                                    start + OUTER_SEGMENT;

                                const pathId =
                                    `${uniqueId}-outer-${index}`;

                                return (
                                    <g
                                        key={tab.href}
                                        className="group cursor-pointer"
                                    >
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
                                                transition-colors
                                                duration-200
                                                group-hover:fill-[#D2232A]
                                            "
                                        />

                                        <path
                                            id={pathId}
                                            d={arcPath(
                                                183,
                                                start + 5,
                                                end - 5,
                                            )}
                                            fill="none"
                                            pointerEvents="none"
                                        />

                                        <text
                                            fill={foreground}
                                            fontSize="21"
                                            fontWeight="900"
                                            textAnchor="middle"
                                            pointerEvents="none"
                                            className="
                                                transition-colors
                                                duration-200
                                                group-hover:fill-[#FFFDE9]
                                            "
                                            style={{
                                                fontFamily:
                                                    "var(--font-anton), sans-serif",
                                            }}
                                        >
                                            <textPath
                                                href={`#${pathId}`}
                                                startOffset="50%"
                                            >
                                                {tab.lines[0]}
                                            </textPath>
                                        </text>
                                    </g>
                                );
                            })}
                        </g>

                        {/* ANEL 1 — CONTA */}

                        <g
                            transform={`rotate(${innerAngle} ${CENTER} ${CENTER})`}
                        >
                            {accountActions.map(
                                (item, index) => {
                                    const start =
                                        180 +
                                        index * INNER_SEGMENT;

                                    const end =
                                        start + INNER_SEGMENT;

                                    const p = polar(
                                        111,
                                        (start + end) / 2,
                                    );

                                    const Icon = item.icon;

                                    return (
                                        <g
                                            key={item.action}
                                            className="group cursor-pointer"
                                        >
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
                                                    transition-colors
                                                    duration-200
                                                    group-hover:fill-[#D2232A]
                                                "
                                            />

                                            <g
                                                transform={`translate(${p.x - 13} ${p.y - 13})`}
                                                pointerEvents="none"
                                            >
                                                <Icon
                                                    size={26}
                                                    strokeWidth={2.5}
                                                    className="
                                                        text-[#D2232A]
                                                        transition-colors
                                                        duration-200
                                                        group-hover:text-[#FFFDE9]
                                                    "
                                                />
                                            </g>
                                        </g>
                                    );
                                },
                            )}
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
                    </g>
                </svg>

                {/* CONTROLE DE VOLUME */}

                {hasPlayer && volumeOpen && (
                    <div
                        className="
                            absolute
                            left-1/2
                            top-[12%]
                            z-10
                            flex
                            -translate-x-1/2
                            items-center
                            gap-2
                            rounded-full
                            border-2
                            border-[#D2232A]
                            bg-[#FFFDE9]
                            px-3
                            py-2
                            text-[#D2232A]
                            shadow-[3px_3px_0_#D2232A]
                        "
                        onPointerDown={(event) => {
                            event.stopPropagation();
                        }}
                        onPointerMove={(event) => {
                            event.stopPropagation();
                        }}
                        onPointerUp={(event) => {
                            event.stopPropagation();
                        }}
                    >
                        <button
                            type="button"
                            onClick={toggleMute}
                            aria-label={
                                volume === 0
                                    ? "Ativar som"
                                    : "Silenciar"
                            }
                        >
                            {volume === 0 ? (
                                <VolumeX size={18} />
                            ) : (
                                <Volume2 size={18} />
                            )}
                        </button>

                        <input
                            aria-label="Volume"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(event) => {
                                changeVolume(
                                    Number(
                                        event.target.value,
                                    ),
                                );
                            }}
                            className="
                                w-24
                                accent-[#D2232A]
                            "
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
