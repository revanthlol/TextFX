'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
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
    Eye,
    BookOpen,
    FileJson,
    Upload,
    ExternalLink,
    Code2
} from 'lucide-react';
import { FontCombobox } from './FontCombobox';
import { AnimatedLogo } from './AnimatedLogo';
import { CommandPalette } from './ui/CommandPalette';
import { BottomSheet } from './ui/BottomSheet';
import { ReadmePreviewFrame } from './ui/ReadmePreviewFrame';
import { ShareModal } from './ui/ShareModal';
import { CustomSelect, SelectOption } from './ui/CustomSelect';
import { NumberInputStepper } from './ui/NumberInputStepper';
import { exportConfigJson, importConfigJson } from '@/lib/exportUtils';
import { compressConfig, decompressConfig } from '@/lib/urlCompression';
import { GRADIENT_PRESETS } from '@/lib/gradients';
import { PRESETS, TextFXPreset } from '@/data/presets';
import { ColorPicker } from './ui/ColorPicker';
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
    { id: 'typewriter', label: 'Typewriter' },
    { id: 'fade', label: 'Fade In/Out' },
    { id: 'slide-up', label: 'Slide Up' },
    { id: 'wave', label: 'Wave' },
    { id: 'glitch', label: 'Glitch' },
];

const ANIMATION_SELECT_OPTIONS: SelectOption[] = ANIMATION_STYLES.map(a => ({
    value: a.id,
    label: a.label,
}));

const TEXT_GRADIENT_SELECT_OPTIONS: SelectOption[] = [
    { value: '', label: 'Solid Color (No Gradient)', description: 'Use custom solid text color' },
    ...GRADIENT_PRESETS.map(g => ({
        value: g.id,
        label: g.name,
        gradientCss: `linear-gradient(${g.angle || 90}deg, ${g.from}, ${g.to})`,
    }))
];

