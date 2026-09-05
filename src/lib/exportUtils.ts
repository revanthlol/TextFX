/**
 * Export and Download utilities for TextFX
 */

/**
 * Downloads a high-DPI (2x scale) PNG snapshot from an SVG URL
 */
export async function downloadPngFromSvg(
    svgUrl: string,
    width: number,
    height: number,
    filename: string = 'textfx-banner.png'
): Promise<void> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const scale = 2; // 2x retina scale for crisp typography
            const canvas = document.createElement('canvas');
            canvas.width = width * scale;
            canvas.height = height * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }

            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Failed to create PNG blob'));
                    return;
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            }, 'image/png');
        };

        img.onerror = () => {
            reject(new Error('Failed to load SVG for PNG conversion'));
        };

        img.src = svgUrl;
    });
}

/**
 * Exports current configuration to a downloadable JSON file
 */
export function exportConfigJson(config: unknown, filename: string = 'textfx-config.json'): void {
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Parses and validates an uploaded JSON configuration file
 */
export function importConfigJson(file: File): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target?.result as string);
                if (typeof parsed !== 'object' || parsed === null) {
                    throw new Error('Invalid configuration format');
                }
                resolve(parsed as Record<string, unknown>);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : 'Unknown error';
                reject(new Error('Failed to parse JSON file: ' + msg));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read configuration file'));
        reader.readAsText(file);
    });
}
