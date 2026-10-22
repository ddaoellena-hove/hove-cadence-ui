/**
 * Utilitaires purs de Sparkline : résumé textuel de la tendance (nom
 * accessible), testable isolément.
 */
import { formatValueWithUnit } from "./chart-format";

export type TrendDirection = "up" | "down" | "flat";

/** Sens de la série : dernière valeur comparée à la première. */
export const trendDirection = (values: number[]): TrendDirection => {
  const first = values[0];
  const last = values[values.length - 1];
  if (last > first) return "up";
  if (last < first) return "down";
  return "flat";
};

const DIRECTION_LABEL: Record<TrendDirection, string> = {
  up: "en hausse",
  down: "en baisse",
  flat: "stable",
};

/**
 * « Tendance en hausse : de 12 à 18 min sur 7 points ». Si un pic ou un creux
 * dépasse les extrémités, il est ajouté : « …, minimum 84 %, maximum 95 % »
 * (sinon une série 95 → 84 → 95 serait annoncée « stable » sans plus).
 */
export const describeTrend = (values: number[], unit?: string, format?: Intl.NumberFormatOptions): string => {
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const fmt = (v: number) => formatValueWithUnit(v, unit, format);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const extremes =
    min < Math.min(firstValue, lastValue) || max > Math.max(firstValue, lastValue)
      ? `, minimum ${fmt(min)}, maximum ${fmt(max)}`
      : "";
  return `Tendance ${DIRECTION_LABEL[trendDirection(values)]} : de ${fmt(firstValue)} à ${fmt(lastValue)} sur ${values.length} points${extremes}`;
};