const BG_GRADIENT_SELECT_OPTIONS: SelectOption[] = [
    { value: '', label: 'Select Gradient...', description: 'Choose a background preset' },
    ...GRADIENT_PRESETS.map(g => ({
        value: g.id,
        label: g.name,
        gradientCss: `linear-gradient(${g.angle || 90}deg, ${g.from}, ${g.to})`,
    }))
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

    // Sync theme with localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('textfx_theme');
            if (saved === 'light') {
                setIsDarkMode(false);
            } else {
                setIsDarkMode(true);
            }
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('textfx_theme', next ? 'dark' : 'light');
            }
            return next;
        });
    }, []);

    // Accordion states
    const [openSections, setOpenSections] = useState({
        text: true,
        typography: false,
        animation: false,
        colors: false,
        canvas: false,
    });

    // Preview state
    const [previewMode, setPreviewMode] = useState<'github' | 'discord' | 'canvas'>('github');
    const [isCanvasTransparent, setIsCanvasTransparent] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isPreviewSheetOpen, setIsPreviewSheetOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Canvas Settings
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(100);
    const [backgroundType, setBackgroundType] = useState<'transparent' | 'solid' | 'gradient'>('transparent');
    const [backgroundColor, setBackgroundColor] = useState('#0d1117');
    const [backgroundGradient, setBackgroundGradient] = useState('');
    const [backgroundGradientAngle, setBackgroundGradientAngle] = useState(90);
    const [hAlign, setHAlign] = useState<'left' | 'center' | 'right'>('center');
    const [vAlign, setVAlign] = useState<'top' | 'center' | 'bottom'>('center');

    // Cursor & Timing
    const [cursorChar, setCursorChar] = useState('|');
    const [cursorColor, setCursorColor] = useState('#00ff66');
    const [cursorBlinkSpeed, setCursorBlinkSpeed] = useState(600);
    const [hideCursorOnComplete, setHideCursorOnComplete] = useState(false);
    const [pauseDuration, setPauseDuration] = useState(2);
    const [loop, setLoop] = useState(true);
    const [vanishBeforeNextLine, setVanishBeforeNextLine] = useState(true);

    // Active Preset ID
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
        if (section in openSections) {
            setOpenSections(prev => ({ ...prev, [section]: true }));
        }
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

    // Initialize from URL params (supports ?c=... compressed configs and legacy params)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if ([...params.keys()].length === 0) return;

        // 1. Check compressed config ?c=...
        if (params.has('c')) {
            const decompressed = decompressConfig<Record<string, unknown>>(params.get('c')!);
            if (decompressed && typeof decompressed === 'object') {
                if (decompressed.lines && Array.isArray(decompressed.lines)) {
                    const parsed = decompressed.lines.map((item: Partial<TextLine>) => ({
                        text: typeof item.text === 'string' ? item.text : String(item || ''),
                        font: item.font || DEFAULT_VALUES.font,
                        color: item.color || DEFAULT_VALUES.color,
                        fontSize: typeof item.fontSize === 'number' ? item.fontSize : DEFAULT_VALUES.fontSize,
                        letterSpacing: item.letterSpacing || DEFAULT_VALUES.letterSpacing,
                        typingSpeed: typeof item.typingSpeed === 'number' ? item.typingSpeed : DEFAULT_VALUES.typingSpeed,
                        deleteSpeed: typeof item.deleteSpeed === 'number' ? item.deleteSpeed : DEFAULT_VALUES.deleteSpeed,
                        fontWeight: item.fontWeight || DEFAULT_VALUES.fontWeight,
                        lineHeight: typeof item.lineHeight === 'number' ? item.lineHeight : DEFAULT_VALUES.lineHeight,
                        animationStyle: item.animationStyle || DEFAULT_VALUES.animationStyle,
                        gradient: item.gradient || DEFAULT_VALUES.gradient,
                    }));
                    setTextLines(parsed);
                }
                if (decompressed.width) setWidth(Number(decompressed.width));
                if (decompressed.height) setHeight(Number(decompressed.height));
                if (decompressed.backgroundType && (decompressed.backgroundType === 'transparent' || decompressed.backgroundType === 'solid' || decompressed.backgroundType === 'gradient')) {
                    setBackgroundType(decompressed.backgroundType);
                }
                if (decompressed.backgroundColor) setBackgroundColor(String(decompressed.backgroundColor));
                if (decompressed.backgroundGradient) setBackgroundGradient(String(decompressed.backgroundGradient));
                if (decompressed.backgroundGradientAngle) setBackgroundGradientAngle(Number(decompressed.backgroundGradientAngle));
                if (decompressed.hAlign && (decompressed.hAlign === 'left' || decompressed.hAlign === 'center' || decompressed.hAlign === 'right')) {
                    setHAlign(decompressed.hAlign);
                }
                if (decompressed.vAlign && (decompressed.vAlign === 'top' || decompressed.vAlign === 'center' || decompressed.vAlign === 'bottom')) {
                    setVAlign(decompressed.vAlign);
                }
                if (decompressed.cursorChar !== undefined) setCursorChar(String(decompressed.cursorChar));
                if (decompressed.cursorColor !== undefined) setCursorColor(String(decompressed.cursorColor));
                if (decompressed.cursorBlinkSpeed) setCursorBlinkSpeed(Number(decompressed.cursorBlinkSpeed));
                if (decompressed.hideCursorOnComplete !== undefined) setHideCursorOnComplete(Boolean(decompressed.hideCursorOnComplete));
                if (decompressed.pauseDuration) setPauseDuration(Number(decompressed.pauseDuration));
                if (decompressed.loop !== undefined) setLoop(Boolean(decompressed.loop));
                if (decompressed.vanishBeforeNextLine !== undefined) setVanishBeforeNextLine(Boolean(decompressed.vanishBeforeNextLine));
                return;
            }
        }

        // 2. Check preset
        if (params.has('preset')) {
            const presetId = params.get('preset');
            const found = PRESETS.find(p => p.id === presetId);
            if (found) {
                applyPreset(found);
                return;
            }
        }

        // 3. Check legacy / docs uncompressed params
        const sharedFont = params.get('font') || DEFAULT_VALUES.font;
        let sharedColor = params.get('color') || DEFAULT_VALUES.color;
        if (sharedColor && !sharedColor.startsWith('#') && /^[0-9a-fA-F]{3,8}$/.test(sharedColor)) {
            sharedColor = `#${sharedColor}`;
        }
        const sharedFontSize = params.has('size')
            ? parseInt(params.get('size')!, 10)
            : params.has('fontSize')
            ? parseInt(params.get('fontSize')!, 10)
            : DEFAULT_VALUES.fontSize;
        const sharedLetterSpacing = params.get('letterSpacing') || DEFAULT_VALUES.letterSpacing;
        const sharedTypingSpeed = params.has('speed')
            ? parseFloat(params.get('speed')!)
            : params.has('typingSpeed')
            ? parseFloat(params.get('typingSpeed')!)
            : DEFAULT_VALUES.typingSpeed;
        const sharedDeleteSpeed = params.has('deleteSpeed') ? parseFloat(params.get('deleteSpeed')!) : DEFAULT_VALUES.deleteSpeed;
        const sharedFontWeight = params.get('weight') || params.get('fontWeight') || DEFAULT_VALUES.fontWeight;
        const sharedLineHeight = params.has('lineHeight') ? parseFloat(params.get('lineHeight')!) : DEFAULT_VALUES.lineHeight;
        const sharedAnimationStyle = params.get('animationStyle') || DEFAULT_VALUES.animationStyle;
        const sharedGradient = params.get('gradient') || DEFAULT_VALUES.gradient;

        if (params.has('lines')) {
            const rawLinesStr = params.get('lines')!;
            let parsedLines: Partial<TextLine>[] = [];
            try {
                const jsonParsed = JSON.parse(rawLinesStr);
                if (Array.isArray(jsonParsed) && jsonParsed.length > 0) {
                    parsedLines = jsonParsed;
                }
            } catch {
                // Semicolon-separated format from docs & API: "Line 1;Line 2;Line 3"
                parsedLines = rawLinesStr.split(';').map(t => ({ text: t.trim() })).filter(l => l.text);
            }

            if (parsedLines.length > 0) {
                const mapped = parsedLines.map((item: Partial<TextLine>) => ({
                    text: typeof item.text === 'string' ? item.text : String(item || ''),
                    font: item.font || sharedFont,
                    color: item.color || sharedColor,
                    fontSize: typeof item.fontSize === 'number' ? item.fontSize : sharedFontSize,
                    letterSpacing: item.letterSpacing || sharedLetterSpacing,
                    typingSpeed: typeof item.typingSpeed === 'number' ? item.typingSpeed : sharedTypingSpeed,
                    deleteSpeed: typeof item.deleteSpeed === 'number' ? item.deleteSpeed : sharedDeleteSpeed,
                    fontWeight: item.fontWeight || sharedFontWeight,
                    lineHeight: typeof item.lineHeight === 'number' ? item.lineHeight : sharedLineHeight,
                    animationStyle: item.animationStyle || sharedAnimationStyle,
                    gradient: item.gradient || sharedGradient,
                }));
                setTextLines(mapped);
            }
        }

        if (params.has('width')) setWidth(parseInt(params.get('width')!, 10));
        if (params.has('height')) setHeight(parseInt(params.get('height')!, 10));
        
        const bgParam = params.get('background') || params.get('backgroundColor');
        if (params.has('backgroundType')) {
            const bt = params.get('backgroundType');
            if (bt === 'transparent' || bt === 'solid' || bt === 'gradient') setBackgroundType(bt);
        } else if (params.has('backgroundGradient')) {
            setBackgroundType('gradient');
        } else if (bgParam === 'transparent') {
            setBackgroundType('transparent');
        } else if (bgParam) {
            setBackgroundType('solid');
            setBackgroundColor(bgParam.startsWith('#') || !/^[0-9a-fA-F]{3,8}$/.test(bgParam) ? bgParam : `#${bgParam}`);
        }

        if (params.has('backgroundGradient')) setBackgroundGradient(params.get('backgroundGradient')!);
        if (params.has('backgroundGradientAngle')) setBackgroundGradientAngle(parseInt(params.get('backgroundGradientAngle')!, 10));
        
        if (params.has('hAlign')) {
            const val = params.get('hAlign');
            if (val === 'left' || val === 'center' || val === 'right') setHAlign(val);
        }
        if (params.has('vAlign')) {
            const val = params.get('vAlign');
            if (val === 'top' || val === 'center' || val === 'bottom') setVAlign(val);
        }
        const cursorParam = params.get('cursor') || params.get('cursorChar');
        if (cursorParam !== null) setCursorChar(cursorParam);
        if (params.has('cursorColor')) setCursorColor(params.get('cursorColor')!);
        if (params.has('cursorBlinkSpeed')) setCursorBlinkSpeed(parseFloat(params.get('cursorBlinkSpeed')!));
        if (params.has('hideCursorOnComplete')) setHideCursorOnComplete(params.get('hideCursorOnComplete') === 'true');
        if (params.has('pauseDuration')) setPauseDuration(parseFloat(params.get('pauseDuration')!));
        if (params.has('loop')) setLoop(params.get('loop') === 'true');
        if (params.has('vanishBeforeNextLine')) setVanishBeforeNextLine(params.get('vanishBeforeNextLine') === 'true');
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

    // Compute Ultra-Short Compressed Query Param (?c=...)
    const compressedParam = useMemo(() => {
        if (textLines.length === 0) return '';

        const minimalConfig: Record<string, unknown> = {
            lines: textLines.map(line => {
                const item: Record<string, unknown> = { text: line.text };
                if (line.font !== DEFAULT_VALUES.font) item.font = line.font;
                if (line.color !== DEFAULT_VALUES.color) item.color = line.color;
                if (line.fontSize !== DEFAULT_VALUES.fontSize) item.fontSize = line.fontSize;
                if (line.letterSpacing !== DEFAULT_VALUES.letterSpacing) item.letterSpacing = line.letterSpacing;
                if (line.typingSpeed !== DEFAULT_VALUES.typingSpeed) item.typingSpeed = line.typingSpeed;
                if (line.deleteSpeed !== DEFAULT_VALUES.deleteSpeed) item.deleteSpeed = line.deleteSpeed;
                if (line.fontWeight !== DEFAULT_VALUES.fontWeight) item.fontWeight = line.fontWeight;
                if (line.lineHeight !== DEFAULT_VALUES.lineHeight) item.lineHeight = line.lineHeight;
                if (line.animationStyle !== DEFAULT_VALUES.animationStyle) item.animationStyle = line.animationStyle;
                if (line.gradient !== DEFAULT_VALUES.gradient) item.gradient = line.gradient;
                return item;
            }),
        };

        if (width !== DEFAULT_VALUES.width) minimalConfig.width = width;
        if (height !== DEFAULT_VALUES.height) minimalConfig.height = height;

        if (backgroundType !== 'transparent') {
            minimalConfig.backgroundType = backgroundType;
            if (backgroundType === 'solid') minimalConfig.backgroundColor = backgroundColor;
            if (backgroundType === 'gradient') {
                minimalConfig.backgroundGradient = backgroundGradient;
                if (backgroundGradientAngle !== 90) minimalConfig.backgroundGradientAngle = backgroundGradientAngle;
            }
        }

        if (hAlign !== DEFAULT_VALUES.hAlign) minimalConfig.hAlign = hAlign;
        if (vAlign !== DEFAULT_VALUES.vAlign) minimalConfig.vAlign = vAlign;

        if (cursorChar !== DEFAULT_VALUES.cursorChar) minimalConfig.cursorChar = cursorChar;
        if (cursorColor && cursorColor !== DEFAULT_VALUES.cursorColor) minimalConfig.cursorColor = cursorColor;
        if (cursorBlinkSpeed !== DEFAULT_VALUES.cursorBlinkSpeed) minimalConfig.cursorBlinkSpeed = cursorBlinkSpeed;
        if (hideCursorOnComplete) minimalConfig.hideCursorOnComplete = true;

        if (pauseDuration !== DEFAULT_VALUES.pauseDuration) minimalConfig.pauseDuration = pauseDuration;
        if (!loop) minimalConfig.loop = false;
        if (!vanishBeforeNextLine) minimalConfig.vanishBeforeNextLine = false;

        return compressConfig(minimalConfig);
    }, [
        textLines, width, height, backgroundType, backgroundColor,
        backgroundGradient, backgroundGradientAngle, hAlign, vAlign,
        cursorChar, cursorColor, cursorBlinkSpeed, hideCursorOnComplete,
        pauseDuration, loop, vanishBeforeNextLine
    ]);

    // Live Clean URLs
    const svgUrl = useMemo(() => {
        return `/api/svg?c=${compressedParam}`;
    }, [compressedParam]);

    const absoluteSvgUrl = useMemo(() => {
        if (typeof window === 'undefined') return svgUrl;
        return `${window.location.origin}${svgUrl}`;
    }, [svgUrl]);

    // Clean Studio Share URL
    const studioShareUrl = useMemo(() => {
        if (typeof window === 'undefined') return svgUrl;
        return `${window.location.origin}/?c=${compressedParam}`;
    }, [compressedParam, svgUrl]);

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
        if (isCanvasTransparent) return 'bg-checkered text-white border-zinc-800';
        return isDarkMode 
            ? 'bg-[#0d1117] text-[#c9d1d9] border-[#30363d]' 
            : 'bg-[#f6f8fa] text-zinc-900 border-zinc-200';
    };

    // Export JSON configuration file
    const handleExportJson = () => {
        const config = {
            version: '1.0',
            textLines,
            canvas: {
                width,
                height,
                backgroundType,
                backgroundColor,
                backgroundGradient,
                backgroundGradientAngle,
                hAlign,
                vAlign,
                cursorChar,
                cursorColor,
                cursorBlinkSpeed,
                hideCursorOnComplete,
                pauseDuration,
                loop,
                vanishBeforeNextLine
            }
        };
        exportConfigJson(config, 'textfx-config.json');
        showToast('Exported configuration JSON', 'check');
    };

    // Import JSON configuration file
    const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await importConfigJson(file);
            if (data.textLines && Array.isArray(data.textLines)) {
                setTextLines(data.textLines as TextLine[]);
            }
            if (data.canvas && typeof data.canvas === 'object') {
                const c = data.canvas as Record<string, unknown>;
                if (c.width) setWidth(Number(c.width));
                if (c.height) setHeight(Number(c.height));
                if (c.backgroundType && (c.backgroundType === 'transparent' || c.backgroundType === 'solid' || c.backgroundType === 'gradient')) {
                    setBackgroundType(c.backgroundType);
                }
                if (c.backgroundColor) setBackgroundColor(String(c.backgroundColor));
                if (c.backgroundGradient) setBackgroundGradient(String(c.backgroundGradient));
                if (c.backgroundGradientAngle) setBackgroundGradientAngle(Number(c.backgroundGradientAngle));
                if (c.hAlign && (c.hAlign === 'left' || c.hAlign === 'center' || c.hAlign === 'right')) {
                    setHAlign(c.hAlign);
                }
                if (c.vAlign && (c.vAlign === 'top' || c.vAlign === 'center' || c.vAlign === 'bottom')) {
                    setVAlign(c.vAlign);
                }
                if (c.cursorChar !== undefined) setCursorChar(String(c.cursorChar));
                if (c.cursorColor !== undefined) setCursorColor(String(c.cursorColor));
                if (c.cursorBlinkSpeed) setCursorBlinkSpeed(Number(c.cursorBlinkSpeed));
                if (c.hideCursorOnComplete !== undefined) setHideCursorOnComplete(Boolean(c.hideCursorOnComplete));
                if (c.pauseDuration) setPauseDuration(Number(c.pauseDuration));
                if (c.loop !== undefined) setLoop(Boolean(c.loop));
                if (c.vanishBeforeNextLine !== undefined) setVanishBeforeNextLine(Boolean(c.vanishBeforeNextLine));
            }
            setActivePresetId(null);
            showToast('Loaded configuration successfully!', 'sparkles');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Invalid JSON file';
            showToast(`Import Error: ${msg}`, 'info');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Fetch and copy Raw SVG XML text
    const handleCopyRawSvg = async () => {
        try {
            const res = await fetch(svgUrl);
            const svgText = await res.text();
            navigator.clipboard.writeText(svgText);
            setCopiedKey('raw-svg');
            showToast('Copied Raw SVG XML', 'check');
            setTimeout(() => setCopiedKey(null), 2000);
        } catch {
            showToast('Failed to fetch SVG content', 'info');
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${
            isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-zinc-50 text-zinc-900'
        }`}>
            {/* TOP NAVIGATION BAR */}
            <header className={`border-b sticky top-0 z-30 backdrop-blur-md transition-colors duration-200 h-14 ${
                isDarkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    
                    {/* Brand Logo & Tag */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2 group">
                            <AnimatedLogo />
                        </Link>
                    </div>

                    {/* Header Quick Controls */}
                    <div className="flex items-center gap-2">
                        {/* Command Palette Trigger */}
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
                            onClick={() => setIsShareModalOpen(true)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                isDarkMode 
                                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white' 
                                    : 'bg-white border-zinc-300 text-zinc-700 hover:bg-zinc-100 shadow-sm'
                            }`}
                        >
                            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden sm:inline">Share / QR</span>
                        </button>

                        <button
                            type="button"
                            onClick={resetToDefaults}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 shadow-sm'
                            }`}
                            title="Reset all settings"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>

                        <Link
                            href="/docs"
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 shadow-sm'
                            }`}
                            title="API & Embed Documentation"
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Docs</span>
                        </Link>

                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={`p-1.5 rounded-md border text-xs transition-colors ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 shadow-sm'
                            }`}
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-700" />}
                        </button>

                        <a 
                            href="https://github.com/revanthlol/TextFX" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`p-1.5 rounded-md border text-xs transition-colors ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100'
                            }`}
                            title="GitHub Repository"
                        >
                            <Github className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </header>

            {/* MAIN APP CONTAINER: Independent Scrolling Split Panes on Desktop */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden flex flex-col pb-24 lg:pb-4">

                {/* INSPIRATION PRESET THEMES CAROUSEL */}
                <div className="shrink-0 mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            Curated Theme Presets
                        </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {PRESETS.map((preset) => {
                            const isSelected = activePresetId === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 active:scale-95 ${
                                        isSelected 
                                            ? isDarkMode
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                                                : 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-sm'
                                            : isDarkMode
                                                ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800'
                                                : 'bg-white border-zinc-300 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 shadow-sm'
                                    }`}
                                >
                                    <span className={isSelected ? 'text-emerald-400' : 'text-zinc-400'}>
                                        {renderPresetIcon(preset.iconName)}
                                    </span>
                                    <span>{preset.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2-COLUMN SPLIT PANES (Independent Scroll on Desktop) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-0">
                    
                    {/* LEFT PANE (5 cols): Independently Scrollable Settings */}
                    <div className="lg:col-span-5 lg:h-full lg:overflow-y-auto pr-1 space-y-3 pb-6">
                        
                        {/* 1. TEXT CONTENT & MULTI-LINE */}
                        <AccordionSection
                            id="section-text"
                            title="Text Lines & Content"
                            icon={<Type className="w-4 h-4" />}
                            isOpen={openSections.text}
                            onToggle={() => toggleSection('text')}
                            isDarkMode={isDarkMode}
                            badge={`${textLines.length} ${textLines.length === 1 ? 'line' : 'lines'}`}
                        >
                            <div className="space-y-4">
                                {textLines.map((line, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`p-3.5 rounded-xl border space-y-3 transition-colors ${
                                            isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-mono font-semibold text-emerald-400">
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
                                                        ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' 
                                                        : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
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
                                            <CustomSelect
                                                label="Animation Style"
                                                value={line.animationStyle || 'typewriter'}
                                                options={ANIMATION_SELECT_OPTIONS}
                                                onChange={(val) => updateTextLine(idx, 'animationStyle', val)}
                                                isDarkMode={isDarkMode}
                                            />

                                            <CustomSelect
                                                label="Gradient Fill"
                                                value={line.gradient || ''}
                                                options={TEXT_GRADIENT_SELECT_OPTIONS}
                                                onChange={(val) => updateTextLine(idx, 'gradient', val)}
                                                isDarkMode={isDarkMode}
                                            />
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

                                        {/* Number Input Steppers with Quick Presets (NO SLIDERS) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                            <NumberInputStepper
                                                label="Font Size"
                                                value={line.fontSize}
                                                onChange={(v) => updateTextLine(idx, 'fontSize', v)}
                                                min={12}
                                                max={96}
                                                step={1}
                                                unit="px"
                                                presets={[16, 20, 24, 28, 36, 48]}
                                                isDarkMode={isDarkMode}
                                            />
                                            <NumberInputStepper
                                                label="Type Speed"
                                                value={Math.round(line.typingSpeed * 1000)}
                                                onChange={(v) => updateTextLine(idx, 'typingSpeed', v / 1000)}
                                                min={10}
                                                max={300}
                                                step={5}
                                                unit="ms"
                                                presets={[30, 60, 90, 120]}
                                                isDarkMode={isDarkMode}
                                            />
                                            <NumberInputStepper
                                                label="Delete Speed"
                                                value={Math.round(line.deleteSpeed * 1000)}
                                                onChange={(v) => updateTextLine(idx, 'deleteSpeed', v / 1000)}
                                                min={5}
                                                max={200}
                                                step={5}
                                                unit="ms"
                                                presets={[20, 40, 60, 80]}
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

                                    <NumberInputStepper
                                        label="Pause Duration"
                                        value={pauseDuration}
                                        onChange={setPauseDuration}
                                        min={0.5}
                                        max={10}
                                        step={0.5}
                                        unit="s"
                                        presets={[1, 1.5, 2, 3, 5]}
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

                                        <NumberInputStepper
                                            label="Cursor Blink Speed"
                                            value={cursorBlinkSpeed}
                                            onChange={setCursorBlinkSpeed}
                                            min={200}
                                            max={1500}
                                            step={50}
                                            unit="ms"
                                            presets={[300, 500, 600, 800]}
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
                                                        ? 'bg-zinc-100 text-zinc-950 border-zinc-200 shadow-sm font-semibold'
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
                                        <CustomSelect
                                            label="Gradient Preset"
                                            value={backgroundGradient}
                                            options={BG_GRADIENT_SELECT_OPTIONS}
                                            onChange={setBackgroundGradient}
                                            isDarkMode={isDarkMode}
                                        />

                                        <NumberInputStepper
                                            label="Gradient Angle"
                                            value={backgroundGradientAngle}
                                            onChange={setBackgroundGradientAngle}
                                            min={0}
                                            max={360}
                                            step={15}
                                            unit="°"
                                            presets={[0, 45, 90, 135, 180, 270]}
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
                                    <NumberInputStepper
                                        label="Canvas Width"
                                        value={width}
                                        onChange={setWidth}
                                        min={200}
                                        max={1600}
                                        step={20}
                                        unit="px"
                                        presets={[400, 500, 600, 800, 1000]}
                                        isDarkMode={isDarkMode}
                                    />
                                    <NumberInputStepper
                                        label="Canvas Height"
                                        value={height}
                                        onChange={setHeight}
                                        min={40}
                                        max={600}
                                        step={10}
                                        unit="px"
                                        presets={[60, 80, 100, 120, 150]}
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
                                                            ? 'bg-zinc-100 text-zinc-950 border-zinc-200 shadow-sm font-semibold'
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
                                                            ? 'bg-zinc-100 text-zinc-950 border-zinc-200 shadow-sm font-semibold'
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

                    </div>

                    {/* RIGHT PANE (7 cols): Independently Scrollable Live Preview & Exports */}
                    <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto pl-1 space-y-4 pb-6">
                        
                        {/* Live Preview Card */}
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
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={isCanvasTransparent}
                                            onChange={(e) => setIsCanvasTransparent(e.target.checked)}
                                            className="rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500/20 bg-zinc-900 w-3.5 h-3.5 cursor-pointer accent-emerald-500"
                                        />
                                        <span className={`text-[11px] font-medium transition-colors ${
                                            isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
                                        }`}>
                                            Transparent Canvas
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* PREVIEW CONTAINER BODY */}
                            <div className={`p-6 flex items-center justify-center min-h-[280px] overflow-auto transition-colors ${getCanvasBgClass()}`}>
                                
                                {previewMode === 'github' && (
                                    <div className="w-full max-w-xl flex justify-center">
                                        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }} className="w-full">
                                            <ReadmePreviewFrame
                                                svgUrl={svgUrl}
                                                width={width}
                                                height={height}
                                                isDarkMode={isDarkMode}
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

                                {/* 1-Click Quick Action Buttons */}
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
                                        <span>Download SVG</span>
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* EXPORTS, EMBED SNIPPETS, & DOWNLOADS (Positioned below preview pane) */}
                        <div id="section-export" className={`rounded-xl border shadow-xl p-5 space-y-4 transition-all ${
                            isDarkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                        <Code className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                                        Export & Embed Snippets
                                    </h3>
                                </div>
                                <span className="text-[11px] text-zinc-400 font-mono">
                                    Ultra-short embed tags
                                </span>
                            </div>

                            <div className="space-y-3.5">
                                {/* Markdown */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className={`font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-700'}`}>GitHub README (Markdown)</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`, 'md', 'Markdown')}
                                            className={`flex items-center gap-1 font-medium transition-colors ${
                                                isDarkMode ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'
                                            }`}
                                        >
                                            {copiedKey === 'md' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === 'md' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-md font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-900 font-medium'
                                    }`}>
                                        {`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`}
                                    </div>
                                </div>

                                {/* HTML <img> */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className={`font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-700'}`}>HTML &lt;img&gt; Tag</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(`<img src="${absoluteSvgUrl}" alt="TextFX Animation" width="${width}" height="${height}" />`, 'html', 'HTML Tag')}
                                            className={`flex items-center gap-1 font-medium transition-colors ${
                                                isDarkMode ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'
                                            }`}
                                        >
                                            {copiedKey === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === 'html' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-md font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-900 font-medium'
                                    }`}>
                                        {`<img src="${absoluteSvgUrl}" alt="TextFX Animation" width="${width}" height="${height}" />`}
                                    </div>
                                </div>

                                {/* React / Next.js JSX */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className={`font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-700'}`}>React / Next.js JSX</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(`<Image src="${absoluteSvgUrl}" alt="TextFX Animation" width={${width}} height={${height}} unoptimized />`, 'jsx', 'React JSX')}
                                            className={`flex items-center gap-1 font-medium transition-colors ${
                                                isDarkMode ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'
                                            }`}
                                        >
                                            {copiedKey === 'jsx' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === 'jsx' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-md font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-900 font-medium'
                                    }`}>
                                        {`<Image src="${absoluteSvgUrl}" alt="TextFX Animation" width={${width}} height={${height}} unoptimized />`}
                                    </div>
                                </div>

                                {/* Direct SVG URL & Raw XML */}
                                <div className={`grid grid-cols-2 gap-2 pt-2 border-t ${
                                    isDarkMode ? 'border-zinc-800/60' : 'border-zinc-200'
                                }`}>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(absoluteSvgUrl, 'url', 'Direct SVG URL')}
                                        className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                            isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100'
                                        }`}
                                    >
                                        {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />}
                                        <span className="truncate">{copiedKey === 'url' ? 'Copied URL' : 'Copy Direct URL'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleCopyRawSvg}
                                        className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                                            isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100'
                                        }`}
                                    >
                                        {copiedKey === 'raw' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Code2 className="w-3.5 h-3.5 text-zinc-400" />}
                                        <span className="truncate">{copiedKey === 'raw' ? 'Copied XML' : 'Copy Raw SVG'}</span>
                                    </button>
                                </div>

                                {/* File Downloads & Backup */}
                                <div className="space-y-2 pt-3 border-t border-zinc-800/60">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                                        Downloads & Configuration Backups
                                    </span>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDownload}
                                            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 shadow-sm'
                                            }`}
                                        >
                                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Download SVG</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleExportJson}
                                            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                                            }`}
                                        >
                                            <FileJson className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Export JSON</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                                            }`}
                                        >
                                            <Upload className="w-3.5 h-3.5 text-purple-400" />
                                            <span>Import JSON</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            {/* Mobile Sticky Quick Action Bar */}
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
                    <div className={`p-4 rounded-xl border flex items-center justify-center min-h-[220px] overflow-auto ${getCanvasBgClass()}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={svgUrl}
                            alt="TextFX Mobile Preview"
                            key={svgUrl}
                            className="max-w-full h-auto drop-shadow-md"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => handleCopy(`[![TextFX](${absoluteSvgUrl})](https://github.com/revanthlol/TextFX)`, 'sheet-md', 'Markdown')}
                            className="py-2.5 px-3 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                            {copiedKey === 'sheet-md' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copy Markdown</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDownload}
                            className={`py-2.5 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-200' : 'border-zinc-300 bg-white text-zinc-800'
                            }`}
                        >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Download SVG</span>
                        </button>
                    </div>

                    <div className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-xs font-mono ${
                        isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-300 text-zinc-600'
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

            {/* Hidden File Input for JSON Config Import */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJson}
                accept=".json,application/json"
                className="hidden"
            />

            {/* Share / QR Code Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                shareUrl={studioShareUrl}
                isDarkMode={isDarkMode}
            />

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
                onCopyHtml={() => handleCopy(`<img src="${absoluteSvgUrl}" alt="TextFX Animation" width="${width}" height="${height}" />`, 'cmd-html', 'HTML Tag')}
                onCopyUrl={() => handleCopy(absoluteSvgUrl, 'cmd-url', 'SVG URL')}
                onDownloadSvg={handleDownload}
                onExportJson={handleExportJson}
                onImportJson={() => fileInputRef.current?.click()}
                onOpenShare={() => setIsShareModalOpen(true)}
                onShareConfig={() => handleCopy(studioShareUrl, 'cmd-share', 'Share URL')}
                onReset={resetToDefaults}
                onToggleTheme={toggleTheme}
                isDarkMode={isDarkMode}
            />

        </div>
    );
}
