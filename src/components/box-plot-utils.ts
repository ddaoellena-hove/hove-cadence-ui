import { quantileSorted } from "d3-array";
import { formatValueWithUnit } from "./chart-format";

// Calculs du BoxPlot (purs, testés) : quartiles, moustaches de Tukey
// (1,5 × écart interquartile), valeurs aberrantes, phrases lues.

export interface BoxStats {
  count: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  /** Extrémités des moustaches : valeurs extrêmes dans [q1 − 1,5 × IQR, q3 + 1,5 × IQR]. */
  lowWhisker: number;
  highWhisker: number;
  /** Valeurs hors des moustaches, triées. */
  outliers: number[];
}

/** Statistiques d'un groupe ; null sans valeur finie. */
export const boxStats = (values: number[]): BoxStats | null => {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const q1 = quantileSorted(sorted, 0.25) ?? sorted[0];
  const median = quantileSorted(sorted, 0.5) ?? sorted[0];
  const q3 = quantileSorted(sorted, 0.75) ?? sorted[0];
  const iqr = q3 - q1;
  const low = q1 - 1.5 * iqr;
  const high = q3 + 1.5 * iqr;
  const inside = sorted.filter((v) => v >= low && v <= high);
  return {
    count: sorted.length,
    min: sorted[0],
    q1,
    median,
    q3,
    max: sorted[sorted.length - 1],
    lowWhisker: inside[0] ?? q1,
    highWhisker: inside[inside.length - 1] ?? q3,
    outliers: sorted.filter((v) => v < low || v > high),
  };
};

/**
 * Phrase lue d'un groupe : « Ligne 13 : médiane 24 min, moitié centrale de
 * 21 à 28 min, de 17 à 33 min hors valeurs aberrantes, 2 valeurs aberrantes,
 * 120 courses. »
 */
export const describeBox = (
  label: string,
  stats: BoxStats | null,
  countLabel: string,
  unit?: string,
  format?: Intl.NumberFormatOptions,
) => {
  if (!stats) return `${label} : aucune valeur`;
  const v = (n: number) => formatValueWithUnit(n, unit, format);
  const outliers = stats.outliers.length;
  return [
    `${label} : médiane ${v(stats.median)}`,
    `moitié centrale de ${v(stats.q1)} à ${v(stats.q3)}`,
    `de ${v(stats.lowWhisker)} à ${v(stats.highWhisker)} hors valeurs aberrantes`,
    outliers ? `${outliers} valeur${outliers > 1 ? "s" : ""} aberrante${outliers > 1 ? "s" : ""}` : "aucune valeur aberrante",
    `${stats.count} ${countLabel}`,
  ].join(", ");
};
