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
    isDarkMode: boolean;
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
    isDarkMode,
    className = ''
}: RangeSliderProps) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-center justify-between text-xs">
                <label className={`font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label}
                </label>
                <div className={`px-2 py-0.5 rounded font-mono font-medium text-[11px] ${
                    isDarkMode ? 'bg-gray-800 text-blue-400 border border-gray-700' : 'bg-gray-100 text-blue-600 border border-gray-200'
                }`}>
                    {value}{unit}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-opacity hover:opacity-90"
                />
            </div>
        </div>
    );
}
