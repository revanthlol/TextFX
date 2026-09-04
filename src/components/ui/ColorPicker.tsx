'use client';

import React, { useState, useEffect, useRef } from 'react';

const SWATCHES = [
    '#000000',
    '#ffffff',
    '#0d1117',
    '#161b22',
    '#58a6ff',
    '#00ff66',
    '#00ffff',
    '#ff007f',
    '#ff4b1f',
    '#ffb703',
    '#a855f7',
    '#6e7681',
];

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
    isDarkMode: boolean;
    allowEmpty?: boolean;
    emptyLabel?: string;
    className?: string;
}

export function ColorPicker({
    label,
    value,
    onChange,
    isDarkMode,
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

    // Format safe hex for <input type="color">
    const getSafeHex = (val: string) => {
        if (!val) return '#000000';
        let hex = val.startsWith('#') ? val : `#${val}`;
        // Expand 3-digit hex #abc to #aabbcc
        if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
            hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
        }
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            return hex.toLowerCase();
        }
        return '#000000';
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setInputValue(next);
        if (next === '' && allowEmpty) {
            onChange('');
            return;
        }
        // Normalize
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
        <div className={`space-y-2 ${className}`}>
            <div className="flex items-center justify-between">
                <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {label}
                </label>
                {allowEmpty && !isCurrentEmpty && (
                    <button
                        type="button"
                        onClick={() => {
                            setInputValue('');
                            onChange('');
                        }}
                        className="text-[11px] text-gray-400 hover:text-red-400 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {/* Visual Swatch / Native Color Picker Trigger */}
                <div className="relative flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => colorInputRef.current?.click()}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center overflow-hidden shadow-sm transition-transform active:scale-95 ${
                            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'
                        }`}
                        title="Pick custom color"
                    >
                        {isCurrentEmpty ? (
                            <span className="text-[10px] text-gray-400 font-mono">None</span>
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

                {/* Hex Text Input */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleTextChange}
                        placeholder={allowEmpty ? emptyLabel : '#000000'}
                        className={`w-full rounded-lg border font-mono text-xs px-3 py-2 outline-none transition-all ${
                            isDarkMode
                                ? 'bg-gray-800/80 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        }`}
                    />
                </div>

                {/* EyeDropper Button */}
                {hasEyeDropper && (
                    <button
                        type="button"
                        onClick={handleEyeDropper}
                        className={`p-2 rounded-lg border transition-colors ${
                            isDarkMode
                                ? 'border-gray-700 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
                                : 'border-gray-300 bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Pick color from screen"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4 4 4 0 014-4h1v1a1 1 0 001 1h1v1a1 1 0 001 1h1v1a4 4 0 01-4 4zm8-18l5 5-9 9H7v-4l9-9z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Quick Swatch Palette */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {SWATCHES.map((swatch) => (
                    <button
                        key={swatch}
                        type="button"
                        onClick={() => {
                            setInputValue(swatch);
                            onChange(swatch);
                        }}
                        className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 active:scale-95 ${
                            value?.toLowerCase() === swatch.toLowerCase()
                                ? 'ring-2 ring-blue-500 scale-105 border-white dark:border-gray-900'
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
