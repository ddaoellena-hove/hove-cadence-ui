// Fonctions pures de DataTable (internes, non exportées par index.ts).
// Isolées pour être testées sans DOM ni TanStack.

/** Valeur triable renvoyée par une colonne. */
export type DataTableValue = string | number | Date | boolean | null | undefined;

/** Tri d'une colonne. */
export interface DataTableSort {
  id: string;
  desc: boolean;
}

/** État de la case « Tout sélectionner ». */
export type HeaderCheckboxState = "unchecked" | "checked" | "indeterminate";

// ── Tri ──────────────────────────────────────────────────────────────────────

// « Ligne 2 » avant « Ligne 10 », sans tenir compte de la casse ni des accents
const collator = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

const toComparable = (value: DataTableValue): number | string => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "boolean") return value ? 1 : 0;
  return value as number | string;
};

/**
 * Comparaison ascendante de deux valeurs non vides (le sens descendant et
 * le placement des valeurs vides sont gérés par l'appelant).
 */
export const compareValues = (a: DataTableValue, b: DataTableValue): number => {
  const left = toComparable(a);
  const right = toComparable(b);
  if (typeof left === "number" && typeof right === "number") return left - right;
  return collator.compare(String(left), String(right));
};

/**
 * Cycle de tri d'une colonne : aucun → croissant → décroissant → aucun.
 * Sans `multi`, la colonne remplace le tri existant ; avec `multi`
 * (Maj+clic), elle est ajoutée, modifiée ou retirée du tri multi-colonnes.
 */
export const toggleSort = (sort: DataTableSort[], id: string, multi: boolean): DataTableSort[] => {
  const existing = sort.find((s) => s.id === id);
  // Prochain état de la colonne : null = retirée du tri
  const next: DataTableSort | null = !existing
    ? { id, desc: false }
    : !existing.desc
      ? { id, desc: true }
      : null;

  if (!multi) return next ? [next] : [];
  if (!existing) return [...sort, next as DataTableSort];
  return next ? sort.map((s) => (s.id === id ? next : s)) : sort.filter((s) => s.id !== id);
};

// ── Sélection ────────────────────────────────────────────────────────────────

/** État de la case d'en-tête par rapport aux lignes affichées. */
export const getHeaderCheckboxState = (
  displayedIds: string[],
  selected: ReadonlySet<string>,
): HeaderCheckboxState => {
  if (displayedIds.length === 0) return "unchecked";
  const count = displayedIds.filter((id) => selected.has(id)).length;
  if (count === 0) return "unchecked";
  return count === displayedIds.length ? "checked" : "indeterminate";
};

/** Coche ou décoche un ensemble d'ids, en conservant l'ordre existant. */
export const setIdsSelected = (selectedIds: string[], ids: string[], checked: boolean): string[] => {
  if (checked) {
    const present = new Set(selectedIds);
    return [...selectedIds, ...ids.filter((id) => !present.has(id))];
  }
  const removed = new Set(ids);
  return selectedIds.filter((id) => !removed.has(id));
};

/**
 * Ids de la plage entre l'ancre (dernière case cliquée) et la cible, dans
 * l'ordre affiché. Sans ancre affichée, la plage se réduit à la cible.
 */
export const getRangeIds = (displayedIds: string[], anchorId: string | null, targetId: string): string[] => {
  const targetIndex = displayedIds.indexOf(targetId);
  const anchorIndex = anchorId === null ? -1 : displayedIds.indexOf(anchorId);
  if (targetIndex === -1) return [];
  if (anchorIndex === -1) return [targetId];
  const [start, end] = anchorIndex < targetIndex ? [anchorIndex, targetIndex] : [targetIndex, anchorIndex];
  return displayedIds.slice(start, end + 1);
};

// ── Rendu par défaut ─────────────────────────────────────────────────────────

const numberFormat = new Intl.NumberFormat("fr-FR");
const pad = (n: number) => String(n).padStart(2, "0");

/** Rendu texte par défaut d'une valeur de cellule. */
export const formatCellValue = (value: DataTableValue): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return numberFormat.format(value);
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  if (value instanceof Date) {
    return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
  }
  return value;
};
