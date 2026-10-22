// Fonctions pures de Card (internes, non exportées par index.ts). Le
// formatage fr-FR vit dans chart-format.ts, partagé avec les graphiques.

export {
  describeDelta,
  formatDelta,
  formatKpiValue,
  getDeltaTone,
  type DeltaTone as KpiDeltaTone,
  type DeltaUnit as KpiDeltaUnit,
  type GoodDirection as KpiGoodDirection,
} from "./chart-format";

/**
 * Tracé SVG d'une mini-courbe dans une boîte width × height, avec une marge
 * pour que le trait ne soit pas coupé. Une série plate est centrée.
 */
export const buildSparklinePoints = (
  values: number[],
  width: number,
  height: number,
  padding = 2,
): { x: number; y: number }[] => {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
  const round = (n: number) => Math.round(n * 100) / 100;
  return values.map((v, i) => ({
    x: round(padding + i * stepX),
    y: round(span === 0 ? height / 2 : padding + (1 - (v - min) / span) * (height - padding * 2)),
  }));
};
