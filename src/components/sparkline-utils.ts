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

/** « Tendance en hausse : de 12 à 18 min sur 7 points ». */
export const describeTrend = (values: number[], unit?: string, format?: Intl.NumberFormatOptions): string => {
  const first = formatValueWithUnit(values[0], unit, format);
  const last = formatValueWithUnit(values[values.length - 1], unit, format);
  return `Tendance ${DIRECTION_LABEL[trendDirection(values)]} : de ${first} à ${last} sur ${values.length} points`;
};
