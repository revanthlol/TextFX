'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Terminal, 
    Zap, 
    Sun, 
    Briefcase, 
    Compass, 
    Sparkles, 
    Type, 
    Palette, 
    Sliders, 
    Settings2, 
    Code, 
    Copy, 
    Check, 
    RotateCcw, 
    Share2, 
    Download, 
    Trash2, 
    Plus, 
    Github, 
    MessageSquare, 
    Monitor,
    Layers,
    Moon,
    Eye
} from 'lucide-react';
import { FontCombobox } from './FontCombobox';
import { AnimatedLogo } from './AnimatedLogo';
import { CommandPalette } from './ui/CommandPalette';
import { BottomSheet } from './ui/BottomSheet';
import { ReadmePreviewFrame } from './ui/ReadmePreviewFrame';
import { GRADIENT_PRESETS } from '@/lib/gradients';
import { PRESETS, TextFXPreset } from '@/data/presets';
import { ColorPicker } from './ui/ColorPicker';
import { RangeSlider } from './ui/RangeSlider';
import { SwitchToggle } from './ui/SwitchToggle';
import { AccordionSection } from './ui/AccordionSection';
import { ToastProvider, useToast } from './ui/Toast';

interface TextLine {
    text: string;
    font: string;
    color: string;
    fontSize: number;
    letterSpacing: string;
    typingSpeed: number;
    deleteSpeed: number;
    fontWeight: string;
    lineHeight: number;
    animationStyle: string;
    gradient: string;
}

const DEFAULT_VALUES = {
    font: 'Courier Prime',
    color: '#00ff66',
    fontSize: 28,
    letterSpacing: '0.1em',
    typingSpeed: 0.06,
    deleteSpeed: 0.04,
    fontWeight: '400',
    lineHeight: 1.3,
    animationStyle: 'typewriter',
    gradient: '',
    width: 600,
    height: 100,
    backgroundColor: '#0d1117',
    backgroundGradient: '',
    backgroundGradientAngle: 90,
    hAlign: 'center' as const,
    vAlign: 'center' as const,
    cursorChar: '|',
    cursorColor: '#00ff66',
    cursorBlinkSpeed: 600,
    hideCursorOnComplete: false,
    pauseDuration: 2,
    loop: true,
    vanishBeforeNextLine: true,
};

const ANIMATION_STYLES = [
    { id: 'typewriter', label: 'Typewriter', desc: 'Progressive typing' },
    { id: 'fade', label: 'Fade In/Out', desc: 'Opacity transition' },
    { id: 'slide-up', label: 'Slide Up', desc: 'Slide in from bottom' },
    { id: 'wave', label: 'Wave', desc: 'Sine wave bounce' },
    { id: 'glitch', label: 'Glitch', desc: 'Cyber chromatic jitter' },
];

const CURSOR_OPTIONS = [
    { label: 'Pipe (|)', value: '|' },
    { label: 'Underscore (_)', value: '_' },
    { label: 'Solid Block (█)', value: '█' },
    { label: 'Half Block (▋)', value: '▋' },
    { label: 'None (Hidden)', value: '' },
];

export default function SvgGeneratorWrapper() {
    return (
        <ToastProvider>
            <SvgGenerator />
        </ToastProvider>
    );
}

