/**
 * Meter component.
 *
 * Mesure d'une valeur par rapport à une capacité, en barre horizontale :
 * taux de charge, remplissage d'un parking relais, quota. Deux modes :
 * - simple (`value`) : seuils libellés et sens favorable, comme `Gauge` ;
 * - proportionnel (`segments`) : décomposition d'un total (km commerciaux /
 *   haut-le-pied / annulés), chaque segment avec sa couleur ET son motif.
 * Primitive compacte, sans états de chargement (comme `Gauge`).
 */
import { useId } from "react";
import { ChartPatternDef, ChartPatternSwatch } from "./ChartPattern";
import { formatValueWithUnit } from "./chart-format";
import { seriesColor, seriesPattern, svgId } from "./chart-palette";
import {
  describeSegments,
  formatMeterValue,
  formatSegmentShare,
  meterRatio,
  prepareSegments,
  type MeterSegmentInput,
} from "./meter-utils";
import { evaluateThresholds, thresholdStatus, type ValueThreshold } from "./threshold-utils";
import "./meter.css";

export type MeterThreshold = ValueThreshold;
export type MeterSegment = MeterSegmentInput;

interface MeterBaseProps {
  /** Libellé visible au-dessus de la barre (nom accessible). */
  label: string;
  /** Unité (« places », « km », « % »). Avec « % », seule la valeur est affichée. */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /**
   * "md" (défaut) : libellé et valeur au-dessus, statut dessous. "sm" : une
   * seule rangée barre + valeur, pour une cellule de `DataTable` ou une ligne
   * de liste ; le libellé et le statut restent lus (nom accessible).
   */
  size?: "md" | "sm";
  /** Masque seulement la valeur visuelle ; la mesure reste accessible. */
  hideValue?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
}

export interface MeterSimpleProps extends MeterBaseProps {
  /** Valeur mesurée. Au-delà de `max`, la barre est pleine et le nombre réel reste affiché. */
  value: number;
  /** Capacité. Défaut 100. */
  max?: number;
  /** Début de l'échelle (« 90 » pour un taux lu entre 90 et 100 %). Défaut 0. */
  min?: number;
  /** Seuils (avec libellé) : repères sur la barre, teinte et statut. */
  thresholds?: MeterThreshold[];
  /** Sens favorable. Défaut "up". Un taux de charge se juge en "down". */
  goodDirection?: "up" | "down" | "neutral";
  /** Objectif : repère plus marqué que les seuils, rappelé dans le nom accessible. */
  target?: number;
  segments?: never;
  showLegend?: never;
}

export interface MeterProportionalProps extends MeterBaseProps {
  /** Décomposition du total, dans l'ordre d'affichage. */
  segments: MeterSegment[];
  /** Capacité ; le reste apparaît comme piste vide. Défaut : la somme des segments. */
  max?: number;
  /** Légende sous la barre (libellé, valeur, part). Défaut true. */
  showLegend?: boolean;
  value?: never;
  min?: never;
  thresholds?: never;
  goodDirection?: never;
  target?: never;
}

export type MeterProps = MeterSimpleProps | MeterProportionalProps;

