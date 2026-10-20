// Fonctions pures de DateRangePicker (internes, non exportées par index.ts).

import { addDays, compareDays, countDays, endOfDay, formatDate, isSameDay, startOfDay } from "./date-utils";

export interface DateRangePreset {
  id: string;
  label: string;
  /** Calcule la période à partir de la date de référence. */
  getRange: (reference: Date) => { start: Date; end: Date };
}

/** Période complète, normalisée : début à 00:00, fin à 23:59:59.999. */
export interface CompleteRange {
  start: Date;
  end: Date;
}

/** Préréglages par défaut, relatifs à la date de référence. */
export const DEFAULT_PRESETS: DateRangePreset[] = [
  { id: "today", label: "Aujourd'hui", getRange: (ref) => ({ start: ref, end: ref }) },
  { id: "yesterday", label: "Hier", getRange: (ref) => ({ start: addDays(ref, -1), end: addDays(ref, -1) }) },
  { id: "last-7-days", label: "7 derniers jours", getRange: (ref) => ({ start: addDays(ref, -6), end: ref }) },
  { id: "last-30-days", label: "30 derniers jours", getRange: (ref) => ({ start: addDays(ref, -29), end: ref }) },
  {
    id: "this-month",
    label: "Ce mois-ci",
    getRange: (ref) => ({ start: new Date(ref.getFullYear(), ref.getMonth(), 1), end: ref }),
  },
  {
    id: "last-month",
    label: "Mois dernier",
    getRange: (ref) => ({
      start: new Date(ref.getFullYear(), ref.getMonth() - 1, 1),
      end: new Date(ref.getFullYear(), ref.getMonth(), 0),
    }),
  },
];

/** Ordonne deux dates et normalise la période en jours entiers. */
export const normalizeRange = (a: Date, b: Date): CompleteRange => {
  const [first, last] = compareDays(a, b) <= 0 ? [a, b] : [b, a];
  return { start: startOfDay(first), end: endOfDay(last) };
};

/** Préréglage qui correspond exactement à la période, au jour près. */
export const findMatchingPreset = (
  range: { start: Date | null; end: Date | null } | undefined,
  presets: DateRangePreset[],
  reference: Date,
): DateRangePreset | undefined => {
  if (!range?.start || !range.end) return undefined;
  const { start, end } = range;
  return presets.find((preset) => {
    const candidate = preset.getRange(reference);
    return isSameDay(candidate.start, start) && isSameDay(candidate.end, end);
  });
};

/** Texte du déclencheur : « 01/10/2026 – 19/10/2026 », ou une seule date. */
export const formatRange = (start: Date, end: Date): string =>
  isSameDay(start, end) ? formatDate(start) : `${formatDate(start)} – ${formatDate(end)}`;

/** Jour trop éloigné du début choisi pour respecter la durée maximale. */
export const exceedsMaxDays = (anchor: Date, date: Date, maxDays?: number): boolean =>
  maxDays !== undefined && countDays(anchor, date) > maxDays;
