import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChartAxisBottom, ChartAxisLeft } from "./ChartAxis";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartLegend } from "./ChartLegend";
import { ChartPatternDef, ChartPatternSwatch } from "./ChartPattern";
import { ChartTooltip, type ChartTooltipRow } from "./ChartTooltip";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { seriesColor, seriesMarker, seriesPattern, svgId } from "./chart-palette";
import {
  buildCategoryScale,
  buildSeriesScale,
  buildValueScale,
  categoryTotal,
  stackBars,
  type BarLayout,
} from "./bar-chart-utils";
import { useChartWidth } from "./use-chart-size";
import "./bar-chart.css";

export interface BarChartSeries {
  id: string;
  label: string;
  /** Une valeur par catégorie, dans l'ordre de `categories` ; null = pas de donnée. */
  data: (number | null)[];
  /** Couleur imposée (token attendu : `var(--cadence-dataviz-series-N)`). Défaut : palette, dans l'ordre. */
  color?: string;
}

export interface BarChartProps extends ChartCommonProps {
  /** Libellés des catégories (axe X en vertical, axe Y en horizontal). */
  categories: string[];
  /** Une à huit séries. */
  series: BarChartSeries[];
  /** "stacked" (défaut) : barres empilées ; "grouped" : côte à côte. */
  layout?: BarLayout;
  /** "vertical" (défaut) ou "horizontal" (libellés longs, nombreuses catégories). */
  orientation?: "vertical" | "horizontal";
  /** Unité du tooltip, du tableau et des valeurs (« perturbations »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Valeurs au bout des barres (total de la pile si empilé). Défaut false. */
  showValues?: boolean;
  /** Légende sous le graphique (dès deux séries). Défaut true. */
  showLegend?: boolean;
  /** Lignes de grille. Défaut true. */
  showGrid?: boolean;
  /** En-tête masqué visuellement (titre toujours lu), ex. quand le titre est déjà affiché par une Card. */
  hideTitle?: boolean;
  /** Hauteur du tracé. Défaut 280 en vertical ; 36px par catégorie en horizontal. */
  height?: number;
}

const BAR_ROW = 36;

/**
 * Barres empilées ou groupées, verticales ou horizontales : comparaison de
 * catégories série par série. Motif par série (en plus de la couleur),
 * tooltip par catégorie, navigation au clavier, alternative tabulaire.
 */
