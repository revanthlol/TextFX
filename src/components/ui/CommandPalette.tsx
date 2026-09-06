'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Search, 
    Terminal, 
    Zap, 
    Sun, 
    Briefcase, 
    Compass, 
    Sparkles, 
    Type, 
    Palette, 
    Layers, 
    Settings2, 
    Code, 
    Copy, 
    RotateCcw, 
    Share2, 
    Download, 
    Moon,
    ArrowRight,
    BookOpen,
    Image as ImageIcon,
    FileJson,
    Upload,
    QrCode
} from 'lucide-react';
import { PRESETS, TextFXPreset } from '@/data/presets';

export interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    category: 'Presets' | 'Animation Effects' | 'Quick Actions' | 'Jump to Section' | 'Appearance';
    icon: React.ReactNode;
    shortcut?: string;
    onSelect: () => void;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyPreset: (preset: TextFXPreset) => void;
    onSelectAnimation: (style: string) => void;
    onJumpToSection: (section: string) => void;
    onCopyMarkdown: () => void;
    onCopyHtml: () => void;
    onCopyUrl: () => void;
    onDownloadSvg: () => void;
    onDownloadPng?: () => void;
    onExportJson?: () => void;
    onImportJson?: () => void;
    onOpenShare?: () => void;
    onShareConfig: () => void;
    onReset: () => void;
    onToggleTheme: () => void;
    isDarkMode: boolean;
}

