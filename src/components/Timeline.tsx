/**
 * Timeline component.
 *
 * Plages horizontales sur un axe temps, une ligne par entité (ligne, arrêt,
 * véhicule, perturbation) : durée des perturbations, amplitudes de service,
 * travaux. Les bornes sont des dates ou des heures de service (« HH:mm »
 * jusqu'à 47:59, comme TimePicker `allowOvernight`). Couleurs par `tone`
 * (tokens de statut), toujours doublées d'un motif. Survol/focus → ChartTooltip ;
 * clic/Entrée → `onItemClick` (ouvrir un Drawer côté app).
 */
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartAxisBottom, type ChartTick } from "./ChartAxis";
import { ChartTooltip } from "./ChartTooltip";
import { ChartDataTable } from "./ChartDataTable";
import { ChartPatternDef } from "./ChartPattern";
import { svgId, type PatternKind } from "./chart-palette";
import type { IndicatorVariant } from "./Indicator";
import { toNumber, formatValue, buildTicks, tonePattern, toneColor, isDateValue, type TimeValue } from "./timeline-utils";
import "./timeline.css";

export interface TimelineItem {
  id: string;
  start: TimeValue;
  /** Fin de la plage. Absente : instant. */
  end?: TimeValue;
  label?: string;
  /** Teinte de statut (token). */
  tone?: IndicatorVariant;
  /** Motif de remplissage. Défaut : dérivé du `tone`. */
  pattern?: PatternKind;
}

export interface TimelineRow {
  id: string;
  label: string;
  items: TimelineItem[];
}

export interface TimelineAnnotation {
  id: string;
  start: TimeValue;
  /** Avec `end` : bande ; sans : trait. */
  end?: TimeValue;
  label?: string;
}

export interface TimelineProps extends ChartCommonProps {
  rows: TimelineRow[];
  /** Heures de service au-delà de 24:00 (jusqu'à 47:59). */
  allowOvernight?: boolean;
  /** Fenêtre affichée. Défaut : englobe les plages. */
  range?: [TimeValue, TimeValue];
  /** Repère « maintenant » : valeur, ou `true` (instant courant, mode date). */
  now?: TimeValue;
  annotations?: TimelineAnnotation[];
  onItemClick?: (item: TimelineItem, row: TimelineRow) => void;
}

const WIDTH = 680;
const GUTTER = 148;
const RIGHT = 16;
const TOP = 8;
const ROW_H = 32;
const BAR_H = 18;
const AXIS_H = 28;
const PLOT_W = WIDTH - GUTTER - RIGHT;

