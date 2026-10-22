// Calculs purs de LineChart (internes) : abscisses, échelles, empilement,
// seuils, annotations, point le plus proche. Rendu SVG dans LineChart.tsx.

import { bisector, max, min } from "d3-array";
import { scaleLinear, scalePoint, scaleTime } from "d3-scale";
import { stack } from "d3-shape";
import { formatAxisDate, getDateGranularity, type DateGranularity, type GoodDirection } from "./chart-format";

export type ChartX = Date | string;

export interface LinePoint {
  x: ChartX;
  y: number | null;
}

export interface LineSeriesInput {
  id: string;
  label: string;
  data: LinePoint[];
}

/** Clé stable d'une abscisse (timestamp ou catégorie). */
export const xKey = (x: ChartX) => (x instanceof Date ? String(x.getTime()) : x);

/** Abscisses communes à toutes les séries, triées (dates) ou dans l'ordre d'apparition (catégories). */
export const collectXs = (series: LineSeriesInput[]): ChartX[] => {
  const seen = new Map<string, ChartX>();
  for (const s of series) for (const p of s.data) if (!seen.has(xKey(p.x))) seen.set(xKey(p.x), p.x);
  const xs = [...seen.values()];
  return isTimeAxis(xs) ? (xs as Date[]).sort((a, b) => a.getTime() - b.getTime()) : xs;
};

export const isTimeAxis = (xs: ChartX[]) => xs.length > 0 && xs.every((x) => x instanceof Date);

/** Valeur d'une série à une abscisse (null si absente). */
export const valueAt = (series: LineSeriesInput, x: ChartX): number | null =>
  series.data.find((p) => xKey(p.x) === xKey(x))?.y ?? null;

export interface XScale {
  /** Position en px d'une abscisse. */
  position: (x: ChartX) => number;
  time: boolean;
  granularity: DateGranularity;
}

export const buildXScale = (xs: ChartX[], width: number): XScale => {
  if (isTimeAxis(xs)) {
    const dates = xs as Date[];
    const first = dates[0];
    const last = dates[dates.length - 1];
    const scale = scaleTime().domain([first, last]).range([0, width]);
    return { position: (x) => scale(x as Date), time: true, granularity: getDateGranularity(first, last) };
  }
  const scale = scalePoint<string>().domain(xs as string[]).range([0, width]).padding(0.5);
  return { position: (x) => scale(x as string) ?? 0, time: false, granularity: "day" };
};

/** Graduations de l'axe X : ~1 étiquette tous les 90px. */
export const buildXTicks = (xs: ChartX[], scale: XScale, width: number) => {
  if (xs.length === 0) return [];
  const count = Math.max(2, Math.floor(width / 90));
  if (scale.time) {
    const dates = xs as Date[];
    const time = scaleTime().domain([dates[0], dates[dates.length - 1]]);
    // Ticks de jour à minuit en granularité jour, d'heure ronde en granularité heure
    return time.ticks(count).map((date) => ({
      key: String(date.getTime()),
      position: scale.position(date),
      label: formatAxisDate(date, scale.granularity),
    }));
  }
  const step = Math.ceil(xs.length / count);
  return xs
    .filter((_, i) => i % step === 0)
    .map((x) => ({ key: xKey(x), position: scale.position(x), label: String(x) }));
};

/** Séries empilées : [bas, haut] de chaque série à chaque abscisse (valeurs nulles = 0). */
export const stackSeries = (series: LineSeriesInput[], xs: ChartX[]) => {
  const rows = xs.map((x) => Object.fromEntries(series.map((s) => [s.id, valueAt(s, x) ?? 0])));
  return stack<Record<string, number>>().keys(series.map((s) => s.id))(rows).map((layer) =>
    layer.map(([y0, y1]) => [y0, y1] as [number, number]),
  );
};

/** Échelle Y : 0 → max arrondi (ou yDomain), incluant les seuils. */
export const buildYScale = (
  series: LineSeriesInput[],
  xs: ChartX[],
  height: number,
  options: { stacked?: boolean; yDomain?: [number, number]; thresholds?: number[] },
) => {
  let domain: [number, number];
  if (options.yDomain) {
    domain = options.yDomain;
  } else {
    const values = options.stacked
      ? stackSeries(series, xs).flatMap((layer) => layer.map(([, y1]) => y1))
      : series.flatMap((s) => s.data.map((p) => p.y).filter((y): y is number => y !== null));
    const all = [...values, ...(options.thresholds ?? [])];
    const low = Math.min(0, min(all) ?? 0);
    const high = max(all) ?? 1;
    domain = [low, high === low ? low + 1 : high];
  }
  const scale = scaleLinear().domain(domain).range([height, 0]);
  return options.yDomain ? scale : scale.nice(5);
};

/** Le point est-il du côté défavorable du seuil ? « down » : au-dessus ; « up » : en dessous. */
export const breachesThreshold = (value: number | null, threshold: number, goodDirection: GoodDirection) => {
  if (value === null || goodDirection === "neutral") return false;
  return goodDirection === "down" ? value > threshold : value < threshold;
};

export interface ResolvedAnnotation {
  label: string;
  /** Trait vertical (x1 === x0) ou bande [x0, x1], bornés à la zone de tracé. */
  x0: number;
  x1: number;
  band: boolean;
}

/** Positions des annotations ; celles hors de la période sont ignorées. */
export const resolveAnnotations = (
  annotations: { at: ChartX | [ChartX, ChartX]; label: string }[],
  scale: XScale,
  width: number,
): ResolvedAnnotation[] =>
  annotations
    .map(({ at, label }) => {
      const [start, end] = Array.isArray(at) ? at : [at, at];
      const a = scale.position(start);
      const b = scale.position(end);
      const x0 = Math.max(0, Math.min(a, b));
      const x1 = Math.min(width, Math.max(a, b));
      return { label, x0, x1, band: Array.isArray(at) };
    })
    .filter((a) => Number.isFinite(a.x0) && Number.isFinite(a.x1) && a.x1 >= 0 && a.x0 <= width && a.x0 <= a.x1);

/** Index de l'abscisse la plus proche d'une position en px. */
export const nearestIndex = (positions: number[], px: number) => {
  if (positions.length === 0) return -1;
  const i = bisector((p: number) => p).center(positions, px);
  return Math.max(0, Math.min(positions.length - 1, i));
};
