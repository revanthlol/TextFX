'use client';

import React from 'react';

interface SwitchToggleProps {
    id?: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    isDarkMode?: boolean;
    className?: string;
}

export function SwitchToggle({
    id,
    label,
    description,
    checked,
    onChange,
    isDarkMode = true,
    className = ''
}: SwitchToggleProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div 
            className={`flex items-start justify-between gap-3 cursor-pointer select-none py-1 ${className}`} 
            onClick={() => onChange(!checked)}
        >
            <div className="space-y-0.5">
                <label htmlFor={inputId} className={`text-xs font-medium cursor-pointer ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {label}
                </label>
                {description && (
                    <p className="text-[11px] text-zinc-500">
                        {description}
                    </p>
                )}
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                id={inputId}
                onClick={(e) => {
                    e.stopPropagation();
                    onChange(!checked);
                }}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-400 ${
                    checked ? 'bg-zinc-100 dark:bg-zinc-100' : isDarkMode ? 'bg-zinc-800' : 'bg-zinc-300'
                }`}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-zinc-900 shadow-sm ring-0 transition duration-150 ease-in-out ${
                        checked ? 'translate-x-4 bg-zinc-950' : 'translate-x-0 bg-white'
                    }`}
                />
            </button>
        </div>
    );
}
