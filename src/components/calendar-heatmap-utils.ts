// Calculs du CalendarHeatmap (purs, testés) : jours de la période rangés en
// semaines (lundi en tête), étiquettes de mois, clés de jour.

export type DayInput = Date | string;

export interface CalendarDay {
  /** « 2026-10-14 » */
  key: string;
  date: Date;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Jour local à minuit, depuis une Date ou une chaîne « AAAA-MM-JJ » (sans décalage de fuseau). */
export const toDay = (value: DayInput): Date => {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const parsed = new Date(value);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

/** Clé « AAAA-MM-JJ » d'un jour local. */
export const dayKey = (value: DayInput) => {
  const d = toDay(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Rang du jour dans la semaine, lundi = 0 … dimanche = 6. */
export const weekdayIndex = (date: Date) => (date.getDay() + 6) % 7;

/**
 * Semaines (colonnes) couvrant [start, end] : 7 cases du lundi au dimanche,
 * `null` hors de la période (début de la première semaine, fin de la dernière).
 */
export const buildWeeks = (start: DayInput, end: DayInput): (CalendarDay | null)[][] => {
  const first = toDay(start);
  const last = toDay(end);
  if (last < first) return [];
  const cursor = new Date(first);
  cursor.setDate(cursor.getDate() - weekdayIndex(cursor));
  const weeks: (CalendarDay | null)[][] = [];
  while (cursor <= last) {
    const week: (CalendarDay | null)[] = [];
    for (let i = 0; i < 7; i += 1) {
      week.push(cursor >= first && cursor <= last ? { key: dayKey(cursor), date: new Date(cursor) } : null);
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
};

const monthFormat = new Intl.DateTimeFormat("fr-FR", { month: "short" });

/** Étiquette de mois sur la semaine qui contient le 1er du mois (ou la première de la période). */
export const monthLabels = (weeks: (CalendarDay | null)[][]) => {
  const labels: { col: number; label: string }[] = [];
  let previous = -1;
  weeks.forEach((week, col) => {
    const day = week.find((d) => d !== null && (d.date.getDate() === 1 || (col === 0 && labels.length === 0)));
    const month = day?.date.getMonth();
    if (day && month !== previous) {
      labels.push({ col, label: monthFormat.format(day.date) });
      previous = month ?? previous;
    }
  });
  return labels;
};

/** Période par défaut : l'année civile du jour le plus récent (aujourd'hui sans donnée). */
export const defaultYearRange = (days: DayInput[]): [Date, Date] => {
  const latest = days.length ? days.map(toDay).reduce((a, b) => (b > a ? b : a)) : new Date();
  return [new Date(latest.getFullYear(), 0, 1), new Date(latest.getFullYear(), 11, 31)];
};

const fullDate = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/** « mercredi 14 octobre 2026 » */
export const formatDayLong = (date: Date) => fullDate.format(date);

/** Taille d'une case carrée selon la largeur disponible : bornée à [8, 18] px. */
export const cellSize = (width: number, weeks: number, labelColumn = 40, gap = 2) =>
  weeks === 0 ? 12 : Math.max(8, Math.min(18, Math.floor((width - labelColumn) / weeks) - gap));
