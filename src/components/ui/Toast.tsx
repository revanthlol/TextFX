'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <AnimatePresence mode="wait">
                    {toast && (
                        <motion.div 
                            key={toast.id}
                            role="status"
                            initial={{ opacity: 0, y: 20, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 12, scale: 0.92 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 380 }}
                            className="pointer-events-auto flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-zinc-950/90 text-zinc-100 border border-zinc-800 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-md text-xs font-medium"
                        >
                            {toast.iconType === 'sparkles' ? (
                                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : toast.iconType === 'info' ? (
                                <Info className="w-4 h-4 text-sky-400 shrink-0" />
                            ) : (
                                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            <span className="tracking-wide select-none">{toast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
