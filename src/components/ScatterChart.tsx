import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChartAxisBottom, ChartAxisLeft } from "./ChartAxis";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartLegend } from "./ChartLegend";
import { ChartMarker } from "./ChartMarker";
import { ChartTooltip } from "./ChartTooltip";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { seriesColor, seriesMarker } from "./chart-palette";
import { buildAxisScale, nearestPoint, traversalOrder } from "./scatter-chart-utils";
import type { ScatterPointInput } from "./chart-types";
import { useChartWidth } from "./use-chart-size";
import "./scatter-chart.css";

export type ScatterChartPoint = ScatterPointInput;

export interface ScatterChartSeries {
  id: string;
  label: string;
  /** Points ; `label` nomme le point (« Ligne 13 ») dans le tooltip, l'annonce et le tableau. */
  points: ScatterChartPoint[];
}

export interface ScatterChartAxis {
  /** Titre de l'axe (« Taux de charge », « Retard moyen »). */
  label: string;
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Bornes imposées. Défaut : de min(0, valeurs) au maximum, arrondi. */
  domain?: [number, number];
  /** Inclure zéro dans l'axe. Défaut true. */
  includeZero?: boolean;
}

export interface ScatterChartThreshold {
  /** Axe du seuil : "x" (trait vertical) ou "y" (trait horizontal). */
  axis: "x" | "y";
  value: number;
  /** « Capacité 100 % » — toujours affiché sur le trait. */
  label: string;
}

export interface ScatterChartProps extends ChartCommonProps {
  /** Une à huit séries (une forme et une couleur chacune). */
  series: ScatterChartSeries[];
  xAxis: ScatterChartAxis;
  yAxis: ScatterChartAxis;
  /** Seuils libellés sur l'un ou l'autre axe : délimitent des quadrants (charge élevée, retard). */
  thresholds?: ScatterChartThreshold[];
  /** Clic ou Entrée sur un point (ouvrir le détail). */
  onPointClick?: (point: ScatterChartPoint, series: ScatterChartSeries) => void;
  /** Légende cliquable (dès deux séries). Défaut true. */
  showLegend?: boolean;
  /** Lignes de grille. Défaut true. */
  showGrid?: boolean;
  /** En-tête masqué visuellement (titre toujours lu). */
  hideTitle?: boolean;
  /** Hauteur du tracé. Défaut 320. */
  height?: number;
}

const MARGIN = { top: 28, right: 20, bottom: 44, left: 56 };

/**
 * Nuage de points : corrélation entre deux mesures (charge vs retard, distance
 * vs temps), détection d'anomalies. Une forme et une couleur par série, seuils
 * sur chaque axe, tooltip et parcours au clavier point par point, alternative
 * tabulaire.
 */