export const BarChart = ({
  categories,
  series,
  layout = "stacked",
  orientation = "vertical",
  unit,
  format,
  showValues = false,
  showLegend = true,
  showGrid = true,
  hideTitle = false,
  height: heightProp,
  ...frame
}: BarChartProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const patternPrefix = svgId(useId());
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(plotRef);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ left: 0, top: 0 });

  const horizontal = orientation === "horizontal";
  const indexed = series.map((s, i) => ({ ...s, index: i, color: s.color ?? seriesColor(i), pattern: seriesPattern(i) }));
  const visible = indexed.filter((s) => !hidden.has(s.id));
  const stacked = layout === "stacked";

  // Marge gauche : valeurs (vertical) ou libellés de catégories (horizontal, ~6,5px par caractère)
  const longestLabel = Math.max(0, ...categories.map((c) => c.length));
  const margin = horizontal
    ? { top: 8, right: showValues ? 48 : 16, bottom: 28, left: Math.min(180, Math.max(56, longestLabel * 6.5 + 16)) }
    : { top: showValues ? 20 : 12, right: 16, bottom: 28, left: 52 };
  const height = heightProp ?? (horizontal ? categories.length * BAR_ROW + margin.top + margin.bottom : 280);
  const plotWidth = Math.max(0, width - margin.left - margin.right);
  const plotHeight = Math.max(0, height - margin.top - margin.bottom);

  const categoryLength = horizontal ? plotHeight : plotWidth;
  const valueLength = horizontal ? plotWidth : plotHeight;
  const band = buildCategoryScale(categories, categoryLength, layout);
  const subBand = buildSeriesScale(visible.map((s) => s.id), band.bandwidth());
  const value = buildValueScale(visible, categories, valueLength, layout);
  const layers = stacked ? stackBars(visible, categories) : [];

  const valueTicks = value.ticks(5);
  const formatValue = (v: number | null) => (v === null ? "—" : formatValueWithUnit(v, unit, format));

  /** Rectangle d'une barre de la série l (index dans `visible`) pour la catégorie c. */
  const barRect = (l: number, c: number) => {
    const category = categories[c];
    const start = band(category) ?? 0;
    let from: number;
    let to: number;
    let offset = start;
    let thickness = band.bandwidth();
    if (stacked) {
      [from, to] = layers[l][c];
    } else {
      const v = visible[l].data[c];
      if (v === null || v === undefined) return null;
      from = 0;
      to = v;
      offset = start + (subBand(visible[l].id) ?? 0);
      thickness = subBand.bandwidth();
    }
    if (to - from <= 0) return null;
    const a = value(from);
    const b = value(to);
    return horizontal
      ? { x: a, y: offset, width: b - a, height: thickness }
      : { x: offset, y: plotHeight - b, width: thickness, height: b - a };
  };

  // ── Catégorie active : tooltip et annonce ──
  const rows: ChartTooltipRow[] =
    active === null
      ? []
      : visible.map((s) => ({
          id: s.id,
          label: s.label,
          value: formatValue(s.data[active] ?? null),
          icon: <ChartPatternSwatch kind={s.pattern} color={s.color} />,
        }));
  const total = active !== null && stacked && visible.length > 1 ? categoryTotal(visible, active) : null;
  const note = total !== null ? `Total : ${formatValue(total)}` : undefined;
  const announcement =
    active === null ? "" : `${categories[active]} — ${rows.map((r) => `${r.label} : ${r.value}`).join(", ")}${note ? `. ${note}` : ""}`;

  const anchor = (() => {
    if (active === null) return null;
    const center = (band(categories[active]) ?? 0) + band.bandwidth() / 2;
    return horizontal
      ? { x: origin.left + margin.left + plotWidth / 2, y: origin.top + margin.top + center }
      : { x: origin.left + margin.left + center, y: origin.top + margin.top + plotHeight / 3 };
  })();

  const activate = (index: number | null, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setOrigin({ left: rect.left, top: rect.top });
    setActive(index);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (categories.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const position = horizontal ? e.clientY - rect.top - margin.top : e.clientX - rect.left - margin.left;
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
    const forward = horizontal ? ["ArrowDown", "ArrowRight"] : ["ArrowRight", "ArrowDown"];
    const backward = horizontal ? ["ArrowUp", "ArrowLeft"] : ["ArrowLeft", "ArrowUp"];
    const next = forward.includes(e.key)
      ? Math.min(last, current + 1)
      : backward.includes(e.key)
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
      else if (next.size < series.length - 1) next.add(id); // au moins une série visible
      return next;
    });

  const legend =
    showLegend && series.length > 1 ? (
      <ChartLegend
        items={indexed.map((s) => ({
          id: s.id,
          label: s.label,
          color: s.color,
          marker: seriesMarker(s.index),
          icon: <ChartPatternSwatch kind={s.pattern} color={s.color} />,
          hidden: hidden.has(s.id),
        }))}
        onToggle={toggleSeries}
      />
    ) : undefined;

  const withTotal = stacked && visible.length > 1;
  const table = (show: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={show}
      columns={["Catégorie", ...visible.map((s) => (unit ? `${s.label} (${unit})` : s.label)), ...(withTotal ? ["Total"] : [])]}
      numeric={[...visible.map((_, i) => i + 1), ...(withTotal ? [visible.length + 1] : [])]}
      rows={categories.map((category, c) => [
        category,
        ...visible.map((s) => formatKpiValue(s.data[c] ?? "—", format)),
        ...(withTotal ? [formatKpiValue(categoryTotal(visible, c), format)] : []),
      ])}
    />
  );

  // Graduations : valeurs le long de l'axe des valeurs, catégories le long de l'autre
  const valueAxisTicks = valueTicks.map((v) => ({
    key: String(v),
    position: horizontal ? value(v) : plotHeight - value(v),
    label: formatKpiValue(v, format),
  }));
  const categoryTicks = categories.map((c) => ({
    key: c,
    position: (band(c) ?? 0) + band.bandwidth() / 2,
    label: c,
  }));

  return (
    <ChartFrame
      {...frame}
      kind={`bar-chart bar-chart--${orientation}`}
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
        aria-roledescription="graphique"
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
            {indexed.map((s) => (
              <ChartPatternDef key={s.id} id={`${patternPrefix}-${s.index}`} kind={s.pattern} />
            ))}
          </defs>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Axe des valeurs et grille */}
            {horizontal ? (
              <g aria-hidden="true">
                {valueAxisTicks.map((t) => (
                  <g key={t.key}>
                    {showGrid && <line className="chart__grid-line" x1={t.position} x2={t.position} y1={0} y2={plotHeight} />}
                    <text className="chart__axis-label" x={t.position} y={plotHeight + 18} textAnchor="middle">
                      {t.label}
                    </text>
                  </g>
                ))}
              </g>
            ) : (
              <ChartAxisLeft ticks={valueAxisTicks} plotWidth={showGrid ? plotWidth : 0} />
            )}

            {/* Catégorie active : bande de survol */}
            {active !== null && (
              <rect
                className="bar-chart__hover"
                {...(horizontal
                  ? { x: 0, y: (band(categories[active]) ?? 0) - (band.step() - band.bandwidth()) / 2, width: plotWidth, height: band.step() }
                  : { x: (band(categories[active]) ?? 0) - (band.step() - band.bandwidth()) / 2, y: 0, width: band.step(), height: plotHeight })}
              />
            )}

            {/* Barres : couleur + motif de la série */}
            {visible.map((s, l) =>
              categories.map((category, c) => {
                const rect = barRect(l, c);
                if (!rect) return null;
                return (
                  <g key={`${s.id}-${category}`} className="bar-chart__bar">
                    <rect {...rect} rx={2} fill={s.color} />
                    {s.pattern !== "solid" && <rect {...rect} rx={2} fill={`url(#${patternPrefix}-${s.index})`} />}
                  </g>
                );
              }),
            )}

            {/* Valeurs au bout des barres (total de la pile si empilé) */}
            {showValues &&
              categories.map((category, c) =>
                (stacked ? [null] : visible).map((s, l) => {
                  const v = stacked ? categoryTotal(visible, c) : (s?.data[c] ?? null);
                  if (v === null || v === 0) return null;
                  const center = stacked
                    ? (band(category) ?? 0) + band.bandwidth() / 2
                    : (band(category) ?? 0) + (subBand(visible[l].id) ?? 0) + subBand.bandwidth() / 2;
                  const end = value(v);
                  return (
                    <text
                      key={`${category}-${s?.id ?? "total"}`}
                      className="bar-chart__value"
                      {...(horizontal
                        ? { x: end + 6, y: center, dy: "0.32em", textAnchor: "start" }
                        : { x: center, y: plotHeight - end - 6, textAnchor: "middle" })}
                    >
                      {formatKpiValue(v, format)}
                    </text>
                  );
                }),
              )}

            {/* Axe des catégories */}
            {horizontal ? (
              <g aria-hidden="true">
                {categoryTicks.map((t) => (
                  <text key={t.key} className="chart__axis-label chart__axis-label--date" x={-8} y={t.position} dy="0.32em" textAnchor="end">
                    {t.label}
                  </text>
                ))}
                <line className="chart__axis-line" x1={0} x2={0} y1={0} y2={plotHeight} />
              </g>
            ) : (
              <ChartAxisBottom ticks={categoryTicks} y={plotHeight} plotWidth={plotWidth} dates />
            )}
          </g>
        </svg>
        <p className="chart__sr-only" aria-live="polite">
          {announcement}
        </p>
      </div>
      {anchor && active !== null && <ChartTooltip x={anchor.x} y={anchor.y} title={categories[active]} rows={rows} note={note} />}
    </ChartFrame>
  );
};
