'use client';

import { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  TextCursor, 
  Eye, 
  Code, 
  Palette, 
  Plus, 
  Minus, 
  Download, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Github, 
  Star,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  Sliders,
  Layers
} from 'lucide-react';
import FontCombobox from './FontCombobox';
import { GRADIENT_PRESETS } from '@/lib/gradients';

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
    animationStyle?: 'typewriter' | 'fade' | 'slide-up' | 'wave' | 'glitch';
    gradient?: string;
}

interface GitHubStats {
    stars: number;
    loading: boolean;
}

type DeletionBehavior = 'stay' | 'backspace' | 'clear';
type AnimationStyle = 'typewriter' | 'fade' | 'slide-up' | 'wave' | 'glitch';
type BackgroundType = 'solid' | 'gradient' | 'transparent';
type HAlign = 'left' | 'center' | 'right';
type VAlign = 'top' | 'center' | 'bottom';

const DEFAULT_VALUES = {
    font: 'Courier Prime',
    color: '#000000',
    fontSize: 28,
    letterSpacing: '0.1em',
    typingSpeed: 2, // chars/s (1/0.5 = 2)
    deleteSpeed: 2, // chars/s (1/0.5 = 2)
    fontWeight: '400',
    lineHeight: 1.3,
    animationStyle: 'typewriter' as AnimationStyle,
    gradient: '',
    
    width: 450,
    height: 150,
    pause: 1000,
    repeat: true,
    backgroundColor: '#ffffff',
    backgroundOpacity: 1,
    backgroundType: 'solid' as BackgroundType,
    bgGradient: 'sunset',
    borderRadius: 4,
    hAlign: 'center' as HAlign,
    vAlign: 'center' as VAlign,
    border: true,
    cursorStyle: 'straight',
    cursorColor: '',
    cursorBlinkSpeed: 0.7,
    hideCursorOnComplete: false,
    deletionBehavior: 'backspace' as DeletionBehavior
};

