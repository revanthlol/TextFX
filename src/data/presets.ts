export interface TextFXPreset {
    id: string;
    name: string;
    iconName: 'Terminal' | 'Zap' | 'Sun' | 'Briefcase' | 'Compass' | 'Sparkles';
    description: string;
    lines: Array<{
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
    }>;
    canvas: {
        width: number;
        height: number;
        backgroundType: 'transparent' | 'solid' | 'gradient';
        backgroundColor: string;
        backgroundGradient: string;
        backgroundGradientAngle: number;
        hAlign: 'left' | 'center' | 'right';
        vAlign: 'top' | 'middle' | 'bottom';
        cursorChar: string;
        cursorColor: string;
        cursorBlinkSpeed: number;
        hideCursorOnComplete: boolean;
        pauseDuration: number;
        loop: boolean;
        vanishBeforeNextLine: boolean;
    };
}

export const PRESETS: TextFXPreset[] = [
    {
        id: 'terminal-hacker',
        name: 'Terminal Hacker',
        iconName: 'Terminal',
        description: 'Classic green phosphor CLI terminal with fast typing',
        lines: [
            {
                text: 'git commit -m "feat: awesome update"',
                font: 'Fira Code',
                color: '#00ff66',
                fontSize: 22,
                letterSpacing: '0.05em',
                typingSpeed: 0.05,
                deleteSpeed: 0.03,
                fontWeight: '500',
                lineHeight: 1.3,
                animationStyle: 'typewriter',
                gradient: ''
            },
            {
                text: 'git push origin main --force',
                font: 'Fira Code',
                color: '#00ff66',
                fontSize: 22,
                letterSpacing: '0.05em',
                typingSpeed: 0.05,
                deleteSpeed: 0.03,
                fontWeight: '500',
                lineHeight: 1.3,
                animationStyle: 'typewriter',
                gradient: ''
            }
        ],
        canvas: {
            width: 600,
            height: 90,
            backgroundType: 'solid',
            backgroundColor: '#0d1117',
            backgroundGradient: '',
            backgroundGradientAngle: 90,
            hAlign: 'left',
            vAlign: 'middle',
            cursorChar: '_',
            cursorColor: '#00ff66',
            cursorBlinkSpeed: 400,
            hideCursorOnComplete: false,
            pauseDuration: 1.5,
            loop: true,
            vanishBeforeNextLine: true
        }
    },
    {
        id: 'cyberpunk-neon',
        name: 'Cyberpunk Neon',
        iconName: 'Zap',
        description: 'Futuristic glitch effects with electric magenta & cyan gradient',
        lines: [
            {
                text: 'WELCOME TO NIGHT CITY',
                font: 'Orbitron',
                color: '#ff007f',
                fontSize: 26,
                letterSpacing: '0.15em',
                typingSpeed: 0.06,
                deleteSpeed: 0.04,
                fontWeight: '700',
                lineHeight: 1.3,
                animationStyle: 'glitch',
                gradient: 'cyber-neon'
            },
            {
                text: 'NEURAL LINK CONNECTED',
                font: 'Orbitron',
                color: '#ff007f',
                fontSize: 26,
                letterSpacing: '0.15em',
                typingSpeed: 0.06,
                deleteSpeed: 0.04,
                fontWeight: '700',
                lineHeight: 1.3,
                animationStyle: 'glitch',
                gradient: 'cyber-neon'
            }
        ],
        canvas: {
            width: 640,
            height: 100,
            backgroundType: 'solid',
            backgroundColor: '#060611',
            backgroundGradient: '',
            backgroundGradientAngle: 90,
            hAlign: 'center',
            vAlign: 'middle',
            cursorChar: '▋',
            cursorColor: '#00ffff',
            cursorBlinkSpeed: 300,
            hideCursorOnComplete: false,
            pauseDuration: 2,
            loop: true,
            vanishBeforeNextLine: true
        }
    },
    {
        id: 'modern-dev',
        name: 'Modern Dev',
        iconName: 'Briefcase',
        description: 'Clean, professional slide-up typography for GitHub profiles',
        lines: [
            {
                text: 'Full-Stack Software Engineer',
                font: 'Inter',
                color: '#f0f6fc',
                fontSize: 24,
                letterSpacing: '0.02em',
                typingSpeed: 0.06,
                deleteSpeed: 0.04,
                fontWeight: '600',
                lineHeight: 1.3,
                animationStyle: 'slide-up',
                gradient: ''
            },
            {
                text: 'TypeScript • Next.js • TailwindCSS',
                font: 'Inter',
                color: '#58a6ff',
                fontSize: 24,
                letterSpacing: '0.02em',
                typingSpeed: 0.06,
                deleteSpeed: 0.04,
                fontWeight: '600',
                lineHeight: 1.3,
                animationStyle: 'slide-up',
                gradient: ''
            }
        ],
        canvas: {
            width: 580,
            height: 90,
            backgroundType: 'solid',
            backgroundColor: '#161b22',
            backgroundGradient: '',
            backgroundGradientAngle: 90,
            hAlign: 'left',
            vAlign: 'middle',
            cursorChar: '|',
            cursorColor: '#58a6ff',
            cursorBlinkSpeed: 500,
            hideCursorOnComplete: false,
            pauseDuration: 2,
            loop: true,
            vanishBeforeNextLine: true
        }
    },
    {
        id: 'aurora-borealis',
        name: 'Northern Lights',
        iconName: 'Compass',
        description: 'Mystical emerald to cyan aurora gradient with soft fade transitions',
        lines: [
            {
                text: 'Building the next generation of AI tools',
                font: 'Outfit',
                color: '#00ffaa',
                fontSize: 26,
                letterSpacing: '0.05em',
                typingSpeed: 0.06,
                deleteSpeed: 0.04,
                fontWeight: '600',
                lineHeight: 1.3,
                animationStyle: 'fade',
                gradient: 'northern-lights'
            },
            {
                text: 'Empowering creators worldwide',
                font: 'Outfit',
                color: '#00ffaa',
                fontSize: 26,
                letterSpacing: '0.05em',
                typingSpeed: 0.06,
                deleteSpeed: 0.04,
                fontWeight: '600',
                lineHeight: 1.3,
                animationStyle: 'fade',
                gradient: 'northern-lights'
            }
        ],
        canvas: {
            width: 650,
            height: 100,
            backgroundType: 'gradient',
            backgroundColor: '#051119',
            backgroundGradient: 'deep-space',
            backgroundGradientAngle: 135,
            hAlign: 'center',
            vAlign: 'middle',
            cursorChar: '|',
            cursorColor: '#00ffaa',
            cursorBlinkSpeed: 600,
            hideCursorOnComplete: false,
            pauseDuration: 2.2,
            loop: true,
            vanishBeforeNextLine: true
        }
    },
    {
        id: 'golden-editorial',
        name: 'Golden Hour',
        iconName: 'Sparkles',
        description: 'Elegant serif typography with luxurious golden metallic gradient',
        lines: [
            {
                text: 'The Art of Thoughtful Design',
                font: 'Playfair Display',
                color: '#d4af37',
                fontSize: 30,
                letterSpacing: '0.08em',
                typingSpeed: 0.06,
                deleteSpeed: 0.04,
                fontWeight: '700',
                lineHeight: 1.3,
                animationStyle: 'typewriter',
                gradient: 'golden-hour'
            },
            {
                text: 'Where simplicity meets luxury',
                font: 'Playfair Display',
                color: '#d4af37',
                fontSize: 30,
                letterSpacing: '0.08em',
                typingSpeed: 0.06,
                deleteSpeed: 0.04,
                fontWeight: '700',
                lineHeight: 1.3,
                animationStyle: 'typewriter',
                gradient: 'golden-hour'
            }
        ],
        canvas: {
            width: 600,
            height: 100,
            backgroundType: 'transparent',
            backgroundColor: '#ffffff',
            backgroundGradient: '',
            backgroundGradientAngle: 90,
            hAlign: 'center',
            vAlign: 'middle',
            cursorChar: '▋',
            cursorColor: '#ffd700',
            cursorBlinkSpeed: 500,
            hideCursorOnComplete: false,
            pauseDuration: 2.5,
            loop: true,
            vanishBeforeNextLine: true
        }
    }
];