function SvgGenerator() {
    const { showToast } = useToast();
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Accordion states
    const [openSections, setOpenSections] = useState({
        text: true,
        typography: false,
        animation: false,
        colors: false,
        canvas: false,
        export: false,
    });

    // Preview state
    const [previewMode, setPreviewMode] = useState<'github' | 'discord' | 'canvas'>('github');
    const [canvasTheme, setCanvasTheme] = useState<'dark' | 'light' | 'dimmed' | 'transparent'>('dark');
    const [zoom, setZoom] = useState(100);
    const [isPreviewSheetOpen, setIsPreviewSheetOpen] = useState(false);

    // Text Lines
    const [textLines, setTextLines] = useState<TextLine[]>([
        { 
            text: 'Hello, World!', 
            font: 'Courier Prime', 
            color: '#00ff66', 
            fontSize: 28, 
            letterSpacing: '0.1em', 
            typingSpeed: 0.06, 
            deleteSpeed: 0.04, 
            fontWeight: '400', 
            lineHeight: 1.3,
            animationStyle: 'typewriter',
            gradient: ''
        },
        { 
            text: 'Animated with TextFX!', 
            font: 'Courier Prime', 
            color: '#00ff66', 
            fontSize: 28, 
            letterSpacing: '0.1em', 
            typingSpeed: 0.06, 
            deleteSpeed: 0.04, 
            fontWeight: '400', 
            lineHeight: 1.3,
            animationStyle: 'typewriter',
            gradient: ''
        }
    ]);

    // Canvas & Layout State
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(100);
    const [backgroundType, setBackgroundType] = useState<'transparent' | 'solid' | 'gradient'>('transparent');
    const [backgroundColor, setBackgroundColor] = useState('#0d1117');
    const [backgroundGradient, setBackgroundGradient] = useState('');
    const [backgroundGradientAngle, setBackgroundGradientAngle] = useState(90);
    const [hAlign, setHAlign] = useState<'left' | 'center' | 'right'>('center');
    const [vAlign, setVAlign] = useState<'top' | 'center' | 'bottom'>('center');

    // Cursor & Timing State
    const [cursorChar, setCursorChar] = useState('|');
    const [cursorColor, setCursorColor] = useState('#00ff66');
    const [cursorBlinkSpeed, setCursorBlinkSpeed] = useState(600);
    const [hideCursorOnComplete, setHideCursorOnComplete] = useState(false);
    const [pauseDuration, setPauseDuration] = useState(2);
    const [loop, setLoop] = useState(true);
    const [vanishBeforeNextLine, setVanishBeforeNextLine] = useState(true);

    // Active preset tracking
    const [activePresetId, setActivePresetId] = useState<string | null>(null);

    // Command palette state
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    // Copy states
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Global Cmd+K / Ctrl+K keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Jump to section helper
    const handleJumpToSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: true }));
        setTimeout(() => {
            const el = document.getElementById(`section-${section}`);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    // Toggle accordion
    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Apply Preset Theme
    const applyPreset = useCallback((preset: TextFXPreset) => {
        setActivePresetId(preset.id);
        setTextLines(preset.lines.map(l => ({ ...l })));
        setWidth(preset.canvas.width);
        setHeight(preset.canvas.height);
        setBackgroundType(preset.canvas.backgroundType);
        setBackgroundColor(preset.canvas.backgroundColor);
        setBackgroundGradient(preset.canvas.backgroundGradient);
        setBackgroundGradientAngle(preset.canvas.backgroundGradientAngle);
        setHAlign(preset.canvas.hAlign);
        setVAlign(preset.canvas.vAlign === 'middle' ? 'center' : preset.canvas.vAlign);
        setCursorChar(preset.canvas.cursorChar);
        setCursorColor(preset.canvas.cursorColor);
        setCursorBlinkSpeed(preset.canvas.cursorBlinkSpeed);
        setHideCursorOnComplete(preset.canvas.hideCursorOnComplete);
        setPauseDuration(preset.canvas.pauseDuration);
        setLoop(preset.canvas.loop);
        setVanishBeforeNextLine(preset.canvas.vanishBeforeNextLine);
        showToast(`Preset: ${preset.name}`, 'sparkles');
    }, [showToast]);

    // Initialize from URL params if present
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if (params.has('preset')) {
            const presetId = params.get('preset');
            const found = PRESETS.find(p => p.id === presetId);
            if (found) {
                applyPreset(found);
            }
        }
    }, [applyPreset]);

    // Reset to defaults
    const resetToDefaults = () => {
        setActivePresetId(null);
        setTextLines([
            {
                text: 'Hello, World!',
                font: DEFAULT_VALUES.font,
                color: '#00ff66',
                fontSize: DEFAULT_VALUES.fontSize,
                letterSpacing: DEFAULT_VALUES.letterSpacing,
                typingSpeed: DEFAULT_VALUES.typingSpeed,
                deleteSpeed: DEFAULT_VALUES.deleteSpeed,
                fontWeight: DEFAULT_VALUES.fontWeight,
                lineHeight: DEFAULT_VALUES.lineHeight,
                animationStyle: DEFAULT_VALUES.animationStyle,
                gradient: DEFAULT_VALUES.gradient
            },
            {
                text: 'Animated with TextFX!',
                font: DEFAULT_VALUES.font,
                color: '#00ff66',
                fontSize: DEFAULT_VALUES.fontSize,
                letterSpacing: DEFAULT_VALUES.letterSpacing,
                typingSpeed: DEFAULT_VALUES.typingSpeed,
                deleteSpeed: DEFAULT_VALUES.deleteSpeed,
                fontWeight: DEFAULT_VALUES.fontWeight,
                lineHeight: DEFAULT_VALUES.lineHeight,
                animationStyle: DEFAULT_VALUES.animationStyle,
                gradient: DEFAULT_VALUES.gradient
            }
        ]);
        setWidth(600);
        setHeight(100);
        setBackgroundType('transparent');
        setBackgroundColor('#0d1117');
        setBackgroundGradient('');
        setBackgroundGradientAngle(90);
        setHAlign('center');
        setVAlign('center');
        setCursorChar('|');
        setCursorColor('#00ff66');
        setCursorBlinkSpeed(600);
        setHideCursorOnComplete(false);
        setPauseDuration(2);
        setLoop(true);
        setVanishBeforeNextLine(true);
        showToast('Reset to default settings', 'info');
    };

    // Line management
    const addTextLine = () => {
        const lastLine = textLines[textLines.length - 1] || DEFAULT_VALUES;
        setTextLines([
            ...textLines,
            {
                text: 'New line of text',
                font: lastLine.font,
                color: lastLine.color,
                fontSize: lastLine.fontSize,
                letterSpacing: lastLine.letterSpacing,
                typingSpeed: lastLine.typingSpeed,
                deleteSpeed: lastLine.deleteSpeed,
                fontWeight: lastLine.fontWeight,
                lineHeight: lastLine.lineHeight,
                animationStyle: lastLine.animationStyle,
                gradient: lastLine.gradient,
            }
        ]);
    };

    const updateTextLine = (index: number, field: keyof TextLine, value: TextLine[keyof TextLine]) => {
        const updated = [...textLines];
        updated[index] = { ...updated[index], [field]: value };
        setTextLines(updated);
        setActivePresetId(null);
    };

    const removeTextLine = (index: number) => {
        if (textLines.length > 1) {
            setTextLines(textLines.filter((_, i) => i !== index));
            setActivePresetId(null);
        }
    };

    // Compute Query Params
    const queryParamsString = useMemo(() => {
        const params = new URLSearchParams();

        if (textLines.length === 0) return '';

        const firstLine = textLines[0];
        const allSame = (field: keyof TextLine) => textLines.every(line => line[field] === firstLine[field]);

        // Lines payload
        const linesData = textLines.map(line => {
            const minimal: Record<string, unknown> = { text: line.text };
            if (!allSame('font') && line.font !== DEFAULT_VALUES.font) minimal.font = line.font;
            if (!allSame('color') && line.color !== DEFAULT_VALUES.color) minimal.color = line.color;
            if (!allSame('fontSize') && line.fontSize !== DEFAULT_VALUES.fontSize) minimal.fontSize = line.fontSize;
            if (!allSame('letterSpacing') && line.letterSpacing !== DEFAULT_VALUES.letterSpacing) minimal.letterSpacing = line.letterSpacing;
            if (!allSame('typingSpeed') && line.typingSpeed !== DEFAULT_VALUES.typingSpeed) minimal.typingSpeed = line.typingSpeed;
            if (!allSame('deleteSpeed') && line.deleteSpeed !== DEFAULT_VALUES.deleteSpeed) minimal.deleteSpeed = line.deleteSpeed;
            if (!allSame('fontWeight') && line.fontWeight !== DEFAULT_VALUES.fontWeight) minimal.fontWeight = line.fontWeight;
            if (!allSame('lineHeight') && line.lineHeight !== DEFAULT_VALUES.lineHeight) minimal.lineHeight = line.lineHeight;
            if (!allSame('animationStyle') && line.animationStyle !== DEFAULT_VALUES.animationStyle) minimal.animationStyle = line.animationStyle;
            if (!allSame('gradient') && line.gradient !== DEFAULT_VALUES.gradient) minimal.gradient = line.gradient;
            return minimal;
        });

        params.append('lines', JSON.stringify(linesData));

        // Shared line attributes
        if (allSame('font') && firstLine.font !== DEFAULT_VALUES.font) params.append('font', firstLine.font);
        if (allSame('color') && firstLine.color !== DEFAULT_VALUES.color) params.append('color', firstLine.color);
        if (allSame('fontSize') && firstLine.fontSize !== DEFAULT_VALUES.fontSize) params.append('fontSize', firstLine.fontSize.toString());
        if (allSame('letterSpacing') && firstLine.letterSpacing !== DEFAULT_VALUES.letterSpacing) params.append('letterSpacing', firstLine.letterSpacing);
        if (allSame('typingSpeed') && firstLine.typingSpeed !== DEFAULT_VALUES.typingSpeed) params.append('typingSpeed', firstLine.typingSpeed.toString());
        if (allSame('deleteSpeed') && firstLine.deleteSpeed !== DEFAULT_VALUES.deleteSpeed) params.append('deleteSpeed', firstLine.deleteSpeed.toString());
        if (allSame('fontWeight') && firstLine.fontWeight !== DEFAULT_VALUES.fontWeight) params.append('fontWeight', firstLine.fontWeight);
        if (allSame('lineHeight') && firstLine.lineHeight !== DEFAULT_VALUES.lineHeight) params.append('lineHeight', firstLine.lineHeight.toString());
        if (allSame('animationStyle') && firstLine.animationStyle !== DEFAULT_VALUES.animationStyle) params.append('animationStyle', firstLine.animationStyle);
        if (allSame('gradient') && firstLine.gradient !== DEFAULT_VALUES.gradient) params.append('gradient', firstLine.gradient);

        // Canvas & Styling Params
        if (width !== DEFAULT_VALUES.width) params.append('width', width.toString());
        if (height !== DEFAULT_VALUES.height) params.append('height', height.toString());

        if (backgroundType === 'solid') {
            params.append('backgroundColor', backgroundColor);
        } else if (backgroundType === 'gradient' && backgroundGradient) {
            params.append('backgroundGradient', backgroundGradient);
            if (backgroundGradientAngle !== 90) {
                params.append('backgroundGradientAngle', backgroundGradientAngle.toString());
            }
        }

        if (hAlign !== DEFAULT_VALUES.hAlign) params.append('hAlign', hAlign);
        if (vAlign !== DEFAULT_VALUES.vAlign) params.append('vAlign', vAlign);

        if (cursorChar !== DEFAULT_VALUES.cursorChar) params.append('cursorChar', cursorChar);
        if (cursorColor) params.append('cursorColor', cursorColor);
        if (cursorBlinkSpeed !== DEFAULT_VALUES.cursorBlinkSpeed) params.append('cursorBlinkSpeed', cursorBlinkSpeed.toString());
        if (hideCursorOnComplete) params.append('hideCursorOnComplete', 'true');

        if (pauseDuration !== DEFAULT_VALUES.pauseDuration) params.append('pauseDuration', pauseDuration.toString());
        if (!loop) params.append('loop', 'false');
        if (!vanishBeforeNextLine) params.append('vanishBeforeNextLine', 'false');

        return params.toString();
    }, [
        textLines, width, height, backgroundType, backgroundColor,
        backgroundGradient, backgroundGradientAngle, hAlign, vAlign,
        cursorChar, cursorColor, cursorBlinkSpeed, hideCursorOnComplete,
        pauseDuration, loop, vanishBeforeNextLine
    ]);

    // Live URL
    const svgUrl = useMemo(() => {
        return `/api/svg?${queryParamsString}`;
    }, [queryParamsString]);

    const absoluteSvgUrl = useMemo(() => {
        if (typeof window === 'undefined') return svgUrl;
        return `${window.location.origin}${svgUrl}`;
    }, [svgUrl]);

    // Sync query string in URL address bar
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const currentSearch = window.location.search;
        const newSearch = `?${queryParamsString}`;
        if (currentSearch !== newSearch) {
            window.history.replaceState(null, '', newSearch);
        }
    }, [queryParamsString]);

    // Copy to clipboard helper
    const handleCopy = (text: string, key: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        showToast(`Copied ${label}`, 'check');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Download SVG file
    const handleDownload = async () => {
        try {
            const res = await fetch(svgUrl);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `textfx-animated.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast('Downloaded textfx-animated.svg', 'check');
        } catch {
            showToast('Failed to download SVG', 'info');
        }
    };

    // Preset Lucide Icon Renderer
    const renderPresetIcon = (iconName: TextFXPreset['iconName']) => {
        switch (iconName) {
            case 'Terminal': return <Terminal className="w-3.5 h-3.5" />;
            case 'Zap': return <Zap className="w-3.5 h-3.5" />;
            case 'Sun': return <Sun className="w-3.5 h-3.5" />;
            case 'Briefcase': return <Briefcase className="w-3.5 h-3.5" />;
            case 'Compass': return <Compass className="w-3.5 h-3.5" />;
            case 'Sparkles':
            default:
                return <Sparkles className="w-3.5 h-3.5" />;
        }
    };

    // Canvas background style helper
    const getCanvasBgClass = () => {
        switch (canvasTheme) {
            case 'light': return 'bg-white text-zinc-900 border-zinc-200';
            case 'dimmed': return 'bg-[#161b22] text-[#c9d1d9] border-[#30363d]';
            case 'transparent': return 'bg-checkered text-white border-zinc-800';
            case 'dark':
            default:
                return 'bg-[#0d1117] text-[#c9d1d9] border-[#30363d]';
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-150 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
            
            {/* Top Navigation Bar */}
            <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
                isDarkMode ? 'bg-zinc-950/85 border-zinc-800' : 'bg-white/85 border-zinc-200'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AnimatedLogo />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Cmd+K Command Palette Trigger */}
                        <button
                            type="button"
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all ${
                                isDarkMode 
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700' 
                                    : 'bg-zinc-50 border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 shadow-sm'
                            }`}
                            title="Open Command Palette (Cmd+K)"
                        >
                            <span className="hidden sm:inline text-[11px]">Search commands</span>
                            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                                ⌘K
                            </kbd>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleCopy(window.location.href, 'share', 'Share URL')}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                isDarkMode 
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white' 
                                    : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100 shadow-sm'
                            }`}
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Share</span>
                        </button>

                        <button
                            type="button"
                            onClick={resetToDefaults}
                            className={`p-1.5 rounded-md border text-xs transition-colors ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100'
                            }`}
                            title="Reset all settings"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-1.5 rounded-md border text-xs transition-colors ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100'
                            }`}
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Starter Presets Banner */}
            <div className={`border-b ${isDarkMode ? 'bg-zinc-900/30 border-zinc-800/60' : 'bg-zinc-100/60 border-zinc-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 whitespace-nowrap mr-1">
                        Presets:
                    </span>
                    {PRESETS.map(preset => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all border ${
                                activePresetId === preset.id
                                    ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold shadow-sm'
                                    : isDarkMode
                                        ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                                        : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                            }`}
                        >
                            {renderPresetIcon(preset.iconName)}
                            <span>{preset.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Split-Screen Studio Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT PANE (5 cols): Form Accordions */}
                    <div className="lg:col-span-5 space-y-3">
                        
                        {/* 1. TEXT CONTENT & LINES */}
                        <AccordionSection
                            id="section-text"
                            title="Text Content & Lines"
                            icon={<Type className="w-4 h-4" />}
                            badge={`${textLines.length} ${textLines.length === 1 ? 'line' : 'lines'}`}
                            isOpen={openSections.text}
                            onToggle={() => toggleSection('text')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-4">
                                {textLines.map((line, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`p-3.5 rounded-lg border space-y-3 transition-all ${
                                            isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-zinc-400 font-mono">
                                                Line #{idx + 1}
                                            </span>
                                            {textLines.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTextLine(idx)}
                                                    className="text-xs text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                                                    title="Remove line"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Text Input */}
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                value={line.text}
                                                onChange={(e) => updateTextLine(idx, 'text', e.target.value)}
                                                placeholder="Enter line text..."
                                                className={`w-full rounded-md border text-xs px-3 py-2 outline-none font-medium transition-all ${
                                                    isDarkMode 
                                                        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500' 
                                                        : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
                                                }`}
                                            />
                                        </div>

                                        {/* Per-Line Font Picker */}
                                        <div className="space-y-1">
                                            <label className={`block text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                Font Family
                                            </label>
                                            <FontCombobox
                                                value={line.font}
                                                onChange={(font) => updateTextLine(idx, 'font', font)}
                                                isDarkMode={isDarkMode}
                                            />
                                        </div>

                                        {/* Per-Line Animation Style & Gradient */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className={`block text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                    Animation Style
                                                </label>
                                                <select
                                                    value={line.animationStyle || 'typewriter'}
                                                    onChange={(e) => updateTextLine(idx, 'animationStyle', e.target.value)}
                                                    className={`w-full rounded-md border text-xs px-2.5 py-1.5 outline-none ${
                                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                                                    }`}
                                                >
                                                    {ANIMATION_STYLES.map(s => (
                                                        <option key={s.id} value={s.id}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className={`block text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                    Gradient Fill
                                                </label>
                                                <select
                                                    value={line.gradient || ''}
                                                    onChange={(e) => updateTextLine(idx, 'gradient', e.target.value)}
                                                    className={`w-full rounded-md border text-xs px-2.5 py-1.5 outline-none ${
                                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                                                    }`}
                                                >
                                                    <option value="">Solid Color</option>
                                                    {GRADIENT_PRESETS.map(g => (
                                                        <option key={g.id} value={g.id}>{g.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Per-Line Solid Color Picker */}
                                        {!line.gradient && (
                                            <ColorPicker
                                                label="Solid Text Color"
                                                value={line.color}
                                                onChange={(c) => updateTextLine(idx, 'color', c)}
                                                isDarkMode={isDarkMode}
                                            />
                                        )}

                                        {/* Sliders for line font size & speeds */}
                                        <div className="grid grid-cols-3 gap-3 pt-1">
                                            <RangeSlider
                                                label="Font Size"
                                                value={line.fontSize}
                                                onChange={(v) => updateTextLine(idx, 'fontSize', v)}
                                                min={12}
                                                max={64}
                                                unit="px"
                                                isDarkMode={isDarkMode}
                                            />
                                            <RangeSlider
                                                label="Type Speed"
                                                value={Math.round(line.typingSpeed * 1000)}
                                                onChange={(v) => updateTextLine(idx, 'typingSpeed', v / 1000)}
                                                min={20}
                                                max={200}
                                                step={10}
                                                unit="ms"
                                                isDarkMode={isDarkMode}
                                            />
                                            <RangeSlider
                                                label="Delete Speed"
                                                value={Math.round(line.deleteSpeed * 1000)}
                                                onChange={(v) => updateTextLine(idx, 'deleteSpeed', v / 1000)}
                                                min={10}
                                                max={150}
                                                step={10}
                                                unit="ms"
                                                isDarkMode={isDarkMode}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addTextLine}
                                    className={`w-full py-2 rounded-md border border-dashed text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                                        isDarkMode
                                            ? 'border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900'
                                            : 'border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100'
                                    }`}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Another Line</span>
                                </button>
                            </div>
                        </AccordionSection>

                        {/* 2. TYPOGRAPHY & LETTERING */}
                        <AccordionSection
                            id="section-typography"
                            title="Typography & Lettering"
                            icon={<Sliders className="w-4 h-4" />}
                            isOpen={openSections.typography}
                            onToggle={() => toggleSection('typography')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            Font Weight
                                        </label>
                                        <select
                                            value={textLines[0]?.fontWeight || '400'}
                                            onChange={(e) => {
                                                const updated = textLines.map(l => ({ ...l, fontWeight: e.target.value }));
                                                setTextLines(updated);
                                            }}
                                            className={`w-full rounded-md border text-xs px-2.5 py-1.5 outline-none ${
                                                isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                                            }`}
                                        >
                                            <option value="300">Light (300)</option>
                                            <option value="400">Regular (400)</option>
                                            <option value="500">Medium (500)</option>
                                            <option value="600">Semi-Bold (600)</option>
                                            <option value="700">Bold (700)</option>
                                            <option value="800">Extra Bold (800)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            Letter Spacing
                                        </label>
                                        <select
                                            value={textLines[0]?.letterSpacing || '0.1em'}
                                            onChange={(e) => {
                                                const updated = textLines.map(l => ({ ...l, letterSpacing: e.target.value }));
                                                setTextLines(updated);
                                            }}
                                            className={`w-full rounded-md border text-xs px-2.5 py-1.5 outline-none ${
                                                isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                                            }`}
                                        >
                                            <option value="-0.05em">Tight (-0.05em)</option>
                                            <option value="0em">Normal (0em)</option>
                                            <option value="0.05em">Slight (0.05em)</option>
                                            <option value="0.1em">Wide (0.1em)</option>
                                            <option value="0.2em">Extra Wide (0.2em)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </AccordionSection>

                        {/* 3. ANIMATION & TIMING */}
                        <AccordionSection
                            id="section-animation"
                            title="Animation & Cursor Suite"
                            icon={<Settings2 className="w-4 h-4" />}
                            isOpen={openSections.animation}
                            onToggle={() => toggleSection('animation')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            Cursor Style
                                        </label>
                                        <select
                                            value={cursorChar}
                                            onChange={(e) => setCursorChar(e.target.value)}
                                            className={`w-full rounded-md border text-xs px-2.5 py-1.5 outline-none ${
                                                isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                                            }`}
                                        >
                                            {CURSOR_OPTIONS.map(c => (
                                                <option key={c.label} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <RangeSlider
                                        label="Pause Between Lines"
                                        value={pauseDuration}
                                        onChange={setPauseDuration}
                                        min={0.5}
                                        max={5}
                                        step={0.5}
                                        unit="s"
                                        isDarkMode={isDarkMode}
                                    />
                                </div>

                                {cursorChar && (
                                    <>
                                        <ColorPicker
                                            label="Cursor Color"
                                            value={cursorColor}
                                            onChange={setCursorColor}
                                            isDarkMode={isDarkMode}
                                            allowEmpty={true}
                                            emptyLabel="Inherit Text Color"
                                        />

                                        <RangeSlider
                                            label="Cursor Blink Speed"
                                            value={cursorBlinkSpeed}
                                            onChange={setCursorBlinkSpeed}
                                            min={200}
                                            max={1200}
                                            step={50}
                                            unit="ms"
                                            isDarkMode={isDarkMode}
                                        />
                                    </>
                                )}

                                <div className="pt-2 border-t border-zinc-800 space-y-2">
                                    <SwitchToggle
                                        label="Infinite Loop"
                                        description="Continuously repeat animation"
                                        checked={loop}
                                        onChange={setLoop}
                                        isDarkMode={isDarkMode}
                                    />
                                    <SwitchToggle
                                        label="Vanish Before Next Line"
                                        description="Backspace / fade previous line before next"
                                        checked={vanishBeforeNextLine}
                                        onChange={setVanishBeforeNextLine}
                                        isDarkMode={isDarkMode}
                                    />
                                    <SwitchToggle
                                        label="Auto-Hide Cursor"
                                        description="Hide cursor when typing concludes"
                                        checked={hideCursorOnComplete}
                                        onChange={setHideCursorOnComplete}
                                        isDarkMode={isDarkMode}
                                    />
                                </div>
                            </div>
                        </AccordionSection>

                        {/* 4. CANVAS BACKGROUND & GRADIENTS */}
                        <AccordionSection
                            id="section-colors"
                            title="Canvas Background & Gradients"
                            icon={<Palette className="w-4 h-4" />}
                            isOpen={openSections.colors}
                            onToggle={() => toggleSection('colors')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className={`block text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                        Background Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['transparent', 'solid', 'gradient'] as const).map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setBackgroundType(type)}
                                                className={`py-1.5 px-3 rounded-md text-xs font-medium capitalize border transition-all ${
                                                    backgroundType === type
                                                        ? 'bg-zinc-100 text-zinc-950 border-zinc-200 shadow-sm'
                                                        : isDarkMode
                                                            ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                                            : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {backgroundType === 'solid' && (
                                    <ColorPicker
                                        label="Canvas Background Color"
                                        value={backgroundColor}
                                        onChange={setBackgroundColor}
                                        isDarkMode={isDarkMode}
                                    />
                                )}

                                {backgroundType === 'gradient' && (
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className={`block text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                Gradient Preset
                                            </label>
                                            <select
                                                value={backgroundGradient}
                                                onChange={(e) => setBackgroundGradient(e.target.value)}
                                                className={`w-full rounded-md border text-xs px-2.5 py-1.5 outline-none ${
                                                    isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
                                                }`}
                                            >
                                                <option value="">Select Gradient...</option>
                                                {GRADIENT_PRESETS.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <RangeSlider
                                            label="Gradient Angle"
                                            value={backgroundGradientAngle}
                                            onChange={setBackgroundGradientAngle}
                                            min={0}
                                            max={360}
                                            step={15}
                                            unit="°"
                                            isDarkMode={isDarkMode}
                                        />
                                    </div>
                                )}
                            </div>
                        </AccordionSection>

                        {/* 5. CANVAS DIMENSIONS & ALIGNMENT */}
                        <AccordionSection
                            id="section-canvas"
                            title="Dimensions & Alignment"
                            icon={<Layers className="w-4 h-4" />}
                            isOpen={openSections.canvas}
                            onToggle={() => toggleSection('canvas')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <RangeSlider
                                        label="Canvas Width"
                                        value={width}
                                        onChange={setWidth}
                                        min={300}
                                        max={1200}
                                        step={10}
                                        unit="px"
                                        isDarkMode={isDarkMode}
                                    />
                                    <RangeSlider
                                        label="Canvas Height"
                                        value={height}
                                        onChange={setHeight}
                                        min={50}
                                        max={400}
                                        step={10}
                                        unit="px"
                                        isDarkMode={isDarkMode}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1">
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            Horizontal Align
                                        </label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {(['left', 'center', 'right'] as const).map(align => (
                                                <button
                                                    key={align}
                                                    type="button"
                                                    onClick={() => setHAlign(align)}
                                                    className={`py-1 rounded-md text-xs font-medium capitalize border transition-all ${
                                                        hAlign === align
                                                            ? 'bg-zinc-100 text-zinc-950 border-zinc-200 shadow-sm'
                                                            : isDarkMode
                                                                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                                                : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                                                    }`}
                                                >
                                                    {align}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className={`block text-[11px] font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            Vertical Align
                                        </label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {(['top', 'center', 'bottom'] as const).map(align => (
                                                <button
                                                    key={align}
                                                    type="button"
                                                    onClick={() => setVAlign(align)}
                                                    className={`py-1 rounded-md text-xs font-medium capitalize border transition-all ${
                                                        vAlign === align
                                                            ? 'bg-zinc-100 text-zinc-950 border-zinc-200 shadow-sm'
                                                            : isDarkMode
                                                                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                                                : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                                                    }`}
                                                >
                                                    {align}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AccordionSection>

                        {/* 6. EXPORT & EMBED CODES */}
                        <AccordionSection
                            id="section-export"
                            title="Export & Embed Snippets"
                            icon={<Code className="w-4 h-4" />}
                            isOpen={openSections.export}
                            onToggle={() => toggleSection('export')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-3.5">
                                {/* Markdown */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-zinc-400">GitHub README (Markdown)</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`, 'md', 'Markdown')}
                                            className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1 font-medium"
                                        >
                                            {copiedKey === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === 'md' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-md font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                                    }`}>
                                        {`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`}
                                    </div>
                                </div>

                                {/* HTML <img> */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-zinc-400">HTML &lt;img&gt; Tag</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(`<img src="${absoluteSvgUrl}" alt="TextFX Animation" />`, 'html', 'HTML Tag')}
                                            className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1 font-medium"
                                        >
                                            {copiedKey === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === 'html' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-md font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                                    }`}>
                                        {`<img src="${absoluteSvgUrl}" alt="TextFX Animation" />`}
                                    </div>
                                </div>

                                {/* Direct SVG URL */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-zinc-400">Direct SVG URL</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(absoluteSvgUrl, 'url', 'Direct SVG URL')}
                                            className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1 font-medium"
                                        >
                                            {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === 'url' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-md font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                                    }`}>
                                        {absoluteSvgUrl}
                                    </div>
                                </div>
                            </div>
                        </AccordionSection>

                    </div>

                    {/* RIGHT PANE (7 cols): Pinned Sticky Live Preview */}
                    <div className="lg:col-span-7 lg:sticky lg:top-20 space-y-4">
                        
                        <div className={`rounded-xl border shadow-xl overflow-hidden backdrop-blur-md transition-all ${
                            isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                            
                            {/* Preview Window Header Bar */}
                            <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 ${
                                isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                            }`}>
                                {/* Mock Platform Tabs */}
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('github')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                            previewMode === 'github'
                                                ? isDarkMode ? 'bg-zinc-950 text-white border border-zinc-800 shadow-sm' : 'bg-white text-zinc-900 border border-zinc-300 shadow-sm'
                                                : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        <Github className="w-3.5 h-3.5" />
                                        <span>README.md</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('discord')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                            previewMode === 'discord'
                                                ? isDarkMode ? 'bg-zinc-950 text-white border border-zinc-800 shadow-sm' : 'bg-white text-zinc-900 border border-zinc-300 shadow-sm'
                                                : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Discord Bio</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('canvas')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                            previewMode === 'canvas'
                                                ? isDarkMode ? 'bg-zinc-950 text-white border border-zinc-800 shadow-sm' : 'bg-white text-zinc-900 border border-zinc-300 shadow-sm'
                                                : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        <Monitor className="w-3.5 h-3.5" />
                                        <span>Canvas</span>
                                    </button>
                                </div>

                                {/* Canvas Background Switcher */}
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] uppercase font-semibold text-zinc-500 mr-1">
                                        Backdrop:
                                    </span>
                                    {(['dark', 'light', 'dimmed', 'transparent'] as const).map(theme => (
                                        <button
                                            key={theme}
                                            type="button"
                                            onClick={() => setCanvasTheme(theme)}
                                            className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all border ${
                                                canvasTheme === theme
                                                    ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold'
                                                    : isDarkMode
                                                        ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                                        : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-100'
                                            }`}
                                        >
                                            {theme}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* PREVIEW CONTAINER BODY */}
                            <div className={`p-6 flex items-center justify-center min-h-[300px] overflow-auto transition-colors ${getCanvasBgClass()}`}>
                                
                                {previewMode === 'github' && (
                                    <div className="w-full max-w-xl flex justify-center">
                                        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }} className="w-full">
                                            <ReadmePreviewFrame
                                                svgUrl={svgUrl}
                                                width={width}
                                                height={height}
                                                isDarkMode={canvasTheme === 'dark' || canvasTheme === 'dimmed'}
                                            />
                                        </div>
                                    </div>
                                )}

                                {previewMode === 'discord' && (
                                    <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#111214] shadow-xl p-4 text-zinc-300">
                                        <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 mb-4">
                                            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shadow">
                                                DEV
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white">Developer #0001</div>
                                                <div className="text-[11px] text-zinc-400 font-medium">About Me</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center py-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={svgUrl}
                                                alt="TextFX Preview"
                                                key={svgUrl}
                                                className="max-w-full h-auto rounded"
                                                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {previewMode === 'canvas' && (
                                    <div className="p-4 flex items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={svgUrl}
                                            alt="TextFX Preview"
                                            key={svgUrl}
                                            className="max-w-full h-auto drop-shadow-lg"
                                            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Preview Window Footer Quick Actions */}
                            <div className={`px-4 py-3 border-t flex flex-wrap items-center justify-between gap-3 ${
                                isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                            }`}>
                                {/* Zoom Controls */}
                                <div className="flex items-center gap-1 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setZoom(Math.max(50, zoom - 25))}
                                        className={`px-2 py-0.5 rounded border text-xs ${isDarkMode ? 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white' : 'border-zinc-300 bg-white text-zinc-700'}`}
                                    >
                                        -
                                    </button>
                                    <span className="font-mono text-[11px] px-1 text-zinc-400">{zoom}%</span>
                                    <button
                                        type="button"
                                        onClick={() => setZoom(Math.min(175, zoom + 25))}
                                        className={`px-2 py-0.5 rounded border text-xs ${isDarkMode ? 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white' : 'border-zinc-300 bg-white text-zinc-700'}`}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* 1-Click Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`, 'quick-md', 'Markdown')}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-950 font-semibold text-xs shadow-sm hover:bg-white transition-all active:scale-95"
                                    >
                                        {copiedKey === 'quick-md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedKey === 'quick-md' ? 'Copied' : 'Copy Markdown'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all active:scale-95 ${
                                            isDarkMode
                                                ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                                                : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 shadow-sm'
                                        }`}
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Direct SVG URL Banner */}
                        <div className={`px-3.5 py-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                            isDarkMode ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'
                        }`}>
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="font-mono text-zinc-400 font-semibold">API:</span>
                                <span className="font-mono text-[11px] truncate text-zinc-400">{svgUrl}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleCopy(absoluteSvgUrl, 'api-url', 'API URL')}
                                className="flex-shrink-0 text-zinc-300 hover:text-white font-medium flex items-center gap-1"
                            >
                                {copiedKey === 'api-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedKey === 'api-url' ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>

                    </div>

                </div>
            </main>

            {/* Mobile Sticky Quick Action Bar (Floating at bottom on < lg screens) */}
            <div className={`fixed inset-x-0 bottom-0 z-40 lg:hidden p-3 border-t backdrop-blur-xl flex items-center justify-between gap-2.5 transition-all ${
                isDarkMode ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/95 border-zinc-200 shadow-xl'
            }`}>
                <button
                    type="button"
                    onClick={() => setIsPreviewSheetOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold text-xs active:scale-95 transition-all shadow-sm"
                >
                    <Eye className="w-4 h-4" />
                    <span>Live Preview</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        {width}×{height}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => handleCopy(`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`, 'mobile-quick-md', 'Markdown')}
                    className="py-2.5 px-3.5 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 active:scale-95 shadow-sm transition-all"
                >
                    {copiedKey === 'mobile-quick-md' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>Markdown</span>
                </button>

                <button
                    type="button"
                    onClick={handleDownload}
                    className={`p-2.5 rounded-lg border text-xs font-medium active:scale-95 transition-all ${
                        isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white' : 'border-zinc-300 bg-white text-zinc-700'
                    }`}
                    title="Download SVG"
                >
                    <Download className="w-4 h-4" />
                </button>
            </div>

            {/* Mobile Bottom Sheet Drawer */}
            <BottomSheet
                isOpen={isPreviewSheetOpen}
                onClose={() => setIsPreviewSheetOpen(false)}
                title="Live SVG Preview"
                description={`${width} × ${height}px • ${textLines.length} ${textLines.length === 1 ? 'line' : 'lines'}`}
                isDarkMode={isDarkMode}
            >
                <div className="space-y-4 pb-4">
                    {/* View Controls in Bottom Sheet */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setPreviewMode('github')}
                                className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                                    previewMode === 'github'
                                        ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold'
                                        : isDarkMode
                                            ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                            : 'bg-white border-zinc-300 text-zinc-600'
                                }`}
                            >
                                GitHub README
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewMode('canvas')}
                                className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                                    previewMode === 'canvas'
                                        ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold'
                                        : isDarkMode
                                            ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                            : 'bg-white border-zinc-300 text-zinc-600'
                                }`}
                            >
                                Raw Canvas
                            </button>
                        </div>

                        {/* Theme toggles for canvas */}
                        <div className="flex items-center gap-1">
                            {(['dark', 'light'] as const).map(theme => (
                                <button
                                    key={theme}
                                    type="button"
                                    onClick={() => setCanvasTheme(theme)}
                                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize border ${
                                        canvasTheme === theme
                                            ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold'
                                            : isDarkMode
                                                ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                                : 'bg-white border-zinc-300 text-zinc-600'
                                    }`}
                                >
                                    {theme}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview render container in sheet */}
                    <div className={`p-4 rounded-xl border flex items-center justify-center overflow-x-auto min-h-[160px] ${getCanvasBgClass()}`}>
                        {previewMode === 'github' ? (
                            <ReadmePreviewFrame
                                svgUrl={svgUrl}
                                width={width}
                                height={height}
                                isDarkMode={canvasTheme === 'dark' || canvasTheme === 'dimmed'}
                            />
                        ) : (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={svgUrl}
                                alt="TextFX Mobile Preview"
                                key={svgUrl}
                                className="max-w-full h-auto drop-shadow-md"
                            />
                        )}
                    </div>

                    {/* Action buttons inside drawer */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => handleCopy(`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`, 'sheet-md', 'Markdown')}
                            className="w-full py-2.5 px-3 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                            {copiedKey === 'sheet-md' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            <span>Copy Markdown</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDownload}
                            className={`w-full py-2.5 px-3 rounded-lg border font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-800'
                            }`}
                        >
                            <Download className="w-4 h-4" />
                            <span>Download SVG</span>
                        </button>
                    </div>

                    {/* API URL row in sheet */}
                    <div className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs ${
                        isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                    }`}>
                        <span className="font-mono text-[11px] truncate flex-1">{svgUrl}</span>
                        <button
                            type="button"
                            onClick={() => handleCopy(absoluteSvgUrl, 'sheet-url', 'API URL')}
                            className="text-zinc-300 hover:text-white font-medium flex-shrink-0 flex items-center gap-1"
                        >
                            {copiedKey === 'sheet-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copy URL</span>
                        </button>
                    </div>
                </div>
            </BottomSheet>

            {/* Command Palette Modal */}
            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                onApplyPreset={applyPreset}
                onSelectAnimation={(style) => {
                    const updated = textLines.map(l => ({ ...l, animationStyle: style }));
                    setTextLines(updated);
                    showToast(`Animation set to ${style}`, 'sparkles');
                }}
                onJumpToSection={handleJumpToSection}
                onCopyMarkdown={() => handleCopy(`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`, 'cmd-md', 'Markdown')}
                onCopyHtml={() => handleCopy(`<img src="${absoluteSvgUrl}" alt="TextFX Animation" />`, 'cmd-html', 'HTML Tag')}
                onCopyUrl={() => handleCopy(absoluteSvgUrl, 'cmd-url', 'SVG URL')}
                onDownloadSvg={handleDownload}
                onShareConfig={() => handleCopy(window.location.href, 'cmd-share', 'Share URL')}
                onReset={resetToDefaults}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                isDarkMode={isDarkMode}
            />

        </div>
    );
}
