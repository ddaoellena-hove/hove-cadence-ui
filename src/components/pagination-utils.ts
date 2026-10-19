// Fonctions pures de Pagination (internes, non exportées par index.ts).
// Isolées pour être testées sans DOM.

/** Élément de la liste de pages : un numéro ou une ellipse. */
export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/** Au-delà de ce nombre de pages, des ellipses apparaissent. */
const MAX_VISIBLE_ITEMS = 7;

const numberFormat = new Intl.NumberFormat("fr-FR");

/** Nombre de pages (au moins 1, même sans résultat). */
export const getPageCount = (totalItems: number, pageSize: number): number =>
  Math.max(1, Math.ceil(Math.max(0, totalItems) / Math.max(1, pageSize)));

/** Ramène une page dans les bornes [1, pageCount]. */
export const clampPage = (page: number, pageCount: number): number =>
  Math.min(Math.max(1, Math.floor(page)), pageCount);

/**
 * Liste des pages à afficher : première, dernière, courante ±1, avec des
 * ellipses. La longueur reste fixe (7) pour que les boutons ne sautent pas.
 *   page 5 / 249 → 1 … 4 5 6 … 249
 *   page 2 / 249 → 1 2 3 4 5 … 249
 */
export const getPageItems = (page: number, pageCount: number): PageItem[] => {
  if (pageCount <= MAX_VISIBLE_ITEMS) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const current = clampPage(page, pageCount);
  // Proche du début : 1 2 3 4 5 … n
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", pageCount];
  }
  // Proche de la fin : 1 … n-4 n-3 n-2 n-1 n
  if (current >= pageCount - 3) {
    return [1, "ellipsis-start", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }
  return [1, "ellipsis-start", current - 1, current, current + 1, "ellipsis-end", pageCount];
};

/** Nombre formaté à la française (séparateur de milliers insécable). */
export const formatNumber = (value: number): string => numberFormat.format(value);

/** Plage affichée : « 1–50 sur 12 430 », ou « 0 résultat » si vide. */
export const formatRange = (page: number, pageSize: number, totalItems: number): string => {
  if (totalItems <= 0) return "0 résultat";
  const pageCount = getPageCount(totalItems, pageSize);
  const current = clampPage(page, pageCount);
  const start = (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, totalItems);
  return `${formatNumber(start)}–${formatNumber(end)} sur ${formatNumber(totalItems)}`;
};
