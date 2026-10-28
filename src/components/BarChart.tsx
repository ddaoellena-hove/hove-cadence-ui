import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChartAxisBottom, ChartAxisLeft } from "./ChartAxis";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartLegend } from "./ChartLegend";
import { ChartPatternDef, ChartPatternSwatch } from "./ChartPattern";
import { ChartTooltip, type ChartTooltipRow } from "./ChartTooltip";
import { formatGap, formatKpiValue, formatValueWithUnit } from "./chart-format";
import { paletteIndex, REFERENCE_COLOR, seriesColor, seriesMarker, seriesPattern, svgId } from "./chart-palette";
import { ReferenceSwatch } from "./ChartMarker";
import {
  buildCategoryScale,
  buildSeriesScale,
  buildValueScale,
  categoryTotal,
  includeReferences,
  stackBars,
} from "./bar-chart-utils";
import type { BarLayout } from "./chart-types";
import { useChartSync } from "./chart-sync";
import { useChartWidth } from "./use-chart-size";
import "./bar-chart.css";

export interface BarChartSeries {
  id: string;
  label: string;
  /** Une valeur par catégorie, dans l'ordre de `categories` ; null = pas de donnée. */
  data: (number | null)[];
  /** Couleur imposée (token attendu : `var(--cadence-dataviz-series-N)`). Défaut : palette, dans l'ordre. */
  color?: string;
  /**
   * Série de référence (période précédente, semaine type) : trait tireté
   * ardoise en travers de chaque catégorie, hors empilement et groupement.
   */
  reference?: boolean;
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
  /**
   * Événements datés (grève, travaux, météo) : bande sur une catégorie ou un
   * intervalle de catégories `[début, fin]`, toujours libellée, rappelée au survol.
   */
  annotations?: BarChartAnnotation[];
  /**
   * Catégorie cliquable : clic sur sa bande (toute la hauteur du tracé), ou
   * Entrée / Espace sur la catégorie active au clavier. Sans effet sur une
   * catégorie sans valeur. Les en-têtes de « Voir les données » deviennent des boutons.
   */
  onDatumClick?: (datum: BarChartDatum) => void;
  /** Catégorie mise en avant (filtre actif côté app), contrôlée : contour, autres barres atténuées. */
  selectedCategory?: string;
  /** Rappel d'interaction (tooltip, description lue). Défaut « Entrée ou clic : voir le détail ». */
  clickHint?: string;
}

/** Catégorie cliquée (onDatumClick) : la colonne entière, toutes séries hors références. */
export interface BarChartDatum {
  category: string;
  /** Position dans `categories`. */
  index: number;
  /** Valeurs de la catégorie, séries de référence exclues (y compris les séries masquées par la légende). */
  values: { seriesId: string; value: number | null }[];
}

