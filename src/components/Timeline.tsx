/**
 * Timeline component.
 *
 * Plages horizontales sur un axe temps, une ligne par entité (ligne, arrêt,
 * véhicule, perturbation) : durée des perturbations, amplitudes de service,
 * travaux. Les bornes sont des dates ou des heures de service (« HH:mm »
 * jusqu'à 47:59, comme TimePicker `allowOvernight`). Couleurs par `tone`
 * (tokens de statut), toujours doublées d'un motif. Cadre commun avec
 * JourneyTimeline (TimelineShell) : bandeau « Fenêtre », échelle, axe horaire
 * en haut, grille. Survol/focus → ChartTooltip ; clic/Entrée → `onItemClick`
 * (ouvrir un Drawer côté app).
 */
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartTooltip } from "./ChartTooltip";
import { ChartDataTable } from "./ChartDataTable";
import { ChartPatternDef } from "./ChartPattern";
import { svgId, type PatternKind } from "./chart-palette";
import type { IndicatorVariant } from "./Indicator";
import { TimelineShell, type TimelineScaleProps } from "./TimelineShell";
import { toMinutes, formatClock, modeOf, roundWindow, tonePattern, toneColor, type TimeValue } from "./timeline-utils";
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

export interface TimelineProps extends ChartCommonProps, TimelineScaleProps {
  rows: TimelineRow[];
  /** Heures de service au-delà de 24:00 (jusqu'à 47:59). */
  allowOvernight?: boolean;
  /** Fenêtre affichée. Défaut : englobe les plages, arrondie à 5 min. */
  range?: [TimeValue, TimeValue];
  /** Repère « maintenant ». */
  now?: TimeValue;
  annotations?: TimelineAnnotation[];
  onItemClick?: (item: TimelineItem, row: TimelineRow) => void;
}

const GUTTER = 148;
const ROW_H = 40;

