
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

const RED = "#D2232A";
const CREAM = "#FFFDE9";

const SIZE = 440;
const CENTER = SIZE / 2;
const RADIUS = 200;
const INNER_RADIUS = 55;
const SEGMENT = 45;

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
    start: number,
    end: number,
) {
    const outerStart = polar(RADIUS, start);
    const outerEnd = polar(RADIUS, end);
    const innerEnd = polar(INNER_RADIUS, end);
    const innerStart = polar(INNER_RADIUS, start);

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${RADIUS} ${RADIUS} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerEnd.x} ${innerEnd.y}`,
        `A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${innerStart.x} ${innerStart.y}`,
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

export function FileTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const uniqueId = useId().replace(/:/g, "");

    const dialRef = useRef<HTMLDivElement>(null);
    const angleRef = useRef(0);
    const velocityRef = useRef(0);
    const draggingRef = useRef(false);
    const lastPointerAngleRef = useRef(0);
    const pointerStartRef = useRef({
        x: 0,
        y: 0,
    });
    const hasDraggedRef = useRef(false);
    const frameRef = useRef<number | null>(null);

    const [angle, setAngle] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    const isTodaTercaTem = pathname.startsWith(
        "/toda-terca-tem",
    );

    const foreground = isTodaTercaTem
        ? CREAM
        : RED;

    const background = isTodaTercaTem
        ? RED
        : CREAM;

    const setRotation = useCallback((next: number) => {
        angleRef.current = next;
        setAngle(next);
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const active = tabs.findIndex((tab) => {
            return tab.href === "/"
                ? pathname === "/"
                : pathname === tab.href ||
                      pathname.startsWith(
                          `${tab.href}/`,
                      );
        });

        if (active >= 0) {
            setActiveIndex(active);
        }
    }, [pathname]);

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

            if (!draggingRef.current) {
                const restingMotion =
                    Math.sin(time * 0.00065) * 1.2;

                const difference =
                    restingMotion - angleRef.current;

                velocityRef.current +=
                    difference * 0.018 * delta;

                velocityRef.current *= Math.pow(
                    0.88,
                    delta,
                );

                setRotation(
                    angleRef.current +
                        velocityRef.current * delta,
                );
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
    }, [mounted, setRotation]);

    function getPointerAngle(
        clientX: number,
        clientY: number,
    ) {
        const rect =
            dialRef.current?.getBoundingClientRect();

        if (!rect) {
            return 0;
        }

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        return (
            Math.atan2(
                clientY - centerY,
                clientX - centerX,
            ) *
            (180 / Math.PI)
        );
    }

    function getSectorIndex(
        clientX: number,
        clientY: number,
    ) {
        const rect =
            dialRef.current?.getBoundingClientRect();

        if (!rect) {
            return -1;
        }

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;

        const radius = Math.sqrt(
            dx * dx + dy * dy,
        );

        const scale = rect.width / SIZE;

        if (
            radius < INNER_RADIUS * scale ||
            radius > RADIUS * scale
        ) {
            return -1;
        }

        let degrees =
            Math.atan2(dy, dx) *
            (180 / Math.PI);

        degrees -= angleRef.current;

        degrees = ((degrees % 360) + 360) % 360;

        if (degrees < 180 || degrees >= 360) {
            return -1;
        }

        const index = Math.floor(
            (degrees - 180) / SEGMENT,
        );

        return index >= 0 && index < tabs.length
            ? index
            : -1;
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

        draggingRef.current = true;
        hasDraggedRef.current = false;
        velocityRef.current = 0;

        pointerStartRef.current = {
            x: event.clientX,
            y: event.clientY,
        };

        lastPointerAngleRef.current = getPointerAngle(
            event.clientX,
            event.clientY,
        );

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

        const current = getPointerAngle(
            event.clientX,
            event.clientY,
        );

        const difference = normalizeDifference(
            current - lastPointerAngleRef.current,
        );

        const next = Math.max(
            -55,
            Math.min(
                55,
                angleRef.current + difference,
            ),
        );

        velocityRef.current = difference * 0.65;

        setRotation(next);

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
            const index = getSectorIndex(
                event.clientX,
                event.clientY,
            );

            if (index >= 0) {
                setActiveIndex(index);
                router.push(tabs[index].href);
            }
        }

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
    }

    function handleWheel(
        event: ReactWheelEvent<HTMLDivElement>,
    ) {
        const difference =
            Math.abs(event.deltaX) > Math.abs(event.deltaY)
                ? event.deltaX
                : event.deltaY;

        const next = Math.max(
            -55,
            Math.min(
                55,
                angleRef.current + difference * 0.045,
            ),
        );

        velocityRef.current = difference * 0.004;

        setRotation(next);
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
                h-[140px]
                w-full
                overflow-hidden
                md:left-auto
                md:right-6
                md:h-[160px]
                md:w-[320px]
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
                    left-1/2
                    top-0
                    aspect-square
                    h-[280px]
                    w-[280px]
                    -translate-x-1/2
                    cursor-grab
                    touch-none
                    select-none
                    active:cursor-grabbing
                    md:h-[320px]
                    md:w-[320px]
                "
            >
                <svg
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="h-full w-full"
                    aria-label="Navegação giratória"
                >
                    <g
                        transform={`rotate(${angle} ${CENTER} ${CENTER})`}
                    >
                        <circle
                            cx={CENTER}
                            cy={CENTER}
                            r={RADIUS}
                            fill={background}
                            stroke={foreground}
                            strokeWidth="3"
                        />

                        {tabs.map((tab, index) => {
                            const start =
                                180 + index * SEGMENT;

                            const end =
                                start + SEGMENT;

                            const middle =
                                (start + end) / 2;

                            const pathId =
                                `${uniqueId}-dial-${index}`;

                            const dot = polar(
                                105,
                                middle,
                            );

                            const hasTwoLines =
                                tab.lines.length > 1;

                            return (
                                <g key={tab.href}>
                                    <path
                                        d={sectorPath(
                                            start,
                                            end,
                                        )}
                                        fill="transparent"
                                        stroke={foreground}
                                        strokeWidth="1.5"
                                        className="cursor-pointer"
                                    />

                                    {tab.lines.map(
                                        (line, lineIndex) => {
                                            const radius =
                                                hasTwoLines
                                                    ? lineIndex === 0
                                                        ? 171
                                                        : 139
                                                    : 158;

                                            const fontSize =
                                                hasTwoLines
                                                    ? lineIndex === 0
                                                        ? 16
                                                        : 20
                                                    : index === 2
                                                      ? 17
                                                      : 22;

                                            const textPathId =
                                                `${pathId}-${lineIndex}`;

                                            return (
                                                <g key={textPathId}>
                                                    <path
                                                        id={textPathId}
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
                                                            href={`#${textPathId}`}
                                                            startOffset="50%"
                                                        >
                                                            {line}
                                                        </textPath>
                                                    </text>
                                                </g>
                                            );
                                        },
                                    )}

                                    <circle
                                        cx={dot.x}
                                        cy={dot.y}
                                        r="5"
                                        fill={
                                            activeIndex === index
                                                ? foreground
                                                : "none"
                                        }
                                        stroke={foreground}
                                        strokeWidth="2"
                                        pointerEvents="none"
                                    />
                                </g>
                            );
                        })}

                        <circle
                            cx={CENTER}
                            cy={CENTER}
                            r={INNER_RADIUS}
                            fill={background}
                            stroke={foreground}
                            strokeWidth="2"
                            pointerEvents="none"
                        />

                        <circle
                            cx={CENTER}
                            cy={CENTER}
                            r="8"
                            fill={foreground}
                            pointerEvents="none"
                        />
                    </g>
                </svg>
            </div>
        </div>
    );
}