export function CommandPalette({
    isOpen,
    onClose,
    onApplyPreset,
    onSelectAnimation,
    onJumpToSection,
    onCopyMarkdown,
    onCopyHtml,
    onCopyUrl,
    onDownloadSvg,
    onDownloadPng,
    onExportJson,
    onImportJson,
    onOpenShare,
    onShareConfig,
    onReset,
    onToggleTheme,
    isDarkMode
}: CommandPaletteProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Focus on open
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Build all available command items
    const allCommands: CommandItem[] = useMemo(() => [
        // Presets
        ...PRESETS.map(preset => ({
            id: `preset-${preset.id}`,
            title: `Preset: ${preset.name}`,
            subtitle: preset.description,
            category: 'Presets' as const,
            icon: preset.iconName === 'Terminal' ? <Terminal className="w-4 h-4" /> :
                  preset.iconName === 'Zap' ? <Zap className="w-4 h-4" /> :
                  preset.iconName === 'Sun' ? <Sun className="w-4 h-4" /> :
                  preset.iconName === 'Briefcase' ? <Briefcase className="w-4 h-4" /> :
                  preset.iconName === 'Compass' ? <Compass className="w-4 h-4" /> :
                  <Sparkles className="w-4 h-4" />,
            onSelect: () => onApplyPreset(preset)
        })),

        // Animation Effects
        {
            id: 'anim-typewriter',
            title: 'Animation: Typewriter',
            subtitle: 'Progressive character reveal with blinking cursor',
            category: 'Animation Effects' as const,
            icon: <Terminal className="w-4 h-4" />,
            onSelect: () => onSelectAnimation('typewriter')
        },
        {
            id: 'anim-fade',
            title: 'Animation: Fade In/Out',
            subtitle: 'Smooth opacity transitions between text segments',
            category: 'Animation Effects' as const,
            icon: <Sparkles className="w-4 h-4" />,
            onSelect: () => onSelectAnimation('fade')
        },
        {
            id: 'anim-slide-up',
            title: 'Animation: Slide Up',
            subtitle: 'Modern slide in from bottom with simultaneous fade',
            category: 'Animation Effects' as const,
            icon: <ArrowRight className="w-4 h-4 rotate-[-90deg]" />,
            onSelect: () => onSelectAnimation('slide-up')
        },
        {
            id: 'anim-wave',
            title: 'Animation: Wave Bounce',
            subtitle: 'Playful sine-wave oscillation motion',
            category: 'Animation Effects' as const,
            icon: <Sparkles className="w-4 h-4" />,
            onSelect: () => onSelectAnimation('wave')
        },
        {
            id: 'anim-glitch',
            title: 'Animation: Cyber Glitch',
            subtitle: 'Futuristic chromatic displacement animation',
            category: 'Animation Effects' as const,
            icon: <Zap className="w-4 h-4" />,
            onSelect: () => onSelectAnimation('glitch')
        },

        // Quick Actions
        {
            id: 'action-copy-md',
            title: 'Copy Markdown Embed',
            subtitle: 'Copy ![TextFX](url) markdown tag for GitHub README',
            category: 'Quick Actions' as const,
            icon: <Copy className="w-4 h-4" />,
            shortcut: '⌘M',
            onSelect: onCopyMarkdown
        },
        {
            id: 'action-copy-html',
            title: 'Copy HTML <img> Tag',
            subtitle: 'Copy raw <img src="..." /> tag',
            category: 'Quick Actions' as const,
            icon: <Code className="w-4 h-4" />,
            onSelect: onCopyHtml
        },
        {
            id: 'action-copy-url',
            title: 'Copy Direct SVG URL',
            subtitle: 'Copy hotlinkable SVG endpoint URL',
            category: 'Quick Actions' as const,
            icon: <Share2 className="w-4 h-4" />,
            onSelect: onCopyUrl
        },
        {
            id: 'action-download',
            title: 'Download .SVG File',
            subtitle: 'Save animated SVG directly to your computer',
            category: 'Quick Actions' as const,
            icon: <Download className="w-4 h-4" />,
            onSelect: onDownloadSvg
        },
        ...(onDownloadPng ? [{
            id: 'action-download-png',
            title: 'Download High-Res PNG (2x)',
            subtitle: 'Rasterize current frame as high-DPI image snapshot',
            category: 'Quick Actions' as const,
            icon: <ImageIcon className="w-4 h-4" />,
            onSelect: onDownloadPng
        }] : []),
        ...(onExportJson ? [{
            id: 'action-export-json',
            title: 'Export Configuration (JSON)',
            subtitle: 'Save current settings to textfx-config.json file',
            category: 'Quick Actions' as const,
            icon: <FileJson className="w-4 h-4" />,
            onSelect: onExportJson
        }] : []),
        ...(onImportJson ? [{
            id: 'action-import-json',
            title: 'Import Configuration (JSON)',
            subtitle: 'Upload a saved textfx-config.json configuration file',
            category: 'Quick Actions' as const,
            icon: <Upload className="w-4 h-4" />,
            onSelect: onImportJson
        }] : []),
        ...(onOpenShare ? [{
            id: 'action-share-qr',
            title: 'Share / Scan QR Code',
            subtitle: 'Open QR code dialog to test live on your mobile device',
            category: 'Quick Actions' as const,
            icon: <QrCode className="w-4 h-4" />,
            onSelect: onOpenShare
        }] : []),
        {
            id: 'action-share',
            title: 'Copy Share URL',
            subtitle: 'Copy shareable web studio URL with all settings encoded',
            category: 'Quick Actions' as const,
            icon: <Share2 className="w-4 h-4" />,
            onSelect: onShareConfig
        },
        {
            id: 'action-open-docs',
            title: 'Open API Documentation',
            subtitle: 'View parameter reference, code snippets, and GET /api/svg guide',
            category: 'Quick Actions' as const,
            icon: <BookOpen className="w-4 h-4" />,
            onSelect: () => {
                window.location.href = '/docs';
            }
        },
        {
            id: 'action-reset',
            title: 'Reset to Defaults',
            subtitle: 'Clear all edits and restore original starter config',
            category: 'Quick Actions' as const,
            icon: <RotateCcw className="w-4 h-4" />,
            onSelect: onReset
        },

        // Jump to Section
        {
            id: 'jump-text',
            title: 'Jump to: Text & Lines',
            category: 'Jump to Section' as const,
            icon: <Type className="w-4 h-4" />,
            onSelect: () => onJumpToSection('text')
        },
        {
            id: 'jump-typography',
            title: 'Jump to: Typography & Lettering',
            category: 'Jump to Section' as const,
            icon: <Type className="w-4 h-4" />,
            onSelect: () => onJumpToSection('typography')
        },
        {
            id: 'jump-animation',
            title: 'Jump to: Animation & Cursor',
            category: 'Jump to Section' as const,
            icon: <Settings2 className="w-4 h-4" />,
            onSelect: () => onJumpToSection('animation')
        },
        {
            id: 'jump-colors',
            title: 'Jump to: Canvas & Gradients',
            category: 'Jump to Section' as const,
            icon: <Palette className="w-4 h-4" />,
            onSelect: () => onJumpToSection('colors')
        },
        {
            id: 'jump-canvas',
            title: 'Jump to: Dimensions & Alignment',
            category: 'Jump to Section' as const,
            icon: <Layers className="w-4 h-4" />,
            onSelect: () => onJumpToSection('canvas')
        },
        {
            id: 'jump-export',
            title: 'Jump to: Export & Snippets',
            category: 'Jump to Section' as const,
            icon: <Code className="w-4 h-4" />,
            onSelect: () => onJumpToSection('export')
        },

        // Appearance
        {
            id: 'theme-toggle',
            title: `Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`,
            category: 'Appearance' as const,
            icon: isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
            onSelect: onToggleTheme
        }
    ], [
        onApplyPreset, onSelectAnimation, onCopyMarkdown, onCopyHtml,
        onCopyUrl, onDownloadSvg, onDownloadPng, onExportJson, onImportJson,
        onOpenShare, onShareConfig, onReset, onJumpToSection,
        onToggleTheme, isDarkMode
    ]);

    // Filter commands by search
    const filteredCommands = useMemo(() => {
        if (!searchQuery.trim()) return allCommands;
        const q = searchQuery.toLowerCase();
        return allCommands.filter(cmd => 
            cmd.title.toLowerCase().includes(q) ||
            cmd.subtitle?.toLowerCase().includes(q) ||
            cmd.category.toLowerCase().includes(q)
        );
    }, [allCommands, searchQuery]);

    // Keep selected index within bounds
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    // Automatically scroll selected item into view during keyboard navigation
    useEffect(() => {
        if (!listRef.current) return;
        const activeElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
        if (activeElement) {
            activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    // Keyboard navigation within modal
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].onSelect();
                onClose();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-100"
            onClick={onClose}
        >
            <div 
                className={`w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100 ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
                }`}
                onClick={e => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                {/* Search Bar */}
                <div className="flex items-center px-4 border-b border-zinc-800/80">
                    <Search className="w-4 h-4 text-zinc-500 mr-3 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Type a command, preset, or search settings..."
                        className="w-full py-3.5 bg-transparent outline-none text-xs font-medium placeholder-zinc-500"
                    />
                    <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                        ESC
                    </kbd>
                </div>

                {/* Results List */}
                <div 
                    ref={listRef}
                    className="max-h-[340px] overflow-y-auto p-2 space-y-1"
                >
                    {filteredCommands.length === 0 ? (
                        <div className="py-8 text-center text-xs text-zinc-500">
                            No matching commands found.
                        </div>
                    ) : (
                        filteredCommands.map((cmd, index) => {
                            const isSelected = index === selectedIndex;
                            return (
                                <button
                                    key={cmd.id}
                                    type="button"
                                    data-index={index}
                                    onClick={() => {
                                        cmd.onSelect();
                                        onClose();
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs transition-colors ${
                                        isSelected 
                                            ? isDarkMode ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-900 font-semibold'
                                            : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`p-1 rounded-md ${
                                            isSelected ? 'text-blue-400' : 'text-zinc-500'
                                        }`}>
                                            {cmd.icon}
                                        </span>
                                        <div>
                                            <div className="font-medium text-xs">
                                                {cmd.title}
                                            </div>
                                            {cmd.subtitle && (
                                                <div className="text-[11px] text-zinc-500 font-normal truncate max-w-sm">
                                                    {cmd.subtitle}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800/40 text-zinc-500 border border-zinc-800">
                                            {cmd.category}
                                        </span>
                                        {cmd.shortcut && (
                                            <kbd className="text-[10px] font-mono px-1 rounded bg-zinc-800 text-zinc-400">
                                                {cmd.shortcut}
                                            </kbd>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer instructions */}
                <div className={`px-4 py-2 border-t text-[11px] flex items-center justify-between ${
                    isDarkMode ? 'bg-zinc-900/40 border-zinc-800 text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                }`}>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 rounded bg-zinc-800 text-zinc-400 font-mono">↑↓</kbd> navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 rounded bg-zinc-800 text-zinc-400 font-mono">↵</kbd> select
                        </span>
                    </div>
                    <span>TextFX</span>
                </div>
            </div>
        </div>
    );
}
