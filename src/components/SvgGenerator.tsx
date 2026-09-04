'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontCombobox } from './FontCombobox';
import { GRADIENT_PRESETS, GradientPreset } from '@/lib/gradients';
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
    color: '#000000',
    fontSize: 28,
    letterSpacing: '0.1em',
    typingSpeed: 2,
    deleteSpeed: 2,
    fontWeight: '400',
    lineHeight: 1.3,
    animationStyle: 'typewriter',
    gradient: '',
    width: 500,
    height: 100,
    backgroundColor: '#ffffff',
    backgroundGradient: '',
    backgroundGradientAngle: 90,
    hAlign: 'center' as const,
    vAlign: 'middle' as const,
    cursorChar: '|',
    cursorColor: '',
    cursorBlinkSpeed: 600,
    hideCursorOnComplete: false,
    pauseDuration: 2,
    loop: true,
    vanishBeforeNextLine: true,
};

const ANIMATION_STYLES = [
    { id: 'typewriter', label: 'Typewriter', icon: '⌨️', desc: 'Progressive character typing' },
    { id: 'fade', label: 'Fade In/Out', icon: '✨', desc: 'Smooth opacity transitions' },
    { id: 'slide-up', label: 'Slide Up', icon: '🚀', desc: 'Slide in from bottom' },
    { id: 'wave', label: 'Wave Bounce', icon: '🌊', desc: 'Dynamic sine oscillation' },
    { id: 'glitch', label: 'Cyber Glitch', icon: '⚡', desc: 'Chromatic displacement' },
];

