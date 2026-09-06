'use client';

import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputStepperProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    isDarkMode?: boolean;
    className?: string;
    description?: string;
}

export const NumberInputStepper: React.FC<NumberInputStepperProps> = ({
    label,
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    unit = '',
    isDarkMode = true,
    className = '',
    description,
}) => {
    const [inputValue, setInputValue] = useState<string>(value.toString());

    // Sync input string with incoming value
    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    const clamp = (num: number) => {
        const clamped = Math.max(min, Math.min(max, num));
        // Handle decimal precision based on step
        const decimals = step.toString().split('.')[1]?.length || 0;
        return parseFloat(clamped.toFixed(decimals));
    };

    const handleBlurOrCommit = () => {
        const parsed = parseFloat(inputValue);
        if (isNaN(parsed)) {
            setInputValue(value.toString());
        } else {
            const clamped = clamp(parsed);
            onChange(clamped);
            setInputValue(clamped.toString());
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlurOrCommit();
            (e.target as HTMLInputElement).blur();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            increment();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            decrement();
        }
    };

    const increment = () => {
        const next = clamp(value + step);
        onChange(next);
        setInputValue(next.toString());
    };

    const decrement = () => {
        const next = clamp(value - step);
        onChange(next);
        setInputValue(next.toString());
    };

    // Calculate percentage for progress fill
    const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <label
                        className={`block text-[11px] font-medium uppercase tracking-wider ${
                            isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                        }`}
                    >
                        {label}
                    </label>
                    {description && (
                        <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {description}
                        </p>
                    )}
                </div>

                {/* Compact Stepper & Editable Field */}
                <div
                    className={`flex items-center rounded-lg border overflow-hidden transition-all ${
                        isDarkMode
                            ? 'bg-zinc-950 border-zinc-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30'
                            : 'bg-white border-zinc-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30 shadow-sm'
                    }`}
                >
                    <button
                        type="button"
                        onClick={decrement}
                        disabled={value <= min}
                        className={`px-1.5 py-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                            isDarkMode
                                ? 'text-zinc-400 hover:text-white hover:bg-zinc-900 active:bg-zinc-800'
                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200'
                        }`}
                        title="Decrease"
                    >
                        <Minus className="w-3 h-3" />
                    </button>

                    <div className="flex items-center px-1">
                        <input
                            type="text"
                            inputMode="decimal"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onBlur={handleBlurOrCommit}
                            onKeyDown={handleKeyDown}
                            className={`w-12 text-center text-xs font-mono font-semibold bg-transparent outline-none py-1 ${
                                isDarkMode ? 'text-zinc-100' : 'text-zinc-900'
                            }`}
                        />
                        {unit && (
                            <span
                                className={`text-[10px] font-mono select-none pr-1 ${
                                    isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                                }`}
                            >
                                {unit}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={increment}
                        disabled={value >= max}
                        className={`px-1.5 py-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                            isDarkMode
                                ? 'text-zinc-400 hover:text-white hover:bg-zinc-900 active:bg-zinc-800'
                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200'
                        }`}
                        title="Increase"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Range Scrubber Track */}
            <div className="relative flex items-center group py-0.5">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => {
                        const next = parseFloat(e.target.value);
                        onChange(next);
                        setInputValue(next.toString());
                    }}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none transition-all ${
                        isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'
                    }`}
                    style={{
                        background: isDarkMode
                            ? `linear-gradient(to right, #10b981 ${percentage}%, #27272a ${percentage}%)`
                            : `linear-gradient(to right, #2563eb ${percentage}%, #e4e4e7 ${percentage}%)`,
                    }}
                />
            </div>
        </div>
    );
};