export interface BarChartAnnotation {
  /** Catégorie, ou intervalle de catégories (bornes comprises). */
  at: string | [string, string];
  /** « Grève 16/10 » */
  label: string;
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
  annotations = [],
  onDatumClick,
  selectedCategory,
  clickHint = "Entrée ou clic : voir le détail",
  ...frame
}: BarChartProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const hintId = useId();
  const patternPrefix = svgId(useId());
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(plotRef);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ left: 0, top: 0 });

  const horizontal = orientation === "horizontal";
  // Les références ne consomment pas de couleur ni de motif de la palette
  const indexed = series.map((s, i) => ({
    ...s,
    index: i,
    color: s.reference ? REFERENCE_COLOR : (s.color ?? seriesColor(paletteIndex(series, i))),
    pattern: seriesPattern(paletteIndex(series, i)),
  }));
  const visible = indexed.filter((s) => !s.reference && !hidden.has(s.id));
  const references = indexed.filter((s) => s.reference && !hidden.has(s.id));
  const stacked = layout === "stacked";
  const selected = selectedCategory === undefined ? -1 : categories.indexOf(selectedCategory);

  // ── Clic sur une catégorie : la colonne entière, ignorée si aucune valeur ──
  const datumAt = (c: number): BarChartDatum | null => {
    const values = series.filter((s) => !s.reference).map((s) => ({ seriesId: s.id, value: s.data[c] ?? null }));
    return values.some((v) => v.value !== null) ? { category: categories[c], index: c, values } : null;
  };
  const clickable = (c: number | null) => Boolean(onDatumClick) && c !== null && datumAt(c) !== null;
  const select = (c: number | null) => {
    const datum = c === null ? null : datumAt(c);
    if (datum) onDatumClick?.(datum);
  };

  // Marge gauche : valeurs (vertical) ou libellés de catégories (horizontal, ~6,5px par caractère)
  const longestLabel = Math.max(0, ...categories.map((c) => c.length));
  const margin = horizontal
    ? { top: 8, right: showValues ? 48 : 16, bottom: 28, left: Math.min(180, Math.max(56, longestLabel * 6.5 + 16)) }
    : { top: showValues || annotations.length > 0 ? 20 : 12, right: 16, bottom: 28, left: 52 };
  const height = heightProp ?? (horizontal ? categories.length * BAR_ROW + margin.top + margin.bottom : 280);
  const plotWidth = Math.max(0, width - margin.left - margin.right);
  const plotHeight = Math.max(0, height - margin.top - margin.bottom);

  const categoryLength = horizontal ? plotHeight : plotWidth;
  const valueLength = horizontal ? plotWidth : plotHeight;
  const band = buildCategoryScale(categories, categoryLength, layout);
  const subBand = buildSeriesScale(visible.map((s) => s.id), band.bandwidth());
  const value = includeReferences(buildValueScale(visible, categories, valueLength, layout), references);
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

  // Curseur synchronisé (ChartSyncGroup) : catégorie posée par un autre graphique, repérée sans tooltip
  const syncedKey = useChartSync(active !== null ? (categories[active] ?? null) : null);
  const syncedIndex = syncedKey === null ? -1 : categories.indexOf(syncedKey);
  const shown = active ?? (syncedIndex >= 0 ? syncedIndex : null);

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
  if (active !== null) {
    for (const r of references) rows.push({ id: r.id, label: r.label, value: formatValue(r.data[active] ?? null), icon: <ReferenceSwatch /> });
  }
  const total = active !== null && stacked && visible.length > 1 ? categoryTotal(visible, active) : null;
  // Une seule référence : écart avec la série (ou le total empilé) de la catégorie
  const gap = (() => {
    if (active === null || references.length !== 1 || visible.length === 0 || (!stacked && visible.length !== 1)) return null;
    const current = stacked ? categoryTotal(visible, active) : visible[0].data[active];
    const previous = references[0].data[active];
    if (current === null || current === undefined || previous === null || previous === undefined) return null;
    return `Écart vs ${references[0].label} : ${formatGap(current - previous, unit, format)}`;
  })();
  // Annotations : index des catégories couvertes (inconnues ignorées)
  const resolvedAnnotations = annotations.flatMap((a) => {
    const [from, to] = Array.isArray(a.at) ? a.at : [a.at, a.at];
    const i = categories.indexOf(from);
    const j = categories.indexOf(to);
    return i < 0 || j < 0 ? [] : [{ label: a.label, first: Math.min(i, j), last: Math.max(i, j) }];
  });
  const activeAnnotations = active === null ? [] : resolvedAnnotations.filter((a) => active >= a.first && active <= a.last).map((a) => a.label);
  const note = [...activeAnnotations, total !== null ? `Total : ${formatValue(total)}` : null, gap].filter(Boolean).join(" · ") || undefined;
  const announcement =
    active === null ? "" : `${categories[active]}${active === selected ? ", sélectionné" : ""} — ${rows.map((r) => `${r.label} : ${r.value}`).join(", ")}${note ? `. ${note}` : ""}`;

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

  /** Catégorie sous le pointeur (bande complète, espaces compris), null hors du tracé. */
  const indexAt = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = horizontal ? e.clientY - rect.top - margin.top : e.clientX - rect.left - margin.left;
    const step = band.step();
    const index = Math.floor((position - (band(categories[0]) ?? 0) + (step - band.bandwidth()) / 2) / step);
    return index >= 0 && index < categories.length ? index : null;
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (categories.length === 0) return;
    activate(indexAt(e), e.currentTarget);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (categories.length === 0) return;
    if ((e.key === "Enter" || e.key === " ") && onDatumClick) {
      e.preventDefault();
      select(active);
      return;
    }
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
          icon: s.reference ? <ReferenceSwatch /> : <ChartPatternSwatch kind={s.pattern} color={s.color} />,
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
      columns={[
        "Catégorie",
        ...visible.map((s) => (unit ? `${s.label} (${unit})` : s.label)),
        ...(withTotal ? ["Total"] : []),
        ...references.map((s) => (unit ? `${s.label} (${unit})` : s.label)),
      ]}
      numeric={[...visible, ...(withTotal ? [null] : []), ...references].map((_, i) => i + 1)}
      rows={categories.map((category, c) => [
        category,
        ...visible.map((s) => formatKpiValue(s.data[c] ?? "—", format)),
        ...(withTotal ? [formatKpiValue(categoryTotal(visible, c), format)] : []),
        ...references.map((s) => formatKpiValue(s.data[c] ?? "—", format)),
      ])}
      rowActions={onDatumClick ? categories.map((_, c) => (clickable(c) ? () => select(c) : undefined)) : undefined}
      currentRow={selected >= 0 ? selected : undefined}
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
        className={`chart__plot${clickable(shown) ? " bar-chart__plot--clickable" : ""}`}
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-roledescription="graphique"
        aria-labelledby={titleId}
        aria-describedby={[frame.description ? descriptionId : null, onDatumClick ? hintId : null].filter(Boolean).join(" ") || undefined}
        onMouseMove={handleMouseMove}
        onClick={onDatumClick ? (e) => categories.length > 0 && select(indexAt(e)) : undefined}
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
              <ChartAxisLeft ticks={valueAxisTicks} plotWidth={plotWidth} grid={showGrid} />
            )}

            {/* Annotations : bande libellée sur une ou plusieurs catégories */}
            {resolvedAnnotations.map((a) => {
              const gapPx = (band.step() - band.bandwidth()) / 2;
              const start = (band(categories[a.first]) ?? 0) - gapPx;
              const end = (band(categories[a.last]) ?? 0) + band.bandwidth() + gapPx;
              return (
                <g key={`${a.label}-${a.first}`} className="bar-chart__annotation">
                  <rect
                    className="bar-chart__annotation-band"
                    {...(horizontal ? { x: 0, y: start, width: plotWidth, height: end - start } : { x: start, y: 0, width: end - start, height: plotHeight })}
                  />
                  <text className="bar-chart__annotation-label" {...(horizontal ? { x: plotWidth - 4, y: start + 12, textAnchor: "end" } : { x: start + 4, y: -6 })}>
                    {a.label}
                  </text>
                </g>
              );
            })}

            {/* Catégorie active : bande de survol */}
            {shown !== null && (
              <rect
                className="bar-chart__hover"
                {...(horizontal
                  ? { x: 0, y: (band(categories[shown]) ?? 0) - (band.step() - band.bandwidth()) / 2, width: plotWidth, height: band.step() }
                  : { x: (band(categories[shown]) ?? 0) - (band.step() - band.bandwidth()) / 2, y: 0, width: band.step(), height: plotHeight })}
              />
            )}

            {/* Barres : couleur + motif de la série */}
            {visible.map((s, l) =>
              categories.map((category, c) => {
                const rect = barRect(l, c);
                if (!rect) return null;
                return (
                  <g key={`${s.id}-${category}`} className={`bar-chart__bar${selected >= 0 && c !== selected ? " bar-chart__bar--muted" : ""}`}>
                    <rect {...rect} rx={2} fill={s.color} />
                    {s.pattern !== "solid" && <rect {...rect} rx={2} fill={`url(#${patternPrefix}-${s.index})`} />}
                  </g>
                );
              }),
            )}

            {/* Références : trait tireté en travers de la catégorie */}
            {references.map((r) =>
              categories.map((category, c) => {
                const v = r.data[c];
                if (v === null || v === undefined) return null;
                const start = (band(category) ?? 0) - 3;
                const end = (band(category) ?? 0) + band.bandwidth() + 3;
                const at = horizontal ? value(v) : plotHeight - value(v);
                return (
                  <line
                    key={`${r.id}-${category}`}
                    className="bar-chart__reference"
                    {...(horizontal ? { x1: at, x2: at, y1: start, y2: end } : { x1: start, x2: end, y1: at, y2: at })}
                  />
                );
              }),
            )}

            {/* Catégorie sélectionnée : contour plein de la bande (pas la couleur seule) */}
            {selected >= 0 && (
              <rect
                className="bar-chart__selected"
                rx={3}
                {...(horizontal
                  ? { x: 1, y: (band(categories[selected]) ?? 0) - (band.step() - band.bandwidth()) / 2 + 1, width: Math.max(0, plotWidth - 2), height: Math.max(0, band.step() - 2) }
                  : { x: (band(categories[selected]) ?? 0) - (band.step() - band.bandwidth()) / 2 + 1, y: 1, width: Math.max(0, band.step() - 2), height: Math.max(0, plotHeight - 2) })}
              />
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
      {onDatumClick && (
        <p id={hintId} className="chart__sr-only">
          {selected >= 0 ? `${clickHint}. Sélection : ${categories[selected]}.` : `${clickHint}.`}
        </p>
      )}
      {anchor && active !== null && (
        <ChartTooltip x={anchor.x} y={anchor.y} title={categories[active]} rows={rows} note={note} hint={clickable(active) ? clickHint : undefined} />
      )}
    </ChartFrame>
  );
};
