import { useId, useState, type KeyboardEvent } from "react";
import { arc, pie, type PieArcDatum } from "d3-shape";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartPatternDef, ChartPatternSwatch } from "./ChartPattern";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { seriesColor, seriesPattern, svgId } from "./chart-palette";
import { describeDonut, describeSlice, formatShare, prepareSlices, sliceTotal, type DonutSlice, type DonutSliceInput } from "./donut-chart-utils";
import "./donut-chart.css";

export type DonutChartSlice = DonutSliceInput;

export interface DonutChartProps extends ChartCommonProps {
  /** Parts, dans l'ordre d'affichage (sens horaire depuis midi). Valeurs nulles ou négatives ignorées. */
  slices: DonutChartSlice[];
  /** Nombre maximal de parts ; au-delà, les plus petites sont regroupées dans « Autres ». Défaut 6. */
  maxSlices?: number;
  /** Libellé de la part regroupée. Défaut « Autres ». */
  othersLabel?: string;
  /** Unité des valeurs (« trajets », « véhicules »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Libellé sous le total au centre. Défaut « Total ». */
  centerLabel?: string;
  /** Légende à côté de l'anneau (libellé, valeur, part). Défaut true. */
  showLegend?: boolean;
  /** Diamètre de l'anneau, en px. Défaut 200. */
  size?: number;
  /** En-tête masqué visuellement (titre toujours lu), ex. dans une `Card` qui affiche déjà le titre. */
  hideTitle?: boolean;
}

// Écart réservé autour de l'anneau pour la part active, qui s'agrandit
const GROW = 6;
const THICKNESS_RATIO = 0.36;

/**
 * Anneau de parts d'un total (≤ 6 parts) : total au centre, légende avec
 * valeur et part. Chaque part a une couleur ET un motif. Survol ou clavier :
 * la part active s'agrandit et le centre affiche sa part du total.
 */
export const DonutChart = ({
  slices: slicesProp,
  maxSlices = 6,
  othersLabel = "Autres",
  unit,
  format,
  centerLabel = "Total",
  showLegend = true,
  size = 200,
  hideTitle = false,
  ...frame
}: DonutChartProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const patternPrefix = svgId(useId());
  const [active, setActive] = useState<number | null>(null);

  const slices = prepareSlices(slicesProp, maxSlices, othersLabel).map((s) => ({
    ...s,
    color: s.color ?? seriesColor(s.index),
    pattern: seriesPattern(s.index),
  }));
  const total = sliceTotal(slices);
  const activeSlice = active !== null ? slices[active] : null;

  const outer = size / 2 - GROW;
  const inner = outer * (1 - THICKNESS_RATIO);
  const arcs = pie<(typeof slices)[number]>()
    .sort(null)
    .value((s) => s.value)
    .padAngle(slices.length > 1 ? 0.012 : 0)(slices);
  const shape = (d: PieArcDatum<DonutSlice>, grow: boolean) =>
    arc<PieArcDatum<DonutSlice>>()
      .innerRadius(inner)
      .outerRadius(grow ? outer + GROW : outer)
      .cornerRadius(2)(d) ?? undefined;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (slices.length === 0) return;
    if (e.key === "Escape") {
      setActive(null);
      return;
    }
    const last = slices.length - 1;
    const current = active ?? 0;
    const next = ["ArrowRight", "ArrowDown"].includes(e.key)
      ? (current + 1) % slices.length
      : ["ArrowLeft", "ArrowUp"].includes(e.key)
        ? (current - 1 + slices.length) % slices.length
        : e.key === "Home"
          ? 0
          : e.key === "End"
            ? last
            : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
  };

  const table = (visible: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={visible}
      columns={["Catégorie", unit ? `Valeur (${unit})` : "Valeur", "Part"]}
      numeric={[1, 2]}
      rows={[
        ...slices.map((s) => [s.label, formatKpiValue(s.value, format), formatShare(s.share)]),
        ["Total", formatKpiValue(total, format), formatShare(total > 0 ? 1 : 0)],
      ]}
    />
  );

  return (
    <ChartFrame
      {...frame}
      kind="donut-chart"
      titleId={titleId}
      descriptionId={descriptionId}
      height={size}
      hideHeader={hideTitle}
      table={table}
    >
      <div className="donut-chart__body">
        <div
          className="chart__plot donut-chart__plot"
          style={{ width: size, height: size }}
          tabIndex={0}
          role="group"
          aria-roledescription="graphique en anneau"
          aria-labelledby={titleId}
          aria-describedby={`${frame.description ? `${descriptionId} ` : ""}${patternPrefix}-summary`}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive((a) => a ?? (slices.length ? 0 : null))}
          onBlur={() => setActive(null)}
          onKeyDown={handleKeyDown}
        >
          <svg className="chart__svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
            <defs>
              {slices.map((s) => (
                <ChartPatternDef key={s.id} id={`${patternPrefix}-${s.index}`} kind={s.pattern} />
              ))}
            </defs>
            <g transform={`translate(${size / 2}, ${size / 2})`}>
              <circle className="donut-chart__track" r={(outer + inner) / 2} strokeWidth={outer - inner} fill="none" />
              {arcs.map((d, i) => {
                const s = d.data as (typeof slices)[number];
                const isActive = active === i;
                const path = shape(d, isActive);
                return (
                  <g
                    key={s.id}
                    className={`donut-chart__slice${active !== null && !isActive ? " donut-chart__slice--dimmed" : ""}`}
                    onMouseEnter={() => setActive(i)}
                  >
                    <path d={path} fill={s.color} />
                    {s.pattern !== "solid" && <path d={path} fill={`url(#${patternPrefix}-${s.index})`} />}
                  </g>
                );
              })}
            </g>
          </svg>
          <div className="donut-chart__center" aria-hidden="true">
            {activeSlice ? (
              <>
                <span className="donut-chart__number">{formatShare(activeSlice.share)}</span>
                <span className="donut-chart__caption">{activeSlice.label}</span>
              </>
            ) : (
              <>
                <span className="donut-chart__number">{formatKpiValue(total, format)}</span>
                <span className="donut-chart__caption">
                  {centerLabel}
                  {unit ? ` (${unit})` : ""}
                </span>
              </>
            )}
          </div>
          <span id={`${patternPrefix}-summary`} className="chart__sr-only">
            {describeDonut(slices, unit, format)}
          </span>
        </div>

        {showLegend && (
          <ul className="donut-chart__legend" aria-label="Légende">
            {slices.map((s, i) => (
              <li
                key={s.id}
                className={`donut-chart__legend-item${active === i ? " donut-chart__legend-item--active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <ChartPatternSwatch kind={s.pattern} color={s.color} />
                <span className="donut-chart__legend-label">{s.label}</span>
                <span className="donut-chart__legend-value">{formatValueWithUnit(s.value, undefined, format)}</span>
                <span className="donut-chart__legend-share">{formatShare(s.share)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="chart__sr-only" aria-live="polite">
        {activeSlice ? describeSlice(activeSlice, unit, format) : ""}
      </p>
    </ChartFrame>
  );
};
