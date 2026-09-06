'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    BookOpen, 
    Copy, 
    Check, 
    ExternalLink, 
    Terminal, 
    Code2, 
    Sun, 
    Moon, 
    ArrowLeft,
    Search,
    Cpu
} from 'lucide-react';
import { AnimatedLogo } from '@/components/AnimatedLogo';

interface ParamDef {
    name: string;
    type: string;
    defaultVal: string;
    description: string;
    example: string;
    category: 'Content' | 'Typography' | 'Animation' | 'Canvas' | 'Cursor';
}

const PARAM_DEFINITIONS: ParamDef[] = [
    {
        name: 'lines',
        type: 'string',
        defaultVal: 'Hello,+World!',
        description: 'Semicolon-separated list of text strings to animate sequentially. URL-encode spaces as + or %20.',
        example: 'lines=Full-Stack+Engineer;Open+Source+Builder;Next.js+Fan',
        category: 'Content'
    },
    {
        name: 'font',
        type: 'string',
        defaultVal: 'Courier+Prime',
        description: 'Google Font family name. Any of the 1,500+ Google Fonts can be specified.',
        example: 'font=Fira+Code',
        category: 'Typography'
    },
    {
        name: 'color',
        type: 'hex / string',
        defaultVal: '00ff66',
        description: 'Primary text color (hex code with or without #, or valid CSS color name).',
        example: 'color=38bdf8',
        category: 'Typography'
    },
    {
        name: 'size',
        type: 'number (px)',
        defaultVal: '28',
        description: 'Font size in pixels.',
        example: 'size=32',
        category: 'Typography'
    },
    {
        name: 'weight',
        type: 'number (100-900)',
        defaultVal: '400',
        description: 'Font weight for typography rendering.',
        example: 'weight=700',
        category: 'Typography'
    },
    {
        name: 'letterSpacing',
        type: 'string (em/px)',
        defaultVal: '0.1em',
        description: 'Letter spacing / kerning applied to text.',
        example: 'letterSpacing=0.15em',
        category: 'Typography'
    },
    {
        name: 'animationStyle',
        type: 'enum',
        defaultVal: 'typewriter',
        description: 'Animation mode. Supported: typewriter, fade, slide-up, wave, glitch.',
        example: 'animationStyle=glitch',
        category: 'Animation'
    },
    {
        name: 'speed',
        type: 'number (seconds)',
        defaultVal: '0.06',
        description: 'Typing duration per character in seconds (e.g. 0.06 = 60ms/char).',
        example: 'speed=0.04',
        category: 'Animation'
    },
    {
        name: 'deleteSpeed',
        type: 'number (seconds)',
        defaultVal: '0.04',
        description: 'Backspace / deletion duration per character in seconds.',
        example: 'deleteSpeed=0.02',
        category: 'Animation'
    },
    {
        name: 'pause',
        type: 'number (seconds)',
        defaultVal: '2',
        description: 'Duration to pause after finishing typing a line before moving to the next.',
        example: 'pause=1.5',
        category: 'Animation'
    },
    {
        name: 'loop',
        type: 'boolean (true|false)',
        defaultVal: 'true',
        description: 'Whether the animation loops infinitely or stops after the final line.',
        example: 'loop=true',
        category: 'Animation'
    },
    {
        name: 'vanish',
        type: 'boolean (true|false)',
        defaultVal: 'true',
        description: 'Whether the current line deletes/vanishes before the next line begins.',
        example: 'vanish=true',
        category: 'Animation'
    },
    {
        name: 'cursor',
        type: 'string / char',
        defaultVal: '|',
        description: 'Blinking cursor glyph. Supported: |, _, █, ▋, or empty for hidden cursor.',
        example: 'cursor=_',
        category: 'Cursor'
    },
    {
        name: 'cursorColor',
        type: 'hex / string',
        defaultVal: '00ff66',
        description: 'Custom color for the blinking cursor (defaults to matching text color).',
        example: 'cursorColor=ec4899',
        category: 'Cursor'
    },
    {
        name: 'cursorBlinkSpeed',
        type: 'number (ms)',
        defaultVal: '600',
        description: 'Blink duration of the cursor in milliseconds.',
        example: 'cursorBlinkSpeed=500',
        category: 'Cursor'
    },
    {
        name: 'hideCursorOnComplete',
        type: 'boolean',
        defaultVal: 'false',
        description: 'Hide the cursor once the final line finishes typing.',
        example: 'hideCursorOnComplete=true',
        category: 'Cursor'
    },
    {
        name: 'width',
        type: 'number (px)',
        defaultVal: '600',
        description: 'Canvas SVG viewBox width in pixels.',
        example: 'width=800',
        category: 'Canvas'
    },
    {
        name: 'height',
        type: 'number (px)',
        defaultVal: '100',
        description: 'Canvas SVG viewBox height in pixels.',
        example: 'height=120',
        category: 'Canvas'
    },
    {
        name: 'background',
        type: 'hex / string',
        defaultVal: '0d1117',
        description: 'Background color of the canvas. Use transparent for transparent SVG.',
        example: 'background=transparent',
        category: 'Canvas'
    },
    {
        name: 'center',
        type: 'boolean (true|false)',
        defaultVal: 'true',
        description: 'Center text horizontally across canvas width.',
        example: 'center=true',
        category: 'Canvas'
    },
    {
        name: 'vCenter',
        type: 'boolean (true|false)',
        defaultVal: 'true',
        description: 'Center text vertically across canvas height.',
        example: 'vCenter=true',
        category: 'Canvas'
    },
    {
        name: 'gradient',
        type: 'string',
        defaultVal: 'none',
        description: 'Linear gradient preset ID applied across text letters (e.g. sunset, synthwave, neon-green, cyber-punk, cotton-candy).',
        example: 'gradient=synthwave',
        category: 'Typography'
    },
    {
        name: 'backgroundGradient',
        type: 'string',
        defaultVal: 'none',
        description: 'Linear gradient preset ID applied to the canvas background.',
        example: 'backgroundGradient=matrix',
        category: 'Canvas'
    }
];