const CURSOR_OPTIONS = [
    { label: 'Pipe (|)', value: '|' },
    { label: 'Underscore (_)', value: '_' },
    { label: 'Solid Block (█)', value: '█' },
    { label: 'Half Block (▋)', value: '▋' },
    { label: 'Slash (/)', value: '/' },
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

    // Text Lines
    const [textLines, setTextLines] = useState<TextLine[]>([
        { 
            text: 'Hello, World!', 
            font: 'Courier Prime', 
            color: '#00ff66', 
            fontSize: 28, 
            letterSpacing: '0.1em', 
            typingSpeed: 2, 
            deleteSpeed: 2, 
            fontWeight: '400', 
            lineHeight: 1.3,
            animationStyle: 'typewriter',
            gradient: ''
        },
        { 
            text: 'Animated with TextFX! 🚀✨', 
            font: 'Courier Prime', 
            color: '#00ff66', 
            fontSize: 28, 
            letterSpacing: '0.1em', 
            typingSpeed: 2, 
            deleteSpeed: 2, 
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
    const [vAlign, setVAlign] = useState<'top' | 'middle' | 'bottom'>('middle');

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

    // Copy states
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Toggle single accordion
    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Initialize from URL params if present
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if (params.has('preset')) {
            const presetId = params.get('preset');
            const found = PRESETS.find(p => p.id === presetId);
            if (found) {
                applyPreset(found);
                return;
            }
        }
    }, []);

    // Apply Preset Theme
    const applyPreset = (preset: TextFXPreset) => {
        setActivePresetId(preset.id);
        setTextLines(preset.lines.map(l => ({ ...l })));
        setWidth(preset.canvas.width);
        setHeight(preset.canvas.height);
        setBackgroundType(preset.canvas.backgroundType);
        setBackgroundColor(preset.canvas.backgroundColor);
        setBackgroundGradient(preset.canvas.backgroundGradient);
        setBackgroundGradientAngle(preset.canvas.backgroundGradientAngle);
        setHAlign(preset.canvas.hAlign);
        setVAlign(preset.canvas.vAlign);
        setCursorChar(preset.canvas.cursorChar);
        setCursorColor(preset.canvas.cursorColor);
        setCursorBlinkSpeed(preset.canvas.cursorBlinkSpeed);
        setHideCursorOnComplete(preset.canvas.hideCursorOnComplete);
        setPauseDuration(preset.canvas.pauseDuration);
        setLoop(preset.canvas.loop);
        setVanishBeforeNextLine(preset.canvas.vanishBeforeNextLine);
        showToast(`Applied preset: ${preset.name}`, preset.icon);
    };

    // Reset to initial defaults
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
                text: 'Animated with TextFX! 🚀✨',
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
        setVAlign('middle');
        setCursorChar('|');
        setCursorColor('#00ff66');
        setCursorBlinkSpeed(600);
        setHideCursorOnComplete(false);
        setPauseDuration(2);
        setLoop(true);
        setVanishBeforeNextLine(true);
        showToast('Reset to default configuration', '🔄');
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

    const updateTextLine = (index: number, field: keyof TextLine, value: any) => {
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
            const minimal: Record<string, any> = { text: line.text };
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
        showToast(`Copied ${label} to clipboard!`, '📋');
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
            showToast('Downloaded textfx-animated.svg', '💾');
        } catch {
            showToast('Failed to download SVG', '⚠️');
        }
    };

    // Canvas background style helper
    const getCanvasBgClass = () => {
        switch (canvasTheme) {
            case 'light': return 'bg-white text-gray-900 border-gray-200';
            case 'dimmed': return 'bg-[#161b22] text-[#c9d1d9] border-[#30363d]';
            case 'transparent': return 'bg-checkered text-white border-gray-700/50';
            case 'dark':
            default:
                return 'bg-[#0d1117] text-[#c9d1d9] border-[#30363d]';
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#090d13] text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            
            {/* Top Navigation Bar */}
            <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
                isDarkMode ? 'bg-[#0d1117]/80 border-gray-800' : 'bg-white/80 border-gray-200'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 font-mono font-bold text-white text-lg">
                            ⚡
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                                    TextFX
                                </h1>
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                                    Studio v2.0
                                </span>
                            </div>
                            <p className="text-[11px] text-gray-400">
                                Dynamic Animated SVGs for GitHub READMEs & Profiles
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => handleCopy(window.location.href, 'share', 'Shareable URL')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                isDarkMode 
                                    ? 'bg-gray-800/80 border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white' 
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                            }`}
                        >
                            <span>🔗</span>
                            <span>Share Config</span>
                        </button>

                        <button
                            type="button"
                            onClick={resetToDefaults}
                            className={`p-2 rounded-lg border text-xs transition-colors ${
                                isDarkMode ? 'border-gray-800 bg-gray-800/60 text-gray-300 hover:text-white' : 'border-gray-200 bg-white text-gray-600 hover:text-gray-900'
                            }`}
                            title="Reset all settings to default"
                        >
                            🔄
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-lg border text-xs transition-colors ${
                                isDarkMode ? 'border-gray-800 bg-gray-800/60 text-amber-400 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                            }`}
                            title="Toggle Light/Dark App Theme"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Starter Presets Banner */}
            <div className={`border-b ${isDarkMode ? 'bg-[#0b0f17] border-gray-800/80' : 'bg-gray-100/70 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap mr-1">
                        Presets:
                    </span>
                    {PRESETS.map(preset => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                                activePresetId === preset.id
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-500/30'
                                    : isDarkMode
                                        ? 'bg-gray-800/80 border-gray-700/80 text-gray-300 hover:bg-gray-700 hover:text-white'
                                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                            }`}
                        >
                            <span>{preset.icon}</span>
                            <span>{preset.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Split-Screen Studio Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT PANE (5 cols): Scrollable Form Accordions */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* 1. TEXT & LINES */}
                        <AccordionSection
                            title="Text Content & Lines"
                            icon="📝"
                            badge={`${textLines.length} ${textLines.length === 1 ? 'line' : 'lines'}`}
                            isOpen={openSections.text}
                            onToggle={() => toggleSection('text')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-4">
                                {textLines.map((line, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`p-3.5 rounded-xl border space-y-3.5 transition-all ${
                                            isDarkMode ? 'border-gray-800 bg-gray-800/40' : 'border-gray-200 bg-gray-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-blue-400 font-mono">
                                                Line #{idx + 1}
                                            </span>
                                            {textLines.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTextLine(idx)}
                                                    className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded hover:bg-red-500/10 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>

                                        {/* Text Input */}
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                value={line.text}
                                                onChange={(e) => updateTextLine(idx, 'text', e.target.value)}
                                                placeholder="Type your text or emojis here..."
                                                className={`w-full rounded-lg border text-sm px-3 py-2 outline-none font-medium transition-all ${
                                                    isDarkMode 
                                                        ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                                }`}
                                            />
                                        </div>

                                        {/* Per-Line Font Picker */}
                                        <div className="space-y-1">
                                            <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Font Family
                                            </label>
                                            <FontCombobox
                                                value={line.font}
                                                onChange={(font) => updateTextLine(idx, 'font', font)}
                                                isDarkMode={isDarkMode}
                                            />
                                        </div>

                                        {/* Per-Line Animation Style & Fill */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Animation Style
                                                </label>
                                                <select
                                                    value={line.animationStyle || 'typewriter'}
                                                    onChange={(e) => updateTextLine(idx, 'animationStyle', e.target.value)}
                                                    className={`w-full rounded-lg border text-xs px-2.5 py-2 outline-none ${
                                                        isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                                                    }`}
                                                >
                                                    {ANIMATION_STYLES.map(s => (
                                                        <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Gradient Fill
                                                </label>
                                                <select
                                                    value={line.gradient || ''}
                                                    onChange={(e) => updateTextLine(idx, 'gradient', e.target.value)}
                                                    className={`w-full rounded-lg border text-xs px-2.5 py-2 outline-none ${
                                                        isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                                                    }`}
                                                >
                                                    <option value="">Solid Color (Below)</option>
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
                                                value={line.typingSpeed}
                                                onChange={(v) => updateTextLine(idx, 'typingSpeed', v)}
                                                min={0.5}
                                                max={6}
                                                step={0.5}
                                                unit="s"
                                                isDarkMode={isDarkMode}
                                            />
                                            <RangeSlider
                                                label="Delete Speed"
                                                value={line.deleteSpeed}
                                                onChange={(v) => updateTextLine(idx, 'deleteSpeed', v)}
                                                min={0.5}
                                                max={6}
                                                step={0.5}
                                                unit="s"
                                                isDarkMode={isDarkMode}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addTextLine}
                                    className={`w-full py-2.5 rounded-xl border border-dashed text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                        isDarkMode
                                            ? 'border-gray-700 text-blue-400 hover:border-blue-500 hover:bg-blue-500/5'
                                            : 'border-gray-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50'
                                    }`}
                                >
                                    <span>➕</span>
                                    <span>Add Another Line</span>
                                </button>
                            </div>
                        </AccordionSection>

                        {/* 2. TYPOGRAPHY & LETTERING */}
                        <AccordionSection
                            title="Typography & Lettering"
                            icon="🔤"
                            isOpen={openSections.typography}
                            onToggle={() => toggleSection('typography')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Font Weight
                                        </label>
                                        <select
                                            value={textLines[0]?.fontWeight || '400'}
                                            onChange={(e) => {
                                                const updated = textLines.map(l => ({ ...l, fontWeight: e.target.value }));
                                                setTextLines(updated);
                                            }}
                                            className={`w-full rounded-lg border text-xs px-3 py-2 outline-none ${
                                                isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
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
                                        <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Letter Spacing
                                        </label>
                                        <select
                                            value={textLines[0]?.letterSpacing || '0.1em'}
                                            onChange={(e) => {
                                                const updated = textLines.map(l => ({ ...l, letterSpacing: e.target.value }));
                                                setTextLines(updated);
                                            }}
                                            className={`w-full rounded-lg border text-xs px-3 py-2 outline-none ${
                                                isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
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
                            title="Animation & Cursor Suite"
                            icon="✨"
                            isOpen={openSections.animation}
                            onToggle={() => toggleSection('animation')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Cursor Style
                                        </label>
                                        <select
                                            value={cursorChar}
                                            onChange={(e) => setCursorChar(e.target.value)}
                                            className={`w-full rounded-lg border text-xs px-3 py-2 outline-none ${
                                                isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
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

                                <div className="pt-2 border-t border-gray-800 space-y-3">
                                    <SwitchToggle
                                        label="Infinite Loop"
                                        description="Continuously loop the animation indefinitely"
                                        checked={loop}
                                        onChange={setLoop}
                                        isDarkMode={isDarkMode}
                                    />
                                    <SwitchToggle
                                        label="Vanish Before Next Line"
                                        description="Delete or fade out previous text before typing next line"
                                        checked={vanishBeforeNextLine}
                                        onChange={setVanishBeforeNextLine}
                                        isDarkMode={isDarkMode}
                                    />
                                    <SwitchToggle
                                        label="Auto-Hide Cursor"
                                        description="Hide the cursor once the final animation completes"
                                        checked={hideCursorOnComplete}
                                        onChange={setHideCursorOnComplete}
                                        isDarkMode={isDarkMode}
                                    />
                                </div>
                            </div>
                        </AccordionSection>

                        {/* 4. CANVAS BACKGROUND & GRADIENTS */}
                        <AccordionSection
                            title="Canvas Background & Gradients"
                            icon="🎨"
                            isOpen={openSections.colors}
                            onToggle={() => toggleSection('colors')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Background Type
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['transparent', 'solid', 'gradient'] as const).map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setBackgroundType(type)}
                                                className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-all ${
                                                    backgroundType === type
                                                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                                        : isDarkMode
                                                            ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
                                            <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Background Gradient Preset
                                            </label>
                                            <select
                                                value={backgroundGradient}
                                                onChange={(e) => setBackgroundGradient(e.target.value)}
                                                className={`w-full rounded-lg border text-xs px-3 py-2 outline-none ${
                                                    isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                            >
                                                <option value="">Select Gradient Preset...</option>
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
                            title="Dimensions & Alignment"
                            icon="📐"
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
                                        <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Horizontal Align
                                        </label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {(['left', 'center', 'right'] as const).map(align => (
                                                <button
                                                    key={align}
                                                    type="button"
                                                    onClick={() => setHAlign(align)}
                                                    className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                                                        hAlign === align
                                                            ? 'bg-blue-600 text-white border-blue-500'
                                                            : isDarkMode
                                                                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {align}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className={`block text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Vertical Align
                                        </label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {(['top', 'middle', 'bottom'] as const).map(align => (
                                                <button
                                                    key={align}
                                                    type="button"
                                                    onClick={() => setVAlign(align)}
                                                    className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                                                        vAlign === align
                                                            ? 'bg-blue-600 text-white border-blue-500'
                                                            : isDarkMode
                                                                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
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
                            title="Export & Embed Snippets"
                            icon="🚀"
                            isOpen={openSections.export}
                            onToggle={() => toggleSection('export')}
                            isDarkMode={isDarkMode}
                        >
                            <div className="space-y-3.5">
                                {/* Markdown */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-400">GitHub README (Markdown)</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`, 'md', 'Markdown Snippet')}
                                            className="text-blue-400 hover:text-blue-300 font-medium"
                                        >
                                            {copiedKey === 'md' ? '✓ Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-lg font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-800'
                                    }`}>
                                        {`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`}
                                    </div>
                                </div>

                                {/* HTML <img> */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-400">HTML &lt;img&gt; Tag</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(`<img src="${absoluteSvgUrl}" alt="TextFX Animation" />`, 'html', 'HTML Tag')}
                                            className="text-blue-400 hover:text-blue-300 font-medium"
                                        >
                                            {copiedKey === 'html' ? '✓ Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-lg font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-800'
                                    }`}>
                                        {`<img src="${absoluteSvgUrl}" alt="TextFX Animation" />`}
                                    </div>
                                </div>

                                {/* Direct SVG URL */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-400">Direct SVG URL</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(absoluteSvgUrl, 'url', 'Direct SVG URL')}
                                            className="text-blue-400 hover:text-blue-300 font-medium"
                                        >
                                            {copiedKey === 'url' ? '✓ Copied' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-lg font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-800'
                                    }`}>
                                        {absoluteSvgUrl}
                                    </div>
                                </div>
                            </div>
                        </AccordionSection>

                    </div>

                    {/* RIGHT PANE (7 cols): Pinned Sticky Live Preview */}
                    <div className="lg:col-span-7 lg:sticky lg:top-20 space-y-4">
                        
                        <div className={`rounded-2xl border shadow-xl overflow-hidden backdrop-blur-md transition-all ${
                            isDarkMode ? 'bg-[#0d1117]/90 border-[#30363d]' : 'bg-white border-gray-200'
                        }`}>
                            
                            {/* Preview Window Header Bar */}
                            <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
                                isDarkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-50 border-gray-200'
                            }`}>
                                {/* Mock Platform Tabs */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('github')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            previewMode === 'github'
                                                ? isDarkMode ? 'bg-[#0d1117] text-white border border-[#30363d] shadow-sm' : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                                                : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                    >
                                        <span>🐙</span>
                                        <span>GitHub README</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('discord')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            previewMode === 'discord'
                                                ? isDarkMode ? 'bg-[#0d1117] text-white border border-[#30363d] shadow-sm' : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                                                : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                    >
                                        <span>💬</span>
                                        <span>Discord Bio</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode('canvas')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                            previewMode === 'canvas'
                                                ? isDarkMode ? 'bg-[#0d1117] text-white border border-[#30363d] shadow-sm' : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                                                : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                    >
                                        <span>🖼️</span>
                                        <span>Canvas</span>
                                    </button>
                                </div>

                                {/* Canvas Background / Contrast Switcher */}
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] uppercase font-semibold text-gray-400 mr-1">
                                        Canvas:
                                    </span>
                                    {(['dark', 'light', 'dimmed', 'transparent'] as const).map(theme => (
                                        <button
                                            key={theme}
                                            type="button"
                                            onClick={() => setCanvasTheme(theme)}
                                            className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all border ${
                                                canvasTheme === theme
                                                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                                    : isDarkMode
                                                        ? 'bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {theme}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* PREVIEW CONTAINER BODY */}
                            <div className={`p-6 flex items-center justify-center min-h-[320px] overflow-auto transition-colors ${getCanvasBgClass()}`}>
                                
                                {previewMode === 'github' && (
                                    <div className="w-full max-w-xl rounded-xl border border-gray-700/60 bg-[#0d1117]/80 shadow-2xl overflow-hidden">
                                        {/* GitHub File Header */}
                                        <div className="px-4 py-2 bg-[#161b22] border-b border-gray-700/60 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                                                    <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688Z" />
                                                </svg>
                                                <span className="text-xs font-semibold text-gray-200 font-mono">README.md</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
                                                <span>main</span>
                                            </div>
                                        </div>
                                        {/* GitHub Readme Content */}
                                        <div className="p-6 flex flex-col items-center justify-center">
                                            {/* Live SVG image */}
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={svgUrl}
                                                alt="TextFX Preview"
                                                key={svgUrl}
                                                className="max-w-full h-auto drop-shadow-md rounded-lg"
                                                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {previewMode === 'discord' && (
                                    <div className="w-full max-w-md rounded-2xl border border-[#232428] bg-[#111214] shadow-2xl p-4 text-[#dbdee1]">
                                        <div className="flex items-center gap-3 border-b border-[#232428] pb-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white shadow">
                                                👤
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">Developer #0001</div>
                                                <div className="text-xs text-gray-400 font-medium">About Me</div>
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
                            <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 ${
                                isDarkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-50 border-gray-200'
                            }`}>
                                {/* Zoom Controls */}
                                <div className="flex items-center gap-1.5 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setZoom(Math.max(50, zoom - 25))}
                                        className={`px-2 py-1 rounded border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-white text-gray-700'}`}
                                    >
                                        -
                                    </button>
                                    <span className="font-mono text-[11px] px-1 text-gray-400">{zoom}%</span>
                                    <button
                                        type="button"
                                        onClick={() => setZoom(Math.min(175, zoom + 25))}
                                        className={`px-2 py-1 rounded border ${isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-gray-200 bg-white text-gray-700'}`}
                                    >
                                        +
                                    </button>
                                </div>

                                {/* 1-Click Quick Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`, 'quick-md', 'Markdown')}
                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
                                    >
                                        <span>📋</span>
                                        <span>{copiedKey === 'quick-md' ? 'Copied!' : 'Copy Markdown'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDownload}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                                            isDarkMode
                                                ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white'
                                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                                        }`}
                                    >
                                        <span>💾</span>
                                        <span>Download SVG</span>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* Direct SVG URL Banner */}
                        <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                            isDarkMode ? 'bg-gray-900/60 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-600 shadow-sm'
                        }`}>
                            <div className="flex items-center gap-2 overflow-hidden">
                                <span className="font-mono text-blue-400 font-bold">API:</span>
                                <span className="font-mono text-[11px] truncate">{svgUrl}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleCopy(absoluteSvgUrl, 'api-url', 'API URL')}
                                className="flex-shrink-0 text-blue-400 hover:text-blue-300 font-medium"
                            >
                                {copiedKey === 'api-url' ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>

                    </div>

                </div>
            </main>

        </div>
    );
}
