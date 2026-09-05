'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    isDarkMode: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    isDarkMode,
}) => {
    // Prevent body scroll when bottom sheet is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Bottom Sheet Drawer */}
            <div
                className={`fixed inset-x-0 bottom-0 max-h-[88vh] flex flex-col rounded-t-2xl border-t shadow-2xl transition-transform animate-in slide-in-from-bottom duration-300 ease-out z-50 ${
                    isDarkMode
                        ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100 backdrop-blur-xl'
                        : 'bg-white/95 border-zinc-200 text-zinc-900 backdrop-blur-xl'
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bottom-sheet-title"
            >
                {/* Drag Handle & Header */}
                <div className="flex flex-col items-center pt-2.5 px-4 pb-3 border-b border-zinc-800/40 relative">
                    <div className="w-12 h-1 rounded-full bg-zinc-600/40 mb-3" />
                    <div className="w-full flex items-center justify-between">
                        <div>
                            <h3 id="bottom-sheet-title" className="text-sm font-semibold tracking-tight">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-[11px] text-zinc-400">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className={`p-1.5 rounded-lg border transition-colors ${
                                isDarkMode
                                    ? 'border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                                    : 'border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                            }`}
                            aria-label="Close bottom sheet"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
                    {children}
                </div>
            </div>
        </div>
    );
};
