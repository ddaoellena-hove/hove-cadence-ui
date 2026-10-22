// Calculs purs de BarList (internes) : tri, limite, proportions, nom accessible.

import { describeDelta, formatValueWithUnit, type DeltaUnit, type GoodDirection } from "./chart-format";

export interface BarListItemInput {
  id: string;
  value: number;
  delta?: { value: number; unit?: DeltaUnit };
}

/** Tri décroissant facultatif (l'ordre fourni est conservé sinon), puis limite. */
export const prepareItems = <T extends BarListItemInput>(items: T[], sort: "none" | "desc", limit?: number) => {
  const sorted = sort === "desc" ? [...items].sort((a, b) => b.value - a.value) : items;
  return { shown: limit === undefined ? sorted : sorted.slice(0, limit), hidden: limit === undefined ? 0 : Math.max(0, sorted.length - limit) };
};

/** Largeur relative de la barre (0 à 1) : la plus grande valeur positive vaut 1. */
export const barRatio = (value: number, maxValue: number) => (maxValue <= 0 ? 0 : Math.max(0, Math.min(1, value / maxValue)));

/** Nom accessible d'une ligne : « Ligne 13 : 42 perturbations, en hausse de 12 %, défavorable ». */
export const describeItem = (
  label: string,
  item: BarListItemInput,
  goodDirection: GoodDirection,
  unit?: string,
  format?: Intl.NumberFormatOptions,
) => {
  const value = formatValueWithUnit(item.value, unit, format);
  const delta = item.delta ? `, ${describeDelta(item.delta.value, item.delta.unit ?? "%", goodDirection)}` : "";
  return `${label} : ${value}${delta}`;
};
