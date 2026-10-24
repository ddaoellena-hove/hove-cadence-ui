import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { scaleBand, scaleLinear } from "d3-scale";
import { ChartAxisBottom, ChartAxisLeft } from "./ChartAxis";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartTooltip } from "./ChartTooltip";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { boxStats, describeBox } from "./box-plot-utils";
import { useChartWidth } from "./use-chart-size";
import "./box-plot.css";

export interface BoxPlotGroup {
  id: string;
  /** « Ligne 13 », « 07 h – 08 h » */
  label: string;
  /** Observations brutes (temps de parcours, retards). Valeurs non finies ignorées. */
  values: number[];
}

export interface BoxPlotThreshold {
  value: number;
  /** « Temps prévu 24 min » — toujours affiché sur la ligne. */
  label: string;
}

export interface BoxPlotProps extends ChartCommonProps {
  /** Un groupe par boîte, dans l'ordre d'affichage. */
  groups: BoxPlotGroup[];
  /** Unité des valeurs (« min »). */
  unit?: string;
  /** Ce que l'on compte, au pluriel (« courses »). Défaut « observations ». */
  countLabel?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Lignes horizontales libellées (temps prévu, objectif). */
  thresholds?: BoxPlotThreshold[];
  /** Bornes de l'axe des valeurs. Défaut : englobe toutes les valeurs, arrondi. */
  yDomain?: [number, number];
  /** Lignes de grille. Défaut true. */
  showGrid?: boolean;
  /** En-tête masqué visuellement (titre toujours lu). */
  hideTitle?: boolean;
  /** Hauteur du tracé. Défaut 280. */
  height?: number;
}

const MARGIN = { top: 20, right: 16, bottom: 28, left: 52 };

/**
 * Boîtes à moustaches : dispersion d'une mesure par groupe (temps de parcours
 * par ligne ou par créneau). Boîte du 1er au 3e quartile, médiane, moustaches
 * de Tukey (1,5 × écart interquartile), valeurs aberrantes en points. Tooltip
 * et clavier par groupe, alternative tabulaire.
 */
