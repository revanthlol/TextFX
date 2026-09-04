/**
 * Default values for the SVG generator
 */
export const DEFAULT_VALUES = {
    // Text line defaults
    font: 'Courier Prime',
    color: '#000000',
    fontSize: 28,
    letterSpacing: '0.1em',
    typingSpeed: 0.5, // s/char (API format)
    deleteSpeed: 0.5, // s/char (API format)
    fontWeight: '400',
    lineHeight: 1.3,
    animationStyle: 'typewriter' as 'typewriter' | 'fade' | 'slide-up' | 'wave' | 'glitch',
    textGradient: '',
    
    // Global defaults
    width: 450,
    height: 150,
    pause: 1000,
    repeat: true,
    backgroundColor: '#ffffff',
    backgroundOpacity: 1,
    backgroundType: 'solid' as 'solid' | 'gradient' | 'transparent',
    bgGradient: '',
    borderRadius: 4,
    center: true,
    vCenter: true,
    hAlign: 'center' as 'left' | 'center' | 'right',
    vAlign: 'center' as 'top' | 'center' | 'bottom',
    border: true,
    cursorStyle: 'straight' as 'straight' | 'underline' | 'block' | 'blank',
    cursorColor: '',
    cursorBlinkSpeed: 0.7,
    hideCursorOnComplete: false,
    fontRatio: 0.6,
    deletionBehavior: 'backspace' as 'stay' | 'backspace' | 'clear'
};

/**
 * Validates the query parameters for the SVG generator.
 * @param params - The URLSearchParams object from the request.
 * @returns An object with the validated and parsed parameters.
 */
