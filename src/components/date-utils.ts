// Fonctions de date partagées par DatePicker et DateRangePicker (internes,
// non exportées par index.ts). Dates locales au navigateur.

/** Jours de la semaine française, commençant le lundi. */
export const WEEKDAYS = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

export const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const longDateFormat = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Majuscule initiale pour l'affichage (« janvier » → « Janvier »). */
export const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Début du jour (00:00:00.000). */
export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Fin du jour (23:59:59.999). */
export const endOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** Même jour du mois décalé, borné au dernier jour du mois cible (31/01 + 1 → 28/02). */
export const addMonths = (date: Date, months: number): Date => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
};

/** Comparaison au jour près : négatif si a est avant b. */
export const compareDays = (a: Date, b: Date): number => startOfDay(a).getTime() - startOfDay(b).getTime();

/** Nombre de jours de la période, bornes incluses (01/10 → 01/10 = 1). */
export const countDays = (start: Date, end: Date): number =>
  Math.round(Math.abs(compareDays(end, start)) / 86_400_000) + 1;

/** Clé stable d'un jour (« 2026-10-19 »), utilisée pour retrouver le bouton à focaliser. */
export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** Format français : JJ/MM/AAAA (+ HH:mm si withTime). */
export const formatDate = (date: Date, withTime = false): string => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  if (withTime) {
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Cases de saisie d'une date : [JJ, MM, AAAA] (+ [HH, mm] si withTime).
 * Vides pour une valeur absente.
 */
export const dateToParts = (date: Date | null, withTime = false): string[] => {
  if (!date) return withTime ? ["", "", "", "", ""] : ["", "", ""];
  const parts = [String(date.getDate()).padStart(2, "0"), String(date.getMonth() + 1).padStart(2, "0"), String(date.getFullYear())];
  return withTime ? [...parts, String(date.getHours()).padStart(2, "0"), String(date.getMinutes()).padStart(2, "0")] : parts;
};

/**
 * Cases saisies → Date, ou null si la date n'existe pas (31/02, mois 13…),
 * si l'année n'a pas 4 chiffres ou si l'heure est hors 00:00–23:59.
 */
export const partsToDate = (parts: string[], withTime = false): Date | null => {
  const [dd, mm, yyyy, hh = "0", min = "0"] = parts;
  if (!/^\d{1,2}$/.test(dd) || !/^\d{1,2}$/.test(mm) || !/^\d{4}$/.test(yyyy)) return null;
  if (withTime && (!/^\d{1,2}$/.test(hh) || !/^\d{1,2}$/.test(min))) return null;
  const [day, month, year, hour, minute] = [dd, mm, yyyy, hh, min].map(Number);
  if (hour > 23 || minute > 59) return null;
  const date = new Date(year, month - 1, day, withTime ? hour : 0, withTime ? minute : 0);
  // Date roulée (31/02 → 03/03) : la date saisie n'existe pas
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
};

/** Texte collé « 12/06/2026 » (+ « 14:30 ») → cases, ou null s'il ne correspond pas. */
export const parseDateText = (text: string, withTime = false): string[] | null => {
  const match = text.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:[ T]+(\d{1,2})[:h](\d{2}))?$/);
  if (!match) return null;
  const [, dd, mm, yyyy, hh, min] = match;
  const parts = [dd.padStart(2, "0"), mm.padStart(2, "0"), yyyy];
  if (!withTime) return parts;
  return [...parts, (hh ?? "").padStart(hh ? 2 : 0, "0"), min ?? ""];
};

/** Date en toutes lettres pour les lecteurs d'écran : « lundi 19 octobre 2026 ». */
export const formatLongDate = (date: Date): string => longDateFormat.format(date);

/** Libellé du mois affiché : « Octobre 2026 ». */
export const formatMonthLabel = (year: number, month: number): string => `${capitalize(MONTHS[month])} ${year}`;

/**
 * Semaines du mois, du lundi au dimanche. Les cases hors du mois sont
 * complétées avec les jours des mois voisins.
 */
export const buildWeeks = (year: number, month: number): Date[][] => {
  // getDay() renvoie 0 pour dimanche : on décale pour une semaine qui commence le lundi
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Date[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(new Date(year, month, -firstDay + 1 + i));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push(new Date(year, month + 1, d));
    }
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
};

/** Jour hors des bornes (comparaison au jour près). */
export const isOutsideBounds = (date: Date, minDate?: Date, maxDate?: Date): boolean =>
  (minDate !== undefined && compareDays(date, minDate) < 0) ||
  (maxDate !== undefined && compareDays(date, maxDate) > 0);

/**
 * Déplacement clavier dans un calendrier : flèches (jour / semaine),
 * Début / Fin (lundi / dimanche), Page préc. / suiv. (mois).
 * Renvoie null pour une touche non gérée.
 */
export const getKeyboardTarget = (date: Date, key: string): Date | null => {
  const weekday = (date.getDay() + 6) % 7;
  switch (key) {
    case "ArrowLeft":
      return addDays(date, -1);
    case "ArrowRight":
      return addDays(date, 1);
    case "ArrowUp":
      return addDays(date, -7);
    case "ArrowDown":
      return addDays(date, 7);
    case "Home":
      return addDays(date, -weekday);
    case "End":
      return addDays(date, 6 - weekday);
    case "PageUp":
      return addMonths(date, -1);
    case "PageDown":
      return addMonths(date, 1);
    default:
      return null;
  }
};
