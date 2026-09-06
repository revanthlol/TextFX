'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            {/* Full Name Label on Top */}
            <div className="flex items-baseline justify-between gap-1">
                <label
                    className={`block text-[11px] font-semibold uppercase tracking-wider ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-700'
                    }`}
                >
                    {label}
                </label>
                {description && (
                    <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        {description}
                    </span>
                )}
            </div>

            {/* Stepper Component Below Label */}
            <div
                className={`flex items-center justify-between rounded-lg border overflow-hidden transition-all w-full ${
                    isDarkMode
                        ? 'bg-zinc-950 border-zinc-800 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30'
                        : 'bg-white border-zinc-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 shadow-sm'
                }`}
            >
                <button
                    type="button"
                    onClick={decrement}
                    disabled={value <= min}
                    className={`px-2 py-1.5 transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed ${
                        isDarkMode
                            ? 'text-zinc-400 hover:text-white hover:bg-zinc-900 active:bg-zinc-800'
                            : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 active:bg-zinc-200'
                    }`}
                    title="Decrease"
                >
                    <Minus className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-center flex-1 px-1">
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
                        className={`w-full text-center text-xs font-mono font-semibold bg-transparent outline-none py-1.5 cursor-text ${
                            isDarkMode ? 'text-zinc-100' : 'text-zinc-900'
                        }`}
                    />
                    {unit && (
                        <span
                            className={`text-[10px] font-mono select-none pr-1 ${
                                isDarkMode ? 'text-zinc-500' : 'text-zinc-500 font-medium'
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
                    className={`px-2 py-1.5 transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed ${
                        isDarkMode
                            ? 'text-zinc-400 hover:text-white hover:bg-zinc-900 active:bg-zinc-800'
                            : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 active:bg-zinc-200'
                    }`}
                    title="Increase"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Floating Presets Dropdown Animated with Framer Motion */}
            <AnimatePresence>
                {isDropdownOpen && presets && presets.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.96 }}
                        transition={{ duration: 0.12 }}
                        className={`absolute left-0 right-0 top-full mt-1 z-30 rounded-lg border shadow-xl p-1 backdrop-blur-md ${
                            isDarkMode
                                ? 'bg-zinc-950/95 border-zinc-800 text-zinc-200'
                                : 'bg-white/95 border-zinc-300 text-zinc-800'
                        }`}
                    >
                        <div className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider border-b mb-0.5 ${
                            isDarkMode ? 'text-zinc-500 border-zinc-800/60' : 'text-zinc-600 border-zinc-200'
                        }`}>
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
                                            e.preventDefault();
                                            handleSelectPreset(preset);
                                        }}
                                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-mono transition-colors ${
                                            isSelected
                                                ? isDarkMode
                                                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold'
                                                    : 'bg-emerald-50 text-emerald-800 font-semibold'
                                                : isDarkMode
                                                ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                                                : 'text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950'
                                        }`}
                                    >
                                        <span>
                                            {preset}{unit ? ` ${unit}` : ''}
                                        </span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
