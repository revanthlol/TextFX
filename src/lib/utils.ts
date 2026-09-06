/**
 * TextFX Utilities and Parameter Validation
 */

export function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(' ');
}

export const DEFAULT_VALUES = {
    // Text line defaults
    font: 'Courier Prime',
    color: '#00ff66',
    fontSize: 28,
    letterSpacing: '0.1em',
    typingSpeed: 0.06, // s/char (crisp 60ms)
    deleteSpeed: 0.04, // s/char (crisp 40ms)
    fontWeight: '400',
    lineHeight: 1.3,
    animationStyle: 'typewriter' as 'typewriter' | 'fade' | 'slide-up' | 'wave' | 'glitch',
    textGradient: '',
    
    // Global defaults
    width: 600,
    height: 100,
    pause: 2000,
    repeat: true,
    backgroundColor: '#0d1117',
    backgroundOpacity: 1,
    backgroundType: 'transparent' as 'transparent' | 'solid' | 'gradient',
    bgGradient: '',
    bgGradientAngle: 90,
    borderRadius: 6,
    hAlign: 'center' as 'left' | 'center' | 'right',
    vAlign: 'center' as 'top' | 'center' | 'bottom',
    border: false,
    cursorStyle: 'straight' as 'straight' | 'underline' | 'block' | 'half-block' | 'blank',
    cursorChar: '|',
    cursorColor: '',
    cursorBlinkSpeed: 0.6,
    hideCursorOnComplete: false,
    fontRatio: 0.6,
    deletionBehavior: 'backspace' as 'stay' | 'backspace' | 'clear'
};

/**
 * Validates and normalizes query parameters for the SVG generator.
 */
