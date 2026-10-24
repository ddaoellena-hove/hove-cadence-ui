/**
 * Gauge component.
 *
 * Jauge d'une proportion unique (arc 270° ou anneau), valeur au centre en mono.
 * La couleur vient de `goodDirection` et des `thresholds` — jamais la couleur
 * seule : le libellé du seuil franchi est annoncé.
 */
import { useId } from "react";
import { arc } from "d3-shape";
import { evaluateThresholds, thresholdStatus } from "./threshold-utils";
import "./gauge.css";

export interface GaugeThreshold {
  value: number;
  label: string;
}

export interface GaugeProps {
  value: number;
  /** Maximum. Défaut 100. */
  max?: number;
  /** Unité accolée à la valeur (« % », « min »). */
  unit?: string;
  /** Seuils (avec libellé) : colorent la jauge et annoncent le franchissement. */
  thresholds?: GaugeThreshold[];
  /** Sens favorable. Défaut "up". */
  goodDirection?: "up" | "down" | "neutral";
  /** Forme. Défaut "arc" (270°). */
  shape?: "arc" | "ring";
  /** Classe CSS additionnelle. */
  className?: string;
}

const SIZE = 160;
const R = 68;
const THICK = 14;
// Retrait de l'arc de valeur dans la piste : un liseré gris reste visible
// autour (côtés et extrémités), comme une barre dans son rail.
const PAD = 3;

export const Gauge = ({ value, max = 100, unit, thresholds, goodDirection = "up", shape = "arc", className }: GaugeProps) => {
  const titleId = useId();
  const valid = Number.isFinite(value) && Number.isFinite(max) && max > 0;
  const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });
  const displayValue = Number.isFinite(value) ? numberFormat.format(value) : "—";
  const proportion = valid ? Math.min(1, Math.max(0, value / max)) : 0;
  const { tone, label } = valid
    ? evaluateThresholds(value, thresholds, goodDirection)
    : { tone: "neutral" as const, label: null };
  const status = thresholdStatus(tone, label);

  // Arc 270° ouvert en bas, ou anneau complet.
  const start = shape === "arc" ? -0.75 * Math.PI : 0;
  const sweep = shape === "arc" ? 1.5 * Math.PI : 2 * Math.PI;

  const gen = arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(R - THICK)
    .outerRadius(R)
    .cornerRadius(THICK / 2);
  const trackPath = gen({ startAngle: start, endAngle: start + sweep }) ?? undefined;
  // Arc de valeur plus fin (PAD de chaque côté) et décalé de PAD aux extrémités
  const padAngle = PAD / (R - THICK / 2);
  const valueStart = start + padAngle;
  const valueSweep = Math.max(0, sweep - 2 * padAngle);
  const valueGen = arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(R - THICK + PAD)
    .outerRadius(R - PAD)
    .cornerRadius((THICK - 2 * PAD) / 2);
  const valuePath = proportion > 0 ? (valueGen({ startAngle: valueStart, endAngle: valueStart + valueSweep * proportion }) ?? undefined) : undefined;

  const rootClass = ["gauge", `gauge--${tone}`, `gauge--${shape}`, className].filter(Boolean).join(" ");
  const srText = valid ? `${displayValue}${unit ? ` ${unit}` : ""} sur ${numberFormat.format(max)}${status ? ` — ${status}` : ""}` : "Donnée indisponible";

  return (
    <div className={rootClass} role="img" aria-labelledby={titleId}>
      <span id={titleId} className="gauge__sr">{srText}</span>
      <svg className="gauge__svg" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <g transform={`translate(${SIZE / 2}, ${SIZE / 2})`}>
          <path className="gauge__track" d={trackPath} />
          <path className="gauge__value" d={valuePath} />
        </g>
      </svg>
      <div className="gauge__center" aria-hidden="true">
        <span className="gauge__number">
          {displayValue}
          {unit && <span className="gauge__unit">{unit}</span>}
        </span>
        {status && <span className="gauge__threshold">{status}</span>}
      </div>
    </div>
  );
};
