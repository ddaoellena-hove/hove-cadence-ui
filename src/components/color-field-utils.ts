/**
 * Conversions HEX ↔ HSV pour le sélecteur de ColorField (zone saturation /
 * luminosité + réglette de teinte). La valeur échangée reste un hex `#RRGGBB`.
 */

/** Teinte (0–360), saturation et luminosité (0–100). */
export interface Hsv {
  h: number;
  s: number;
  v: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** `#RRGGBB` (ou `#RGB`) → HSV ; null si invalide. */
export const hexToHsv = (hex: string): Hsv | null => {
  const m = hex.trim().replace(/^#/, "");
  const full = m.length === 3 ? m.replace(/./g, (ch) => ch + ch) : m;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  // Sans arrondi : l'aller-retour HEX → HSV → HEX est exact.
  return { h, s: max === 0 ? 0 : (d / max) * 100, v: max * 100 };
};

/** HSV → `#RRGGBB` en majuscules. */
export const hsvToHex = ({ h, s, v }: Hsv): string => {
  const sat = clamp(s, 0, 100) / 100;
  const val = clamp(v, 0, 100) / 100;
  const c = val * sat;
  const hue = ((h % 360) + 360) % 360;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;
  const [r, g, b] =
    hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

export { clamp };
