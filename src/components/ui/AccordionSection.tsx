'use client';

import React from 'react';

interface AccordionSectionProps {
    title: string;
    icon: string;
    badge?: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    isDarkMode: boolean;
    className?: string;
}

export function AccordionSection({
    title,
    icon,
    badge,
    isOpen,
    onToggle,
    children,
    isDarkMode,
    className = ''
}: AccordionSectionProps) {
    return (
        <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
            isDarkMode 
                ? 'border-gray-800 bg-gray-900/60 hover:border-gray-700/80' 
                : 'border-gray-200 bg-white shadow-sm hover:border-gray-300'
        } ${className}`}>
            <button
                type="button"
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-4 text-left select-none transition-colors ${
                    isOpen 
                        ? isDarkMode ? 'bg-gray-800/40' : 'bg-gray-50/70'
                        : 'hover:bg-gray-800/20'
                }`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-base">{icon}</span>
                    <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                    </span>
                    {badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                            isDarkMode ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}>
                            {badge}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <svg
                        className={`w-4 h-4 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className={`p-4 pt-3 border-t space-y-4 animate-in fade-in-50 duration-150 ${
                    isDarkMode ? 'border-gray-800/80' : 'border-gray-100'
                }`}>
                    {children}
                </div>
            )}
        </div>
    );
}
