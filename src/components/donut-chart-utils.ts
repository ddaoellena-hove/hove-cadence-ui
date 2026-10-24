import { formatValueWithUnit } from "./chart-format";

// Calculs du DonutChart (purs, testés) : regroupement des petites parts,
// pourcentages et phrases lues par les lecteurs d'écran.

export interface DonutSliceInput {
  id: string;
  label: string;
  value: number;
  color?: string;
}

/** Part prête à dessiner : index de palette conservé, part du total. */
export interface DonutSlice extends DonutSliceInput {
  /** Index de couleur / motif dans la palette (ordre fourni). */
  index: number;
  share: number;
}

/** Identifiant de la part qui regroupe les catégories au-delà de `maxSlices`. */
export const OTHERS_ID = "__autres";

/**
 * Parts valides (valeur finie et positive), dans l'ordre fourni. Au-delà de
 * `maxSlices`, les plus petites sont regroupées dans une part « Autres »
 * (dernière, couleur neutre de la série 8).
 */
export const prepareSlices = (slices: DonutSliceInput[], maxSlices = 6, othersLabel = "Autres"): DonutSlice[] => {
  const valid = slices.map((s, index) => ({ ...s, index })).filter((s) => Number.isFinite(s.value) && s.value > 0);
  let kept = valid;
  let others = 0;
  if (maxSlices >= 2 && valid.length > maxSlices) {
    // On garde les maxSlices − 1 plus grandes, dans leur ordre d'origine
    const keepIds = new Set(
      [...valid].sort((a, b) => b.value - a.value).slice(0, maxSlices - 1).map((s) => s.id),
    );
    kept = valid.filter((s) => keepIds.has(s.id));
    others = valid.filter((s) => !keepIds.has(s.id)).reduce((sum, s) => sum + s.value, 0);
  }
  const total = kept.reduce((sum, s) => sum + s.value, 0) + others;
  const result: DonutSlice[] = kept.map((s, i) => ({ ...s, index: i, share: total > 0 ? s.value / total : 0 }));
  if (others > 0) {
    result.push({
      id: OTHERS_ID,
      label: othersLabel,
      value: others,
      color: "var(--cadence-dataviz-series-8, #55606e)",
      index: 7,
      share: others / total,
    });
  }
  return result;
};

/** Somme des parts. */
export const sliceTotal = (slices: { value: number }[]) => slices.reduce((sum, s) => sum + s.value, 0);

const percentFormat = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

/** Part en pourcentage fr-FR : « 42,5 % ». */
export const formatShare = (share: number) => percentFormat.format(share);

/** Nom accessible d'une part : « Bus : 1 240 trajets, 42,5 % ». */
export const describeSlice = (slice: DonutSlice, unit?: string, format?: Intl.NumberFormatOptions) =>
  `${slice.label} : ${formatValueWithUnit(slice.value, unit, format)}, ${formatShare(slice.share)}`;

/** Résumé du graphique : « Total 2 918 trajets en 4 parts. Plus grande part : Bus, 42,5 % ». */
export const describeDonut = (slices: DonutSlice[], unit?: string, format?: Intl.NumberFormatOptions) => {
  if (slices.length === 0) return "Aucune part.";
  const largest = slices.reduce((a, b) => (b.value > a.value ? b : a));
  const total = formatValueWithUnit(sliceTotal(slices), unit, format);
  return `Total ${total} en ${slices.length} part${slices.length > 1 ? "s" : ""}. Plus grande part : ${largest.label}, ${formatShare(largest.share)}.`;
};
