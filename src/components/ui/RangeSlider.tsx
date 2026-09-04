'use client';

import React from 'react';

interface RangeSliderProps {
    label: string;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    isDarkMode?: boolean;
    className?: string;
}

export function RangeSlider({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = '',
    isDarkMode = true,
    className = ''
}: RangeSliderProps) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-center justify-between text-xs">
                <label className={`text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {label}
                </label>
                <div className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-medium ${
                    isDarkMode ? 'bg-zinc-900 text-zinc-300 border border-zinc-800' : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                }`}>
                    {value}{unit}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
                />
            </div>
        </div>
    );
}
