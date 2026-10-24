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

/** Couleur d'une série de référence (période précédente, semaine type) : ardoise neutre. */
export const REFERENCE_COLOR = "var(--cadence-dataviz-series-8, #55606e)";

/** Index de palette d'une série parmi les séries hors référence (les références ne consomment pas de couleur). */
export const paletteIndex = (series: { reference?: boolean }[], i: number) => series.slice(0, i).filter((s) => !s.reference).length;

/** Forme de marqueur de la série n (0 à 7). */
export const seriesMarker = (index: number): MarkerShape => SHAPES[index % SHAPES.length];

/** Nombre de pas de la rampe séquentielle (--cadence-dataviz-seq-1..7). */
export const SEQ_STEPS = 7;

/** Couleur du pas n (1 à 7) de la rampe séquentielle. */
export const sequentialColor = (step: number) => `var(--cadence-dataviz-seq-${step})`;

// Motifs des barres (ChartPattern) : série 1 unie, puis une texture par série
export type PatternKind = "solid" | "diagonal" | "dots" | "horizontal" | "diagonal-back" | "vertical" | "grid" | "cross";

const PATTERNS: PatternKind[] = ["solid", "diagonal", "dots", "horizontal", "diagonal-back", "vertical", "grid", "cross"];

/** Motif de la série n (0 à 7). */
export const seriesPattern = (index: number): PatternKind => PATTERNS[index % PATTERNS.length];

/** Identifiant SVG valide à partir d'un useId React. */
export const svgId = (raw: string) => raw.replace(/[^a-zA-Z0-9_-]/g, "");
