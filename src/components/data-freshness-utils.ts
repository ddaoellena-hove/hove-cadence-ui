// Logique pure de DataFreshness : conversion de date, niveau de fraîcheur
// selon l'âge, ton de statut associé et libellé relatif compact en français.

export type Freshness = "fresh" | "stale" | "old" | "future";
export type FreshnessTone = "nominal" | "warning" | "critical" | "neutral";

/**
 * Décalage d'horloge toléré (s) : une date jusqu'à une minute dans le futur
 * (horloges serveur et navigateur décalées) compte comme « à l'instant ».
 */
export const CLOCK_SKEW_SECONDS = 60;

/** Normalise une valeur de date ; renvoie `null` si elle est invalide. */
export const toDate = (value: Date | string | number): Date | null => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Niveau de fraîcheur : `fresh` < `freshWithin` ≤ `stale` < `staleWithin` ≤ `old`
 * (en secondes). Au-delà du décalage toléré, une date future est `future` :
 * ni fraîche ni périmée, c'est une donnée à vérifier.
 */
export const freshnessLevel = (ageSeconds: number, freshWithin: number, staleWithin: number): Freshness =>
  ageSeconds < -CLOCK_SKEW_SECONDS ? "future"
    : ageSeconds < freshWithin ? "fresh" : ageSeconds < staleWithin ? "stale" : "old";

const TONE: Record<Freshness, FreshnessTone> = { fresh: "nominal", stale: "warning", old: "critical", future: "neutral" };

/** Ton de statut (tokens `--cadence-status-*`) pour un niveau de fraîcheur. */
export const freshnessTone = (level: Freshness): FreshnessTone => TONE[level];

/**
 * Libellé relatif compact (« à l'instant », « il y a 3 min », « il y a 2 h »,
 * « il y a 4 j »). Au-delà de 7 jours (ou pour une date future au-delà du
 * décalage toléré), renvoie `null` : l'appelant affiche alors la date absolue.
 */
export const formatRelative = (ageSeconds: number): string | null => {
  if (ageSeconds < -CLOCK_SKEW_SECONDS) return null; // date future → date absolue
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