export const BoxPlot = ({
  groups,
  unit,
  countLabel = "observations",
  format,
  thresholds = [],
  yDomain,
  showGrid = true,
  hideTitle = false,
  height = 280,
  ...frame
}: BoxPlotProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(plotRef);
  const [active, setActive] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ left: 0, top: 0 });

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);
  const boxes = groups.map((g) => ({ ...g, stats: boxStats(g.values) }));

  const all = [...boxes.flatMap((b) => (b.stats ? [b.stats.min, b.stats.max] : [])), ...thresholds.map((t) => t.value)];
  const low = Math.min(...all, 0);
  const high = Math.max(...all, 1);
  const y = scaleLinear()
    .domain(yDomain ?? [low, high > low ? high : low + 1])
    .range([plotHeight, 0]);
  if (!yDomain) y.nice(5);
  const x = scaleBand<string>().domain(boxes.map((b) => b.id)).range([0, plotWidth]).paddingInner(0.4).paddingOuter(0.25);
  const boxWidth = Math.min(56, x.bandwidth());
  const center = (id: string) => (x(id) ?? 0) + x.bandwidth() / 2;

  const v = (n: number) => formatValueWithUnit(n, unit, format);
  const yTicks = y.ticks(5).map((t) => ({ key: String(t), position: y(t), label: formatKpiValue(t, format) }));
  const xTicks = boxes.map((b) => ({ key: b.id, position: center(b.id), label: b.label }));

  const activate = (index: number | null, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setOrigin({ left: rect.left, top: rect.top });
    setActive(index);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (boxes.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientX - rect.left - MARGIN.left;
    const index = Math.floor((position - (x(boxes[0].id) ?? 0) + (x.step() - x.bandwidth()) / 2) / x.step());
    activate(index >= 0 && index < boxes.length ? index : null, e.currentTarget);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (boxes.length === 0) return;
    if (e.key === "Escape") {
      setActive(null);
      return;
    }
    const last = boxes.length - 1;
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

  const activeBox = active !== null ? boxes[active] : null;
  const table = (show: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={show}
      columns={["Groupe", `Effectif (${countLabel})`, "Minimum", "1er quartile", "Médiane", "3e quartile", "Maximum", "Valeurs aberrantes"].map((c, i) =>
        unit && i >= 2 && i <= 6 ? `${c} (${unit})` : c,
      )}
      numeric={[1, 2, 3, 4, 5, 6, 7]}
      rows={boxes.map((b) =>
        b.stats
          ? [
              b.label,
              formatKpiValue(b.stats.count, { maximumFractionDigits: 0 }),
              ...[b.stats.min, b.stats.q1, b.stats.median, b.stats.q3, b.stats.max].map((n) => formatKpiValue(n, format)),
              formatKpiValue(b.stats.outliers.length, { maximumFractionDigits: 0 }),
            ]
          : [b.label, "0", "—", "—", "—", "—", "—", "0"],
      )}
    />
  );

  return (
    <ChartFrame
      {...frame}
      kind="box-plot"
      titleId={titleId}
      descriptionId={descriptionId}
      height={height}
      hideHeader={hideTitle}
      table={table}
    >
      <div
        ref={plotRef}
        className="chart__plot"
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-roledescription="boîtes à moustaches"
        aria-labelledby={titleId}
        aria-describedby={frame.description ? descriptionId : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActive(null)}
        onFocus={(e) => activate(active ?? (boxes.length ? 0 : null), e.currentTarget)}
        onBlur={() => setActive(null)}
        onKeyDown={handleKeyDown}
      >
        <svg className="chart__svg" width={width} height={height} aria-hidden="true">
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            <ChartAxisLeft ticks={yTicks} plotWidth={plotWidth} grid={showGrid} />
            {active !== null && (
              <rect
                className="box-plot__hover"
                x={(x(boxes[active].id) ?? 0) - (x.step() - x.bandwidth()) / 2}
                y={0}
                width={x.step()}
                height={plotHeight}
              />
            )}

            {boxes.map((b) => {
              if (!b.stats) return null;
              const cx = center(b.id);
              const s = b.stats;
              return (
                <g key={b.id} className="box-plot__group">
                  {/* Moustaches : du bord de la boîte aux valeurs extrêmes non aberrantes */}
                  <line className="box-plot__whisker" x1={cx} x2={cx} y1={y(s.q3)} y2={y(s.highWhisker)} />
                  <line className="box-plot__whisker" x1={cx} x2={cx} y1={y(s.q1)} y2={y(s.lowWhisker)} />
                  <line className="box-plot__cap" x1={cx - boxWidth / 4} x2={cx + boxWidth / 4} y1={y(s.highWhisker)} y2={y(s.highWhisker)} />
                  <line className="box-plot__cap" x1={cx - boxWidth / 4} x2={cx + boxWidth / 4} y1={y(s.lowWhisker)} y2={y(s.lowWhisker)} />
                  <rect className="box-plot__box" x={cx - boxWidth / 2} y={y(s.q3)} width={boxWidth} height={Math.max(1, y(s.q1) - y(s.q3))} rx={2} />
                  <line className="box-plot__median" x1={cx - boxWidth / 2} x2={cx + boxWidth / 2} y1={y(s.median)} y2={y(s.median)} />
                  {s.outliers.map((o, i) => (
                    <circle key={`${o}-${i}`} className="box-plot__outlier" cx={cx} cy={y(o)} r={3} />
                  ))}
                </g>
              );
            })}

            {/* Seuils : ligne tiretée + libellé */}
            {thresholds.map((t) => (
              <g key={`${t.label}-${t.value}`} className="box-plot__threshold">
                <line x1={0} x2={plotWidth} y1={y(t.value)} y2={y(t.value)} />
                <text x={plotWidth} y={y(t.value) - 6} textAnchor="end">
                  {t.label}
                </text>
              </g>
            ))}

            <ChartAxisBottom ticks={xTicks} y={plotHeight} plotWidth={plotWidth} dates />
          </g>
        </svg>
        <p className="chart__sr-only" aria-live="polite">
          {activeBox ? describeBox(activeBox.label, activeBox.stats, countLabel, unit, format) : ""}
        </p>
      </div>
      {activeBox && active !== null && (
        <ChartTooltip
          x={origin.left + MARGIN.left + center(activeBox.id) + boxWidth / 2}
          y={origin.top + MARGIN.top + (activeBox.stats ? y(activeBox.stats.q3) : plotHeight / 2)}
          title={activeBox.label}
          rows={
            activeBox.stats
              ? [
                  { id: "median", label: "Médiane", value: v(activeBox.stats.median) },
                  { id: "iqr", label: "Moitié centrale", value: `${v(activeBox.stats.q1)} à ${v(activeBox.stats.q3)}` },
                  { id: "whiskers", label: "Moustaches", value: `${v(activeBox.stats.lowWhisker)} à ${v(activeBox.stats.highWhisker)}` },
                  { id: "count", label: countLabel.charAt(0).toUpperCase() + countLabel.slice(1), value: formatKpiValue(activeBox.stats.count, { maximumFractionDigits: 0 }) },
                ]
              : [{ id: "none", label: "Valeurs", value: "Aucune" }]
          }
          note={activeBox.stats?.outliers.length ? `${activeBox.stats.outliers.length} valeur(s) aberrante(s) : ${activeBox.stats.outliers.map(v).join(", ")}` : undefined}
        />
      )}
    </ChartFrame>
  );
};
