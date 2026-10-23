/**
 * Utilitaires purs de Timeline et JourneyTimeline : conversion des bornes
 * (Date ou heure de service « HH:mm » jusqu'à 47:59) en minutes, formats
 * fr-FR (« 08h15 », « 40 min », « Jeu. 11/06/2026 »), graduations alignées sur
 * l'horloge et échelles.
 */
import { parseTime } from "./time-picker-utils";
import type { PatternKind } from "./chart-palette";
import type { IndicatorVariant } from "./Indicator";

export type TimeValue = Date | string;

/** "date" : bornes en Date (minutes depuis l'époque) ; "time" : heures de service (minutes depuis 00:00). */
export type TimeMode = "date" | "time";

export const isDateValue = (v: TimeValue): v is Date => v instanceof Date;

/** Mode d'un jeu de bornes : "date" dès qu'une borne est une Date. */
export const modeOf = (values: TimeValue[]): TimeMode => (values.some(isDateValue) ? "date" : "time");

/** Valeur en minutes : depuis l'époque (Date) ou depuis 00:00 du jour de service (« HH:mm »). */
export const toMinutes = (v: TimeValue, allowOvernight: boolean): number =>
  isDateValue(v) ? v.getTime() / 60000 : parseTime(v, allowOvernight) ?? 0;

const pad = (n: number) => String(n).padStart(2, "0");

/** Heure au format horaire fr-FR : « 08h15 » (« 25h30 » après minuit en heures de service). */
export const formatClock = (minutes: number, mode: TimeMode): string => {
  if (mode === "date") {
    const d = new Date(Math.round(minutes) * 60000);
    return `${pad(d.getHours())}h${pad(d.getMinutes())}`;
  }
  const m = Math.round(minutes);
  return `${pad(Math.floor(m / 60))}h${pad(m % 60)}`;
};

/** Durée : « 40 min », « 1 h 05 », « 11 h ». */
export const formatDuration = (minutes: number): string => {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const rest = m % 60;
  return rest ? `${Math.floor(m / 60)} h ${pad(rest)}` : `${Math.floor(m / 60)} h`;
};

const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });

/** Jour : « Jeu. 11/06/2026 ». */
export const formatDay = (minutes: number): string => {
  const s = dayFmt.format(new Date(Math.round(minutes) * 60000));
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Fenêtre affichée : « Jeu. 11/06/2026 07h55 → 08h35 » (date) ou « 07h55 → 08h35 » (service). */
export const formatWindow = (min: number, max: number, mode: TimeMode): string => {
  if (mode === "time") return `${formatClock(min, mode)} → ${formatClock(max, mode)}`;
  const startDay = formatDay(min);
  const endDay = formatDay(max);
  return `${startDay} ${formatClock(min, mode)} → ${endDay === startDay ? "" : `${endDay} `}${formatClock(max, mode)}`;
};

/** Pas de graduation possibles (minutes) et pas « majeur » associé (graduation en gras). */
const STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 180, 360, 720, 1440];
const MAJOR: Record<number, number> = {
  1: 5, 2: 10, 5: 15, 10: 30, 15: 60, 30: 60, 60: 180, 120: 360, 180: 360, 360: 1440, 720: 1440, 1440: 1440,
};

/** Plus petit pas qui laisse au moins `minGap` px entre deux graduations. */
export const pickTickStep = (pxPerMinute: number, minGap = 56): number =>
  STEPS.find((s) => s * pxPerMinute >= minGap) ?? STEPS[STEPS.length - 1];

/** Graduations alignées sur l'horloge locale (08h00, 08h05…), `major` aux multiples du pas majeur. */
export const clockTicks = (min: number, max: number, step: number, mode: TimeMode): { value: number; major: boolean }[] => {
  // En mode date, minutes UTC → minutes locales (décalage pris au début de la fenêtre).
  const offset = mode === "date" ? new Date(min * 60000).getTimezoneOffset() : 0;
  const major = MAJOR[step] ?? step;
  const first = Math.ceil((min - offset) / step - 1e-9) * step;
  const ticks: { value: number; major: boolean }[] = [];
  for (let t = first; t <= max - offset + 1e-9 && ticks.length < 500; t += step) {
    ticks.push({ value: t + offset, major: Math.round(t) % major === 0 });
  }
  return ticks;
};

/** Fenêtre arrondie au pas (défaut 5 min) : bornes lisibles sur l'axe. */
export const roundWindow = (min: number, max: number, step = 5): [number, number] => {
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  return [lo, hi > lo ? hi : lo + step];
};

/** Libellé d'une échelle (durée visible dans la largeur) : « 1 h », « 30 min ». */
export const scaleLabel = (minutes: number): string =>
  minutes >= 60 && minutes % 60 === 0 ? `${minutes / 60} h` : `${minutes} min`;

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
