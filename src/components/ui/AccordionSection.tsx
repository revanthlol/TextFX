'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
    id?: string;
    title: string;
    icon: React.ReactNode;
    badge?: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    isDarkMode?: boolean;
    className?: string;
}

export function AccordionSection({
    id,
    title,
    icon,
    badge,
    isOpen,
    onToggle,
    children,
    isDarkMode = true,
    className = ''
}: AccordionSectionProps) {
    return (
        <div id={id} className={`rounded-lg border transition-all duration-150 overflow-hidden ${
            isDarkMode 
                ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700/80' 
                : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-sm'
        } ${className}`}>
            <button
                type="button"
                onClick={onToggle}
                className={`w-full flex items-center justify-between px-4 py-3 text-left select-none transition-colors ${
                    isOpen 
                        ? isDarkMode ? 'bg-zinc-900/80' : 'bg-zinc-50'
                        : 'hover:bg-zinc-800/30'
                }`}
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-zinc-400 flex items-center justify-center">{icon}</span>
                    <span className={`font-semibold text-xs tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>
                        {title}
                    </span>
                    {badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                            isDarkMode ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}>
                            {badge}
                        </span>
                    )}
                </div>

                <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transform transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className={`p-4 border-t space-y-4 ${
                    isDarkMode ? 'border-zinc-800/80' : 'border-zinc-100'
                }`}>
                    {children}
                </div>
            )}
        </div>
    );
}
