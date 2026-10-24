import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { curveMonotoneX, line as d3Line } from "d3-shape";
import { ChartAxisBottom, ChartAxisLeft } from "./ChartAxis";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartLegend } from "./ChartLegend";
import { ChartMarker } from "./ChartMarker";
import { ChartPatternDef, ChartPatternSwatch } from "./ChartPattern";
import { ChartTooltip, type ChartTooltipRow } from "./ChartTooltip";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { seriesColor, seriesMarker, seriesPattern, svgId } from "./chart-palette";
import { buildCategoryScale, buildSeriesScale, buildValueScale, stackBars, type BarLayout } from "./bar-chart-utils";
import { axisTitle, buildLineScale } from "./combo-chart-utils";
import { useChartWidth } from "./use-chart-size";
import "./combo-chart.css";

export interface ComboChartSeries {
  id: string;
  label: string;
  /** Une valeur par catégorie, dans l'ordre de `categories` ; null = pas de donnée. */
  data: (number | null)[];
}

export interface ComboChartAxis {
  /** Titre de l'axe, affiché au-dessus (« Validations », « Ponctualité »). */
  label: string;
  /** Unité, accolée au titre et aux valeurs (« k », « % »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
}

export interface ComboChartLineAxis extends ComboChartAxis {
  /** Bornes imposées de l'axe droit (« 80 → 100 % »). Défaut : min(0, valeurs) → maximum arrondi. */
  domain?: [number, number];
}

export interface ComboChartThreshold {
  value: number;
  /** « Objectif 95 % » — toujours affiché sur la ligne. */
  label: string;
}

export interface ComboChartProps extends ChartCommonProps {
  /** Libellés des catégories (axe X) : jours, semaines, lignes. */
  categories: string[];
  /** Séries en barres, sur l'axe gauche. */
  bars: ComboChartSeries[];
  /** Séries en courbes, sur l'axe droit. */
  lines: ComboChartSeries[];
  /** Axe gauche (barres). */
  barAxis: ComboChartAxis;
  /** Axe droit (courbes). */
  lineAxis: ComboChartLineAxis;
  /** Plusieurs séries de barres : "grouped" (défaut) ou "stacked". */
  barLayout?: BarLayout;
  /** Seuils libellés sur l'axe droit (courbes). */
  lineThresholds?: ComboChartThreshold[];
  /** Légende cliquable. Défaut true. */
  showLegend?: boolean;
  /** Lignes de grille (axe gauche). Défaut true. */
  showGrid?: boolean;
  /** En-tête masqué visuellement (titre toujours lu). */
  hideTitle?: boolean;
  /** Hauteur du tracé. Défaut 300. */
  height?: number;
}

const MARGIN = { top: 32, right: 56, bottom: 28, left: 56 };
// Motif de trait des courbes (en plus de la couleur et du marqueur)
const DASHES = ["", "6 4", "2 3", "10 4 2 4"];

/**
 * Barres et courbes sur une même période, à deux axes Y titrés : volume
 * (barres, axe gauche) et taux (courbes, axe droit). Fréquentation et
 * ponctualité, offre et demande. Tooltip par catégorie, clavier, légende,
 * alternative tabulaire.
 */
