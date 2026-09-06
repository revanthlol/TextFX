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
    Image as ImageIcon,
    FileJson,
    Upload,
    FileCode
} from 'lucide-react';
import { FontCombobox } from './FontCombobox';
import { AnimatedLogo } from './AnimatedLogo';
import { CommandPalette } from './ui/CommandPalette';
import { BottomSheet } from './ui/BottomSheet';
import { ReadmePreviewFrame } from './ui/ReadmePreviewFrame';
import { ShareModal } from './ui/ShareModal';
import { CustomSelect, SelectOption } from './ui/CustomSelect';
import { NumberInputStepper } from './ui/NumberInputStepper';
import { downloadPngFromSvg, exportConfigJson, importConfigJson } from '@/lib/exportUtils';
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
    { id: 'typewriter', label: 'Typewriter', desc: 'Progressive typing effect' },
    { id: 'fade', label: 'Fade In/Out', desc: 'Smooth opacity pulse' },
    { id: 'slide-up', label: 'Slide Up', desc: 'Slide in from bottom' },
    { id: 'wave', label: 'Wave', desc: 'Sine wave bounce' },
    { id: 'glitch', label: 'Glitch', desc: 'Cyber chromatic jitter' },
];

const ANIMATION_SELECT_OPTIONS: SelectOption[] = ANIMATION_STYLES.map(a => ({
    value: a.id,
    label: a.label,
    description: a.desc,
    badge: a.id.toUpperCase(),
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
    const [canvasTheme, setCanvasTheme] = useState<'dark' | 'light' | 'dimmed' | 'transparent'>('dark');
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

    // Initialize from URL params if present (Full hydration from shared URLs)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        if ([...params.keys()].length === 0) return;

        if (params.has('preset')) {
            const presetId = params.get('preset');
            const found = PRESETS.find(p => p.id === presetId);
            if (found) {
                applyPreset(found);
                return;
            }
        }

        const sharedFont = params.get('font') || DEFAULT_VALUES.font;
        const sharedColor = params.get('color') || DEFAULT_VALUES.color;
        const sharedFontSize = params.has('fontSize') ? parseInt(params.get('fontSize')!, 10) : DEFAULT_VALUES.fontSize;
        const sharedLetterSpacing = params.get('letterSpacing') || DEFAULT_VALUES.letterSpacing;
        const sharedTypingSpeed = params.has('typingSpeed') ? parseFloat(params.get('typingSpeed')!) : DEFAULT_VALUES.typingSpeed;
        const sharedDeleteSpeed = params.has('deleteSpeed') ? parseFloat(params.get('deleteSpeed')!) : DEFAULT_VALUES.deleteSpeed;
        const sharedFontWeight = params.get('fontWeight') || DEFAULT_VALUES.fontWeight;
        const sharedLineHeight = params.has('lineHeight') ? parseFloat(params.get('lineHeight')!) : DEFAULT_VALUES.lineHeight;
        const sharedAnimationStyle = params.get('animationStyle') || DEFAULT_VALUES.animationStyle;
        const sharedGradient = params.get('gradient') || DEFAULT_VALUES.gradient;

        if (params.has('lines')) {
            try {
                const rawLines = JSON.parse(params.get('lines')!);
                if (Array.isArray(rawLines) && rawLines.length > 0) {
                    const parsed = rawLines.map((item: Partial<TextLine>) => ({
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
                    setTextLines(parsed);
                }
            } catch {
                // fall through
            }
        } else if (params.has('text')) {
            const textParam = params.get('text')!;
            const subLines = textParam.split(';').map(t => ({
                text: t,
                font: sharedFont,
                color: sharedColor,
                fontSize: sharedFontSize,
                letterSpacing: sharedLetterSpacing,
                typingSpeed: sharedTypingSpeed,
                deleteSpeed: sharedDeleteSpeed,
                fontWeight: sharedFontWeight,
                lineHeight: sharedLineHeight,
                animationStyle: sharedAnimationStyle,
                gradient: sharedGradient,
            }));
            setTextLines(subLines);
        }

        // Canvas dimensions & background
        if (params.has('width')) setWidth(parseInt(params.get('width')!, 10));
        if (params.has('height')) setHeight(parseInt(params.get('height')!, 10));
        
        if (params.has('backgroundType')) {
            const bt = params.get('backgroundType');
            if (bt === 'transparent' || bt === 'solid' || bt === 'gradient') setBackgroundType(bt);
        } else if (params.has('backgroundGradient')) {
            setBackgroundType('gradient');
        } else if (params.has('backgroundColor') && params.get('backgroundColor') !== 'transparent') {
            setBackgroundType('solid');
        }

        if (params.has('backgroundColor')) setBackgroundColor(params.get('backgroundColor')!);
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
        if (params.has('cursorChar')) setCursorChar(params.get('cursorChar')!);
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
            params.append('backgroundType', 'solid');
            params.append('backgroundColor', backgroundColor);
        } else if (backgroundType === 'gradient' && backgroundGradient) {
            params.append('backgroundType', 'gradient');
            params.append('backgroundGradient', backgroundGradient);
            if (backgroundGradientAngle !== 90) {
                params.append('backgroundGradientAngle', backgroundGradientAngle.toString());
            }
        } else if (backgroundType === 'transparent') {
            params.append('backgroundType', 'transparent');
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

    // Clean Share URL that restores the exact studio state
    const studioShareUrl = useMemo(() => {
        if (typeof window === 'undefined') return svgUrl;
        return `${window.location.origin}/?${queryParamsString}`;
    }, [queryParamsString, svgUrl]);

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

    // Download high-DPI PNG snapshot
    const handleDownloadPng = async () => {
        try {
            await downloadPngFromSvg(svgUrl, width, height, 'textfx-banner.png');
            showToast('Downloaded High-Res PNG (2x)', 'sparkles');
        } catch {
            showToast('Failed to generate PNG snapshot', 'info');
        }
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
            <header className={`border-b sticky top-0 z-30 backdrop-blur-md transition-colors duration-200 ${
                isDarkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    
                    {/* Brand Logo & Tag */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2 group">
                            <AnimatedLogo />
                        </Link>
                        <span className="text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono hidden sm:inline-block">
                            v2.0 SVG Studio
                        </span>
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
                            className={`p-1.5 rounded-md border text-xs transition-colors ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100'
                            }`}
                            title="Reset all settings"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <Link
                            href="/docs"
                            className={`p-1.5 rounded-md border text-xs transition-colors ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100'
                            }`}
                            title="API & Embed Documentation"
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-1.5 rounded-md border text-xs transition-colors ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100'
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

            {/* MAIN APP CONTAINER */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12">

                {/* INSPIRATION PRESET THEMES CAROUSEL */}
                <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            Curated Theme Presets
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                            Click to apply instant styling
                        </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
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

                {/* 2-COLUMN STUDIO WORKSPACE */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT PANE (5 cols): Accordion Settings */}
                    <div className="lg:col-span-5 space-y-3">
                        
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

                                        {/* Per-Line Animation Style & Gradient (Rich Custom Selects) */}
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

                                        {/* Number Input Steppers for line font size & speeds */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                            <NumberInputStepper
                                                label="Font Size"
                                                value={line.fontSize}
                                                onChange={(v) => updateTextLine(idx, 'fontSize', v)}
                                                min={12}
                                                max={96}
                                                step={1}
                                                unit="px"
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

                    {/* RIGHT PANE (7 cols): Live Preview Pane & Export Embed Section */}
                    <div className="lg:col-span-7 space-y-4">
                        
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
                            <div className={`p-6 flex items-center justify-center min-h-[280px] overflow-auto transition-colors ${getCanvasBgClass()}`}>
                                
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
                                        <span>Download</span>
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
                                    Ready-to-use embed tags
                                </span>
                            </div>

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
                                            onClick={() => handleCopy(`<img src="${absoluteSvgUrl}" alt="TextFX Animation" width="${width}" height="${height}" />`, 'html', 'HTML Tag')}
                                            className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1 font-medium"
                                        >
                                            {copiedKey === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === 'html' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-md font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                                    }`}>
                                        {`<img src="${absoluteSvgUrl}" alt="TextFX Animation" width="${width}" height="${height}" />`}
                                    </div>
                                </div>

                                {/* React / Next.js JSX */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-zinc-400">React / Next.js JSX</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(`<Image src="${absoluteSvgUrl}" alt="TextFX Animation" width={${width}} height={${height}} unoptimized />`, 'jsx', 'React JSX')}
                                            className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1 font-medium"
                                        >
                                            {copiedKey === 'jsx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === 'jsx' ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <div className={`p-2.5 rounded-md font-mono text-xs break-all select-all border ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                                    }`}>
                                        {`<Image src="${absoluteSvgUrl}" alt="TextFX Animation" width={${width}} height={${height}} unoptimized />`}
                                    </div>
                                </div>

                                {/* Direct SVG URL & Raw XML */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/60">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(absoluteSvgUrl, 'url', 'Direct SVG URL')}
                                        className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                                            isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                                        }`}
                                    >
                                        {copiedKey === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>Copy API URL</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleCopyRawSvg}
                                        className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                                            isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                                        }`}
                                    >
                                        {copiedKey === 'raw-svg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
                                        <span>Copy Raw SVG XML</span>
                                    </button>
                                </div>

                                {/* File Downloads & Backup */}
                                <div className="space-y-2 pt-3 border-t border-zinc-800/60">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                                        Downloads & Configuration Backups
                                    </span>
                                    <div className="grid grid-cols-2 gap-2">
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
                                            onClick={handleDownloadPng}
                                            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white' : 'border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100 shadow-sm'
                                            }`}
                                        >
                                            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                                            <span>Download PNG (2x)</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleExportJson}
                                            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                                            }`}
                                        >
                                            <FileJson className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Export Config JSON</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
                                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
                                            }`}
                                        >
                                            <Upload className="w-3.5 h-3.5 text-purple-400" />
                                            <span>Import Config JSON</span>
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
                onDownloadPng={handleDownloadPng}
                onExportJson={handleExportJson}
                onImportJson={() => fileInputRef.current?.click()}
                onOpenShare={() => setIsShareModalOpen(true)}
                onShareConfig={() => handleCopy(studioShareUrl, 'cmd-share', 'Share URL')}
                onReset={resetToDefaults}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                isDarkMode={isDarkMode}
            />

        </div>
    );
}
