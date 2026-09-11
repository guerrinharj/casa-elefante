"use client";

import {
    useEffect,
    useState,
} from "react";

type AnimatedCountProps = {
    value: number;
    duration?: number;
    delay?: number;
};

export function AnimatedCount({
    value,
    duration = 1250,
    delay = 250,
}: AnimatedCountProps) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null =
            null;

        const startTimeout = setTimeout(() => {
            const maxRandomValue = Math.max(
                value + 10,
                20,
            );

            interval = setInterval(() => {
                setDisplayValue(
                    Math.floor(
                        Math.random() *
                            maxRandomValue,
                    ),
                );
            }, 35);
        }, delay);

        const finishTimeout = setTimeout(() => {
            if (interval) {
                clearInterval(interval);
            }

            setDisplayValue(value);
        }, delay + duration);

        return () => {
            clearTimeout(startTimeout);
            clearTimeout(finishTimeout);

            if (interval) {
                clearInterval(interval);
            }
        };
    }, [
        value,
        duration,
        delay,
    ]);

    return (
        <span className="inline-block min-w-[2ch] text-right tabular-nums">
            {displayValue}
        </span>
    );
}