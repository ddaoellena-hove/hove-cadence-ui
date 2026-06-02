import React from "react";
import "./data-visualization.css";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataVisualizationSeries {
  label: string;
  /** Override series color. Falls back to CSS token --CAI-dv-series-N */
  color?: string;
  data: number[];
}

export interface DataVisualizationProps {
  /** Chart variant */
  type: "stacked-vertical" | "grouped-vertical" | "horizontal";
  /** One entry per series */
  series: DataVisualizationSeries[];
  /** Category labels (x-axis for vertical, y-axis for horizontal) */
  categories: string[];
  /** Total SVG height in px (excluding legend). Default 260 */
  height?: number;
  /** Show legend below chart. Default true */
  showLegend?: boolean;
  /** Show horizontal grid lines. Default true */
  showGridLines?: boolean;
  /** Show value labels on bars. Default false */
  showValues?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERIES_COLORS = [
  "var(--CAI-dv-series-1)",
  "var(--CAI-dv-series-2)",
  "var(--CAI-dv-series-3)",
  "var(--CAI-dv-series-4)",
  "var(--CAI-dv-series-5)",
  "var(--CAI-dv-series-6)",
];

const MARGIN = { top: 16, right: 16, bottom: 36, left: 44 };

// ─── Utilities ────────────────────────────────────────────────────────────────

function niceMax(raw: number): number {
  if (raw === 0) return 10;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const nice = Math.ceil(raw / mag) * mag;
  return nice;
}

function gridTicks(maxVal: number, count = 5): number[] {
  const step = maxVal / count;
  return Array.from({ length: count + 1 }, (_, i) => i * step);
}

function seriesColor(s: DataVisualizationSeries, idx: number): string {
  return s.color ?? SERIES_COLORS[idx % SERIES_COLORS.length];
}

// ─── Shared sub-components ────────────────────────────────────────────────────

interface GridLinesProps {
  ticks: number[];
  maxVal: number;
  innerW: number;
  innerH: number;
  marginLeft: number;
  marginTop: number;
}

function GridLines({
  ticks,
  maxVal,
  innerW,
  innerH,
  marginLeft,
  marginTop,
}: GridLinesProps) {
  return (
    <>
      {ticks.map((t) => {
        const y = marginTop + innerH - (t / maxVal) * innerH;
        return (
          <line
            key={t}
            x1={marginLeft}
            x2={marginLeft + innerW}
            y1={y}
            y2={y}
            className="dv__grid-line"
          />
        );
      })}
    </>
  );
}

interface YAxisProps {
  ticks: number[];
  maxVal: number;
  innerH: number;
  marginLeft: number;
  marginTop: number;
}

function YAxis({ ticks, maxVal, innerH, marginLeft, marginTop }: YAxisProps) {
  return (
    <>
      {ticks.map((t) => {
        const y = marginTop + innerH - (t / maxVal) * innerH;
        const label = Number.isInteger(t) ? String(t) : t.toFixed(1);
        return (
          <text
            key={t}
            x={marginLeft - 6}
            y={y}
            className="dv__axis-label"
            textAnchor="end"
            dominantBaseline="middle"
          >
            {label}
          </text>
        );
      })}
      {/* Axis line */}
      <line
        x1={marginLeft}
        x2={marginLeft}
        y1={marginTop}
        y2={marginTop + innerH}
        className="dv__axis-line"
      />
    </>
  );
}

interface XLabelsProps {
  categories: string[];
  innerW: number;
  innerH: number;
  marginLeft: number;
  marginTop: number;
}

function XLabels({
  categories,
  innerW,
  innerH,
  marginLeft,
  marginTop,
}: XLabelsProps) {
  const colW = innerW / categories.length;
  return (
    <>
      {categories.map((cat, i) => (
        <text
          key={i}
          x={marginLeft + i * colW + colW / 2}
          y={marginTop + innerH + 16}
          className="dv__axis-label"
          textAnchor="middle"
          dominantBaseline="auto"
        >
          {cat}
        </text>
      ))}
      {/* Baseline */}
      <line
        x1={marginLeft}
        x2={marginLeft + innerW}
        y1={marginTop + innerH}
        y2={marginTop + innerH}
        className="dv__axis-line"
      />
    </>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

interface LegendProps {
  series: DataVisualizationSeries[];
}

function Legend({ series }: LegendProps) {
  return (
    <div className="dv__legend">
      {series.map((s, i) => (
        <div key={i} className="dv__legend-item">
          <span
            className="dv__legend-dot"
            style={{ background: seriesColor(s, i) }}
          />
          <span className="dv__legend-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stacked Vertical ─────────────────────────────────────────────────────────

function StackedVertical({
  series,
  categories,
  innerW,
  innerH,
  marginLeft,
  marginTop,
  maxVal,
  showValues,
}: {
  series: DataVisualizationSeries[];
  categories: string[];
  innerW: number;
  innerH: number;
  marginLeft: number;
  marginTop: number;
  maxVal: number;
  showValues: boolean;
}) {
  const catCount = categories.length;
  const colW = innerW / catCount;
  const barW = Math.min(Math.max(colW * 0.55, 16), 48);
  const RADIUS = 4;

  return (
    <>
      {categories.map((_, ci) => {
        // Accumulate stack from bottom
        let accumulated = 0;
        return (
          <g key={ci}>
            {series.map((s, si) => {
              const val = s.data[ci] ?? 0;
              const barH = (val / maxVal) * innerH;
              const x = marginLeft + ci * colW + colW / 2 - barW / 2;
              const y =
                marginTop + innerH - ((accumulated + val) / maxVal) * innerH;
              const color = seriesColor(s, si);
              const isTop =
                si === series.length - 1 ||
                series.slice(si + 1).every((ss) => (ss.data[ci] ?? 0) === 0);
              accumulated += val;

              if (barH <= 0) return null;

              // Top segment gets rounded top corners; others are flat
              const r = isTop ? RADIUS : 0;
              const d = `M${x + r},${y} H${x + barW - r} Q${x + barW},${y} ${x + barW},${y + r} V${y + barH} H${x} V${y + r} Q${x},${y} ${x + r},${y}`;

              return (
                <g key={si}>
                  <path d={d} fill={color} className="dv__bar" />
                  {showValues && barH > 14 && (
                    <text
                      x={x + barW / 2}
                      y={y + barH / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="dv__value-label"
                    >
                      {val}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </>
  );
}

// ─── Grouped Vertical ─────────────────────────────────────────────────────────

function GroupedVertical({
  series,
  categories,
  innerW,
  innerH,
  marginLeft,
  marginTop,
  maxVal,
  showValues,
}: {
  series: DataVisualizationSeries[];
  categories: string[];
  innerW: number;
  innerH: number;
  marginLeft: number;
  marginTop: number;
  maxVal: number;
  showValues: boolean;
}) {
  const catCount = categories.length;
  const seriesCount = series.length;
  const colW = innerW / catCount;
  const groupGap = 8;
  const barGap = 3;
  const availW = colW - groupGap * 2;
  const barW = Math.min(
    Math.max((availW - barGap * (seriesCount - 1)) / seriesCount, 8),
    48,
  );
  const totalGroupW = barW * seriesCount + barGap * (seriesCount - 1);
  const RADIUS = 4;

  return (
    <>
      {categories.map((_, ci) => (
        <g key={ci}>
          {series.map((s, si) => {
            const val = s.data[ci] ?? 0;
            const barH = (val / maxVal) * innerH;
            const groupStartX =
              marginLeft + ci * colW + colW / 2 - totalGroupW / 2;
            const x = groupStartX + si * (barW + barGap);
            const y = marginTop + innerH - barH;
            const color = seriesColor(s, si);

            if (barH <= 0) return null;

            const d = `M${x + RADIUS},${y} H${x + barW - RADIUS} Q${x + barW},${y} ${x + barW},${y + RADIUS} V${y + barH} H${x} V${y + RADIUS} Q${x},${y} ${x + RADIUS},${y}`;

            return (
              <g key={si}>
                <path d={d} fill={color} className="dv__bar" />
                {showValues && barH > 16 && (
                  <text
                    x={x + barW / 2}
                    y={y + barH / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="dv__value-label"
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      ))}
    </>
  );
}

// ─── Horizontal ───────────────────────────────────────────────────────────────

function HorizontalChart({
  series,
  categories,
  svgW,
  svgH,
  showGridLines,
  showValues,
}: {
  series: DataVisualizationSeries[];
  categories: string[];
  svgW: number;
  svgH: number;
  showGridLines: boolean;
  showValues: boolean;
}) {
  // For horizontal: categories on Y axis, values on X axis
  // Use a wider left margin to fit category labels
  const mTop = 16;
  const mBottom = 32;
  const mLeft = 90;
  const mRight = 24;

  const catCount = categories.length;
  const seriesCount = series.length;
  const innerH = svgH - mTop - mBottom;
  const innerW = svgW - mLeft - mRight;

  // Max value
  const allVals = series.flatMap((s) => s.data);
  const rawMax = Math.max(...allVals, 0);
  const maxVal = niceMax(rawMax);
  const ticks = gridTicks(maxVal);

  const rowH = innerH / catCount;
  const barGap = 3;
  const groupPad = rowH * 0.2;
  const availH = rowH - groupPad * 2;
  const barH = Math.min(
    Math.max((availH - barGap * (seriesCount - 1)) / seriesCount, 6),
    32,
  );
  const totalGroupH = barH * seriesCount + barGap * (seriesCount - 1);
  const RADIUS = 4;

  return (
    <svg
      width="100%"
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="dv__svg"
    >
      {/* X grid lines (vertical for horizontal chart) */}
      {showGridLines &&
        ticks.map((t) => {
          const x = mLeft + (t / maxVal) * innerW;
          return (
            <line
              key={t}
              x1={x}
              x2={x}
              y1={mTop}
              y2={mTop + innerH}
              className="dv__grid-line"
            />
          );
        })}

      {/* X axis labels */}
      {ticks.map((t) => {
        const x = mLeft + (t / maxVal) * innerW;
        const label = Number.isInteger(t) ? String(t) : t.toFixed(1);
        return (
          <text
            key={t}
            x={x}
            y={mTop + innerH + 16}
            className="dv__axis-label"
            textAnchor="middle"
          >
            {label}
          </text>
        );
      })}

      {/* Y category labels + baseline */}
      {categories.map((cat, ci) => (
        <text
          key={ci}
          x={mLeft - 8}
          y={mTop + ci * rowH + rowH / 2}
          className="dv__axis-label"
          textAnchor="end"
          dominantBaseline="middle"
        >
          {cat}
        </text>
      ))}

      {/* Axis lines */}
      <line
        x1={mLeft}
        x2={mLeft}
        y1={mTop}
        y2={mTop + innerH}
        className="dv__axis-line"
      />
      <line
        x1={mLeft}
        x2={mLeft + innerW}
        y1={mTop + innerH}
        y2={mTop + innerH}
        className="dv__axis-line"
      />

      {/* Bars */}
      {categories.map((_, ci) => (
        <g key={ci}>
          {series.map((s, si) => {
            const val = s.data[ci] ?? 0;
            const bW = (val / maxVal) * innerW;
            const groupStartY = mTop + ci * rowH + rowH / 2 - totalGroupH / 2;
            const y = groupStartY + si * (barH + barGap);
            const x = mLeft;
            const color = seriesColor(s, si);

            if (bW <= 0) return null;

            const d = `M${x},${y} H${x + bW - RADIUS} Q${x + bW},${y} ${x + bW},${y + RADIUS} V${y + barH - RADIUS} Q${x + bW},${y + barH} ${x + bW - RADIUS},${y + barH} H${x} Z`;

            return (
              <g key={si}>
                <path d={d} fill={color} className="dv__bar" />
                {showValues && bW > 24 && (
                  <text
                    x={x + bW - 6}
                    y={y + barH / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="dv__value-label"
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DataVisualization({
  type,
  series,
  categories,
  height = 260,
  showLegend = true,
  showGridLines = true,
  showValues = false,
  style,
  className = "",
}: DataVisualizationProps) {
  // Derived geometry for vertical charts
  const svgW = 480;
  const svgH = height;
  const innerW = svgW - MARGIN.left - MARGIN.right;
  const innerH = svgH - MARGIN.top - MARGIN.bottom;

  // Compute max value
  const allVals =
    type === "stacked-vertical"
      ? categories.map((_, ci) =>
          series.reduce((sum, s) => sum + (s.data[ci] ?? 0), 0),
        )
      : series.flatMap((s) => s.data);
  const rawMax = Math.max(...allVals, 0);
  const maxVal = niceMax(rawMax);
  const ticks = gridTicks(maxVal);

  if (type === "horizontal") {
    return (
      <div className={`dv ${className}`} style={style}>
        <HorizontalChart
          series={series}
          categories={categories}
          svgW={svgW}
          svgH={svgH}
          showGridLines={showGridLines}
          showValues={showValues}
        />
        {showLegend && <Legend series={series} />}
      </div>
    );
  }

  return (
    <div className={`dv ${className}`} style={style}>
      <svg
        width="100%"
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="dv__svg"
      >
        {/* Grid lines */}
        {showGridLines && (
          <GridLines
            ticks={ticks}
            maxVal={maxVal}
            innerW={innerW}
            innerH={innerH}
            marginLeft={MARGIN.left}
            marginTop={MARGIN.top}
          />
        )}

        {/* Y axis */}
        <YAxis
          ticks={ticks}
          maxVal={maxVal}
          innerH={innerH}
          marginLeft={MARGIN.left}
          marginTop={MARGIN.top}
        />

        {/* X category labels + baseline */}
        <XLabels
          categories={categories}
          innerW={innerW}
          innerH={innerH}
          marginLeft={MARGIN.left}
          marginTop={MARGIN.top}
        />

        {/* Bars */}
        {type === "stacked-vertical" && (
          <StackedVertical
            series={series}
            categories={categories}
            innerW={innerW}
            innerH={innerH}
            marginLeft={MARGIN.left}
            marginTop={MARGIN.top}
            maxVal={maxVal}
            showValues={showValues}
          />
        )}
        {type === "grouped-vertical" && (
          <GroupedVertical
            series={series}
            categories={categories}
            innerW={innerW}
            innerH={innerH}
            marginLeft={MARGIN.left}
            marginTop={MARGIN.top}
            maxVal={maxVal}
            showValues={showValues}
          />
        )}
      </svg>

      {showLegend && <Legend series={series} />}
    </div>
  );
}
