/**
 * Sparkline component.
 *
 * Mini-courbe sans axe ni interaction, pour une cellule de DataTable, une
 * ligne de BarList ou une Card (`trend`). Point final marqué. Nom accessible
 * résumant la tendance (sens, première et dernière valeur), sauf en mode
 * décoratif quand la valeur est déjà écrite à côté.
 */
import { buildSparklinePoints } from "./card-utils";
import { describeTrend } from "./sparkline-utils";
import "./sparkline.css";

export type SparklineColor = "ink" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface SparklineProps {
  /** Valeurs dans l'ordre chronologique. Moins de 2 valeurs finies → rien. */
  values: number[];
  /** `"ink"` (encre, défaut) ou une série dataviz 1–8 (`--cadence-dataviz-series-N`). */
  color?: SparklineColor;
  /** Largeur en px. */
  width?: number;
  /** Hauteur en px. */
  height?: number;
  /** Marque la dernière valeur d'un point. */
  showLastPoint?: boolean;
  /** Unité du résumé accessible (« min », « % »). */
  unit?: string;
  /** Format des nombres du résumé (fr-FR). */
  format?: Intl.NumberFormatOptions;
  /** Remplace le résumé automatique. */
  "aria-label"?: string;
  /** Masquée aux technologies d'assistance (valeur déjà écrite à côté). */
  decorative?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
}

export const Sparkline = ({
  values,
  color = "ink",
  width = 80,
  height = 32,
  showLastPoint = true,
  unit,
  format,
  "aria-label": ariaLabel,
  decorative = false,
  className,
}: SparklineProps) => {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length < 2) return null;

  const points = buildSparklinePoints(finite, width, height);
  const last = points[points.length - 1];
  const rootClass = ["sparkline", `sparkline--${color === "ink" ? "ink" : `series-${color}`}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      className={rootClass}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      focusable="false"
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": ariaLabel ?? describeTrend(finite, unit, format) })}
    >
      <polyline className="sparkline__line" points={points.map((p) => `${p.x},${p.y}`).join(" ")} />
      {showLastPoint && <circle className="sparkline__dot" cx={last.x} cy={last.y} r={2.5} />}
    </svg>
  );
};
