// Calculs purs de Heatmap (internes) : classes de la rampe, index des
// cellules, déplacement du focus dans la grille.

import { max } from "d3-array";
import { scaleQuantize } from "d3-scale";
import { SEQ_STEPS } from "./chart-palette";

export interface HeatmapCellInput {
  x: string;
  y: string;
  value: number | null;
}

/** Domaine de la rampe : [0, max] par défaut. */
export const heatmapDomain = (cells: HeatmapCellInput[], domain?: [number, number]): [number, number] => {
  if (domain) return domain;
  const high = max(cells, (c) => c.value ?? undefined) ?? 0;
  return [0, high > 0 ? high : 1];
};

/** Pas de la rampe (1 à 7) d'une valeur ; null pour une cellule sans donnée. */
export const buildStepScale = ([low, high]: [number, number]) => {
  const scale = scaleQuantize<number>()
    .domain([low, high])
    .range(Array.from({ length: SEQ_STEPS }, (_, i) => i + 1));
  return (value: number | null) => (value === null ? null : scale(Math.min(high, Math.max(low, value))));
};

/** Les 7 classes de la légende : bornes [début, fin[ de chaque pas. */
export const rampThresholds = ([low, high]: [number, number]) =>
  Array.from({ length: SEQ_STEPS }, (_, i) => {
    const size = (high - low) / SEQ_STEPS;
    return { step: i + 1, from: low + size * i, to: low + size * (i + 1) };
  });

/** Index des cellules par « y|x ». */
export const indexCells = (cells: HeatmapCellInput[]) => new Map(cells.map((c) => [`${c.y}|${c.x}`, c]));

export interface GridPosition {
  row: number;
  col: number;
}

/** Nouvelle position après une touche (flèches, Début / Fin, Ctrl+Début / Fin) ; null si la touche n'est pas gérée. */
export const moveInGrid = (
  { row, col }: GridPosition,
  key: string,
  ctrl: boolean,
  rows: number,
  cols: number,
): GridPosition | null => {
  switch (key) {
    case "ArrowRight":
      return { row, col: Math.min(cols - 1, col + 1) };
    case "ArrowLeft":
      return { row, col: Math.max(0, col - 1) };
    case "ArrowDown":
      return { row: Math.min(rows - 1, row + 1), col };
    case "ArrowUp":
      return { row: Math.max(0, row - 1), col };
    case "Home":
      return ctrl ? { row: 0, col: 0 } : { row, col: 0 };
    case "End":
      return ctrl ? { row: rows - 1, col: cols - 1 } : { row, col: cols - 1 };
    default:
      return null;
  }
};

/** Une étiquette de colonne sur `every` quand la place manque (~28px par étiquette). */
export const columnLabelEvery = (plotWidth: number, cols: number, minLabelWidth = 32) =>
  cols === 0 ? 1 : Math.max(1, Math.ceil(minLabelWidth / (plotWidth / cols)));
