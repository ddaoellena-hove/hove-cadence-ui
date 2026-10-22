import { useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { area as d3Area, curveMonotoneX, line as d3Line } from "d3-shape";
import { ChartAxisBottom, ChartAxisLeft } from "./ChartAxis";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartLegend } from "./ChartLegend";
import { ChartMarker } from "./ChartMarker";
import { ChartTooltip, type ChartTooltipRow } from "./ChartTooltip";
import { formatFullDate, formatKpiValue, formatValueWithUnit, type GoodDirection } from "./chart-format";
import { seriesColor, seriesMarker } from "./chart-palette";
import {
  breachesThreshold,
  buildXScale,
  buildXTicks,
  buildYScale,
  collectXs,
  nearestIndex,
  resolveAnnotations,
  stackSeries,
  valueAt,
  xKey,
  type ChartX,
} from "./line-chart-utils";
import { useChartWidth } from "./use-chart-size";
import "./line-chart.css";

export interface LineChartSeries {
  id: string;
  label: string;
  /** Points ; x est une Date (axe temporel) ou une catégorie. y null = trou dans la courbe. */
  data: { x: Date | string; y: number | null }[];
}

export interface LineChartThreshold {
  value: number;
  /** « Objectif 95 % » — toujours affiché sur la ligne. */
  label: string;
}

export interface LineChartAnnotation {
  /** Trait vertical à une date (ou catégorie), ou bande entre deux. */
  at: Date | string | [Date | string, Date | string];
  /** « Grève 14/10 » */
  label: string;
}

export interface LineChartProps extends ChartCommonProps {
  /** Une à huit séries. */
  series: LineChartSeries[];
  /** "line" (défaut) ou "area". */
  variant?: "line" | "area";
  /** Aires empilées (variant "area"). Défaut false. */
  stacked?: boolean;
  thresholds?: LineChartThreshold[];
  annotations?: LineChartAnnotation[];
  /** Sens favorable, comme Card : les points du côté défavorable d'un seuil sont signalés. Défaut "up". */
  goodDirection?: GoodDirection;
  /** Unité de l'axe Y et du tooltip (« min », « % »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Bornes de l'axe Y. Défaut : 0 → maximum arrondi. */
  yDomain?: [number, number];
  /** Sans axes, légende ni titre visible (titre conservé pour l'accessibilité) : pour une Card. */
  compact?: boolean;
  /** Hauteur du tracé. Défaut 280 (48 en compact). */
  height?: number;
}

// Motif de trait par série (en plus de la couleur et du marqueur)
const DASHES = ["", "6 4", "2 3", "10 4 2 4", "", "6 4", "2 3", "10 4 2 4"];
const MARKERS_MAX_POINTS = 40;

/**
 * Courbe d'évolution : séries temporelles ou catégorielles, aires (empilées
 * ou non), seuils, annotations, tooltip partagé, navigation ←/→ au clavier,
 * alternative tabulaire.
 */
