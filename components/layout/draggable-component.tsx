
"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import type {
    CSSProperties,
    PointerEvent as ReactPointerEvent,
    ReactNode,
} from "react";

import { GripHorizontal } from "lucide-react";

type Position = {
    x: number;
    y: number;
};

type DraggableComponentProps = {
    id: string;
    children: ReactNode;
    className?: string;
    defaultPosition: {
        top?: number;
        left?: number;
        right?: number;
        bottom?: number;
    };
    width?: string;
    zIndex?: number;
};

const STORAGE_PREFIX = "casa-elefante-position-";
const RESET_EVENT = "casa-elefante-reset-positions";

function clamp(
    value: number,
    min: number,
    max: number,
) {
    return Math.min(Math.max(value, min), max);
}

export function DraggableComponent({
    id,
    children,
    className = "",
    defaultPosition,
    width,
    zIndex = 60,
}: DraggableComponentProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const dragRef = useRef<{
        pointerX: number;
        pointerY: number;
        startX: number;
        startY: number;
    } | null>(null);

    const [position, setPosition] = useState<Position | null>(
        null,
    );

    const [ready, setReady] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [desktop, setDesktop] = useState(false);

    const storageKey = `${STORAGE_PREFIX}${id}`;

    const getDefaultPosition = useCallback((): Position => {
        const element = containerRef.current;

        const elementWidth = element?.offsetWidth ?? 56;
        const elementHeight = element?.offsetHeight ?? 56;

        const x = defaultPosition.left ??
            window.innerWidth -
            (defaultPosition.right ?? 24) -
            elementWidth;

        const y = defaultPosition.top ??
            window.innerHeight -
            (defaultPosition.bottom ?? 24) -
            elementHeight;

        return {
            x,
            y,
        };
    }, [defaultPosition]);

    const constrain = useCallback(
        (next: Position): Position => {
            const element = containerRef.current;

            if (!element) {
                return next;
            }

            return {
                x: clamp(
                    next.x,
                    0,
                    Math.max(
                        0,
                        window.innerWidth - element.offsetWidth,
                    ),
                ),
                y: clamp(
                    next.y,
                    0,
                    Math.max(
                        0,
                        window.innerHeight - element.offsetHeight,
                    ),
                ),
            };
        },
        [],
    );

    useEffect(() => {
        const updateDesktop = () => {
            setDesktop(window.innerWidth >= 768);
        };

        updateDesktop();

        window.addEventListener("resize", updateDesktop);

        return () => {
            window.removeEventListener(
                "resize",
                updateDesktop,
            );
        };
    }, []);

    useEffect(() => {
        if (!desktop) {
            setReady(true);
            return;
        }

        let saved: Position | null = null;

        try {
            const stored = localStorage.getItem(storageKey);

            if (stored) {
                const parsed: unknown = JSON.parse(stored);

                if (
                    typeof parsed === "object" &&
                    parsed !== null &&
                    "x" in parsed &&
                    "y" in parsed &&
                    typeof parsed.x === "number" &&
                    typeof parsed.y === "number" &&
                    Number.isFinite(parsed.x) &&
                    Number.isFinite(parsed.y)
                ) {
                    saved = {
                        x: parsed.x,
                        y: parsed.y,
                    };
                }
            }
        } catch {
            saved = null;
        }

        const frame = requestAnimationFrame(() => {
            setPosition(
                constrain(saved ?? getDefaultPosition()),
            );
            setReady(true);
        });

        return () => {
            cancelAnimationFrame(frame);
        };
    }, [
        desktop,
        storageKey,
        constrain,
        getDefaultPosition,
    ]);

    useEffect(() => {
        const reset = () => {
            setPosition(
                constrain(getDefaultPosition()),
            );
        };

        window.addEventListener(RESET_EVENT, reset);

        return () => {
            window.removeEventListener(RESET_EVENT, reset);
        };
    }, [constrain, getDefaultPosition]);

    useEffect(() => {
        if (!desktop || !ready) {
            return;
        }

        const handleResize = () => {
            setPosition((current) => {
                if (!current) {
                    return current;
                }

                return constrain(current);
            });
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener(
                "resize",
                handleResize,
            );
        };
    }, [desktop, ready, constrain]);

    useEffect(() => {
        if (!desktop || !ready || !position || dragging) {
            return;
        }

        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify(position),
            );
        } catch {
            // O navegador pode bloquear armazenamento local.
        }
    }, [
        position,
        dragging,
        desktop,
        ready,
        storageKey,
    ]);

    function handlePointerDown(
        event: ReactPointerEvent<HTMLButtonElement>,
    ) {
        if (!desktop || !position) {
            return;
        }

        if (event.button !== 0) {
            return;
        }

        event.preventDefault();

        dragRef.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            startX: position.x,
            startY: position.y,
        };

        event.currentTarget.setPointerCapture(event.pointerId);

        setDragging(true);
    }

    function handlePointerMove(
        event: ReactPointerEvent<HTMLButtonElement>,
    ) {
        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        setPosition(
            constrain({
                x: drag.startX +
                    event.clientX -
                    drag.pointerX,
                y: drag.startY +
                    event.clientY -
                    drag.pointerY,
            }),
        );
    }

    function handlePointerUp() {
        dragRef.current = null;
        setDragging(false);
    }

    const mobileStyle: CSSProperties = {
        position: "fixed",
        zIndex,
        top: defaultPosition.top ?? "auto",
        left: defaultPosition.left ?? "auto",
        right: defaultPosition.right ?? "auto",
        bottom: defaultPosition.bottom ?? "auto",
        width,
    };

    const desktopStyle: CSSProperties = {
        position: "fixed",
        zIndex: dragging ? 150 : zIndex,
        left: position?.x ?? 0,
        top: position?.y ?? 0,
        right: "auto",
        bottom: "auto",
        width,
        visibility: ready && position ? "visible" : "hidden",
    };

    return (
        <div
            ref={containerRef}
            className={`
                group/draggable
                ${className}
            `}
            style={desktop ? desktopStyle : mobileStyle}
        >
            {desktop && (
                <button
                    type="button"
                    aria-label={`Arrastar ${id}`}
                    title="Arrastar componente"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    className={`
                        absolute
                        left-1/2
                        top-0
                        z-[10]
                        flex
                        h-3
                        w-12
                        -translate-x-1/2
                        cursor-grab
                        items-center
                        justify-center
                        rounded-b-md
                        bg-black/10
                        text-black
                        opacity-0
                        transition-opacity
                        hover:bg-black/20
                        group-hover/draggable:opacity-100
                        focus-visible:opacity-100
                        active:cursor-grabbing
                        ${dragging ? "opacity-100" : ""}
                    `}
                    style={{
                        touchAction: "none",
                    }}
                >
                    <GripHorizontal size={13} />
                </button>
            )}

            {children}
        </div>
    );
}

export function resetDraggablePositions() {
    if (typeof window === "undefined") {
        return;
    }

    const ids = [
        "product-search",
        "performances-search",
        "file-tabs",
        "sidebar",
    ];

    for (const id of ids) {
        localStorage.removeItem(
            `${STORAGE_PREFIX}${id}`,
        );
    }

    window.dispatchEvent(
        new Event(RESET_EVENT),
    );
}
