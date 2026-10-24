import { bin, extent, median } from "d3-array";
import { scaleLinear } from "d3-scale";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { formatClock } from "./timeline-utils";

// Calculs de l'Histogram (purs, testés) : classes, libellés et résumé lu par
// les lecteurs d'écran.

export interface HistogramBin {
  x0: number;
  x1: number;
  count: number;
  /** Part de l'effectif total (0 à 1). */
  share: number;
  /** Première classe ouverte (« moins de … ») : elle reçoit les valeurs sous la première borne. */
  openStart: boolean;
  /** Dernière classe ouverte (« … et plus ») : elle reçoit les valeurs au-delà de la dernière borne. */
  openEnd: boolean;
}

/**
 * Classes de l'histogramme. `bins` nombre : environ autant de classes, bornes
 * « rondes » couvrant toutes les valeurs. `bins` tableau : bornes imposées ;
 * les valeurs en dehors rejoignent la première ou la dernière classe, alors
 * ouverte. Valeurs non finies ignorées.
 */
// Pas d'horloge possibles (minutes) pour des classes d'heures de service
const CLOCK_STEPS = [5, 10, 15, 20, 30, 60, 120, 180, 240, 360];

export const buildBins = (values: number[], bins?: number | number[], clock = false): HistogramBin[] => {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return [];

  let data = finite;
  let domain: [number, number];
  let thresholds: number[] | number;
  let lowOutside = false;
  let highOutside = false;

  if (Array.isArray(bins) && bins.length >= 2) {
    const bounds = [...new Set(bins.filter((b) => Number.isFinite(b)))].sort((a, b) => a - b);
    domain = [bounds[0], bounds[bounds.length - 1]];
    lowOutside = finite.some((v) => v < domain[0]);
    highOutside = finite.some((v) => v > domain[1]);
    data = finite.map((v) => Math.min(domain[1], Math.max(domain[0], v)));
    thresholds = bounds.slice(1, -1);
  } else if (clock) {
    // Heures de service : classes alignées sur l'horloge (22h00, 22h30…), pas le plus proche du nombre visé
    const count = typeof bins === "number" && bins > 0 ? Math.round(bins) : Math.ceil(Math.log2(finite.length) + 1);
    const [low, high] = extent(finite) as [number, number];
    const span = Math.max(1, high - low);
    const step = CLOCK_STEPS.reduce((best, s) => (Math.abs(span / s - count) < Math.abs(span / best - count) ? s : best));
    const start = Math.floor(low / step) * step;
    const end = Math.max(start + step, Math.ceil(high / step) * step);
    domain = [start, end];
    thresholds = [];
    for (let t = start + step; t < end; t += step) thresholds.push(t);
  } else {
    const count = typeof bins === "number" && bins > 0 ? Math.round(bins) : Math.ceil(Math.log2(finite.length) + 1);
    const [low, high] = extent(finite) as [number, number];
    const nice = scaleLinear().domain([low, high === low ? low + 1 : high]).nice(count);
    domain = nice.domain() as [number, number];
    thresholds = nice.ticks(count).filter((t) => t > domain[0] && t < domain[1]);
  }

  const raw = bin().domain(domain).thresholds(thresholds)(data);
  return raw.map((b, i) => ({
    x0: b.x0 ?? domain[0],
    x1: b.x1 ?? domain[1],
    count: b.length,
    share: b.length / finite.length,
    openStart: i === 0 && lowOutside,
    openEnd: i === raw.length - 1 && highOutside,
  }));
};

/** Format d'une borne : nombre fr-FR, ou heure de service (« 25h30 ») quand `clock`. */
export const formatBound = (value: number, clock: boolean, unit?: string, format?: Intl.NumberFormatOptions) =>
  clock ? formatClock(value, "time") : formatValueWithUnit(value, unit, format);

/**
 * Libellé d'une classe : « de 2 à 4 min », « moins de 2 min », « 10 min et
 * plus » ; en heures de service : « de 22h00 à 22h30 », « avant 06h00 »,
 * « 25h00 et après ».
 */
export const binLabel = (b: HistogramBin, unit?: string, format?: Intl.NumberFormatOptions, clock = false) => {
  if (b.openStart && b.openEnd) return "Toutes les valeurs";
  if (b.openStart) return `${clock ? "Avant" : "Moins de"} ${formatBound(b.x1, clock, unit, format)}`;
  if (b.openEnd) return `${formatBound(b.x0, clock, unit, format)} et ${clock ? "après" : "plus"}`;
  return `De ${clock ? formatClock(b.x0, "time") : formatKpiValue(b.x0, format)} à ${formatBound(b.x1, clock, unit, format)}`;
};

const percentFormat = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

/** Part en pourcentage fr-FR : « 21,3 % ». */
export const formatBinShare = (share: number) => percentFormat.format(share);

/** Résumé : « 1 240 courses, médiane 2,4 min, classe la plus fournie : de 2 à 4 min (31 %). » */
export const describeHistogram = (
  values: number[],
  bins: HistogramBin[],
  countLabel: string,
  unit?: string,
  format?: Intl.NumberFormatOptions,
  clock = false,
) => {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0 || bins.length === 0) return "Aucune observation.";
  const top = bins.reduce((a, b) => (b.count > a.count ? b : a));
  const mid = median(finite) ?? 0;
  const topLabel = binLabel(top, unit, format, clock);
  return `${formatKpiValue(finite.length, { maximumFractionDigits: 0 })} ${countLabel}, médiane ${formatBound(mid, clock, unit, format)}, classe la plus fournie : ${topLabel.charAt(0).toLowerCase()}${topLabel.slice(1)} (${formatBinShare(top.share)}).`;
};

/**
 * Position en px d'une valeur sur l'axe X : chaque classe occupe la même
 * largeur (classes métier inégales comme [0, 1, 2, 3, 5, 10] lisibles), la
 * valeur est interpolée dans sa classe. Hors bornes : bornée aux extrémités.
 */
export const edgePosition = (edges: number[], value: number, width: number) => {
  if (edges.length < 2) return 0;
  const step = width / (edges.length - 1);
  if (value <= edges[0]) return 0;
  if (value >= edges[edges.length - 1]) return width;
  const i = edges.findIndex((e, k) => k > 0 && value <= e) - 1;
  return (i + (value - edges[i]) / (edges[i + 1] - edges[i])) * step;
};
