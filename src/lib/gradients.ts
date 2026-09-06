// src/lib/gradients.ts

export interface GradientPreset {
  id: string;
  name: string;
  from: string;
  to: string;
  angle: number; // in degrees: 0, 45, 90, 135, 180
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'sunset', name: 'Sunset Glow', from: '#FF512F', to: '#DD2476', angle: 45 },
  { id: 'sunset-flare', name: 'Sunset Flare', from: '#FF512F', to: '#F09819', angle: 45 },
  { id: 'cyberpunk', name: 'Cyberpunk', from: '#00F260', to: '#0575E6', angle: 90 },
  { id: 'cyber-neon', name: 'Cyber Neon', from: '#ff007f', to: '#00ffff', angle: 90 },
  { id: 'neon', name: 'Neon Horizon', from: '#FA709A', to: '#FEE140', angle: 45 },
  { id: 'emerald', name: 'Emerald Matrix', from: '#11998E', to: '#38EF7D', angle: 90 },
  { id: 'northern-lights', name: 'Northern Lights', from: '#00ffaa', to: '#00bfff', angle: 90 },
  { id: 'gold', name: 'Gold Sovereign', from: '#F7971E', to: '#FFD200', angle: 45 },
  { id: 'golden-hour', name: 'Golden Hour', from: '#F7971E', to: '#FFD200', angle: 45 },
  { id: 'cosmic', name: 'Cosmic Ocean', from: '#2E3192', to: '#1BFFFF', angle: 135 },
  { id: 'deep-space', name: 'Deep Space', from: '#051119', to: '#112233', angle: 135 },
  { id: 'fire', name: 'Flaming Amber', from: '#F12711', to: '#F5AF19', angle: 90 },
  { id: 'violet', name: 'Ultra Violet', from: '#654ea3', to: '#eaafc8', angle: 45 },
  { id: 'terminal', name: 'Terminal Acid', from: '#56ab2f', to: '#a8e063', angle: 90 },
  { id: 'midnight', name: 'Midnight Aurora', from: '#0f2027', to: '#2c5364', angle: 135 }
];

/**
 * Calculate SVG linearGradient coordinates from angle (degrees)
 */
export function getGradientCoordinates(angle: number = 45): {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
} {
  const rad = ((angle - 90) * Math.PI) / 180;
  const x1 = Math.round(50 + Math.cos(rad + Math.PI) * 50) + '%';
  const y1 = Math.round(50 + Math.sin(rad + Math.PI) * 50) + '%';
  const x2 = Math.round(50 + Math.cos(rad) * 50) + '%';
  const y2 = Math.round(50 + Math.sin(rad) * 50) + '%';

  return { x1, y1, x2, y2 };
}

/**
 * Parse a gradient string.
 * Formats supported:
 * 1. Preset id (e.g. "sunset", "cyberpunk")
 * 2. "fromHex,toHex,angle" (e.g. "#ff512f,#dd2476,45")
 * 3. "fromHex,toHex" (defaults to angle 45)
 */
export function parseGradient(str: string): { from: string; to: string; angle: number } | null {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim().toLowerCase();

  // Check preset id
  const preset = GRADIENT_PRESETS.find((p) => p.id === trimmed);
  if (preset) {
    return { from: preset.from, to: preset.to, angle: preset.angle };
  }

  // Check custom format: #hex,#hex[,angle]
  const parts = str.split(',').map((s) => s.trim());
  if (parts.length >= 2) {
    const from = parts[0];
    const to = parts[1];
    const angle = parts[2] ? parseInt(parts[2], 10) || 45 : 45;
    return { from, to, angle };
  }

  return null;
}
