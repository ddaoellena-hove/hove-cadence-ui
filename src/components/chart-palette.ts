// Couleurs et formes de marqueurs des séries (internes). Chaque série a une
// couleur ET une forme : le sens ne repose jamais sur la couleur seule.

export type MarkerShape =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "cross"
  | "triangle-down"
  | "star"
  | "ring";

const SHAPES: MarkerShape[] = ["circle", "square", "triangle", "diamond", "cross", "triangle-down", "star", "ring"];

/** Couleur de la série n (0 à 7), par token. */
export const seriesColor = (index: number) => `var(--cadence-dataviz-series-${(index % 8) + 1})`;

/** Forme de marqueur de la série n (0 à 7). */
export const seriesMarker = (index: number): MarkerShape => SHAPES[index % SHAPES.length];

/** Nombre de pas de la rampe séquentielle (--cadence-dataviz-seq-1..7). */
export const SEQ_STEPS = 7;

/** Couleur du pas n (1 à 7) de la rampe séquentielle. */
export const sequentialColor = (step: number) => `var(--cadence-dataviz-seq-${step})`;