export default function SVGGenerator() {
    const [textLines, setTextLines] = useState<TextLine[]>([
        { text: 'Hello, World!', font: 'Courier Prime', color: '#000000', fontSize: 28, letterSpacing: '0.1em', typingSpeed: 2, deleteSpeed: 2, fontWeight: '400', lineHeight: 1.3, animationStyle: 'typewriter', gradient: '' },
        { text: 'And Emojis! 😀🚀', font: 'Courier Prime', color: '#000000', fontSize: 28, letterSpacing: '0.1em', typingSpeed: 2, deleteSpeed: 2, fontWeight: '400', lineHeight: 1.3, animationStyle: 'typewriter', gradient: '' }
    ]);
    
    // Global settings
    const [width, setWidth] = useState(450);
    const [height, setHeight] = useState(150);
    const [pause, setPause] = useState(1000);
    const [repeat, setRepeat] = useState(true);
    
    // Background options
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundOpacity, setBackgroundOpacity] = useState(1);
    const [backgroundType, setBackgroundType] = useState<BackgroundType>('solid');
    const [bgGradient, setBgGradient] = useState('sunset');
    const [borderRadius, setBorderRadius] = useState(4);
    
    // Alignments
    const [hAlign, setHAlign] = useState<HAlign>('center');
    const [vAlign, setVAlign] = useState<VAlign>('center');
    
    const [border, setBorder] = useState(true);
    const [cursorStyle, setCursorStyle] = useState('straight');
    const [cursorColor, setCursorColor] = useState('');
    const [cursorBlinkSpeed, setCursorBlinkSpeed] = useState(0.7);
    const [hideCursorOnComplete, setHideCursorOnComplete] = useState(false);
    
    const [deletionBehavior, setDeletionBehavior] = useState<DeletionBehavior>('backspace');
    const [globalAnimationStyle, setGlobalAnimationStyle] = useState<AnimationStyle>('typewriter');
    
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set([0]));
    const [cursorDropdownOpen, setCursorDropdownOpen] = useState(false);
    const [origin, setOrigin] = useState('');
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [githubStats, setGithubStats] = useState<GitHubStats>({ stars: 0, loading: true });
    
    const cursorOptions = [
        { value: 'straight', label: 'Straight', icon: '|' },
        { value: 'underline', label: 'Underline', icon: '_' },
        { value: 'block', label: 'Block', icon: '█' },
        { value: 'blank', label: 'Blank (No Cursor)', icon: '○' }
    ];

    const animationOptions: { value: AnimationStyle; label: string; desc: string }[] = [
        { value: 'typewriter', label: 'Typewriter', desc: 'Classic character-by-character appearance' },
        { value: 'fade', label: 'Smooth Fade', desc: 'Fluid character opacity fade' },
        { value: 'slide-up', label: 'Slide Up', desc: 'Glide upwards into place with fade' },
        { value: 'wave', label: 'Wave Bounce', desc: 'Continuous ripple wave animation' },
        { value: 'glitch', label: 'Glitch', desc: 'High-energy chromatic jitter entrance' }
    ];

    const GITHUB_REPO = 'revanthlol/TextFX';

    useEffect(() => {
        const fetchGitHubStats = async () => {
            try {
                const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
                if (response.ok) {
                    const data = await response.json();
                    setGithubStats({ stars: data.stargazers_count, loading: false });
                } else {
                    setGithubStats({ stars: 0, loading: false });
                }
            } catch {
                setGithubStats({ stars: 0, loading: false });
            }
        };

        fetchGitHubStats();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('[data-cursor-dropdown]')) {
                setCursorDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const convertCharsPerSecToSecsPerChar = (charsPerSec: number): number => {
        return charsPerSec > 0 ? Number((1 / charsPerSec).toFixed(3)) : 0.5;
    };

    const updateTextLine = (index: number, field: keyof TextLine, value: unknown) => {
        const newTextLines = [...textLines];
        newTextLines[index] = { ...newTextLines[index], [field]: value };
        setTextLines(newTextLines);
    };

    const addTextLine = () => {
        const newLine: TextLine = {
            text: '',
            font: 'Courier Prime',
            color: '#000000',
            fontSize: 28,
            letterSpacing: '0.1em',
            typingSpeed: 2,
            deleteSpeed: 2,
            fontWeight: '400',
            lineHeight: 1.3,
            animationStyle: globalAnimationStyle,
            gradient: ''
        };
        setTextLines([...textLines, newLine]);
        setExpandedLines(prev => new Set([...prev, textLines.length]));
    };

    const removeTextLine = (index: number) => {
        if (textLines.length > 1) {
            const newTextLines = textLines.filter((_, i) => i !== index);
            setTextLines(newTextLines);
            setExpandedLines(prev => {
                const newExpanded = new Set<number>();
                prev.forEach(lineIndex => {
                    if (lineIndex < index) {
                        newExpanded.add(lineIndex);
                    } else if (lineIndex > index) {
                        newExpanded.add(lineIndex - 1);
                    }
                });
                return newExpanded;
            });
        }
    };

    const toggleLineExpansion = (index: number) => {
        setExpandedLines(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(index)) {
                newExpanded.delete(index);
            } else {
                newExpanded.add(index);
            }
            return newExpanded;
        });
    };

    const createMinimalLine = (line: TextLine): Partial<TextLine> => {
        const minimal: Record<string, unknown> = { text: line.text };
        
        if (line.font !== DEFAULT_VALUES.font) minimal.font = line.font;
        if (line.color !== DEFAULT_VALUES.color) minimal.color = line.color;
        if (line.fontSize !== DEFAULT_VALUES.fontSize) minimal.fontSize = line.fontSize;
        if (line.letterSpacing !== DEFAULT_VALUES.letterSpacing) minimal.letterSpacing = line.letterSpacing;
        if (line.typingSpeed !== DEFAULT_VALUES.typingSpeed) minimal.typingSpeed = convertCharsPerSecToSecsPerChar(line.typingSpeed);
        if (line.deleteSpeed !== DEFAULT_VALUES.deleteSpeed) minimal.deleteSpeed = convertCharsPerSecToSecsPerChar(line.deleteSpeed);
        if (line.fontWeight !== DEFAULT_VALUES.fontWeight) minimal.fontWeight = line.fontWeight;
        if (line.lineHeight !== DEFAULT_VALUES.lineHeight) minimal.lineHeight = line.lineHeight;
        if (line.animationStyle && line.animationStyle !== DEFAULT_VALUES.animationStyle) minimal.animationStyle = line.animationStyle;
        if (line.gradient) minimal.gradient = line.gradient;
        
        return minimal;
    };

    const generateQueryString = () => {
        const params = new URLSearchParams();
        
        if (width !== DEFAULT_VALUES.width) params.append('width', String(width));
        if (height !== DEFAULT_VALUES.height) params.append('height', String(height));
        if (pause !== DEFAULT_VALUES.pause) params.append('pause', String(pause));
        if (repeat !== DEFAULT_VALUES.repeat) params.append('repeat', String(repeat));
        
        // Background
        if (backgroundType !== DEFAULT_VALUES.backgroundType) params.append('backgroundType', backgroundType);
        if (backgroundType === 'solid' && backgroundColor !== DEFAULT_VALUES.backgroundColor) {
            params.append('backgroundColor', backgroundColor);
        }
        if (backgroundType === 'gradient') {
            params.append('bgGradient', bgGradient);
        }
        if (backgroundOpacity !== DEFAULT_VALUES.backgroundOpacity) params.append('backgroundOpacity', String(backgroundOpacity));
        if (borderRadius !== DEFAULT_VALUES.borderRadius) params.append('borderRadius', String(borderRadius));
        
        // Alignments
        if (hAlign !== DEFAULT_VALUES.hAlign) params.append('hAlign', hAlign);
        if (vAlign !== DEFAULT_VALUES.vAlign) params.append('vAlign', vAlign);
        
        if (border !== DEFAULT_VALUES.border) params.append('border', String(border));
        if (cursorStyle !== DEFAULT_VALUES.cursorStyle) params.append('cursorStyle', cursorStyle);
        if (cursorColor) params.append('cursorColor', cursorColor);
        if (cursorBlinkSpeed !== DEFAULT_VALUES.cursorBlinkSpeed) params.append('cursorBlinkSpeed', String(cursorBlinkSpeed));
        if (hideCursorOnComplete) params.append('hideCursorOnComplete', 'true');
        if (deletionBehavior !== DEFAULT_VALUES.deletionBehavior) params.append('deletionBehavior', deletionBehavior);
        if (globalAnimationStyle !== DEFAULT_VALUES.animationStyle) params.append('animationStyle', globalAnimationStyle);

        const validLines = textLines.filter(line => line.text.trim() !== '');
        const minimalLines = validLines.map(createMinimalLine);
        
        if (minimalLines.length > 0) {
            params.append('lines', JSON.stringify(minimalLines));
        }

        return params.toString();
    };

    const svgUrl = `/api/svg?${generateQueryString()}`;
    const fullSvgUrl = `${origin}${svgUrl}`;

    const handleDownload = async () => {
        try {
            const response = await fetch(svgUrl);
            const svgBlob = await response.blob();
            const url = window.URL.createObjectURL(svgBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'textfx.svg';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showNotification('SVG downloaded to Downloads folder!');
        } catch {
            showNotification('Failed to download SVG', 'error');
        }
    };

    const openGitHub = () => {
        window.open(`https://github.com/${GITHUB_REPO}`, '_blank');
    };

    return (
        <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-black text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            {/* Notification Toast */}
            <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
                notification.show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}>
                <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
                    notification.type === 'error' 
                        ? 'bg-red-500 text-white' 
                        : (isDarkMode ? 'bg-yellow-500 text-black font-medium' : 'bg-blue-600 text-white')
                }`}>
                    {notification.type === 'error' ? (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : (
                        <Check className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">{notification.message}</span>
                </div>
            </div>

            <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shadow-md ${isDarkMode ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white'}`}>
                            <TextCursor className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${isDarkMode ? 'from-yellow-400 to-amber-200' : 'from-blue-600 to-indigo-600'} bg-clip-text text-transparent`}>
                                TextFX Generator
                            </h1>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Animated SVG typography engine for GitHub READMEs & websites
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={openGitHub}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                                isDarkMode 
                                    ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700' 
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            } shadow-sm`}
                        >
                            <Github className="w-4 h-4" />
                            <span>GitHub</span>
                        </button>

                        <button
                            onClick={openGitHub}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                                isDarkMode 
                                    ? 'bg-gray-800 border border-yellow-500/30 text-yellow-400 hover:bg-gray-700' 
                                    : 'bg-white border border-orange-200 text-orange-600 hover:bg-orange-50'
                            } shadow-sm`}
                        >
                            <Star className={`w-4 h-4 ${githubStats.loading ? 'animate-pulse' : ''}`} />
                            <span>{githubStats.loading ? '...' : githubStats.stars.toLocaleString()}</span>
                        </button>

                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-full border transition-all ${
                                isDarkMode 
                                    ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            } shadow-sm`}
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Main Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* LEFT COLUMN: Controls */}
                    <div className="space-y-5">
                        {/* Text Lines Card */}
                        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isDarkMode ? 'bg-gray-900 border-gray-800 shadow-xl' : 'bg-white border-gray-200 shadow-lg'
                        }`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Layers className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-blue-500'}`} />
                                    <h2 className="text-lg font-semibold">Text Lines & Styling</h2>
                                </div>
                                <button
                                    onClick={addTextLine}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        isDarkMode
                                            ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    } shadow-sm`}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Line</span>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {textLines.map((line, index) => (
                                    <div 
                                        key={index}
                                        className={`rounded-xl border transition-all overflow-hidden ${
                                            isDarkMode ? 'bg-gray-800/40 border-gray-700/80' : 'bg-gray-50/70 border-gray-200'
                                        }`}
                                    >
                                        <div 
                                            className={`p-3 flex items-center justify-between cursor-pointer ${
                                                isDarkMode ? 'hover:bg-gray-800/80' : 'hover:bg-gray-100/80'
                                            }`}
                                            onClick={() => toggleLineExpansion(index)}
                                        >
                                            <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                                                <div className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                                                    isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    #{index + 1}
                                                </div>
                                                <span 
                                                    className="text-sm font-medium truncate"
                                                    style={{ fontFamily: `'${line.font}', sans-serif` }}
                                                >
                                                    {line.text.trim() || <span className="text-gray-400 italic font-sans text-xs">Empty line...</span>}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {textLines.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeTextLine(index);
                                                        }}
                                                        className="p-1 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <div className="p-1 text-gray-400">
                                                    {expandedLines.has(index) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </div>
                                            </div>
                                        </div>

                                        {expandedLines.has(index) && (
                                            <div className={`p-3.5 pt-1 space-y-3.5 border-t ${isDarkMode ? 'border-gray-700/80 bg-gray-900/30' : 'border-gray-200 bg-white/50'}`}>
                                                {/* Text Input */}
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Text (supports multi-line with Enter)
                                                    </label>
                                                    <textarea 
                                                        value={line.text}
                                                        onChange={(e) => updateTextLine(index, 'text', e.target.value)}
                                                        className={`w-full p-2.5 rounded-lg border text-sm font-mono transition-all resize-none outline-none ${
                                                            isDarkMode 
                                                                ? 'bg-gray-800 border-gray-700 text-white focus:border-yellow-500' 
                                                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                                                        }`}
                                                        rows={2}
                                                        placeholder="Enter text..."
                                                    />
                                                </div>
                                                
                                                {/* Font & Size */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            Font Family
                                                        </label>
                                                        <FontCombobox 
                                                            value={line.font} 
                                                            onChange={(fontFamily) => updateTextLine(index, 'font', fontFamily)}
                                                            isDarkMode={isDarkMode}
                                                        />
                                                    </div>
                                                    <InputField 
                                                        label="Font Size (px)" 
                                                        type="number" 
                                                        value={line.fontSize} 
                                                        onChange={(e) => updateTextLine(index, 'fontSize', parseInt(e.target.value, 10) || 0)}
                                                        isDarkMode={isDarkMode}
                                                        size="small"
                                                    />
                                                </div>

                                                {/* Color & Gradient Fill */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                            Text Fill (Solid or Gradient)
                                                        </label>
                                                        {line.gradient && (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateTextLine(index, 'gradient', '')}
                                                                className="text-[11px] text-amber-500 hover:underline"
                                                            >
                                                                Reset to Solid
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                                                        <ColorField 
                                                            label="Solid Color" 
                                                            value={line.color} 
                                                            onChange={(e) => {
                                                                updateTextLine(index, 'color', e.target.value);
                                                                updateTextLine(index, 'gradient', '');
                                                            }}
                                                            isDarkMode={isDarkMode}
                                                            size="small"
                                                        />
                                                        <div className="space-y-1">
                                                            <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                Gradient Presets
                                                            </label>
                                                            <select
                                                                value={line.gradient || ''}
                                                                onChange={(e) => updateTextLine(index, 'gradient', e.target.value)}
                                                                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
                                                                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                                                                }`}
                                                            >
                                                                <option value="">None (Solid Color)</option>
                                                                {GRADIENT_PRESETS.map((gp) => (
                                                                    <option key={gp.id} value={gp.id}>{gp.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Animation Mode for this line */}
                                                <div>
                                                    <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        Line Animation Style
                                                    </label>
                                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                                                        {animationOptions.map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                onClick={() => updateTextLine(index, 'animationStyle', opt.value)}
                                                                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                                    (line.animationStyle || 'typewriter') === opt.value
                                                                        ? (isDarkMode ? 'bg-yellow-500 text-black font-semibold' : 'bg-blue-600 text-white font-semibold')
                                                                        : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                                                                }`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Speeds */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <InputField 
                                                        label="Typing Speed (char/s)" 
                                                        type="number" 
                                                        step="0.1"
                                                        value={line.typingSpeed} 
                                                        onChange={(e) => updateTextLine(index, 'typingSpeed', parseFloat(e.target.value) || 0)}
                                                        isDarkMode={isDarkMode}
                                                        size="small"
                                                    />
                                                    <InputField 
                                                        label="Delete Speed (char/s)" 
                                                        type="number" 
                                                        step="0.1"
                                                        value={line.deleteSpeed} 
                                                        onChange={(e) => updateTextLine(index, 'deleteSpeed', parseFloat(e.target.value) || 0)}
                                                        isDarkMode={isDarkMode}
                                                        size="small"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Effects, Canvas & Alignment Card */}
                        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isDarkMode ? 'bg-gray-900 border-gray-800 shadow-xl' : 'bg-white border-gray-200 shadow-lg'
                        }`}>
                            <div className="flex items-center gap-2 mb-4">
                                <Sliders className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-blue-500'}`} />
                                <h2 className="text-lg font-semibold">Canvas, Animation & Alignments</h2>
                            </div>

                            {/* Canvas Dimensions */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <InputField 
                                    label="Width (px)" 
                                    type="number" 
                                    value={width} 
                                    onChange={(e) => setWidth(parseInt(e.target.value, 10) || 0)}
                                    isDarkMode={isDarkMode}
                                /> 
                                <InputField 
                                    label="Height (px)" 
                                    type="number" 
                                    value={height} 
                                    onChange={(e) => setHeight(parseInt(e.target.value, 10) || 0)}
                                    isDarkMode={isDarkMode}
                                /> 
                            </div>

                            {/* Alignments (Horizontal & Vertical) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <div>
                                    <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Horizontal Alignment
                                    </label>
                                    <div className="grid grid-cols-3 gap-1 p-1 rounded-lg border bg-gray-100/50 dark:bg-gray-800/60 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => setHAlign('left')}
                                            className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                                                hAlign === 'left' 
                                                    ? (isDarkMode ? 'bg-yellow-500 text-black shadow' : 'bg-white text-blue-600 shadow') 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            <AlignLeft className="w-3.5 h-3.5" /> Left
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHAlign('center')}
                                            className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                                                hAlign === 'center' 
                                                    ? (isDarkMode ? 'bg-yellow-500 text-black shadow' : 'bg-white text-blue-600 shadow') 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            <AlignCenter className="w-3.5 h-3.5" /> Center
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setHAlign('right')}
                                            className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                                                hAlign === 'right' 
                                                    ? (isDarkMode ? 'bg-yellow-500 text-black shadow' : 'bg-white text-blue-600 shadow') 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            <AlignRight className="w-3.5 h-3.5" /> Right
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-xs font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Vertical Alignment
                                    </label>
                                    <div className="grid grid-cols-3 gap-1 p-1 rounded-lg border bg-gray-100/50 dark:bg-gray-800/60 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => setVAlign('top')}
                                            className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                                                vAlign === 'top' 
                                                    ? (isDarkMode ? 'bg-yellow-500 text-black shadow' : 'bg-white text-blue-600 shadow') 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            <AlignVerticalJustifyStart className="w-3.5 h-3.5" /> Top
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVAlign('center')}
                                            className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                                                vAlign === 'center' 
                                                    ? (isDarkMode ? 'bg-yellow-500 text-black shadow' : 'bg-white text-blue-600 shadow') 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            <AlignVerticalJustifyCenter className="w-3.5 h-3.5" /> Center
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setVAlign('bottom')}
                                            className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                                                vAlign === 'bottom' 
                                                    ? (isDarkMode ? 'bg-yellow-500 text-black shadow' : 'bg-white text-blue-600 shadow') 
                                                    : 'text-gray-500 dark:text-gray-400'
                                            }`}
                                        >
                                            <AlignVerticalJustifyEnd className="w-3.5 h-3.5" /> Bottom
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Background Styling */}
                            <div className={`p-3.5 rounded-xl border mb-4 ${isDarkMode ? 'border-gray-700/80 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <label className={`block text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        Background Style
                                    </label>
                                    <div className="flex items-center gap-1 text-xs">
                                        {(['solid', 'gradient', 'transparent'] as BackgroundType[]).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setBackgroundType(type)}
                                                className={`px-2 py-1 rounded-md font-medium capitalize transition-colors ${
                                                    backgroundType === type 
                                                        ? (isDarkMode ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white')
                                                        : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900')
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {backgroundType === 'solid' && (
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <ColorField 
                                            label="Color" 
                                            value={backgroundColor} 
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                            isDarkMode={isDarkMode}
                                            size="small"
                                        />
                                        <InputField 
                                            label="Corner Radius (px)" 
                                            type="number" 
                                            value={borderRadius} 
                                            onChange={(e) => setBorderRadius(parseInt(e.target.value, 10) || 0)}
                                            isDarkMode={isDarkMode}
                                            size="small"
                                        />
                                    </div>
                                )}

                                {backgroundType === 'gradient' && (
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div>
                                            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Gradient Theme
                                            </label>
                                            <select
                                                value={bgGradient}
                                                onChange={(e) => setBgGradient(e.target.value)}
                                                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs outline-none ${
                                                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                                                }`}
                                            >
                                                {GRADIENT_PRESETS.map((gp) => (
                                                    <option key={gp.id} value={gp.id}>{gp.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <InputField 
                                            label="Corner Radius (px)" 
                                            type="number" 
                                            value={borderRadius} 
                                            onChange={(e) => setBorderRadius(parseInt(e.target.value, 10) || 0)}
                                            isDarkMode={isDarkMode}
                                            size="small"
                                        />
                                    </div>
                                )}

                                <div className="mt-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-400">Background Opacity</span>
                                        <span className="font-mono">{Math.round(backgroundOpacity * 100)}%</span>
                                    </div>
                                    <input 
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={backgroundOpacity}
                                        onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Cursor Customization Suite */}
                            <div className={`p-3.5 rounded-xl border mb-4 ${isDarkMode ? 'border-gray-700/80 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                                <label className={`block text-xs font-semibold mb-2.5 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Cursor Customization Suite
                                </label>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                                    {cursorOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setCursorStyle(opt.value)}
                                            className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                                                cursorStyle === opt.value
                                                    ? (isDarkMode ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' : 'bg-blue-50 border-blue-500 text-blue-700')
                                                    : (isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-750' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50')
                                            }`}
                                        >
                                            <span className="font-mono text-base">{opt.icon}</span>
                                            <span>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                    <ColorField 
                                        label="Cursor Color (optional)" 
                                        value={cursorColor} 
                                        onChange={(e) => setCursorColor(e.target.value)}
                                        isDarkMode={isDarkMode}
                                        size="small"
                                    />
                                    <InputField 
                                        label="Blink Speed (seconds)" 
                                        type="number" 
                                        step="0.1"
                                        value={cursorBlinkSpeed} 
                                        onChange={(e) => setCursorBlinkSpeed(parseFloat(e.target.value) || 0.7)}
                                        isDarkMode={isDarkMode}
                                        size="small"
                                    />
                                </div>

                                <div className="mt-3">
                                    <Checkbox 
                                        label="Hide cursor when animation finishes" 
                                        checked={hideCursorOnComplete} 
                                        onChange={setHideCursorOnComplete} 
                                        isDarkMode={isDarkMode} 
                                    />
                                </div>
                            </div>

                            {/* Toggles & Lifecycle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <Checkbox label="Repeat Animation (Loop)" checked={repeat} onChange={setRepeat} isDarkMode={isDarkMode} />
                                <Checkbox label="Show Outer Frame Border" checked={border} onChange={setBorder} isDarkMode={isDarkMode} />
                            </div>

                            {/* Deletion Lifecycle Behavior */}
                            <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'border-gray-700/80 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                                <label className={`block text-xs font-semibold mb-2.5 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                    Text Sequencing Lifecycle
                                </label>
                                <div className="space-y-2">
                                    <RadioOption
                                        id="backspace"
                                        name="deletionBehavior"
                                        value="backspace"
                                        checked={deletionBehavior === 'backspace'}
                                        onChange={() => setDeletionBehavior('backspace')}
                                        label="Backspace"
                                        description="Types out, pauses, then backspaces each character before the next line."
                                        isDarkMode={isDarkMode}
                                    />
                                    <RadioOption
                                        id="stay"
                                        name="deletionBehavior"
                                        value="stay"
                                        checked={deletionBehavior === 'stay'}
                                        onChange={() => setDeletionBehavior('stay')}
                                        label="Stack Lines (Stay)"
                                        description="Text remains on screen and each new line stacks below it."
                                        isDarkMode={isDarkMode}
                                    />
                                    <RadioOption
                                        id="clear"
                                        name="deletionBehavior"
                                        value="clear"
                                        checked={deletionBehavior === 'clear'}
                                        onChange={() => setDeletionBehavior('clear')}
                                        label="Instant Clear"
                                        description="Types out, pauses, and vanishes immediately."
                                        isDarkMode={isDarkMode}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Live Preview & Code Export */}
                    <div className="space-y-5 lg:sticky lg:top-6">
                        {/* Live Preview Card */}
                        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isDarkMode ? 'bg-gray-900 border-gray-800 shadow-xl' : 'bg-white border-gray-200 shadow-lg'
                        }`}>
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <Eye className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-blue-500'}`} />
                                    <h2 className="text-lg font-semibold">Live SVG Preview</h2>
                                </div>
                                <button
                                    onClick={handleDownload}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        isDarkMode
                                            ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                                            : 'bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100'
                                    }`}
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download SVG</span>
                                </button>
                            </div>

                            {/* SVG Preview Frame */}
                            <div className={`p-4 sm:p-6 rounded-xl border flex items-center justify-center min-h-[220px] overflow-hidden transition-all ${
                                isDarkMode 
                                    ? 'bg-gray-950/80 border-gray-800/80 shadow-inner' 
                                    : 'bg-gray-100/70 border-gray-200 shadow-inner'
                            }`}>
                                <div className="max-w-full overflow-x-auto p-2">
                                    <object 
                                        key={svgUrl}
                                        data={svgUrl} 
                                        type="image/svg+xml"
                                        className="max-w-full h-auto transition-opacity duration-200"
                                        aria-label="TextFX Generated SVG"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Export Snippets Card */}
                        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isDarkMode ? 'bg-gray-900 border-gray-800 shadow-xl' : 'bg-white border-gray-200 shadow-lg'
                        }`}>
                            <div className="flex items-center gap-2 mb-3">
                                <Code className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-blue-500'}`} />
                                <h2 className="text-lg font-semibold">Embed Snippets</h2>
                            </div>
                            <div className="space-y-3">
                                <UrlBox label="Direct SVG URL" value={fullSvgUrl} isDarkMode={isDarkMode} showNotification={showNotification} />
                                <UrlBox label="GitHub Markdown" value={`[![TextFX](${fullSvgUrl})](https://github.com/revanthlol/TextFX)`} isDarkMode={isDarkMode} showNotification={showNotification} />
                                <UrlBox label="Raw HTML Embed" value={`<a href="https://github.com/revanthlol/TextFX"><img src="${fullSvgUrl}" alt="TextFX" /></a>`} isDarkMode={isDarkMode} showNotification={showNotification} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Subcomponents
function InputField({ 
    label, 
    type = "text", 
    value, 
    onChange, 
    isDarkMode, 
    className = "", 
    step,
    size = "normal",
    placeholder
}: {
    label: string;
    type?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDarkMode: boolean;
    className?: string;
    step?: string;
    size?: "small" | "normal";
    placeholder?: string;
}) {
    return (
        <div className={`space-y-1 ${className}`}>
            <label className={`block font-medium ${size === "small" ? "text-xs" : "text-sm"} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
            </label>
            <input 
                type={type} 
                value={value} 
                onChange={onChange}
                step={step}
                placeholder={placeholder}
                className={`w-full rounded-lg border font-mono transition-all outline-none ${
                    size === "small" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
                } ${
                    isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white focus:border-yellow-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
            />
        </div>
    );
}

function ColorField({ 
    label, 
    value, 
    onChange, 
    isDarkMode, 
    className = "",
    size = "normal"
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isDarkMode: boolean;
    className?: string;
    size?: "small" | "normal";
}) {
    return (
        <div className={`space-y-1 ${className}`}>
            <label className={`block font-medium ${size === "small" ? "text-xs" : "text-sm"} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
            </label>
            <div className="flex items-center gap-2">
                <input 
                    type="color" 
                    value={value && value.startsWith('#') ? value : '#000000'} 
                    onChange={onChange}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-700 p-0.5 bg-transparent"
                />
                <input 
                    type="text" 
                    value={value || ''} 
                    onChange={onChange}
                    placeholder="#000000"
                    className={`w-full rounded-lg border font-mono uppercase text-xs px-2.5 py-1.5 outline-none ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                />
            </div>
        </div>
    );
}

function Checkbox({ 
    label, 
    checked, 
    onChange, 
    isDarkMode 
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    isDarkMode: boolean;
}) {
    return (
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input 
                type="checkbox" 
                checked={checked} 
                onChange={(e) => onChange(e.target.checked)}
                className={`w-4 h-4 rounded transition-all cursor-pointer ${
                    isDarkMode ? 'accent-yellow-500' : 'accent-blue-600'
                }`}
            />
            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {label}
            </span>
        </label>
    );
}

function RadioOption({
    id,
    name,
    value,
    checked,
    onChange,
    label,
    description,
    isDarkMode
}: {
    id: string;
    name: string;
    value: string;
    checked: boolean;
    onChange: () => void;
    label: string;
    description: string;
    isDarkMode: boolean;
}) {
    return (
        <label htmlFor={id} className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
            checked 
                ? (isDarkMode ? 'bg-yellow-500/10' : 'bg-blue-50') 
                : (isDarkMode ? 'hover:bg-gray-800/40' : 'hover:bg-gray-100/60')
        }`}>
            <input
                type="radio"
                id={id}
                name={name}
                value={value}
                checked={checked}
                onChange={onChange}
                className={`mt-0.5 cursor-pointer ${isDarkMode ? 'accent-yellow-500' : 'accent-blue-600'}`}
            />
            <div className="flex-1">
                <span className={`block text-xs font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {label}
                </span>
                <span className={`block text-[11px] mt-0.5 leading-tight ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {description}
                </span>
            </div>
        </label>
    );
}

function UrlBox({ 
    label, 
    value, 
    isDarkMode, 
    showNotification 
}: {
    label: string;
    value: string;
    isDarkMode: boolean;
    showNotification: (message: string) => void;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        showNotification(`${label} copied to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-1">
            <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {label}
            </label>
            <div className="relative flex items-center">
                <input
                    type="text"
                    readOnly
                    value={value}
                    onClick={handleCopy}
                    className={`w-full p-2 pr-9 rounded-lg border font-mono text-xs cursor-pointer truncate outline-none ${
                        isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-200 hover:border-gray-600' 
                            : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300'
                    }`}
                />
                <button
                    type="button"
                    onClick={handleCopy}
                    className={`absolute right-1.5 p-1 rounded-md text-xs transition-colors ${
                        isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'
                    }`}
                    title="Copy to clipboard"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
    );
}