export const ComboChart = ({
  categories,
  bars,
  lines,
  barAxis,
  lineAxis,
  barLayout = "grouped",
  lineThresholds = [],
  showLegend = true,
  showGrid = true,
  hideTitle = false,
  height = 300,
  ...frame
}: ComboChartProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const patternPrefix = svgId(useId());
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(plotRef);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ left: 0, top: 0 });

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  // Couleurs : barres d'abord, courbes ensuite, sans réutiliser une couleur
  const barSeries = bars.map((s, i) => ({ ...s, index: i, color: seriesColor(i), pattern: seriesPattern(i) }));
  const lineSeries = lines.map((s, j) => ({ ...s, index: bars.length + j, dash: DASHES[j % DASHES.length], color: seriesColor(bars.length + j) }));
  const visibleBars = barSeries.filter((s) => !hidden.has(s.id));
  const visibleLines = lineSeries.filter((s) => !hidden.has(s.id));

  const stacked = barLayout === "stacked" && visibleBars.length > 1;
  const layout: BarLayout = stacked ? "stacked" : "grouped";
  const band = buildCategoryScale(categories, plotWidth, layout);
  const subBand = buildSeriesScale(visibleBars.map((s) => s.id), band.bandwidth());
  const barScale = buildValueScale(visibleBars, categories, plotHeight, layout);
  const layers = stacked ? stackBars(visibleBars, categories) : [];
  const lineScale = buildLineScale(visibleLines, plotHeight, lineAxis.domain, lineThresholds.map((t) => t.value));
  const center = (c: number) => (band(categories[c]) ?? 0) + band.bandwidth() / 2;

  const formatBar = (v: number | null) => (v === null ? "—" : formatValueWithUnit(v, barAxis.unit, barAxis.format));
  const formatLine = (v: number | null) => (v === null ? "—" : formatValueWithUnit(v, lineAxis.unit, lineAxis.format));

  const leftTicks = barScale.ticks(5).map((v) => ({ key: String(v), position: plotHeight - barScale(v), label: formatKpiValue(v, barAxis.format) }));
  const rightTicks = lineScale.ticks(5).map((v) => ({ key: String(v), position: lineScale(v), label: formatKpiValue(v, lineAxis.format) }));
  const categoryTicks = (() => {
    const step = Math.max(1, Math.ceil((categories.length * 56) / Math.max(1, plotWidth)));
    return categories.filter((_, i) => i % step === 0).map((c) => ({ key: c, position: (band(c) ?? 0) + band.bandwidth() / 2, label: c }));
  })();

  /** Rectangle d'une barre (série l parmi les visibles, catégorie c). */
  const barRect = (l: number, c: number) => {
    let from = 0;
    let to: number;
    let x = band(categories[c]) ?? 0;
    let w = band.bandwidth();
    if (stacked) {
      [from, to] = layers[l][c];
    } else {
      const v = visibleBars[l].data[c];
      if (v === null || v === undefined) return null;
      to = v;
      x += subBand(visibleBars[l].id) ?? 0;
      w = subBand.bandwidth();
    }
    if (to - from <= 0) return null;
    return { x, y: plotHeight - barScale(to), width: w, height: barScale(to) - barScale(from) };
  };

  const linePath = (data: (number | null)[]) =>
    d3Line<number | null>()
      .defined((v) => v !== null && Number.isFinite(v))
      .x((_, c) => center(c))
      .y((v) => lineScale(v as number))
      .curve(curveMonotoneX)(data) ?? undefined;

  // ── Catégorie active : tooltip et annonce ──
  const rows: ChartTooltipRow[] =
    active === null
      ? []
      : [
          ...visibleBars.map((s) => ({
            id: s.id,
            label: s.label,
            value: formatBar(s.data[active] ?? null),
            icon: <ChartPatternSwatch kind={s.pattern} color={s.color} />,
          })),
          ...visibleLines.map((s) => ({
            id: s.id,
            label: s.label,
            value: formatLine(s.data[active] ?? null),
            color: s.color,
            marker: seriesMarker(s.index),
          })),
        ];
  const announcement = active === null ? "" : `${categories[active]} — ${rows.map((r) => `${r.label} : ${r.value}`).join(", ")}`;
  const anchor =
    active !== null ? { x: origin.left + MARGIN.left + center(active), y: origin.top + MARGIN.top + plotHeight / 3 } : null;

  const activate = (index: number | null, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setOrigin({ left: rect.left, top: rect.top });
    setActive(index);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (categories.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientX - rect.left - MARGIN.left;
    const step = band.step();
    const index = Math.floor((position - (band(categories[0]) ?? 0) + (step - band.bandwidth()) / 2) / step);
    activate(index >= 0 && index < categories.length ? index : null, e.currentTarget);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (categories.length === 0) return;
    if (e.key === "Escape") {
      setActive(null);
      return;
    }
    const last = categories.length - 1;
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
    if (next === null) return;
    e.preventDefault();
    activate(next, e.currentTarget);
  };

  const toggleSeries = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < bars.length + lines.length - 1) next.add(id); // au moins une série visible
      return next;
    });

  const legend = showLegend ? (
    <ChartLegend
      items={[
        ...barSeries.map((s) => ({
          id: s.id,
          label: s.label,
          color: s.color,
          marker: seriesMarker(s.index),
          icon: <ChartPatternSwatch kind={s.pattern} color={s.color} />,
          hidden: hidden.has(s.id),
        })),
        ...lineSeries.map((s) => ({ id: s.id, label: s.label, color: s.color, marker: seriesMarker(s.index), hidden: hidden.has(s.id) })),
      ]}
      onToggle={toggleSeries}
    />
  ) : undefined;

  const table = (show: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={show}
      columns={[
        "Catégorie",
        ...barSeries.map((s) => axisTitle(s.label, barAxis.unit)),
        ...lineSeries.map((s) => axisTitle(s.label, lineAxis.unit)),
      ]}
      numeric={[...barSeries, ...lineSeries].map((_, i) => i + 1)}
      rows={categories.map((category, c) => [
        category,
        ...barSeries.map((s) => formatKpiValue(s.data[c] ?? "—", barAxis.format)),
        ...lineSeries.map((s) => formatKpiValue(s.data[c] ?? "—", lineAxis.format)),
      ])}
    />
  );

  return (
    <ChartFrame
      {...frame}
      kind="combo-chart"
      titleId={titleId}
      descriptionId={descriptionId}
      height={height}
      hideHeader={hideTitle}
      legend={legend}
      table={table}
    >
      <div
        ref={plotRef}
        className="chart__plot"
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-roledescription="graphique combiné"
        aria-labelledby={titleId}
        aria-describedby={frame.description ? descriptionId : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActive(null)}
        onFocus={(e) => activate(active ?? (categories.length ? 0 : null), e.currentTarget)}
        onBlur={() => setActive(null)}
        onKeyDown={handleKeyDown}
      >
        <svg className="chart__svg" width={width} height={height} aria-hidden="true">
          <defs>
            {barSeries.map((s) => (
              <ChartPatternDef key={s.id} id={`${patternPrefix}-${s.index}`} kind={s.pattern} />
            ))}
          </defs>
          {/* Titres des deux axes, au-dessus de chacun */}
          <text className="combo-chart__axis-title" x={MARGIN.left - 8} y={14} textAnchor="start">
            {axisTitle(barAxis.label, barAxis.unit)}
          </text>
          <text className="combo-chart__axis-title" x={width - MARGIN.right + 8} y={14} textAnchor="end">
            {axisTitle(lineAxis.label, lineAxis.unit)}
          </text>
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            <ChartAxisLeft ticks={leftTicks} plotWidth={plotWidth} grid={showGrid} />
            {/* Axe droit : valeurs des courbes */}
            <g aria-hidden="true">
              {rightTicks.map((t) => (
                <text key={t.key} className="chart__axis-label" x={plotWidth + 8} y={t.position} dy="0.32em" textAnchor="start">
                  {t.label}
                </text>
              ))}
            </g>

            {active !== null && (
              <rect
                className="combo-chart__hover"
                x={(band(categories[active]) ?? 0) - (band.step() - band.bandwidth()) / 2}
                y={0}
                width={band.step()}
                height={plotHeight}
              />
            )}

            {/* Barres : couleur + motif de la série */}
            {visibleBars.map((s, l) =>
              categories.map((category, c) => {
                const rect = barRect(l, c);
                if (!rect) return null;
                return (
                  <g key={`${s.id}-${category}`} className="combo-chart__bar">
                    <rect {...rect} rx={2} fill={s.color} />
                    {s.pattern !== "solid" && <rect {...rect} rx={2} fill={`url(#${patternPrefix}-${s.index})`} />}
                  </g>
                );
              }),
            )}

            {/* Seuils de l'axe droit */}
            {lineThresholds.map((t) => (
              <g key={`${t.label}-${t.value}`} className="combo-chart__threshold">
                <line x1={0} x2={plotWidth} y1={lineScale(t.value)} y2={lineScale(t.value)} />
                <text x={plotWidth} y={lineScale(t.value) - 6} textAnchor="end">
                  {t.label}
                </text>
              </g>
            ))}

            {/* Courbes : couleur, motif de trait et marqueurs */}
            {visibleLines.map((s) => (
              <g key={s.id}>
                <path className="combo-chart__line" d={linePath(s.data)} stroke={s.color} strokeDasharray={s.dash || undefined} />
                {s.data.map((v, c) =>
                  v === null || !Number.isFinite(v) ? null : (
                    <ChartMarker
                      key={categories[c]}
                      shape={seriesMarker(s.index)}
                      x={center(c)}
                      y={lineScale(v)}
                      size={active === c ? 5 : 3}
                      color={s.color}
                    />
                  ),
                )}
              </g>
            ))}

            <ChartAxisBottom ticks={categoryTicks} y={plotHeight} plotWidth={plotWidth} dates />
          </g>
        </svg>
        <p className="chart__sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>
      {anchor && active !== null && <ChartTooltip x={anchor.x} y={anchor.y} title={categories[active]} rows={rows} />}
    </ChartFrame>
  );
};