export const Timeline = ({
  rows,
  allowOvernight = false,
  range,
  now,
  annotations = [],
  onItemClick,
  scales = [60, 30, 15],
  defaultScale = "fit",
  hint,
  ...frame
}: TimelineProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<{ r: number; i: number } | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; row: TimelineRow; item: TimelineItem } | null>(null);

  const num = (v: TimeValue) => toMinutes(v, allowOvernight);
  const mode = modeOf([...rows.flatMap((row) => row.items.map((it) => it.start)), ...(range ?? [])]);
  const clock = (v: TimeValue) => formatClock(num(v), mode);
  const span = (it: TimelineItem) => `${clock(it.start)}${it.end ? ` à ${clock(it.end)}` : ""}`;

  // Fenêtre : `range`, sinon les plages arrondies à 5 min.
  const starts = rows.flatMap((row) => row.items.map((it) => num(it.start)));
  const ends = rows.flatMap((row) => row.items.map((it) => num(it.end ?? it.start)));
  const [min, max] = range
    ? [num(range[0]), num(range[1])]
    : starts.length > 0
      ? roundWindow(Math.min(...starts), Math.max(...ends))
      : [0, 60];

  // Motifs utilisés (défs uniques, dans un SVG caché référencé par les barres).
  const patternOf = (it: TimelineItem): PatternKind => it.pattern ?? tonePattern(it.tone);
  const patterns = [...new Set(rows.flatMap((row) => row.items.map(patternOf)).filter((p) => p !== "solid"))];
  const patId = (p: PatternKind) => svgId(`timeline-${titleId}-${p}`);

  const nowValue = now !== undefined ? num(now) : null;

  const activate = (r: number, i: number) => {
    setCursor({ r, i });
    const row = rows[r];
    const item = row?.items[i];
    const el = groupRef.current?.querySelector<HTMLElement>(`[data-cell="${r}-${i}"]`);
    if (!row || !item || !el) return;
    el.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    const rect = el.getBoundingClientRect();
    setTip({ x: rect.left + rect.width / 2, y: rect.top, row, item });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
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
    else if (e.key === "Escape") { setCursor(null); setTip(null); groupRef.current?.blur(); }
    else handled = false;
    if (handled) e.preventDefault();
  };

  const active = cursor ? rows[cursor.r]?.items[cursor.i] : undefined;
  const announce = active && cursor ? `${rows[cursor.r].label} : ${active.label ?? "plage"}, ${span(active)}` : "";

  const defaultHint = onItemClick
    ? "Survolez une plage pour voir son détail, cliquez dessus pour l’ouvrir."
    : "Survolez une plage pour voir son détail.";

  const dataTable = (visible: boolean) => (
    <ChartDataTable
      visible={visible}
      caption={frame.title}
      columns={["Ligne", "Plage", "Début", "Fin"]}
      rows={rows.flatMap((row) =>
        row.items.map((it) => [row.label, it.label ?? "—", clock(it.start), it.end ? clock(it.end) : "—"]),
      )}
    />
  );

  return (
    <ChartFrame {...frame} titleId={titleId} descriptionId={descriptionId} kind="timeline" height={140 + rows.length * ROW_H} table={dataTable}>
      <div className="timeline__sr" role="status" aria-live="polite">{announce}</div>
      {patterns.length > 0 && (
        <svg className="timeline__defs" width="0" height="0" aria-hidden="true" focusable="false">
          <defs>{patterns.map((p) => <ChartPatternDef key={p} id={patId(p)} kind={p} />)}</defs>
        </svg>
      )}

      <TimelineShell
        mode={mode}
        min={min}
        max={max}
        scales={scales}
        defaultScale={defaultScale}
        gutter={GUTTER}
        stickyGutter
        rowHeight={ROW_H}
        hint={hint ?? defaultHint}
        overlay={({ pos }) => (
          <>
            {/* Bandes et traits d'annotation (sous les plages). */}
            {annotations.map((a) =>
              a.end ? (
                <span key={a.id} className="timeline__band" style={{ left: pos(num(a.start)), width: `calc(${pos(num(a.end))} - ${pos(num(a.start))})` }} />
              ) : (
                <span key={a.id} className="timeline__annotation" style={{ left: pos(num(a.start)) }} />
              ),
            )}
            {/* Repère « maintenant » */}
            {nowValue !== null && nowValue >= min && nowValue <= max && (
              <span className="timeline__now" style={{ left: pos(nowValue) }} />
            )}
          </>
        )}
      >
        {({ pos }) => (
          <div
            ref={groupRef}
            className="timeline__rows"
            role="group"
            aria-label={`${frame.title}. Flèches pour parcourir les plages, Entrée pour ouvrir.`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onFocus={(e) => { if (e.target === e.currentTarget && !cursor) activate(0, 0); }}
            onBlur={() => setTip(null)}
          >
            {rows.map((row, r) => (
              <div key={row.id} className="timeline-shell__row">
                <div className="timeline-shell__gutter">
                  <span className="timeline__row-label">{row.label}</span>
                </div>
                <div className="timeline-shell__track">
                  {row.items.map((it, i) => {
                    const start = num(it.start);
                    const end = it.end ? num(it.end) : start;
                    const focused = cursor?.r === r && cursor?.i === i;
                    const pat = patternOf(it);
                    return (
                      <div
                        key={it.id}
                        data-cell={`${r}-${i}`}
                        className={`timeline__item${focused ? " timeline__item--focused" : ""}`}
                        role="img"
                        aria-label={`${row.label} — ${it.label ?? "plage"} : ${span(it)}`}
                        style={{
                          left: pos(start),
                          width: `max(6px, calc(${pos(end)} - ${pos(start)}))`,
                          backgroundColor: toneColor(it.tone),
                        }}
                        onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, row, item: it })}
                        onMouseLeave={() => setTip((t) => (t?.item === it ? null : t))}
                        onClick={() => onItemClick?.(it, row)}
                      >
                        {pat !== "solid" && (
                          <svg className="timeline__item-pattern" aria-hidden="true" focusable="false">
                            <rect width="100%" height="100%" fill={`url(#${patId(pat)})`} />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </TimelineShell>

      {tip && (
        <ChartTooltip
          x={tip.x}
          y={tip.y}
          title={tip.row.label}
          rows={[
            { id: "range", label: tip.item.label ?? "Plage", value: `${clock(tip.item.start)}${tip.item.end ? ` – ${clock(tip.item.end)}` : ""}`, color: toneColor(tip.item.tone) },
          ]}
        />
      )}
    </ChartFrame>
  );
};
