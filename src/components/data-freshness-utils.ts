// Logique pure de DataFreshness : conversion de date, niveau de fraîcheur
// selon l'âge, ton de statut associé et libellé relatif compact en français.

export type Freshness = "fresh" | "stale" | "old";
export type FreshnessTone = "nominal" | "warning" | "critical";

/** Normalise une valeur de date ; renvoie `null` si elle est invalide. */
export const toDate = (value: Date | string | number): Date | null => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Niveau de fraîcheur : `fresh` < `freshWithin` ≤ `stale` < `staleWithin` ≤ `old` (en secondes). */
export const freshnessLevel = (ageSeconds: number, freshWithin: number, staleWithin: number): Freshness =>
  ageSeconds < freshWithin ? "fresh" : ageSeconds < staleWithin ? "stale" : "old";

const TONE: Record<Freshness, FreshnessTone> = { fresh: "nominal", stale: "warning", old: "critical" };

/** Ton de statut (tokens `--cadence-status-*`) pour un niveau de fraîcheur. */
export const freshnessTone = (level: Freshness): FreshnessTone => TONE[level];

/**
 * Libellé relatif compact (« à l'instant », « il y a 3 min », « il y a 2 h »,
 * « il y a 4 j »). Au-delà de 7 jours (ou pour une date future), renvoie
 * `null` : l'appelant affiche alors la date absolue.
 */
export const formatRelative = (ageSeconds: number): string | null => {
  if (ageSeconds < 0) return null; // date future → date absolue
  if (ageSeconds < 45) return "à l'instant";
  if (ageSeconds < 90) return "il y a 1 min";
  const minutes = Math.round(ageSeconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `il y a ${days} j`;
  return null;
};
