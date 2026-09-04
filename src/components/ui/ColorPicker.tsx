'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Pipette, X } from 'lucide-react';

const SHADCN_SWATCHES = [
    '#ffffff',
    '#a1a1aa',
    '#00ff66',
    '#38bdf8',
    '#818cf8',
    '#c084fc',
    '#f43f5e',
    '#fb923c',
    '#facc15',
    '#18181b',
    '#0d1117',
    '#000000',
];

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
    isDarkMode?: boolean;
    allowEmpty?: boolean;
    emptyLabel?: string;
    className?: string;
}

export function ColorPicker({
    label,
    value,
    onChange,
    isDarkMode = true,
    allowEmpty = false,
    emptyLabel = 'None (Default)',
    className = ''
}: ColorPickerProps) {
    const [inputValue, setInputValue] = useState(value || '');
    const [hasEyeDropper, setHasEyeDropper] = useState(false);
    const colorInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'EyeDropper' in window) {
            setHasEyeDropper(true);
        }
    }, []);

    const getSafeHex = (val: string) => {
        if (!val) return '#00ff66';
        let hex = val.startsWith('#') ? val : `#${val}`;
        if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
            hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
        }
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            return hex.toLowerCase();
        }
        return '#00ff66';
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setInputValue(next);
        if (next === '' && allowEmpty) {
            onChange('');
            return;
        }
        let clean = next.trim();
        if (clean && !clean.startsWith('#')) {
            clean = `#${clean}`;
        }
        if (/^#[0-9A-Fa-f]{3,8}$/.test(clean)) {
            onChange(clean);
        }
    };

    const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setInputValue(next);
        onChange(next);
    };

    const handleEyeDropper = async () => {
        if (typeof window === 'undefined' || !('EyeDropper' in window)) return;
        try {
            // @ts-expect-error EyeDropper API
            const eyeDropper = new window.EyeDropper();
            const result = await eyeDropper.open();
            if (result?.sRGBHex) {
                setInputValue(result.sRGBHex);
                onChange(result.sRGBHex);
            }
        } catch {
            // User cancelled eyedropper
        }
    };

    const isCurrentEmpty = !value || value === '';

    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-center justify-between">
                <label className={`text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {label}
                </label>
                {allowEmpty && !isCurrentEmpty && (
                    <button
                        type="button"
                        onClick={() => {
                            setInputValue('');
                            onChange('');
                        }}
                        className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center gap-0.5 transition-colors"
                    >
                        <X className="w-3 h-3" />
                        <span>Clear</span>
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* Trigger Button for Native Color Picker */}
                <div className="relative flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => colorInputRef.current?.click()}
                        className={`w-8 h-8 rounded-md border flex items-center justify-center overflow-hidden transition-all hover:ring-2 hover:ring-zinc-400 dark:hover:ring-zinc-600 ${
                            isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-50'
                        }`}
                        title="Open color selector"
                    >
                        {isCurrentEmpty ? (
                            <span className="text-[10px] text-zinc-500 font-mono">None</span>
                        ) : (
                            <div 
                                className="w-full h-full"
                                style={{ backgroundColor: value }}
                            />
                        )}
                    </button>
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={getSafeHex(value)}
                        onChange={handleNativeColorChange}
                        className="sr-only"
                    />
                </div>

                {/* Hex Code Input */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleTextChange}
                        placeholder={allowEmpty ? emptyLabel : '#00ff66'}
                        className={`w-full rounded-md border font-mono text-xs px-2.5 py-1.5 outline-none transition-all ${
                            isDarkMode
                                ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
                                : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
                        }`}
                    />
                </div>

                {/* Eyedropper Tool Button */}
                {hasEyeDropper && (
                    <button
                        type="button"
                        onClick={handleEyeDropper}
                        className={`p-2 rounded-md border transition-colors ${
                            isDarkMode
                                ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                                : 'border-zinc-300 bg-zinc-50 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                        title="Pick color from screen"
                    >
                        <Pipette className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Quick Palette Swatches */}
            <div className="flex flex-wrap items-center gap-1 pt-1">
                {SHADCN_SWATCHES.map((swatch) => (
                    <button
                        key={swatch}
                        type="button"
                        onClick={() => {
                            setInputValue(swatch);
                            onChange(swatch);
                        }}
                        className={`w-4 h-4 rounded-sm border transition-all hover:scale-110 ${
                            value?.toLowerCase() === swatch.toLowerCase()
                                ? 'ring-2 ring-blue-500 scale-105 border-white dark:border-zinc-950'
                                : 'border-black/10 dark:border-white/10'
                        }`}
                        style={{ backgroundColor: swatch }}
                        title={swatch}
                    />
                ))}
            </div>
        </div>
    );
}
