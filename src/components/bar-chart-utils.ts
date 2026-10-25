// Calculs purs de BarChart (internes) : bandes des catégories, sous-bandes
// des séries (groupé), empilement, échelle des valeurs, totaux.

import { max } from "d3-array";
import { scaleBand, scaleLinear } from "d3-scale";
import { stack } from "d3-shape";
import type { BarLayout } from "./chart-types";

export interface BarSeriesInput {
  id: string;
  label: string;
  /** Une valeur par catégorie ; null = pas de donnée. */
  data: (number | null)[];
}

export type { BarLayout } from "./chart-types";

/** Bande de chaque catégorie le long de l'axe des catégories. */
export const buildCategoryScale = (categories: string[], length: number, layout: BarLayout) =>
  scaleBand<string>()
    .domain(categories)
    .range([0, length])
    .paddingInner(layout === "stacked" ? 0.35 : 0.25)
    .paddingOuter(0.2);

/** Sous-bande de chaque série dans une catégorie (barres groupées). */
export const buildSeriesScale = (seriesIds: string[], bandwidth: number) =>
  scaleBand<string>().domain(seriesIds).range([0, bandwidth]).padding(0.12);

/** Bas et haut de chaque barre empilée : [série][catégorie] = [début, fin]. */
export const stackBars = (series: BarSeriesInput[], categories: string[]) => {
  const rows = categories.map((_, c) => Object.fromEntries(series.map((s) => [s.id, s.data[c] ?? 0])));
  return stack<Record<string, number>>().keys(series.map((s) => s.id))(rows).map((layer) =>
    layer.map(([start, end]) => [start, end] as [number, number]),
  );
};

/** Total d'une catégorie (valeurs nulles ignorées). */
export const categoryTotal = (series: BarSeriesInput[], index: number) =>
  series.reduce((sum, s) => sum + (s.data[index] ?? 0), 0);

/** Étend une échelle de valeurs aux séries de référence (traits hors barres), si elles la dépassent. */
export const includeReferences = (scale: ReturnType<typeof scaleLinear<number, number>>, references: BarSeriesInput[]) => {
  const high = max(references.flatMap((r) => r.data.filter((v): v is number => v !== null))) ?? 0;
  return high > scale.domain()[1] ? scale.copy().domain([0, high]).nice(5) : scale;
};

/** Échelle des valeurs : 0 → maximum arrondi (somme des séries si empilé). */
export const buildValueScale = (series: BarSeriesInput[], categories: string[], length: number, layout: BarLayout) => {
  const high =
    layout === "stacked"
      ? (max(categories, (_, c) => categoryTotal(series, c)) ?? 0)
      : (max(series.flatMap((s) => s.data.filter((v): v is number => v !== null))) ?? 0);
  return scaleLinear()
    .domain([0, high > 0 ? high : 1])
    .range([0, length])
    .nice(5);
};
