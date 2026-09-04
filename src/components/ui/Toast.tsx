'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, Info, Sparkles } from 'lucide-react';

interface ToastContextType {
    showToast: (message: string, iconType?: 'check' | 'sparkles' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({
    showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<{ message: string; iconType: string; id: number } | null>(null);

    const showToast = useCallback((message: string, iconType: 'check' | 'sparkles' | 'info' = 'check') => {
        const id = Date.now();
        setToast({ message, iconType, id });
        setTimeout(() => {
            setToast((current) => (current?.id === id ? null : current));
        }, 2500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div 
                    role="status"
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-zinc-900/95 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 shadow-xl border border-zinc-800 dark:border-zinc-300 text-xs font-medium backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                    {toast.iconType === 'sparkles' ? (
                        <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600 flex-shrink-0" />
                    ) : toast.iconType === 'info' ? (
                        <Info className="w-4 h-4 text-blue-400 dark:text-blue-600 flex-shrink-0" />
                    ) : (
                        <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
                    )}
                    <span>{toast.message}</span>
                </div>
            )}
        </ToastContext.Provider>
    );
}