export function validateParams(params: URLSearchParams) {
    // Canvas dimensions
    const width = parseInt(params.get('width') || DEFAULT_VALUES.width.toString(), 10);
    const height = parseInt(params.get('height') || DEFAULT_VALUES.height.toString(), 10);
    
    // Pause duration: supports both pause (ms) and pauseDuration (s)
    let pause = DEFAULT_VALUES.pause;
    if (params.has('pauseDuration')) {
        pause = Math.round(parseFloat(params.get('pauseDuration')!) * 1000);
    } else if (params.has('pause')) {
        pause = parseInt(params.get('pause')!, 10);
    }
    
    // Repeat / loop: supports loop and repeat
    let repeat = DEFAULT_VALUES.repeat;
    if (params.has('loop')) {
        repeat = params.get('loop') === 'true';
    } else if (params.has('repeat')) {
        repeat = params.get('repeat') === 'true';
    }
    
    // Background options
    let backgroundType: 'transparent' | 'solid' | 'gradient' = DEFAULT_VALUES.backgroundType;
    if (params.has('backgroundType')) {
        const bt = params.get('backgroundType');
        if (bt === 'transparent' || bt === 'solid' || bt === 'gradient') {
            backgroundType = bt;
        }
    } else if (params.has('backgroundGradient') || params.get('bgGradient')) {
        backgroundType = 'gradient';
    } else if (params.has('backgroundColor') && params.get('backgroundColor') !== 'transparent') {
        backgroundType = 'solid';
    }
    const backgroundColor = params.get('backgroundColor') || DEFAULT_VALUES.backgroundColor;
    const backgroundOpacity = parseFloat(params.get('backgroundOpacity') || DEFAULT_VALUES.backgroundOpacity.toString());
    const bgGradient = params.get('backgroundGradient') || params.get('bgGradient') || DEFAULT_VALUES.bgGradient;
    const bgGradientAngle = parseInt(params.get('backgroundGradientAngle') || params.get('bgGradientAngle') || '90', 10);
    const borderRadius = parseInt(params.get('borderRadius') || DEFAULT_VALUES.borderRadius.toString(), 10);
    
    // Alignments
    let hAlign: 'left' | 'center' | 'right' = DEFAULT_VALUES.hAlign;
    if (params.has('hAlign')) {
        const val = params.get('hAlign');
        if (val === 'left' || val === 'center' || val === 'right') hAlign = val;
    } else if (params.has('center')) {
        hAlign = params.get('center') === 'true' ? 'center' : 'left';
    }

    let vAlign: 'top' | 'center' | 'bottom' = DEFAULT_VALUES.vAlign;
    if (params.has('vAlign')) {
        const val = params.get('vAlign');
        if (val === 'top' || val === 'center' || val === 'bottom') vAlign = val;
        else if (val === 'middle') vAlign = 'center';
    } else if (params.has('vCenter')) {
        vAlign = params.get('vCenter') === 'true' ? 'center' : 'top';
    }

    const border = params.get('border') !== null ? params.get('border') === 'true' : DEFAULT_VALUES.border;
    
    // Cursor options: supports cursorChar ('|', '_', '█', '▋', '') or cursorStyle ('straight', 'underline', 'block', 'blank')
    let cursorStyle: typeof DEFAULT_VALUES.cursorStyle = DEFAULT_VALUES.cursorStyle;
    const cursorCharParam = params.get('cursorChar');
    const cursorStyleParam = params.get('cursorStyle');

    if (cursorCharParam !== null) {
        if (cursorCharParam === '_') cursorStyle = 'underline';
        else if (cursorCharParam === '█') cursorStyle = 'block';
        else if (cursorCharParam === '▋') cursorStyle = 'half-block';
        else if (cursorCharParam === '' || cursorCharParam === 'none') cursorStyle = 'blank';
        else cursorStyle = 'straight';
    } else if (cursorStyleParam) {
        if (['straight', 'underline', 'block', 'half-block', 'blank'].includes(cursorStyleParam)) {
            cursorStyle = cursorStyleParam as typeof DEFAULT_VALUES.cursorStyle;
        }
    }

    const cursorColor = params.get('cursorColor') || DEFAULT_VALUES.cursorColor;
    
    // Cursor Blink Speed: supports ms (e.g. 600) or s (e.g. 0.6)
    let cursorBlinkSpeed = DEFAULT_VALUES.cursorBlinkSpeed;
    if (params.has('cursorBlinkSpeed')) {
        const rawSpeed = parseFloat(params.get('cursorBlinkSpeed')!);
        cursorBlinkSpeed = rawSpeed > 10 ? rawSpeed / 1000 : rawSpeed;
    }

    const hideCursorOnComplete = params.get('hideCursorOnComplete') === 'true';

    // Animation & Gradient
    const animationStyle = (params.get('animationStyle') as typeof DEFAULT_VALUES.animationStyle) || DEFAULT_VALUES.animationStyle;
    const textGradient = params.get('gradient') || params.get('textGradient') || DEFAULT_VALUES.textGradient;

    // Deletion behavior / Vanish
    let deletionBehavior = DEFAULT_VALUES.deletionBehavior;
    if (params.has('vanishBeforeNextLine')) {
        deletionBehavior = params.get('vanishBeforeNextLine') === 'true' ? 'backspace' : 'stay';
    } else if (params.has('deletionBehavior')) {
        const val = params.get('deletionBehavior');
        if (val === 'stay' || val === 'backspace' || val === 'clear') deletionBehavior = val;
    } else if (params.has('deleteAfter')) {
        deletionBehavior = params.get('deleteAfter') === 'true' ? 'backspace' : 'stay';
    }

    // Speeds: normalize if in ms or seconds
    const parseSpeed = (val: string | null, def: number) => {
        if (!val) return def;
        const num = parseFloat(val);
        if (isNaN(num)) return def;
        return num > 5 ? num / 1000 : num;
    };

    const typingSpeed = parseSpeed(params.get('typingSpeed'), DEFAULT_VALUES.typingSpeed);
    const deleteSpeed = parseSpeed(params.get('deleteSpeed'), DEFAULT_VALUES.deleteSpeed);
    const fontSize = parseInt(params.get('fontSize') || DEFAULT_VALUES.fontSize.toString(), 10);
    const font = params.get('font') || DEFAULT_VALUES.font;
    const color = params.get('color') || DEFAULT_VALUES.color;
    const fontWeight = params.get('fontWeight') || DEFAULT_VALUES.fontWeight;

    const letterSpacingParam = params.get('letterSpacing') || DEFAULT_VALUES.letterSpacing.toString();
    let letterSpacing: string | number;
    const numericValue = parseFloat(letterSpacingParam);
    if (!isNaN(numericValue) && letterSpacingParam === numericValue.toString()) {
        letterSpacing = numericValue;
    } else {
        letterSpacing = letterSpacingParam;
    }

    return {
        text: params.get('text') || 'Hello, World!',
        font,
        color,
        fontSize,
        letterSpacing,
        fontWeight,
        typingSpeed,
        deleteSpeed,
        width,
        height,
        pause,
        repeat,
        backgroundColor,
        backgroundOpacity,
        backgroundType,
        bgGradient,
        bgGradientAngle,
        borderRadius,
        center: hAlign === 'center',
        vCenter: vAlign === 'center',
        hAlign,
        vAlign,
        border,
        cursorStyle,
        cursorColor,
        cursorBlinkSpeed,
        hideCursorOnComplete,
        fontRatio: DEFAULT_VALUES.fontRatio,
        deletionBehavior,
        animationStyle,
        textGradient
    };
}