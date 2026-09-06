'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus, Check } from 'lucide-react';

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
    presets?: number[];
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
    presets,
}) => {
    const [inputValue, setInputValue] = useState<string>(value.toString());
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync input string with incoming value
    useEffect(() => {
        setInputValue(value.toString());
    }, [value]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const clamp = (num: number) => {
        const clamped = Math.max(min, Math.min(max, num));
        const decimals = step.toString().split('.')[1]?.length || 0;
        return parseFloat(clamped.toFixed(decimals));
    };

    const commitParsedValue = (str: string) => {
        const parsed = parseFloat(str);
        if (isNaN(parsed)) {
            setInputValue(value.toString());
        } else {
            const clamped = clamp(parsed);
            onChange(clamped);
            setInputValue(clamped.toString());
        }
    };

    const handleBlur = () => {
        commitParsedValue(inputValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            commitParsedValue(inputValue);
            setIsDropdownOpen(false);
            inputRef.current?.blur();
        } else if (e.key === 'Escape') {
            setIsDropdownOpen(false);
            inputRef.current?.blur();
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

    const handleSelectPreset = (preset: number) => {
        onChange(preset);
        setInputValue(preset.toString());
        setIsDropdownOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
            <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <label
                        className={`block text-[11px] font-medium uppercase tracking-wider truncate ${
                            isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                        }`}
                    >
                        {label}
                    </label>
                    {description && (
                        <p className={`text-[10px] truncate ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {description}
                        </p>
                    )}
                </div>

                {/* Compact Stepper & Editable Field */}
                <div
                    className={`flex items-center rounded-lg border overflow-hidden transition-all shrink-0 ${
                        isDarkMode
                            ? 'bg-zinc-950 border-zinc-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30'
                            : 'bg-white border-zinc-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 shadow-sm'
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
                            ref={inputRef}
                            type="text"
                            inputMode="decimal"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onClick={() => {
                                if (presets && presets.length > 0) {
                                    setIsDropdownOpen(true);
                                }
                            }}
                            onFocus={() => {
                                if (presets && presets.length > 0) {
                                    setIsDropdownOpen(true);
                                }
                            }}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className={`w-11 text-center text-xs font-mono font-semibold bg-transparent outline-none py-1 cursor-text ${
                                isDarkMode ? 'text-zinc-100' : 'text-zinc-900'
                            }`}
                        />
                        {unit && (
                            <span
                                className={`text-[10px] font-mono select-none pr-0.5 ${
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

            {/* Floating Presets Dropdown */}
            {isDropdownOpen && presets && presets.length > 0 && (
                <div
                    className={`absolute right-0 top-full mt-1 z-30 min-w-[120px] rounded-lg border shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100 ${
                        isDarkMode
                            ? 'bg-zinc-950/95 border-zinc-800 text-zinc-200 backdrop-blur-md'
                            : 'bg-white/95 border-zinc-200 text-zinc-800 backdrop-blur-md'
                    }`}
                >
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-800/50 mb-0.5">
                        Presets
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                        {presets.map((preset) => {
                            const isSelected = value === preset;
                            return (
                                <button
                                    key={preset}
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault(); // prevent input blur before commit
                                        handleSelectPreset(preset);
                                    }}
                                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-mono transition-colors ${
                                        isSelected
                                            ? isDarkMode
                                                ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                                                : 'bg-emerald-50 text-emerald-700 font-semibold'
                                            : isDarkMode
                                            ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                                            : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                                    }`}
                                >
                                    <span>
                                        {preset}{unit ? ` ${unit}` : ''}
                                    </span>
                                    {isSelected && <Check className="w-3 h-3 text-emerald-500" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