export const LineChart = ({
  series,
  variant = "line",
  stacked = false,
  thresholds = [],
  annotations = [],
  goodDirection = "up",
  unit,
  format,
  yDomain,
  compact = false,
  height: heightProp,
  ...frame
}: LineChartProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(plotRef);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  // Origine du tracé dans la fenêtre, relevée dans les gestionnaires (pas de lecture de ref au rendu)
  const [origin, setOrigin] = useState({ left: 0, top: 0 });

  const height = heightProp ?? (compact ? 48 : 280);
  const margin = compact ? { top: 4, right: 4, bottom: 4, left: 4 } : { top: 20, right: 16, bottom: 28, left: 52 };
  const plotWidth = Math.max(0, width - margin.left - margin.right);
  const plotHeight = Math.max(0, height - margin.top - margin.bottom);

  const indexed = series.map((s, i) => ({ ...s, index: i }));
  const visible = indexed.filter((s) => !hidden.has(s.id));
  const isArea = variant === "area";
  const isStacked = isArea && stacked;

  const xs = useMemo(() => collectXs(series), [series]);
  const xScale = buildXScale(xs, plotWidth);
  const positions = xs.map(xScale.position);
  const yScale = buildYScale(visible, xs, plotHeight, {
    stacked: isStacked,
    yDomain,
    thresholds: thresholds.map((t) => t.value),
  });
  const baseline = yScale(Math.max(yScale.domain()[0], 0));
  const yTicks = yScale.ticks(5).map((v) => ({ key: String(v), position: yScale(v), label: formatKpiValue(v, format) }));
  const xTicks = buildXTicks(xs, xScale, plotWidth);
  const resolvedAnnotations = resolveAnnotations(annotations, xScale, plotWidth);
  const showMarkers = xs.length <= MARKERS_MAX_POINTS;

  const formatValue = (value: number | null) => (value === null ? "—" : formatValueWithUnit(value, unit, format));
  // Données horaires (heures ou minutes non nulles) : la date complète garde l'heure, quelle que soit l'étendue
  const withTime = xScale.time && (xs as Date[]).some((d) => d.getHours() !== 0 || d.getMinutes() !== 0);
  const formatX = (x: ChartX) => (x instanceof Date ? formatFullDate(x, withTime ? "hour" : xScale.granularity) : x);
  const isBreach = (value: number | null) => thresholds.some((t) => breachesThreshold(value, t.value, goodDirection));

  // ── Tracés ──
  const stackedLayers = isStacked ? stackSeries(visible, xs) : [];
  const paths = visible.map((s, layerIndex) => {
    const color = seriesColor(s.index);
    if (isStacked) {
      const layer = stackedLayers[layerIndex];
      const areaPath = d3Area<[number, number]>()
        .x((_, i) => positions[i])
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]))
        .curve(curveMonotoneX)(layer);
      const topPath = d3Line<[number, number]>()
        .x((_, i) => positions[i])
        .y((d) => yScale(d[1]))
        .curve(curveMonotoneX)(layer);
      return { s, color, areaPath, linePath: topPath };
    }
    const points = xs.map((x) => ({ x, y: valueAt(s, x) }));
    const linePath = d3Line<{ x: ChartX; y: number | null }>()
      .defined((p) => p.y !== null)
      .x((p) => xScale.position(p.x))
      .y((p) => yScale(p.y as number))
      .curve(curveMonotoneX)(points);
    const areaPath = isArea
      ? d3Area<{ x: ChartX; y: number | null }>()
          .defined((p) => p.y !== null)
          .x((p) => xScale.position(p.x))
          .y0(baseline)
          .y1((p) => yScale(p.y as number))
          .curve(curveMonotoneX)(points)
      : null;
    return { s, color, areaPath, linePath };
  });

  // Ordonnée affichée d'une série à l'index i (sommet de sa couche si empilé)
  const plottedY = (layerIndex: number, i: number) => {
    if (isStacked) return yScale(stackedLayers[layerIndex][i][1]);
    const value = valueAt(visible[layerIndex], xs[i]);
    return value === null ? null : yScale(value);
  };

  // ── Point actif : tooltip partagé et annonce ──
  const activeX = active !== null ? xs[active] : null;
  const rows: ChartTooltipRow[] =
    activeX === null
      ? []
      : visible.map((s) => {
          const value = valueAt(s, activeX);
          return {
            id: s.id,
            label: s.label,
            value: formatValue(value),
            color: seriesColor(s.index),
            marker: seriesMarker(s.index),
            tone: isBreach(value) ? "alert" : "default",
          };
        });
  const activeNotes =
    active === null
      ? []
      : resolvedAnnotations.filter((a) => positions[active] >= a.x0 - 0.5 && positions[active] <= a.x1 + 0.5).map((a) => a.label);
  const breachedThresholds =
    activeX === null ? [] : thresholds.filter((t) => visible.some((s) => breachesThreshold(valueAt(s, activeX), t.value, goodDirection)));
  const note = [...activeNotes, ...breachedThresholds.map((t) => `${t.label} franchi`)].join(" · ") || undefined;
  const announcement =
    activeX === null ? "" : `${formatX(activeX)} — ${rows.map((r) => `${r.label} : ${r.value}`).join(", ")}${note ? `. ${note}` : ""}`;

  const anchor = (() => {
    if (active === null) return null;
    const ys = visible.map((_, l) => plottedY(l, active)).filter((y): y is number => y !== null);
    const y = ys.length ? Math.min(...ys) : plotHeight / 2;
    return { x: origin.left + margin.left + positions[active], y: origin.top + margin.top + y };
  })();

  /** Active un point et relève la position du tracé (pour le tooltip en portail). */
  const activate = (index: number | null, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setOrigin({ left: rect.left, top: rect.top });
    setActive(index);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (xs.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    activate(nearestIndex(positions, e.clientX - rect.left - margin.left), e.currentTarget);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (xs.length === 0) return;
    const last = xs.length - 1;
    const current = active ?? 0;
    const next =
      e.key === "ArrowRight"
        ? Math.min(last, current + 1)
        : e.key === "ArrowLeft"
          ? Math.max(0, current - 1)
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? last
              : null;
    if (e.key === "Escape") {
      setActive(null);
      return;
    }
    if (next === null) return;
    e.preventDefault();
    activate(next, e.currentTarget);
  };

  const toggleSeries = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < series.length - 1) next.add(id); // au moins une série visible
      return next;
    });

  const legend =
    series.length > 1 ? (
      <ChartLegend
        items={indexed.map((s) => ({
          id: s.id,
          label: s.label,
          color: seriesColor(s.index),
          marker: seriesMarker(s.index),
          hidden: hidden.has(s.id),
        }))}
        onToggle={toggleSeries}
      />
    ) : undefined;

  const table = (show: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={show}
      columns={[xScale.time ? "Date" : "Catégorie", ...visible.map((s) => (unit ? `${s.label} (${unit})` : s.label))]}
      numeric={visible.map((_, i) => i + 1)}
      rows={xs.map((x) => [formatX(x), ...visible.map((s) => formatKpiValue(valueAt(s, x) ?? "—", format))])}
    />
  );

  return (
    <ChartFrame
      {...frame}
      kind="line-chart"
      titleId={titleId}
      descriptionId={descriptionId}
      height={height}
      compact={compact}
      legend={legend}
      table={table}
    >
      <div
        ref={plotRef}
        className="chart__plot"
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-roledescription="graphique"
        aria-labelledby={titleId}
        aria-describedby={frame.description ? descriptionId : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActive(null)}
        onFocus={(e) => activate(active ?? (xs.length ? 0 : null), e.currentTarget)}
        onBlur={() => setActive(null)}
        onKeyDown={handleKeyDown}
      >
        <svg className="chart__svg" width={width} height={height} aria-hidden="true">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {!compact && <ChartAxisLeft ticks={yTicks} plotWidth={plotWidth} />}

            {/* Annotations : bande ou trait vertical libellé */}
            {resolvedAnnotations.map((a) => (
              <g key={`${a.label}-${a.x0}`} className="line-chart__annotation">
                {a.band && <rect className="line-chart__annotation-band" x={a.x0} y={0} width={a.x1 - a.x0} height={plotHeight} />}
                <line className="line-chart__annotation-line" x1={a.x0} x2={a.x0} y1={0} y2={plotHeight} />
                {!compact && (
                  <text className="line-chart__annotation-label" x={a.x0 + 4} y={-6}>
                    {a.label}
                  </text>
                )}
              </g>
            ))}

            {/* Aires puis courbes */}
            {paths.map(({ s, color, areaPath }) =>
              areaPath ? <path key={`area-${s.id}`} className="line-chart__area" d={areaPath} fill={color} /> : null,
            )}
            {paths.map(({ s, color, linePath }) => (
              <path
                key={`line-${s.id}`}
                className="line-chart__line"
                d={linePath ?? undefined}
                stroke={color}
                strokeDasharray={DASHES[s.index % DASHES.length] || undefined}
              />
            ))}

            {/* Seuils : ligne tiretée + libellé, « franchi » en couleur de dépassement */}
            {thresholds.map((t) => {
              const y = yScale(t.value);
              const breached = visible.some((s) => s.data.some((p) => breachesThreshold(p.y, t.value, goodDirection)));
              return (
                <g key={`${t.label}-${t.value}`} className={`line-chart__threshold${breached ? " line-chart__threshold--breached" : ""}`}>
                  <line x1={0} x2={plotWidth} y1={y} y2={y} />
                  {!compact && (
                    <text x={plotWidth} y={y - 6} textAnchor="end">
                      {breached ? `${t.label} · franchi` : t.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Marqueurs : tous les points si peu nombreux, sinon les points au-delà d'un seuil */}
            {visible.map((s, l) =>
              xs.map((x, i) => {
                const y = plottedY(l, i);
                const value = valueAt(s, x);
                const breach = isBreach(value);
                if (y === null || (!showMarkers && !breach) || i === active) return null;
                return (
                  <ChartMarker
                    key={`${s.id}-${xKey(x)}`}
                    shape={seriesMarker(s.index)}
                    x={positions[i]}
                    y={y}
                    size={compact ? 2 : 3}
                    color={breach ? "var(--cadence-dataviz-threshold-breach, #b91c1c)" : seriesColor(s.index)}
                  />
                );
              }),
            )}

            {/* Point actif : repère vertical et marqueurs agrandis */}
            {active !== null && (
              <g className="line-chart__active">
                <line className="line-chart__crosshair" x1={positions[active]} x2={positions[active]} y1={0} y2={plotHeight} />
                {visible.map((s, l) => {
                  const y = plottedY(l, active);
                  if (y === null) return null;
                  return (
                    <ChartMarker
                      key={s.id}
                      shape={seriesMarker(s.index)}
                      x={positions[active]}
                      y={y}
                      size={compact ? 3 : 5}
                      color={isBreach(valueAt(s, xs[active])) ? "var(--cadence-dataviz-threshold-breach, #b91c1c)" : seriesColor(s.index)}
                    />
                  );
                })}
              </g>
            )}

            {!compact && <ChartAxisBottom ticks={xTicks} y={plotHeight} plotWidth={plotWidth} dates={xScale.time} />}
          </g>
        </svg>
        <p className="chart__sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>
      {anchor && activeX !== null && <ChartTooltip x={anchor.x} y={anchor.y} title={formatX(activeX)} rows={rows} note={note} />}
    </ChartFrame>
  );
};