export const Meter = (props: MeterProps) => {
  const labelId = useId();
  const summaryId = useId();
  const patternPrefix = svgId(useId());
  const { label, unit, format, size = "md", hideValue = false, className } = props;
  const sizeClass = `${size === "sm" ? "meter--sm" : ""}${hideValue ? " meter--hide-value" : ""}`;

  // ── Mode proportionnel ──
  if (props.segments) {
    const { showLegend = true } = props;
    const { segments, total, max } = prepareSegments(props.segments, props.max);
    const indexed = segments.map((s) => ({ ...s, color: s.color ?? seriesColor(s.index), pattern: seriesPattern(s.index) }));
    // Début de chaque segment : somme des parts qui le précèdent
    const rects = indexed.map((s, i) => ({ ...s, x: indexed.slice(0, i).reduce((sum, p) => sum + p.share, 0) }));

    return (
      <div className={["meter", "meter--proportional", sizeClass, className].filter(Boolean).join(" ")}>
        <div className="meter__header">
          <span id={labelId} className="meter__label">
            {label}
          </span>
          <span className="meter__value">
            {/* Sans capacité, le total seul (« 3 650 km ») ; avec, « 1 240 / 1 500 km » */}
            {max > total ? formatMeterValue(total, max, unit === "%" ? undefined : unit, format) : formatValueWithUnit(total, unit, format)}
          </span>
        </div>
        <div className="meter__track" role="img" aria-labelledby={hideValue ? `${labelId} ${summaryId}` : labelId} aria-describedby={hideValue ? undefined : summaryId}>
          <svg className="meter__svg" width="100%" height="100%" aria-hidden="true">
            <defs>
              {indexed.map((s) => (
                <ChartPatternDef key={s.id} id={`${patternPrefix}-${s.index}`} kind={s.pattern} />
              ))}
            </defs>
            {rects.map((s) => (
              <g key={s.id} className="meter__segment">
                <rect x={`${s.x * 100}%`} width={`${s.share * 100}%`} height="100%" fill={s.color} />
                {s.pattern !== "solid" && (
                  <rect x={`${s.x * 100}%`} width={`${s.share * 100}%`} height="100%" fill={`url(#${patternPrefix}-${s.index})`} />
                )}
              </g>
            ))}
          </svg>
          <span id={summaryId} className="meter__sr">
            {describeSegments(segments, total, max, unit, format)}
          </span>
        </div>
        {showLegend && size !== "sm" && (
          <ul className="meter__legend" aria-hidden="true">
            {indexed.map((s) => (
              <li key={s.id} className="meter__legend-item">
                <ChartPatternSwatch kind={s.pattern} color={s.color} />
                <span className="meter__legend-label">{s.label}</span>
                <span className="meter__legend-value">
                  {formatValueWithUnit(s.value, unit, format)} · {formatSegmentShare(s.share)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // ── Mode simple ──
  const { value, max = 100, min = 0, thresholds, goodDirection = "up", target } = props;
  const valid = Number.isFinite(value) && Number.isFinite(max) && Number.isFinite(min) && max > min;
  const ratio = meterRatio(value, max, min);
  const at = (v: number) => `${meterRatio(v, max, min) * 100}%`;
  const { tone, label: thresholdLabel } = valid
    ? evaluateThresholds(value, thresholds, goodDirection)
    : { tone: "neutral" as const, label: null };
  const status = thresholdStatus(tone, thresholdLabel);
  const targetText = target !== undefined && Number.isFinite(target) ? `objectif ${formatValueWithUnit(target, unit, format)}` : null;
  const valueText = valid ? formatMeterValue(value, max, unit, format) : "Donnée indisponible";
  const ticks = valid ? (thresholds ?? []).filter((t) => Number.isFinite(t.value) && t.value > min && t.value < max) : [];

  return (
    <div className={["meter", `meter--${tone}`, sizeClass, className].filter(Boolean).join(" ")}>
      <div className="meter__header">
        <span id={labelId} className="meter__label">
          {label}
        </span>
        <span className="meter__value" aria-hidden="true">
          {valid ? valueText : "—"}
        </span>
      </div>
      <div
        className="meter__track"
        role="meter"
        aria-labelledby={labelId}
        aria-valuemin={valid ? min : 0}
        aria-valuemax={valid ? max : 100}
        aria-valuenow={valid ? Math.min(max, Math.max(min, value)) : 0}
        aria-valuetext={[valueText, valid ? targetText : null, status].filter(Boolean).join(" — ")}
      >
        <span className="meter__fill" style={{ width: `${ratio * 100}%` }} />
        {ticks.map((t) => (
          <span key={`${t.value}-${t.label}`} className="meter__tick" style={{ left: at(t.value) }} />
        ))}
        {valid && target !== undefined && Number.isFinite(target) && (
          <span className="meter__target" style={{ left: at(target) }} />
        )}
      </div>
      {status && (
        <span className="meter__status" aria-hidden="true">
          {status}
        </span>
      )}
    </div>
  );
};
