import { formatValueWithUnit } from "./chart-format";

// Calculs du Meter (purs, testés) : proportions bornées, texte de la valeur,
// segments du mode proportionnel et phrases lues par les lecteurs d'écran.

export interface MeterSegmentInput {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface MeterSegment extends MeterSegmentInput {
  /** Index de couleur / motif dans la palette (ordre fourni). */
  index: number;
  /** Part du maximum (largeur du segment, de 0 à 1). */
  share: number;
}

/** Proportion bornée à [0, 1] ; 0 si les valeurs ne sont pas exploitables. */
export const meterRatio = (value: number, max: number) =>
  Number.isFinite(value) && Number.isFinite(max) && max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

/**
 * Texte de la valeur : « 86 % » quand l'unité est « % » (la valeur est déjà
 * une part), sinon « 96 / 120 places ».
 */
export const formatMeterValue = (value: number, max: number, unit?: string, format?: Intl.NumberFormatOptions) =>
  unit === "%" ? formatValueWithUnit(value, unit, format) : `${formatValueWithUnit(value, undefined, format)} / ${formatValueWithUnit(max, unit, format)}`;

/**
 * Segments valides (valeur finie et positive), dans l'ordre fourni. `max`
 * absent ou inférieur à la somme : la somme sert de maximum (aucun reste).
 */
export const prepareSegments = (segments: MeterSegmentInput[], max?: number) => {
  const valid = segments.filter((s) => Number.isFinite(s.value) && s.value > 0);
  const total = valid.reduce((sum, s) => sum + s.value, 0);
  const scale = max !== undefined && Number.isFinite(max) && max > total ? max : total;
  return {
    segments: valid.map((s, index): MeterSegment => ({ ...s, index, share: scale > 0 ? s.value / scale : 0 })),
    total,
    max: scale,
    /** Part non utilisée du maximum (capacité restante). */
    rest: scale > 0 ? (scale - total) / scale : 0,
  };
};

const percentFormat = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 1 });

/** Résumé du mode proportionnel : « Commerciaux : 1 020 km (68 %), … Total 1 240 km sur 1 500 km. » */
export const describeSegments = (
  segments: MeterSegment[],
  total: number,
  max: number,
  unit?: string,
  format?: Intl.NumberFormatOptions,
) => {
  if (segments.length === 0) return "Aucune donnée.";
  const parts = segments.map((s) => `${s.label} : ${formatValueWithUnit(s.value, unit, format)} (${percentFormat.format(s.share)})`);
  const end = max > total ? ` sur ${formatValueWithUnit(max, unit, format)}` : "";
  return `${parts.join(", ")}. Total ${formatValueWithUnit(total, unit, format)}${end}.`;
};

/** Part en pourcentage fr-FR : « 68 % ». */
export const formatSegmentShare = (share: number) => percentFormat.format(share);
