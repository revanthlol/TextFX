'use client';

import React, { useState, useEffect } from 'react';

const CURSOR_SEQUENCE = ['|', '_', '█', '▋'];

export function AnimatedLogo() {
    const [cursorIndex, setCursorIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Cycle through cursor characters every 1.6s
    useEffect(() => {
        const interval = setInterval(() => {
            setCursorIndex((prev) => (prev + 1) % CURSOR_SEQUENCE.length);
        }, 1600);
        return () => clearInterval(interval);
    }, []);

    // Blinking effect
    useEffect(() => {
        const blinkInterval = setInterval(() => {
            setIsVisible((prev) => !prev);
        }, 500);
        return () => clearInterval(blinkInterval);
    }, []);

    const currentCursor = CURSOR_SEQUENCE[cursorIndex];

    return (
        <div className="flex items-center gap-2.5 select-none group cursor-pointer">
            {/* Animated Terminal Icon with cycling cursor */}
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center font-mono font-bold text-sm shadow-sm transition-transform duration-150 group-hover:scale-105 group-hover:border-zinc-500">
                <span className={`font-mono text-xs transition-opacity duration-100 ${
                    isVisible ? 'opacity-100 text-emerald-400' : 'opacity-0 text-emerald-400'
                }`}>
                    {currentCursor}
                </span>
            </div>

            {/* Wordmark */}
            <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-zinc-100 dark:text-zinc-100 font-sans">
                    TextFX
                </span>
            </div>
        </div>
    );
}
