'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
    description?: string;
    badge?: string;
    gradientCss?: string;
    icon?: React.ReactNode;
}

interface CustomSelectProps {
    label?: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    isDarkMode?: boolean;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
    label,
    value,
    options,
    onChange,
    placeholder = 'Select option...',
    isDarkMode = true,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className={`relative space-y-1 ${className}`} ref={containerRef}>
            {label && (
                <label
                    className={`block text-[11px] font-medium uppercase tracking-wider ${
                        isDarkMode ? 'text-zinc-400' : 'text-zinc-600'
                    }`}
                >
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all outline-none ${
                    isDarkMode
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
                        : 'bg-white border-zinc-300 text-zinc-900 hover:border-zinc-400 hover:bg-zinc-50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 shadow-sm'
                } ${isOpen ? (isDarkMode ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-blue-500 ring-1 ring-blue-500/30') : ''}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2.5 min-w-0 truncate">
                    {selectedOption?.gradientCss && (
                        <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-inner"
                            style={{ background: selectedOption.gradientCss }}
                        />
                    )}
                    {selectedOption?.icon && (
                        <span className="shrink-0 text-emerald-400">{selectedOption.icon}</span>
                    )}
                    <span className="truncate font-medium text-xs">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.badge && (
                        <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                                isDarkMode
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                        >
                            {selectedOption.badge}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ml-2 ${
                        isOpen ? 'rotate-180 text-emerald-400' : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    ref={listRef}
                    className={`absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl border shadow-2xl p-1.5 space-y-1 transition-all ${
                        isDarkMode
                            ? 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-black/80'
                            : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
                    }`}
                    role="listbox"
                >
                    {options.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                role="option"
                                aria-selected={isSelected}
                                className={`w-full group px-2.5 py-2 rounded-lg flex items-center justify-between text-left transition-all ${
                                    isSelected
                                        ? isDarkMode
                                            ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                                            : 'bg-emerald-50 text-emerald-900 font-semibold'
                                        : isDarkMode
                                        ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
                                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    {opt.gradientCss && (
                                        <div
                                            className="w-5 h-5 rounded-md border border-white/20 shrink-0 shadow-sm"
                                            style={{ background: opt.gradientCss }}
                                        />
                                    )}
                                    {opt.icon && (
                                        <span className="shrink-0 text-zinc-400 group-hover:text-emerald-400">
                                            {opt.icon}
                                        </span>
                                    )}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs truncate">{opt.label}</span>
                                            {opt.badge && (
                                                <span
                                                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                                        isDarkMode
                                                            ? 'bg-zinc-800 text-zinc-300'
                                                            : 'bg-zinc-100 text-zinc-600'
                                                    }`}
                                                >
                                                    {opt.badge}
                                                </span>
                                            )}
                                        </div>
                                        {opt.description && (
                                            <p
                                                className={`text-[10px] truncate ${
                                                    isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                                                }`}
                                            >
                                                {opt.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