export function validateParams(params: URLSearchParams) {
    const linesParam = params.get('lines');
    
    // Global parameters common to both modes
    const width = parseInt(params.get('width') || DEFAULT_VALUES.width.toString(), 10);
    const height = parseInt(params.get('height') || DEFAULT_VALUES.height.toString(), 10);
    const pause = parseInt(params.get('pause') || DEFAULT_VALUES.pause.toString(), 10);
    const repeat = params.get('repeat') !== null ? params.get('repeat') === 'true' : DEFAULT_VALUES.repeat;
    
    // Background options
    const backgroundColor = params.get('backgroundColor') || DEFAULT_VALUES.backgroundColor;
    const backgroundOpacity = parseFloat(params.get('backgroundOpacity') || DEFAULT_VALUES.backgroundOpacity.toString());
    const backgroundType = (params.get('backgroundType') as typeof DEFAULT_VALUES.backgroundType) || DEFAULT_VALUES.backgroundType;
    const bgGradient = params.get('bgGradient') || DEFAULT_VALUES.bgGradient;
    const borderRadius = parseInt(params.get('borderRadius') || DEFAULT_VALUES.borderRadius.toString(), 10);
    
    // Alignments
    let hAlign = (params.get('hAlign') as typeof DEFAULT_VALUES.hAlign) || DEFAULT_VALUES.hAlign;
    if (params.get('center') !== null) {
        hAlign = params.get('center') === 'true' ? 'center' : 'left';
    }
    const center = hAlign === 'center';

    let vAlign = (params.get('vAlign') as typeof DEFAULT_VALUES.vAlign) || DEFAULT_VALUES.vAlign;
    if (params.get('vCenter') !== null) {
        vAlign = params.get('vCenter') === 'true' ? 'center' : 'top';
    }
    const vCenter = vAlign === 'center';

    const border = params.get('border') !== null ? params.get('border') === 'true' : DEFAULT_VALUES.border;
    
    // Cursor options
    const cursorStyle = (params.get('cursorStyle') as typeof DEFAULT_VALUES.cursorStyle) || DEFAULT_VALUES.cursorStyle;
    const cursorColor = params.get('cursorColor') || DEFAULT_VALUES.cursorColor;
    const cursorBlinkSpeed = parseFloat(params.get('cursorBlinkSpeed') || DEFAULT_VALUES.cursorBlinkSpeed.toString());
    const hideCursorOnComplete = params.get('hideCursorOnComplete') === 'true';

    const fontRatio = parseFloat(params.get('fontRatio') || DEFAULT_VALUES.fontRatio.toString());
    const animationStyle = (params.get('animationStyle') as typeof DEFAULT_VALUES.animationStyle) || DEFAULT_VALUES.animationStyle;
    const textGradient = params.get('textGradient') || DEFAULT_VALUES.textGradient;

    // Deletion behavior
    let deletionBehavior = DEFAULT_VALUES.deletionBehavior;
    const deletionParam = params.get('deletionBehavior');
    const deleteAfterParam = params.get('deleteAfter');
    if (deletionParam && ['stay', 'backspace', 'clear'].includes(deletionParam)) {
        deletionBehavior = deletionParam as typeof DEFAULT_VALUES.deletionBehavior;
    } else if (deleteAfterParam !== null) {
        deletionBehavior = deleteAfterParam === 'true' ? 'backspace' : 'stay';
    }

    if ([width, height, pause, fontRatio, backgroundOpacity, borderRadius, cursorBlinkSpeed].some(isNaN)) {
        throw new Error('Invalid numeric parameter');
    }

    if (linesParam) {
        return {
            text: '', 
            font: DEFAULT_VALUES.font,
            color: DEFAULT_VALUES.color,
            typingSpeed: DEFAULT_VALUES.typingSpeed,
            letterSpacing: DEFAULT_VALUES.letterSpacing,
            fontSize: DEFAULT_VALUES.fontSize,
            deleteSpeed: DEFAULT_VALUES.deleteSpeed,
            fontWeight: DEFAULT_VALUES.fontWeight,
            width,
            height,
            pause,
            repeat,
            backgroundColor,
            backgroundOpacity,
            backgroundType,
            bgGradient,
            borderRadius,
            center,
            vCenter,
            hAlign,
            vAlign,
            border,
            cursorStyle,
            cursorColor,
            cursorBlinkSpeed,
            hideCursorOnComplete,
            fontRatio,
            deletionBehavior,
            animationStyle,
            textGradient
        };
    } else {
        const text = params.get('text') || 'Hello, World!';
        const font = params.get('font') || DEFAULT_VALUES.font;
        const color = params.get('color') || DEFAULT_VALUES.color;
        const typingSpeed = parseFloat(params.get('typingSpeed') || DEFAULT_VALUES.typingSpeed.toString());
        const deleteSpeed = parseFloat(params.get('deleteSpeed') || DEFAULT_VALUES.deleteSpeed.toString());
        const fontSize = parseInt(params.get('fontSize') || DEFAULT_VALUES.fontSize.toString(), 10);
        const fontWeight = params.get('fontWeight') || DEFAULT_VALUES.fontWeight;

        const letterSpacingParam = params.get('letterSpacing') || DEFAULT_VALUES.letterSpacing.toString();
        let letterSpacing: string | number;
        const numericValue = parseFloat(letterSpacingParam);
        if (!isNaN(numericValue) && letterSpacingParam === numericValue.toString()) {
            letterSpacing = numericValue;
        } else {
            letterSpacing = letterSpacingParam;
        }

        if ([typingSpeed, deleteSpeed, fontSize].some(isNaN)) {
            throw new Error('Invalid numeric parameter');
        }

        return {
            text,
            font,
            color,
            width,
            height,
            typingSpeed,
            pause,
            deleteSpeed,
            letterSpacing,
            repeat,
            backgroundColor,
            backgroundOpacity,
            backgroundType,
            bgGradient,
            borderRadius,
            fontSize,
            center,
            vCenter,
            hAlign,
            vAlign,
            border,
            cursorStyle,
            cursorColor,
            cursorBlinkSpeed,
            hideCursorOnComplete,
            fontRatio,
            deletionBehavior,
            fontWeight,
            animationStyle,
            textGradient
        };
    }
}