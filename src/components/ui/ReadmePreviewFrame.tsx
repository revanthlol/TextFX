'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Moon, Sun } from 'lucide-react';

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
    // Allows user to toggle between GitHub Dark (#0d1117) and GitHub Light (#ffffff)
    const [isGithubDark, setIsGithubDark] = useState<boolean>(isDarkMode);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        setIsGithubDark(isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        setHasError(false);
    }, [svgUrl]);

    return (
        <div
            className={`w-full rounded-lg border overflow-hidden transition-colors shadow-sm ${
                isGithubDark
                    ? 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9]'
                    : 'bg-[#ffffff] border-[#d0d7de] text-[#24292f]'
            }`}
        >
            {/* GitHub File Header Bar */}
            <div
                className={`px-4 py-2 flex items-center justify-between border-b text-xs font-mono select-none ${
                    isGithubDark
                        ? 'bg-[#161b22] border-[#30363d] text-[#8b949e]'
                        : 'bg-[#f6f8fa] border-[#d0d7de] text-[#57606a]'
                }`}
            >
                <div className="flex items-center gap-2 font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-[#58a6ff]" />
                    <span className="font-semibold text-xs tracking-tight">README.md</span>
                </div>

                {/* GitHub Theme Toggle (Light / Dark) */}
                <button
                    type="button"
                    onClick={() => setIsGithubDark(!isGithubDark)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono transition-colors border ${
                        isGithubDark
                            ? 'border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]'
                            : 'border-[#d0d7de] bg-[#f3f4f6] text-[#24292f] hover:bg-[#e5e7eb]'
                    }`}
                    title={isGithubDark ? 'Switch to GitHub Light Theme' : 'Switch to GitHub Dark Theme'}
                >
                    {isGithubDark ? (
                        <>
                            <Sun className="w-3 h-3 text-amber-400" />
                            <span className="hidden sm:inline">GitHub Dark</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-3 h-3 text-zinc-700" />
                            <span className="hidden sm:inline">GitHub Light</span>
                        </>
                    )}
                </button>
            </div>

            {/* GitHub Markdown Content Area */}
            <div className="p-6 md:p-10 flex items-center justify-center overflow-x-auto min-h-[160px]">
                {hasError ? (
                    <div className="text-center py-6 text-xs text-zinc-500 font-mono">
                        Loading preview...
                    </div>
                ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={svgUrl}
                        src={svgUrl}
                        alt="TextFX Readme Banner"
                        width={width}
                        height={height}
                        onError={() => setHasError(true)}
                        className="max-w-full h-auto object-contain rounded drop-shadow-sm"
                    />
                )}
            </div>
        </div>
    );
};
