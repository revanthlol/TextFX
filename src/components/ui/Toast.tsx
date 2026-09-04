'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastContextType {
    showToast: (message: string, icon?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
    showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<{ message: string; icon: string; id: number } | null>(null);

    const showToast = useCallback((message: string, icon: string = '✨') => {
        const id = Date.now();
        setToast({ message, icon, id });
        setTimeout(() => {
            setToast((current) => (current?.id === id ? null : current));
        }, 2600);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div 
                    role="status"
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-900/95 text-white dark:bg-white/95 dark:text-gray-900 shadow-2xl backdrop-blur-md border border-white/10 dark:border-gray-900/10 text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-200"
                >
                    <span className="text-base">{toast.icon}</span>
                    <span>{toast.message}</span>
                </div>
            )}
        </ToastContext.Provider>
    );
}
