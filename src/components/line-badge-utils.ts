/**
 * Contraste WCAG pour LineBadge.
 *
 * La couleur de fond d'une ligne vient des données (GTFS route_color) : on
 * choisit la couleur de texte (blanc ou encre) qui atteint 4,5:1 sur ce fond.
 */

/** Encre principale (= --cadence-color-primary). */
export const INK = "#002830";
export const WHITE = "#ffffff";
/** Seuil AA pour du texte normal. */
export const AA_RATIO = 4.5;

/** Canal sRGB [0..255] → linéaire [0..1]. */
const toLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

/** Développe #abc en #aabbcc et renvoie [r,g,b] ; null si invalide. */
export const normalizeLineColor = (value: string): string | null => {
  const hex = value.trim().replace(/^#/, "");
  return /^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? `#${hex}` : null;
};

const parseHex = (hex: string): [number, number, number] | null => {
  const m = hex.trim().replace(/^#/, "");
  const full = m.length === 3 ? m.replace(/./g, (ch) => ch + ch) : m;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

/** Luminance relative WCAG d'une couleur hex (0 si invalide). */
export const luminance = (hex: string): number => {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

/** Rapport de contraste entre deux couleurs hex (1 à 21). */
export const contrastRatio = (a: string, b: string): number => {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Choisit la meilleure couleur de texte (blanc ou encre) pour un fond donné.
 * `ok` indique si elle atteint le seuil AA (sinon : prévoir un liseré).
 */
export const pickTextColor = (background: string): { color: string; ratio: number; ok: boolean } => {
  const white = contrastRatio(WHITE, background);
  const ink = contrastRatio(INK, background);
  const best = white >= ink ? { color: WHITE, ratio: white } : { color: INK, ratio: ink };
  // Le noir assure AA dans la petite zone où ni blanc ni encre ne suffisent.
  if (best.ratio < AA_RATIO) {
    const black = contrastRatio("#000000", background);
    return { color: "#000000", ratio: black, ok: black >= AA_RATIO };
  }
  return { ...best, ok: true };
};
