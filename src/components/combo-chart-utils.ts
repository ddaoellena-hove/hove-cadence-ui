import { max, min } from "d3-array";
import { scaleLinear } from "d3-scale";

// Calculs du ComboChart (purs, testés) : échelle de l'axe des courbes (axe
// droit). Les barres réutilisent bar-chart-utils (axe gauche).

export interface ComboLineInput {
  id: string;
  data: (number | null)[];
}

/**
 * Échelle de l'axe droit, de bas en haut (`length` → 0) : `domain` imposé,
 * sinon de min(0, valeurs, seuils) au maximum, bornes arrondies.
 */
export const buildLineScale = (lines: ComboLineInput[], length: number, domain?: [number, number], thresholds: number[] = []) => {
  if (domain) return scaleLinear().domain(domain).range([length, 0]);
  const values = [...lines.flatMap((l) => l.data.filter((v): v is number => v !== null && Number.isFinite(v))), ...thresholds];
  const low = Math.min(0, min(values) ?? 0);
  const high = max(values) ?? 1;
  return scaleLinear()
    .domain([low, high === low ? low + 1 : high])
    .range([length, 0])
    .nice(5);
};

/** Libellé d'axe : « Validations (k) ». */
export const axisTitle = (label: string, unit?: string) => (unit ? `${label} (${unit})` : label);
