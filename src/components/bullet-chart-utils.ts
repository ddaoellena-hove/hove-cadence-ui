import { formatValueWithUnit } from "./chart-format";
import { evaluateThresholds, thresholdStatus, type ThresholdTone, type ValueThreshold } from "./threshold-utils";

// Calculs du BulletChart (purs, testés) : échelle d'une ligne, plages
// qualitatives et phrases lues par les lecteurs d'écran.

export type BulletDirection = "up" | "down" | "neutral";

export interface BulletBand {
  from: number;
  to: number;
  tone: ThresholdTone;
}

/**
 * Bornes de l'échelle d'une ligne : [`min`, `max`], étendues si la valeur,
 * l'objectif ou une borne de plage en sort (le nombre réel n'est jamais
 * tronqué). Une échelle de 80 à 100 % donne de la place aux plages serrées.
 */
export const bulletScale = (min: number, max: number, value: number, target?: number, ranges: ValueThreshold[] = []): [number, number] => {
  const points = [value, ...(target !== undefined ? [target] : []), ...ranges.map((r) => r.value)].filter((v) => Number.isFinite(v));
  const low = Math.min(Number.isFinite(min) ? min : 0, ...points);
  const high = Math.max(Number.isFinite(max) ? max : 0, ...points);
  return [low, high > low ? high : low + 1];
};

/**
 * Plages qualitatives entre `low` et `high`, délimitées par les bornes de
 * `ranges` et jugées comme `Gauge` : `up` → défavorable, intermédiaire(s),
 * favorable ; `down` → l'inverse. Sans borne ou `neutral` : une plage neutre.
 */
export const bulletBands = (ranges: ValueThreshold[] | undefined, [low, high]: [number, number], dir: BulletDirection): BulletBand[] => {
  const bounds = (ranges ?? [])
    .map((r) => r.value)
    .filter((v) => Number.isFinite(v) && v > low && v < high)
    .sort((a, b) => a - b);
  if (dir === "neutral" || bounds.length === 0) return [{ from: low, to: high, tone: "neutral" }];
  const edges = [low, ...bounds, high];
  const last = edges.length - 2;
  return edges.slice(0, -1).map((from, i) => {
    const worst = dir === "up" ? i === 0 : i === last;
    const best = dir === "up" ? i === last : i === 0;
    return { from, to: edges[i + 1], tone: best ? "success" : worst ? "danger" : "warning" };
  });
};

/** Statut écrit d'une ligne : « Favorable — Bonus dès 92 % », ou null sans plage. */
export const bulletStatus = (value: number, ranges: ValueThreshold[] | undefined, dir: BulletDirection, unit?: string, format?: Intl.NumberFormatOptions) => {
  if (!Number.isFinite(value)) return { tone: "neutral" as const, status: null };
  const { tone, label } = evaluateThresholds(value, ranges, dir);
  if (tone === "warning") {
    const bounds = [...(ranges ?? [])].filter(r => Number.isFinite(r.value)).sort((a, b) => a.value - b.value);
    const lower = [...bounds].reverse().find(r => dir === "down" ? r.value < value : r.value <= value);
    const upper = bounds.find(r => dir === "down" ? r.value >= value : r.value > value);
    if (lower && upper) return { tone, status: `Intermédiaire — entre ${formatValueWithUnit(lower.value, unit, format)} et ${formatValueWithUnit(upper.value, unit, format)}` };
  }
  return { tone, status: thresholdStatus(tone, label) };
};

/** Nom accessible d'une ligne : « Ponctualité : 91,2 %, objectif 92 %, Intermédiaire — … ». */
export const describeBullet = (
  label: string,
  value: number,
  target: number | undefined,
  status: string | null,
  unit?: string,
  format?: Intl.NumberFormatOptions,
) => {
  if (!Number.isFinite(value)) return `${label} : donnée indisponible`;
  const parts = [`${label} : ${formatValueWithUnit(value, unit, format)}`];
  if (target !== undefined && Number.isFinite(target)) parts.push(`objectif ${formatValueWithUnit(target, unit, format)}`);
  if (status) parts.push(status);
  return parts.join(", ");
};
