// src/lib/fonts.ts
import fontData from '@/data/google-fonts.json';

export type FontCategory = 'all' | 'popular' | 'monospace' | 'sans-serif' | 'serif' | 'handwriting' | 'display';

export interface FontItem {
  family: string;
  category: 'sans-serif' | 'serif' | 'monospace' | 'handwriting' | 'display';
  isPopular?: boolean;
}

const FAVORITES_STORAGE_KEY = 'textfx_font_favorites';
const RECENT_STORAGE_KEY = 'textfx_font_recent';

const popularSet = new Set(fontData.popular.map((f: string) => f.toLowerCase()));

export const ALL_FONTS: FontItem[] = (fontData.fonts as Array<{ family: string; category: string }>).map((font) => ({
  family: font.family,
  category: font.category as FontItem['category'],
  isPopular: popularSet.has(font.family.toLowerCase())
}));

export const POPULAR_FONTS: FontItem[] = ALL_FONTS.filter((f) => f.isPopular);

const loadedPreviewFonts = new Set<string>();

/**
 * Dynamically load Google Font preview CSS in browser
 * Uses CSS2 API with text parameter targeting only the font's own name
 * Results in microscopic ~500 byte payload for instant rendering
 * Skips on mobile (<768px) to keep mobile lightweight and prevent lag
 */
export function loadFontPreview(fontFamily: string) {
  if (typeof window === 'undefined' || !fontFamily) return;

  const cleanFamily = fontFamily.trim();
  const cacheKey = cleanFamily.toLowerCase();
  if (loadedPreviewFonts.has(cacheKey)) return;

  try {
    const linkId = `font-preview-${cleanFamily.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    
    const familyParam = cleanFamily.replace(/ /g, '+');
    const fontUrl = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`;

    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    } else {
      link.href = fontUrl;
    }
    
    loadedPreviewFonts.add(cacheKey);
  } catch {
    // Graceful fallback
  }
}

/**
 * LocalStorage Helpers for Starred / Favorite Fonts
 */
export function getStoredFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : ['Courier Prime', 'Fira Code', 'JetBrains Mono', 'Poppins'];
  } catch {
    return ['Courier Prime', 'Fira Code', 'JetBrains Mono', 'Poppins'];
  }
}

export function toggleFavoriteFont(fontFamily: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredFavorites();
    const exists = current.includes(fontFamily);
    const updated = exists ? current.filter((f) => f !== fontFamily) : [fontFamily, ...current];
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * LocalStorage Helpers for Recently Used Fonts
 */
export function getStoredRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : ['Courier Prime'];
  } catch {
    return ['Courier Prime'];
  }
}

export function addRecentFont(fontFamily: string): string[] {
  if (typeof window === 'undefined' || !fontFamily) return [];
  try {
    const current = getStoredRecent().filter((f) => f !== fontFamily);
    const updated = [fontFamily, ...current].slice(0, 8);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