export const Timeline = ({
  rows,
  allowOvernight = false,
  range,
  now,
  annotations = [],
  onItemClick,
  ...frame
}: TimelineProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState<{ r: number; i: number } | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; row: TimelineRow; item: TimelineItem } | null>(null);

  const num = (v: TimeValue) => toNumber(v, allowOvernight);
  const mode: "date" | "time" = rows.some((row) => row.items.some((it) => isDateValue(it.start))) ? "date" : "time";

  // Domaine temps.
  const starts = rows.flatMap((row) => row.items.map((it) => num(it.start)));
  const ends = rows.flatMap((row) => row.items.map((it) => num(it.end ?? it.start)));
  const min = range ? num(range[0]) : Math.min(...starts);
  const max = range ? num(range[1]) : Math.max(...ends);
  const span = max - min || 1;
  const x = (v: number) => GUTTER + ((v - min) / span) * PLOT_W;

  const plotHeight = rows.length * ROW_H;
  const svgHeight = TOP + plotHeight + AXIS_H;

  const ticks: ChartTick[] = buildTicks(min, max, 6).map((t) => ({ key: t.key, position: x(t.value), label: formatValue(t.value, mode) }));

  // Motifs utilisés (défs uniques).
  const patternOf = (it: TimelineItem): PatternKind => it.pattern ?? tonePattern(it.tone);
  const patterns = [...new Set(rows.flatMap((row) => row.items.map(patternOf)).filter((p) => p !== "solid"))];
  const patId = (p: PatternKind) => svgId(`timeline-${titleId}-${p}`);

  const nowValue = now !== undefined ? num(now) : null;

  const activate = (r: number, i: number) => {
    setCursor({ r, i });
    const row = rows[r];
    const item = row.items[i];
    const el = svgRef.current?.querySelector<SVGRectElement>(`[data-cell="${r}-${i}"]`);
    const rect = el?.getBoundingClientRect();
    if (rect) setTip({ x: rect.left + rect.width / 2, y: rect.top, row, item });
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (rows.length === 0) return;
    const c = cursor ?? { r: 0, i: 0 };
    const row = rows[c.r];
    let handled = true;
    if (e.key === "ArrowRight") activate(c.r, Math.min(row.items.length - 1, c.i + 1));
    else if (e.key === "ArrowLeft") activate(c.r, Math.max(0, c.i - 1));
    else if (e.key === "ArrowDown") { const nr = Math.min(rows.length - 1, c.r + 1); activate(nr, Math.min(rows[nr].items.length - 1, c.i)); }
    else if (e.key === "ArrowUp") { const nr = Math.max(0, c.r - 1); activate(nr, Math.min(rows[nr].items.length - 1, c.i)); }
    else if (e.key === "Home") activate(c.r, 0);
    else if (e.key === "End") activate(c.r, row.items.length - 1);
    else if (e.key === "Enter" || e.key === " ") onItemClick?.(row.items[c.i], row);
    else if (e.key === "Escape") { setCursor(null); setTip(null); svgRef.current?.blur(); }
    else handled = false;
    if (handled) e.preventDefault();
  };

  const active = cursor ? rows[cursor.r]?.items[cursor.i] : undefined;
  const announce = active && cursor ? `${rows[cursor.r].label} : ${active.label ?? "plage"}, ${formatValue(num(active.start), mode)}${active.end ? ` à ${formatValue(num(active.end), mode)}` : ""}` : "";

  const dataTable = (visible: boolean) => (
    <ChartDataTable
      visible={visible}
      caption={frame.title}
      columns={["Ligne", "Plage", "Début", "Fin"]}
      rows={rows.flatMap((row) =>
        row.items.map((it) => [row.label, it.label ?? "—", formatValue(num(it.start), mode), it.end ? formatValue(num(it.end), mode) : "—"]),
      )}
    />
  );

  return (
    <ChartFrame {...frame} titleId={titleId} descriptionId={descriptionId} kind="timeline" height={svgHeight} table={dataTable}>
      <div className="timeline__sr" role="status" aria-live="polite">{announce}</div>
      <svg
        ref={svgRef}
        className="timeline__svg"
        viewBox={`0 0 ${WIDTH} ${svgHeight}`}
        role="group"
        aria-label={`${frame.title}. Flèches pour parcourir les plages, Entrée pour ouvrir.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onFocus={() => { if (!cursor) activate(0, 0); }}
        onBlur={() => setTip(null)}
      >
        {patterns.length > 0 && <defs>{patterns.map((p) => <ChartPatternDef key={p} id={patId(p)} kind={p} />)}</defs>}

        {/* Bandes et traits d'annotation (sous les plages). */}
        {annotations.map((a) => {
          const ax = x(num(a.start));
          if (a.end) return <rect key={a.id} className="timeline__band" x={ax} y={TOP} width={Math.max(1, x(num(a.end)) - ax)} height={plotHeight} />;
          return <line key={a.id} className="timeline__annotation" x1={ax} x2={ax} y1={TOP} y2={TOP + plotHeight} />;
        })}

        {/* Lignes */}
        {rows.map((row, r) => {
          const y0 = TOP + r * ROW_H;
          return (
            <g key={row.id}>
              <text className="timeline__row-label" x={0} y={y0 + ROW_H / 2} dy="0.32em">{row.label}</text>
              {row.items.map((it, i) => {
                const x1 = x(num(it.start));
                const x2 = it.end ? x(num(it.end)) : x1 + 6;
                const w = Math.max(6, x2 - x1);
                const by = y0 + (ROW_H - BAR_H) / 2;
                const focused = cursor?.r === r && cursor?.i === i;
                const pat = patternOf(it);
                return (
                  <g key={it.id} className={`timeline__item${focused ? " timeline__item--focused" : ""}`} role="img"
                     aria-label={`${row.label} — ${it.label ?? "plage"} : ${formatValue(num(it.start), mode)}${it.end ? ` à ${formatValue(num(it.end), mode)}` : ""}`}
                     onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, row, item: it })}
                     onMouseLeave={() => setTip((t) => (t?.item === it ? null : t))}
                     onClick={() => onItemClick?.(it, row)}>
                    <rect data-cell={`${r}-${i}`} className="timeline__bar" x={x1} y={by} width={w} height={BAR_H} rx={4} style={{ fill: it.tone || !it.pattern ? toneColor(it.tone) : undefined }} />
                    {pat !== "solid" && <rect x={x1} y={by} width={w} height={BAR_H} rx={4} fill={`url(#${patId(pat)})`} pointerEvents="none" />}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Repère « maintenant » */}
        {nowValue !== null && nowValue >= min && nowValue <= max && (
          <line className="timeline__now" x1={x(nowValue)} x2={x(nowValue)} y1={TOP} y2={TOP + plotHeight} />
        )}

        <ChartAxisBottom ticks={ticks} y={TOP + plotHeight} plotWidth={WIDTH} dates={mode === "date"} />
      </svg>

      {tip && (
        <ChartTooltip
          x={tip.x}
          y={tip.y}
          title={tip.row.label}
          rows={[
            { id: "range", label: tip.item.label ?? "Plage", value: `${formatValue(num(tip.item.start), mode)}${tip.item.end ? ` – ${formatValue(num(tip.item.end), mode)}` : ""}`, color: toneColor(tip.item.tone) },
          ]}
        />
      )}
    </ChartFrame>
  );
};
