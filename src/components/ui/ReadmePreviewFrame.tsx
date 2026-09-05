'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';

interface ReadmePreviewFrameProps {
    svgUrl: string;
    width: number;
    height: number;
    isDarkMode: boolean;
}

export const ReadmePreviewFrame: React.FC<ReadmePreviewFrameProps> = ({
    svgUrl,
    width,
    height,
    isDarkMode,
}) => {
    return (
        <div
            className={`w-full rounded-lg border overflow-hidden transition-all shadow-sm ${
                isDarkMode
                    ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9]'
                    : 'bg-[#ffffff] border-[#d0d7de] text-[#24292f]'
            }`}
        >
            {/* GitHub File Header Bar */}
            <div
                className={`px-4 py-2.5 flex items-center justify-between border-b text-xs font-mono select-none ${
                    isDarkMode
                        ? 'bg-[#161b22] border-[#30363d] text-[#8b949e]'
                        : 'bg-[#f6f8fa] border-[#d0d7de] text-[#57606a]'
                }`}
            >
                <div className="flex items-center gap-2 font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-emerald-500 font-semibold">README.md</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                    <span className="hidden sm:inline">Preview Mode</span>
                    <span className="px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-sans text-[10px]">
                        Markdown
                    </span>
                </div>
            </div>

            {/* GitHub Markdown Content Area - Pure SVG rendering */}
            <div className="p-6 md:p-10 flex items-center justify-center overflow-x-auto min-h-[160px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={svgUrl}
                    alt="TextFX Readme Banner"
                    width={width}
                    height={height}
                    className="max-w-full h-auto object-contain rounded drop-shadow-sm"
                />
            </div>
        </div>
    );
};