const CURATED_EXAMPLES = [
    {
        title: 'Neon Cyber Terminal',
        params: 'lines=SYSTEM+ONLINE;INITIALIZING+CORE;WELCOME+BACK+OPERATOR&font=Courier+Prime&color=00ff66&size=26&cursor=%7C&background=0d1117&width=620&height=90',
        desc: 'Classic hacker terminal with emerald monospace typeface and blinking pipe cursor.'
    },
    {
        title: 'Synthwave Glitch Header',
        params: 'lines=NEON+NIGHTS;CYBERPUNK+2099;RETROWAVE+DREAMS&font=Orbitron&color=ec4899&size=28&animationStyle=glitch&background=09090b&width=650&height=100',
        desc: 'Chromatic aberration glitch effect on futuristic sci-fi font.'
    },
    {
        title: 'Minimalist Portfolio Bio',
        params: 'lines=Hi+there,+I%27m+Alex;Senior+Full-Stack+Architect;Building+Open-Source+Tools&font=Inter&color=f4f4f5&size=24&weight=600&cursor=_&background=transparent&width=600&height=80',
        desc: 'Clean, transparent subtitle banner ideal for dark or light GitHub profile READMEs.'
    },
    {
        title: 'Sunset Gradient Wave',
        params: 'lines=CREATIVE+DEVELOPER;UI%2FUX+ENTHUSIAST;VECTOR+MAGICIAN&font=Outfit&size=28&weight=700&gradient=sunset&animationStyle=wave&background=18181b&width=620&height=100',
        desc: 'Linear sunset color progression with smooth sine wave bounce animation.'
    }
];