export const ScatterChart = ({
  series,
  xAxis,
  yAxis,
  thresholds = [],
  onPointClick,
  showLegend = true,
  showGrid = true,
  hideTitle = false,
  height = 320,
  ...frame
}: ScatterChartProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(plotRef);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ left: 0, top: 0 });

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const indexed = series.map((s, i) => ({ ...s, index: i, color: seriesColor(i), marker: seriesMarker(i) }));
  const visible = indexed.filter((s) => !hidden.has(s.id));

  // Tous les points visibles, avec leur série, dans l'ordre de parcours au clavier
  const points = traversalOrder(visible.flatMap((s) => s.points.map((p) => ({ ...p, series: s }))));
  const x = buildAxisScale(
    [...points.map((p) => p.x), ...thresholds.filter((t) => t.axis === "x").map((t) => t.value)],
    [0, plotWidth],
    xAxis.domain,
    xAxis.includeZero ?? true,
  );
  const y = buildAxisScale(
    [...points.map((p) => p.y), ...thresholds.filter((t) => t.axis === "y").map((t) => t.value)],
    [plotHeight, 0],
    yAxis.domain,
    yAxis.includeZero ?? true,
  );
  const positions = points.map((p) => ({ px: x(p.x), py: y(p.y) }));

  const fx = (n: number) => formatValueWithUnit(n, xAxis.unit, xAxis.format);
  const fy = (n: number) => formatValueWithUnit(n, yAxis.unit, yAxis.format);
  const nameOf = (p: (typeof points)[number]) => p.label ?? p.id;
  const describe = (p: (typeof points)[number]) =>
    `${nameOf(p)}${visible.length > 1 ? ` (${p.series.label})` : ""} : ${xAxis.label} ${fx(p.x)}, ${yAxis.label} ${fy(p.y)}`;

  const activate = (index: number | null, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setOrigin({ left: rect.left, top: rect.top });
    setActive(index);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const index = nearestPoint(positions, e.clientX - rect.left - MARGIN.left, e.clientY - rect.top - MARGIN.top);
    activate(index >= 0 ? index : null, e.currentTarget);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (points.length === 0) return;
    if (e.key === "Escape") {
      setActive(null);
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && onPointClick && active !== null) {
      e.preventDefault();
      const { series: owner, ...point } = points[active];
      onPointClick(point, series[owner.index]);
      return;
    }
    const last = points.length - 1;
    const current = active ?? 0;
    const next = ["ArrowRight", "ArrowUp"].includes(e.key)
      ? Math.min(last, current + 1)
      : ["ArrowLeft", "ArrowDown"].includes(e.key)
        ? Math.max(0, current - 1)
        : e.key === "Home"
          ? 0
          : e.key === "End"
            ? last
            : null;
    if (next === null) return;
    e.preventDefault();
    activate(next, e.currentTarget);
  };

  const handleClick = () => {
    if (!onPointClick || active === null) return;
    const { series: owner, ...point } = points[active];
    onPointClick(point, series[owner.index]);
  };

  const toggleSeries = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < series.length - 1) next.add(id); // au moins une série visible
      return next;
    });

  const legend =
    showLegend && series.length > 1 ? (
      <ChartLegend
        items={indexed.map((s) => ({ id: s.id, label: s.label, color: s.color, marker: s.marker, hidden: hidden.has(s.id) }))}
        onToggle={toggleSeries}
      />
    ) : undefined;

  const axisTitle = (a: ScatterChartAxis) => (a.unit ? `${a.label} (${a.unit})` : a.label);
  const table = (show: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={show}
      columns={["Point", ...(series.length > 1 ? ["Série"] : []), axisTitle(xAxis), axisTitle(yAxis)]}
      numeric={series.length > 1 ? [2, 3] : [1, 2]}
      rows={points.map((p) => [
        nameOf(p),
        ...(series.length > 1 ? [p.series.label] : []),
        formatKpiValue(p.x, xAxis.format),
        formatKpiValue(p.y, yAxis.format),
      ])}
    />
  );

  const activePoint = active !== null ? points[active] : null;
  const xTicks = x.ticks(6).map((t) => ({ key: String(t), position: x(t), label: formatKpiValue(t, xAxis.format) }));
  const yTicks = y.ticks(5).map((t) => ({ key: String(t), position: y(t), label: formatKpiValue(t, yAxis.format) }));

  return (
    <ChartFrame
      {...frame}
      kind="scatter-chart"
      titleId={titleId}
      descriptionId={descriptionId}
      height={height}
      hideHeader={hideTitle}
      legend={legend}
      table={table}
    >
      <div
        ref={plotRef}
        className={`chart__plot${onPointClick && activePoint ? " scatter-chart__plot--clickable" : ""}`}
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-roledescription="nuage de points"
        aria-labelledby={titleId}
        aria-describedby={frame.description ? descriptionId : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActive(null)}
        onClick={handleClick}
        onFocus={(e) => activate(active ?? (points.length ? 0 : null), e.currentTarget)}
        onBlur={() => setActive(null)}
        onKeyDown={handleKeyDown}
      >
        <svg className="chart__svg" width={width} height={height} aria-hidden="true">
          <text className="scatter-chart__axis-title" x={MARGIN.left - 8} y={14}>
            {axisTitle(yAxis)}
          </text>
          <text className="scatter-chart__axis-title" x={width - MARGIN.right} y={height - 6} textAnchor="end">
            {axisTitle(xAxis)}
          </text>
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            <ChartAxisLeft ticks={yTicks} plotWidth={plotWidth} grid={showGrid} />
            {showGrid && (
              <g aria-hidden="true">
                {xTicks.map((t) => (
                  <line key={t.key} className="chart__grid-line" x1={t.position} x2={t.position} y1={0} y2={plotHeight} />
                ))}
              </g>
            )}

            {/* Seuils : traits tiretés libellés, verticaux (x) ou horizontaux (y) */}
            {thresholds.map((t) => (
              <g key={`${t.axis}-${t.label}-${t.value}`} className="scatter-chart__threshold">
                {t.axis === "x" ? (
                  <>
                    <line x1={x(t.value)} x2={x(t.value)} y1={0} y2={plotHeight} />
                    <text x={x(t.value) + 4} y={10}>
                      {t.label}
                    </text>
                  </>
                ) : (
                  <>
                    <line x1={0} x2={plotWidth} y1={y(t.value)} y2={y(t.value)} />
                    <text x={plotWidth} y={y(t.value) - 6} textAnchor="end">
                      {t.label}
                    </text>
                  </>
                )}
              </g>
            ))}

            {points.map((p, i) =>
              i === active ? null : (
                <ChartMarker key={`${p.series.id}-${p.id}`} shape={p.series.marker} x={positions[i].px} y={positions[i].py} size={4} color={p.series.color} />
              ),
            )}
            {activePoint && active !== null && (
              <ChartMarker shape={activePoint.series.marker} x={positions[active].px} y={positions[active].py} size={7} color={activePoint.series.color} className="scatter-chart__active" />
            )}

            <ChartAxisBottom ticks={xTicks} y={plotHeight} plotWidth={plotWidth} />
          </g>
        </svg>
        <p className="chart__sr-only" aria-live="polite">
          {activePoint ? describe(activePoint) : ""}
        </p>
      </div>
      {activePoint && active !== null && (
        <ChartTooltip
          x={origin.left + MARGIN.left + positions[active].px}
          y={origin.top + MARGIN.top + positions[active].py}
          title={nameOf(activePoint)}
          rows={[
            ...(series.length > 1
              ? [{ id: "series", label: "Série", value: activePoint.series.label, color: activePoint.series.color, marker: activePoint.series.marker }]
              : []),
            { id: "x", label: xAxis.label, value: fx(activePoint.x) },
            { id: "y", label: yAxis.label, value: fy(activePoint.y) },
          ]}
          note={onPointClick ? "Entrée ou clic : voir le détail" : undefined}
        />
      )}
    </ChartFrame>
  );
};
