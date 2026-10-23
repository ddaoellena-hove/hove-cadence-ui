/**
 * Utilitaires purs de Timeline : conversion des bornes (Date ou heure de
 * service « HH:mm » jusqu'à 47:59), échelle et graduations.
 */
import { parseTime, formatTime } from "./time-picker-utils";
import type { PatternKind } from "./chart-palette";
import type { IndicatorVariant } from "./Indicator";

export type TimeValue = Date | string;

export const isDateValue = (v: TimeValue): v is Date => v instanceof Date;

/** Valeur numérique : ms (Date) ou minutes de service (chaîne « HH:mm »). */
export const toNumber = (v: TimeValue, allowOvernight: boolean): number =>
  isDateValue(v) ? v.getTime() : parseTime(v, allowOvernight) ?? 0;

const dateFmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** Étiquette d'une valeur selon le mode (date → fr-FR HH:mm, service → HH:mm). */
export const formatValue = (value: number, mode: "date" | "time"): string =>
  mode === "date" ? dateFmt.format(new Date(value)) : formatTime(value);

/** `count` graduations réparties uniformément sur [min, max]. */
export const buildTicks = (min: number, max: number, count: number): { key: string; value: number }[] => {
  if (max <= min || count < 2) return [{ key: "0", value: min }];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const value = min + step * i;
    return { key: String(i), value };
  });
};

/**
 * Motif associé à un `tone` (statut), pour doubler la couleur (lisible en
 * daltonisme et en niveaux de gris).
 */
const TONE_PATTERN: Partial<Record<IndicatorVariant, PatternKind>> = {
  active: "solid",
  upcoming: "diagonal",
  completed: "horizontal",
  draft: "grid",
  warning: "diagonal-back",
  info: "vertical",
  critical: "cross",
  nominal: "dots",
};

export const tonePattern = (tone: IndicatorVariant | undefined): PatternKind =>
  (tone && TONE_PATTERN[tone]) || "solid";

/** Couleur de remplissage d'un `tone` (token de statut) ou série dataviz. */
export const toneColor = (tone: IndicatorVariant | undefined): string =>
  tone ? `var(--cadence-status-${tone}-fg)` : "var(--cadence-dataviz-series-1)";
