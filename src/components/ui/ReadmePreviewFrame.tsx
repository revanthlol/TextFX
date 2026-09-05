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

            {/* GitHub Markdown Content Area */}
            <div className="p-6 md:p-8 space-y-6">
                {/* Mock README Heading */}
                <div className={`border-b pb-2 ${isDarkMode ? 'border-[#21262d]' : 'border-[#d8dee4]'}`}>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                        My Awesome Project
                    </h1>
                </div>

                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-[#8b949e]' : 'text-[#57606a]'}`}>
                    Welcome to the repository. The banner below is dynamically generated via TextFX SVG API.
                </p>

                {/* SVG Embed in GitHub Readme container */}
                <div className="flex justify-center items-center py-2 overflow-x-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={svgUrl}
                        alt="TextFX Readme Banner"
                        width={width}
                        height={height}
                        className="max-w-full h-auto object-contain rounded drop-shadow-sm"
                    />
                </div>

                <div className={`pt-4 border-t text-[11px] font-mono flex items-center justify-between ${
                    isDarkMode ? 'border-[#21262d] text-[#6e7681]' : 'border-[#d8dee4] text-[#8c959f]'
                }`}>
                    <span>Rendered as GitHub SVG embed</span>
                    <span>MIT License</span>
                </div>
            </div>
        </div>
    );
};
