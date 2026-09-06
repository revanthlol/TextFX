'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, QrCode, Share2 } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareUrl: string;
    isDarkMode: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({
    isOpen,
    onClose,
    shareUrl,
    isDarkMode
}) => {
    const [isCopied, setIsCopied] = useState(false);

    // Close on Escape
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

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}&format=svg&color=${isDarkMode ? '00ff66' : '09090b'}&bgcolor=${isDarkMode ? '09090b' : 'ffffff'}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Dialog */}
            <div 
                className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200 z-50 ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                }`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="share-modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                            <Share2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 id="share-modal-title" className="text-sm font-semibold tracking-tight">
                                Share Configuration
                            </h3>
                            <p className="text-[11px] text-zinc-400">
                                Scan on mobile or copy the shareable studio link
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`p-1.5 rounded-lg border transition-colors ${
                            isDarkMode ? 'border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900' : 'border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* QR Code Container */}
                <div className="py-6 flex flex-col items-center justify-center space-y-3">
                    <div className={`p-4 rounded-xl border flex items-center justify-center shadow-inner ${
                        isDarkMode ? 'bg-[#09090b] border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={qrCodeUrl}
                            alt="Configuration QR Code"
                            width={180}
                            height={180}
                            className="rounded-lg object-contain"
                        />
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Scan to test live on your phone</span>
                    </span>
                </div>

                {/* URL Box & Copy */}
                <div className="space-y-3">
                    <div className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs font-mono ${
                        isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                    }`}>
                        <span className="truncate flex-1 text-[11px]">{shareUrl}</span>
                        <button
                            type="button"
                            onClick={handleCopy}
                            className="text-zinc-300 hover:text-white flex items-center gap-1 font-sans text-xs font-semibold flex-shrink-0"
                        >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                isCopied
                                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                                    : isDarkMode
                                    ? 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                                    : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                            }`}
                        >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copied Link!' : 'Copy Link'}</span>
                        </button>

                        <a
                            href={shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                isDarkMode 
                                    ? 'border-zinc-800 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40' 
                                    : 'border-zinc-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open in New Tab</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
