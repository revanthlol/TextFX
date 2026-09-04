'use client';

import React from 'react';

interface SwitchToggleProps {
    id?: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    isDarkMode: boolean;
    className?: string;
}

export function SwitchToggle({
    id,
    label,
    description,
    checked,
    onChange,
    isDarkMode,
    className = ''
}: SwitchToggleProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className={`flex items-start justify-between gap-3 cursor-pointer select-none ${className}`} onClick={() => onChange(!checked)}>
            <div className="space-y-0.5">
                <label htmlFor={inputId} className={`text-xs font-semibold cursor-pointer ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {label}
                </label>
                {description && (
                    <p className="text-[11px] text-gray-400">
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
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    checked ? 'bg-blue-600' : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`}
            >
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        checked ? 'translate-x-4' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    );
}