export default function ApiDocsPage() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [activeTab, setActiveTab] = useState<'markdown' | 'html' | 'curl' | 'javascript' | 'python' | 'nextjs'>('markdown');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Sync theme with localStorage
    React.useEffect(() => {
        try {
            const saved = localStorage.getItem('textfx_theme');
            if (saved === 'light') {
                setIsDarkMode(false);
            } else {
                setIsDarkMode(true);
            }
        } catch {
            // ignore fallback
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const next = !prev;
            try {
                localStorage.setItem('textfx_theme', next ? 'dark' : 'light');
            } catch {
                // ignore
            }
            return next;
        });
    };

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://textfx.dev';

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const filteredParams = PARAM_DEFINITIONS.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const sampleUrl = `${baseUrl}/api/svg?lines=Building+Next-Gen+Apps;Open+Source+Dev&font=Fira+Code&color=38bdf8&size=28&cursor=%7C&background=0d1117&width=600&height=100`;

    const codeSnippets = {
        markdown: `[![TextFX](${sampleUrl})](https://github.com/revanthlol/TextFX)`,
        html: `<img src="${sampleUrl}" alt="TextFX Animated Typography" width="600" height="100" />`,
        curl: `curl -s "${sampleUrl}" -o animated-banner.svg`,
        javascript: `// Fetch raw SVG string or pipe directly to DOM / Canvas
const response = await fetch("${sampleUrl}");
const svgXml = await response.text();`,
        python: `import requests

# Fetch the animated SVG stream
response = requests.get("${sampleUrl}")
with open("banner.svg", "wb") as f:
    f.write(response.content)`,
        nextjs: `import Image from 'next/image';

export function AnimatedBanner() {
  return (
    <img
      src="${sampleUrl}"
      alt="TextFX Banner"
      width={600}
      height={100}
      className="rounded-lg shadow-md"
    />
  );
}`
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 font-sans ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
            
            {/* Top Navigation Bar */}
            <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
                isDarkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-white/80 border-zinc-200'
            }`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <AnimatedLogo />
                        </Link>
                        <span className="text-zinc-600 dark:text-zinc-700">/</span>
                        <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>API Reference</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg border text-xs transition-colors ${
                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 shadow-sm'
                            }`}
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        <Link
                            href="/"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-semibold text-xs shadow-sm hover:bg-white transition-all active:scale-95"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Open Studio</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Docs Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                
                {/* Hero / Header Section */}
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-medium">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>GET /api/svg • High-Performance Vector Endpoint</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Public API Documentation
                    </h1>
                    <p className={`text-sm sm:text-base max-w-3xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        TextFX exposes a stateless, serverless SVG rendering API. Hotlink the URL in your GitHub READMEs, personal portfolios, or web apps with pure vector SMIL animations that run natively in every modern browser.
                    </p>
                </div>

                {/* Quick Start Card */}
                <div className={`p-6 rounded-xl border space-y-4 ${
                    isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
                }`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-emerald-400" />
                            <span>Endpoint Overview</span>
                        </h2>
                        <span className="font-mono text-xs text-zinc-400">HTTP GET</span>
                    </div>
                    <div className={`p-3.5 rounded-lg border font-mono text-xs flex items-center justify-between gap-3 overflow-x-auto ${
                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-300 text-zinc-800'
                    }`}>
                        <div className="flex items-center gap-2 truncate">
                            <span className="text-emerald-400 font-bold">GET</span>
                            <span>{baseUrl}/api/svg?[parameters]</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(`${baseUrl}/api/svg`, 'base-endpoint')}
                            className="text-zinc-400 hover:text-zinc-100 flex items-center gap-1 font-sans text-xs flex-shrink-0"
                        >
                            {copiedKey === 'base-endpoint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === 'base-endpoint' ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-zinc-200 bg-zinc-50'}`}>
                            <span className="font-semibold text-zinc-400 block mb-1">Content-Type</span>
                            <span className="font-mono text-emerald-400">image/svg+xml</span>
                        </div>
                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-zinc-200 bg-zinc-50'}`}>
                            <span className="font-semibold text-zinc-400 block mb-1">Caching</span>
                            <span className="font-mono text-zinc-300">max-age=60, s-maxage=3600</span>
                        </div>
                        <div className={`p-3 rounded-lg border ${isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-zinc-200 bg-zinc-50'}`}>
                            <span className="font-semibold text-zinc-400 block mb-1">CORS Policy</span>
                            <span className="font-mono text-zinc-300">Access-Control-Allow-Origin: *</span>
                        </div>
                    </div>
                </div>

                {/* Code Snippet Tabs */}
                <div className={`rounded-xl border overflow-hidden ${
                    isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
                }`}>
                    <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
                        isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Integration Snippets</span>
                        </div>
                        
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-1 overflow-x-auto">
                            {(['markdown', 'html', 'curl', 'javascript', 'python', 'nextjs'] as const).map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-2.5 py-1 rounded text-xs font-medium capitalize border transition-all ${
                                        activeTab === tab
                                            ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold'
                                            : isDarkMode
                                                ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                                : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-100'
                                    }`}
                                >
                                    {tab === 'nextjs' ? 'Next.js' : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 relative">
                        <pre className={`p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border ${
                            isDarkMode ? 'bg-zinc-950 border-zinc-800/80 text-zinc-300' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
                        }`}>
                            <code>{codeSnippets[activeTab]}</code>
                        </pre>
                        <button
                            type="button"
                            onClick={() => handleCopy(codeSnippets[activeTab], `tab-${activeTab}`)}
                            className="absolute top-7 right-7 px-2.5 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow border border-zinc-700"
                        >
                            {copiedKey === `tab-${activeTab}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedKey === `tab-${activeTab}` ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                </div>

                {/* Parameter Reference Table */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Parameter Reference</h2>
                            <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                All query parameters are optional with intelligent defaults.
                            </p>
                        </div>

                        {/* Search & Category Filter */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search parameters..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`pl-8 pr-3 py-1.5 rounded-lg border text-xs outline-none w-44 sm:w-56 transition-colors ${
                                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-zinc-600' : 'bg-white border-zinc-300 text-zinc-900 focus:border-zinc-400'
                                    }`}
                                />
                            </div>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs outline-none transition-colors ${
                                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-300 text-zinc-800'
                                }`}
                            >
                                <option value="All">All Categories</option>
                                <option value="Content">Content</option>
                                <option value="Typography">Typography</option>
                                <option value="Animation">Animation</option>
                                <option value="Cursor">Cursor</option>
                                <option value="Canvas">Canvas</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className={`rounded-xl border overflow-hidden ${
                        isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
                    }`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className={`border-b font-mono uppercase tracking-wider text-[11px] ${
                                    isDarkMode ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                                }`}>
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Parameter</th>
                                        <th className="px-4 py-3 font-semibold">Type</th>
                                        <th className="px-4 py-3 font-semibold">Default</th>
                                        <th className="px-4 py-3 font-semibold">Description</th>
                                        <th className="px-4 py-3 font-semibold">Example</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-zinc-200'}`}>
                                    {filteredParams.map((param) => (
                                        <tr key={param.name} className={`hover:bg-zinc-500/5 transition-colors`}>
                                            <td className="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                                {param.name}
                                            </td>
                                            <td className={`px-4 py-3 font-mono text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                {param.type}
                                            </td>
                                            <td className={`px-4 py-3 font-mono text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                {param.defaultVal}
                                            </td>
                                            <td className={`px-4 py-3 text-xs ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                                {param.description}
                                            </td>
                                            <td className={`px-4 py-3 font-mono text-[11px] truncate max-w-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                {param.example}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredParams.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-zinc-500 font-mono text-xs">
                                                No parameters match your search query.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Curated Examples & Direct Launch Studio Table */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Curated Examples</h2>
                        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            Tested combinations ready to hotlink or launch in the visual studio.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CURATED_EXAMPLES.map((example, idx) => {
                            const fullSvgUrl = `${baseUrl}/api/svg?${example.params}`;
                            const studioUrl = `/?${example.params}`;
                            return (
                                <div 
                                    key={idx} 
                                    className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
                                        isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-sm">{example.title}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                                                isDarkMode ? 'border border-zinc-700 bg-zinc-800 text-zinc-300' : 'border border-zinc-200 bg-zinc-100 text-zinc-700'
                                            }`}>
                                                Preset
                                            </span>
                                        </div>
                                        <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                            {example.desc}
                                        </p>

                                        {/* Live SVG Preview Box */}
                                        <div className={`p-4 rounded-lg border flex items-center justify-center overflow-x-auto min-h-[90px] ${
                                            isDarkMode ? 'bg-[#0d1117] border-zinc-800' : 'bg-zinc-900 border-zinc-800'
                                        }`}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={fullSvgUrl}
                                                alt={example.title}
                                                className="max-w-full h-auto drop-shadow"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className={`flex items-center justify-between gap-2 pt-2 border-t text-xs ${
                                        isDarkMode ? 'border-zinc-800/40' : 'border-zinc-200'
                                    }`}>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(`[![TextFX](${fullSvgUrl})](https://github.com/revanthlol/TextFX)`, `ex-md-${idx}`)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all ${
                                                isDarkMode ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white' : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 shadow-sm'
                                            }`}
                                        >
                                            {copiedKey === `ex-md-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{copiedKey === `ex-md-${idx}` ? 'Copied' : 'Copy Markdown'}</span>
                                        </button>

                                        <Link
                                            href={studioUrl}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold transition-all active:scale-95"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>Launch Studio</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className={`mt-20 border-t py-8 text-center text-xs ${
                isDarkMode ? 'border-zinc-800 text-zinc-500 bg-zinc-950' : 'border-zinc-200 text-zinc-500 bg-white'
            }`}>
                <p>TextFX • High-Performance Animated SVG Studio & Vector API • MIT License</p>
            </footer>

        </div>
    );
}
