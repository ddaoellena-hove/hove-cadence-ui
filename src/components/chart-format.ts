// Formatage fr-FR partagé par Card et les graphiques (internes, non exportés
// par index.ts) : nombres, variations, dates d'axe et de tooltip.

export type GoodDirection = "up" | "down" | "neutral";
export type DeltaUnit = "%" | "pt" | "";
export type DeltaTone = "positive" | "negative" | "neutral";

// Vrai signe moins typographique (U+2212) et espace fine insécable avant l'unité
const MINUS = "\u2212";
const NNBSP = "\u202F";

const withTypographicMinus = (text: string): string => text.replace("-", MINUS);

/** Valeur : nombre formaté en fr-FR, chaîne affichée telle quelle. */
export const formatKpiValue = (
  value: number | string,
  format: Intl.NumberFormatOptions = { maximumFractionDigits: 1 },
): string =>
  typeof value === "number" ? withTypographicMinus(new Intl.NumberFormat("fr-FR", format).format(value)) : value;

/** Valeur suivie de son unité : « 4,2 min », « 95 % », « 12 ». */
export const formatValueWithUnit = (value: number, unit?: string, format?: Intl.NumberFormatOptions): string =>
  `${formatKpiValue(value, format)}${unit ? `${NNBSP}${unit}` : ""}`;

/** Variation signée : « +1,8 % », « −0,6 pt », « 0 % ». */
export const formatDelta = (value: number, unit: DeltaUnit = "%"): string => {
  const number = new Intl.NumberFormat("fr-FR", { signDisplay: "exceptZero", maximumFractionDigits: 1 }).format(value);
  return `${withTypographicMinus(number)}${unit ? `${NNBSP}${unit}` : ""}`;
};

/** Couleur de la variation selon le sens favorable de l'indicateur. */
export const getDeltaTone = (value: number, goodDirection: GoodDirection): DeltaTone => {
  if (value === 0 || goodDirection === "neutral") return "neutral";
  const isUp = value > 0;
  return isUp === (goodDirection === "up") ? "positive" : "negative";
};

/** Phrase lue par les lecteurs d'écran : « en baisse de 12 % vs hier, favorable ». */
export const describeDelta = (
  value: number,
  unit: DeltaUnit,
  goodDirection: GoodDirection,
  label?: string,
): string => {
  const amount = formatDelta(Math.abs(value), unit).replace("+", "");
  const trend = value === 0 ? "stable" : `en ${value > 0 ? "hausse" : "baisse"} de ${amount}`;
  const tone = getDeltaTone(value, goodDirection);
  const verdict = tone === "positive" ? ", favorable" : tone === "negative" ? ", défavorable" : "";
  return `${trend}${label ? ` ${label}` : ""}${verdict}`;
};

// ── Dates ──────────────────────────────────────────────────────────────────

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export type DateGranularity = "hour" | "day" | "month";

/** Granularité d'axe selon l'étendue : < 2 jours → heures, < 3 mois → jours, sinon mois. */
export const getDateGranularity = (start: Date, end: Date): DateGranularity => {
  const span = Math.abs(end.getTime() - start.getTime());
  if (span < 2 * DAY) return "hour";
  if (span < 92 * DAY) return "day";
  return "month";
};

const hourFormat = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit" });
const dayFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" });
const monthFormat = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" });
const fullFormat = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});
const dateOnlyFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** Étiquette d'axe : « 14 h », « lun. 14 oct. », « oct. 2026 ». */
export const formatAxisDate = (date: Date, granularity: DateGranularity): string => {
  if (granularity === "hour") return `${hourFormat.format(date).replace(/\s*h$/, "")} h`;
  if (granularity === "day") return dayFormat.format(date);
  return monthFormat.format(date);
};

/** Date complète (tooltip, tableau) : avec l'heure si l'axe est horaire. */
export const formatFullDate = (date: Date, granularity: DateGranularity): string =>
  granularity === "hour" ? fullFormat.format(date) : granularity === "day" ? dateOnlyFormat.format(date) : monthFormat.format(date);
