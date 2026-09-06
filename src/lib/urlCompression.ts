import LZString from 'lz-string';

/**
 * Compresses an arbitrary object into an ultra-short, URL-safe string
 */
export function compressConfig(data: unknown): string {
    try {
        const json = JSON.stringify(data);
        return LZString.compressToEncodedURIComponent(json);
    } catch {
        return '';
    }
}

/**
 * Decompresses an ultra-short URL-safe string back into an object
 */
export function decompressConfig<T = Record<string, unknown>>(compressed: string): T | null {
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (!decompressed) return null;
        return JSON.parse(decompressed) as T;
    } catch {
        return null;
    }
}
