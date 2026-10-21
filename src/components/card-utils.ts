// Fonctions pures de Card (internes, non exportées par index.ts).

export type KpiGoodDirection = "up" | "down" | "neutral";
export type KpiDeltaUnit = "%" | "pt" | "";
export type KpiDeltaTone = "positive" | "negative" | "neutral";

// Vrai signe moins typographique (U+2212) et espace fine insécable avant l'unité
const MINUS = "−";
const NNBSP = " ";

const withTypographicMinus = (text: string): string => text.replace("-", MINUS);

/** Valeur principale : nombre formaté en fr-FR, chaîne affichée telle quelle. */
export const formatKpiValue = (
  value: number | string,
  format: Intl.NumberFormatOptions = { maximumFractionDigits: 1 },
): string =>
  typeof value === "number" ? withTypographicMinus(new Intl.NumberFormat("fr-FR", format).format(value)) : value;

/** Variation signée : « +1,8 % », « −0,6 pt », « 0 % ». */
export const formatDelta = (value: number, unit: KpiDeltaUnit = "%"): string => {
  const number = new Intl.NumberFormat("fr-FR", { signDisplay: "exceptZero", maximumFractionDigits: 1 }).format(value);
  return `${withTypographicMinus(number)}${unit ? `${NNBSP}${unit}` : ""}`;
};

/** Couleur de la variation selon le sens favorable de l'indicateur. */
export const getDeltaTone = (value: number, goodDirection: KpiGoodDirection): KpiDeltaTone => {
  if (value === 0 || goodDirection === "neutral") return "neutral";
  const isUp = value > 0;
  return isUp === (goodDirection === "up") ? "positive" : "negative";
};

/** Phrase lue par les lecteurs d'écran : « en baisse de 12 % vs hier, favorable ». */
export const describeDelta = (
  value: number,
  unit: KpiDeltaUnit,
  goodDirection: KpiGoodDirection,
  label?: string,
): string => {
  const amount = formatDelta(Math.abs(value), unit).replace("+", "");
  const trend = value === 0 ? "stable" : `en ${value > 0 ? "hausse" : "baisse"} de ${amount}`;
  const tone = getDeltaTone(value, goodDirection);
  const verdict = tone === "positive" ? ", favorable" : tone === "negative" ? ", défavorable" : "";
  return `${trend}${label ? ` ${label}` : ""}${verdict}`;
};

/**
 * Tracé SVG d'une mini-courbe dans une boîte width × height, avec une marge
 * pour que le trait ne soit pas coupé. Une série plate est centrée.
 */
export const buildSparklinePoints = (
  values: number[],
  width: number,
  height: number,
  padding = 2,
): { x: number; y: number }[] => {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
  const round = (n: number) => Math.round(n * 100) / 100;
  return values.map((v, i) => ({
    x: round(padding + i * stepX),
    y: round(span === 0 ? height / 2 : padding + (1 - (v - min) / span) * (height - padding * 2)),
  }));
};
