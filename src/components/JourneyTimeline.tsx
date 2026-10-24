/**
 * JourneyTimeline component.
 *
 * Comparaison d'itinéraires sur une fenêtre de départ : une ligne par
 * itinéraire, faite d'étapes (marche, transport, attente) placées sur un axe
 * horaire commun, suivie d'un résumé (durée, correspondances, marche) et d'une
 * mention « Recommandé ». Cadre commun avec Timeline (TimelineShell). Survol
 * d'une étape → détail (ChartTooltip) ; clic sur une ligne ou Entrée →
 * `onJourneyClick` (ouvrir l'itinéraire côté app).
 */
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartTooltip } from "./ChartTooltip";
import { ChartDataTable } from "./ChartDataTable";
import { Icons } from "./Icons";
import { ModeIcon, type ModeName } from "./ModeIcon";
import { LineBadge, type LineMode } from "./LineBadge";
import { normalizeLineColor } from "./line-badge-utils";
import { TimelineShell, type TimelineScaleProps } from "./TimelineShell";
import { toMinutes, formatClock, formatDuration, modeOf, roundWindow, type TimeValue } from "./timeline-utils";
import "./journey-timeline.css";

export type JourneySegmentKind = "walk" | "transit" | "wait";

/** Ligne empruntée par une étape en transport (données GTFS). */
export interface JourneyLine {
  /** Code court (« A », « 13 », « T3b »). */
  code: string;
  mode?: LineMode;
  /** GTFS route_color. */
  color?: string;
  /** GTFS route_text_color. Sinon calculée pour AA. */
  textColor?: string;
}

export interface JourneySegment {
  id: string;
  kind: JourneySegmentKind;
  start: TimeValue;
  end: TimeValue;
  /** Ligne empruntée (étape `transit`). */
  line?: JourneyLine;
  /** Détail affiché dans l'info-bulle : « Châtelet → Nation », « Direction La Défense ». */
  label?: string;
}

export interface Journey {
  id: string;
  segments: JourneySegment[];
  /** Libellé court devant le trajet. Défaut « [n] » (nom accessible « Itinéraire n »). */
  label?: string;
  /** Itinéraire mis en avant : mention « Recommandé ». */
  recommended?: boolean;
}

export interface JourneyTimelineProps extends ChartCommonProps, TimelineScaleProps {
  journeys: Journey[];
  /** Fenêtre affichée. Défaut : englobe les trajets, arrondie à 5 min. */
  range?: [TimeValue, TimeValue];
  /** Heures de service au-delà de 24:00 (jusqu'à 47:59). */
  allowOvernight?: boolean;
  /** Clic sur une ligne, ou Entrée sur une de ses étapes. */
  onJourneyClick?: (journey: Journey) => void;
}

const GUTTER = 48;
const ROW_H = 48;

// Pictos remplis de la famille ModeIcon (comme ModeFilter et TreeView)
const MODE_ICON: Record<LineMode, ModeName> = {
  metro: "metro",
  rer: "train",
  train: "train",
  tram: "tram",
  bus: "bus",
  car: "coach",
  navette: "bus",
  bateau: "boat",
};

const MODE_NAME: Record<LineMode, string> = {
  metro: "Métro",
  rer: "RER",
  train: "Train",
  tram: "Tram",
  bus: "Bus",
  car: "Car",
  navette: "Navette",
  bateau: "Bateau",
};

/** Nom d'une étape : « Marche », « Attente », « Bus A », « Ligne 13 ». */
const segmentName = (seg: JourneySegment): string => {
  if (seg.kind === "walk") return "Marche";
  if (seg.kind === "wait") return "Attente";
  if (!seg.line) return "Transport";
  return `${seg.line.mode ? MODE_NAME[seg.line.mode] : "Ligne"} ${seg.line.code}`;
};

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

export const JourneyTimeline = ({
  journeys,
  range,
  allowOvernight = false,
  onJourneyClick,
  scales = [60, 30, 15],
  defaultScale = "fit",
  hint,
  ...frame
}: JourneyTimelineProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const groupRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<{ r: number; i: number } | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; r: number; seg: JourneySegment } | null>(null);

  const num = (v: TimeValue) => toMinutes(v, allowOvernight);
  const mode = modeOf([...journeys.flatMap((j) => j.segments.map((s) => s.start)), ...(range ?? [])]);
  const clock = (v: TimeValue) => formatClock(num(v), mode);
  const duration = (seg: JourneySegment) => formatDuration(num(seg.end) - num(seg.start));

  const starts = journeys.flatMap((j) => j.segments.map((s) => num(s.start)));
  const ends = journeys.flatMap((j) => j.segments.map((s) => num(s.end)));
  const [min, max] = range
    ? [num(range[0]), num(range[1])]
    : starts.length > 0
      ? roundWindow(Math.min(...starts), Math.max(...ends))
      : [0, 60];

  const nameOf = (r: number) => `Itinéraire ${r + 1}`;

  /** Résumé : durée totale, correspondances, marche. */
  const summaryOf = (j: Journey) => {
    const segs = j.segments;
    if (segs.length === 0) return { total: "—", transfers: "", walk: "" };
    const total = formatDuration(num(segs[segs.length - 1].end) - num(segs[0].start));
    const transfers = Math.max(0, segs.filter((s) => s.kind === "transit").length - 1);
    const walk = segs.filter((s) => s.kind === "walk").reduce((sum, s) => sum + num(s.end) - num(s.start), 0);
    return {
      total,
      transfers: transfers === 0 ? "0 correspondance" : plural(transfers, "correspondance"),
      walk: walk > 0 ? `${formatDuration(walk)} de marche` : "sans marche",
    };
  };

  const activate = (r: number, i: number) => {
    setCursor({ r, i });
    const seg = journeys[r]?.segments[i];
    const el = groupRef.current?.querySelector<HTMLElement>(`[data-cell="${r}-${i}"]`);
    if (!seg || !el) return;
    el.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    const rect = el.getBoundingClientRect();
    setTip({ x: rect.left + rect.width / 2, y: rect.top, r, seg });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (journeys.length === 0) return;
    const c = cursor ?? { r: 0, i: 0 };
    const segs = journeys[c.r].segments;
    const last = (r: number) => Math.max(0, journeys[r].segments.length - 1);
    let handled = true;
    if (e.key === "ArrowRight") activate(c.r, Math.min(segs.length - 1, c.i + 1));
    else if (e.key === "ArrowLeft") activate(c.r, Math.max(0, c.i - 1));
    else if (e.key === "ArrowDown") { const nr = Math.min(journeys.length - 1, c.r + 1); activate(nr, Math.min(last(nr), c.i)); }
    else if (e.key === "ArrowUp") { const nr = Math.max(0, c.r - 1); activate(nr, Math.min(last(nr), c.i)); }
    else if (e.key === "Home") activate(c.r, 0);
    else if (e.key === "End") activate(c.r, last(c.r));
    else if (e.key === "Enter" || e.key === " ") onJourneyClick?.(journeys[c.r]);
    else if (e.key === "Escape") { setCursor(null); setTip(null); groupRef.current?.blur(); }
    else handled = false;
    if (handled) e.preventDefault();
  };

  const activeSeg = cursor ? journeys[cursor.r]?.segments[cursor.i] : undefined;
  const announce = (() => {
    if (!cursor || !activeSeg) return "";
    const j = journeys[cursor.r];
    const s = summaryOf(j);
    return `${nameOf(cursor.r)}${j.recommended ? " (recommandé)" : ""}, étape ${cursor.i + 1} sur ${j.segments.length} : ${segmentName(activeSeg)}, ${clock(activeSeg.start)} à ${clock(activeSeg.end)}, ${duration(activeSeg)}. Total ${s.total}, ${s.transfers}, ${s.walk}.`;
  })();

  const defaultHint = onJourneyClick
    ? "Survolez un segment pour voir son détail, cliquez sur un itinéraire pour l’ouvrir."
    : "Survolez un segment pour voir son détail.";

  const dataTable = (visible: boolean) => (
    <ChartDataTable
      visible={visible}
      caption={frame.title}
      columns={["Itinéraire", "Étape", "Départ", "Arrivée", "Durée"]}
      rows={journeys.flatMap((j, r) => {
        const s = summaryOf(j);
        const segs = j.segments;
        return [
          ...segs.map((seg) => [nameOf(r), `${segmentName(seg)}${seg.label ? ` (${seg.label})` : ""}`, clock(seg.start), clock(seg.end), duration(seg)]),
          [
            nameOf(r),
            `Total${j.recommended ? ", recommandé" : ""} : ${s.transfers}, ${s.walk}`,
            segs[0] ? clock(segs[0].start) : "—",
            segs.length ? clock(segs[segs.length - 1].end) : "—",
            s.total,
          ],
        ];
      })}
      numeric={[4]}
    />
  );

  /** Style d'une étape en transport : teinte pâle et bord de la couleur de ligne (GTFS). */
  const transitStyle = (seg: JourneySegment): CSSProperties | undefined => {
    const color = seg.line?.color ? normalizeLineColor(seg.line.color) : null;
    if (!color) return undefined;
    return { backgroundColor: `color-mix(in srgb, ${color} 16%, var(--cadence-color-white, #ffffff))`, borderColor: color };
  };

  return (
    <ChartFrame {...frame} titleId={titleId} descriptionId={descriptionId} kind="journey-timeline" height={140 + journeys.length * ROW_H} table={dataTable}>
      <div className="journey-timeline__sr" role="status" aria-live="polite">{announce}</div>

      <TimelineShell
        mode={mode}
        min={min}
        max={max}
        scales={scales}
        defaultScale={defaultScale}
        gutter={GUTTER}
        rowHeight={ROW_H}
        meta={journeys.length === 1 ? "1 itinéraire" : `${journeys.length} itinéraires`}
        hint={hint ?? defaultHint}
      >
        {({ pos, px }) => (
          <div
            ref={groupRef}
            className="journey-timeline__rows"
            role="group"
            aria-label={`${frame.title}. Flèches pour parcourir les étapes, Entrée pour ouvrir l’itinéraire.`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onFocus={(e) => { if (e.target === e.currentTarget && !cursor) activate(0, 0); }}
            onBlur={() => setTip(null)}
          >
            {journeys.map((j, r) => {
              const segs = j.segments;
              const s = summaryOf(j);
              const first = segs[0] ? num(segs[0].start) : min;
              const lastEnd = segs.length ? num(segs[segs.length - 1].end) : min;
              return (
                <div
                  key={j.id}
                  className={`timeline-shell__row journey-timeline__row${onJourneyClick ? " journey-timeline__row--clickable" : ""}`}
                  onClick={() => onJourneyClick?.(j)}
                >
                  <div className="timeline-shell__gutter" />
                  <div className="timeline-shell__track">
                    {/* Libellé collé au départ du trajet (effet d'escalier). */}
                    <span className="journey-timeline__label" style={{ right: `calc(100% - ${pos(first)} + 8px)` }} aria-hidden="true">
                      {j.label ?? `[${r + 1}]`}
                    </span>

                    {segs.map((seg, i) => {
                      const start = num(seg.start);
                      const end = num(seg.end);
                      const width = px(end - start);
                      const focused = cursor?.r === r && cursor?.i === i;
                      // Marche et transport : picto de mode ; attente : horloge d'interface (pas de mode)
                      const mode: ModeName | null = seg.kind === "walk" ? "walk" : seg.kind === "wait" ? null : seg.line?.mode ? MODE_ICON[seg.line.mode] : "all-pt";
                      // Contenu selon la place : picto, puis badge de ligne, puis durée.
                      const showBadge = seg.kind === "transit" && seg.line && width >= 56;
                      const showDuration = width >= (seg.kind === "transit" ? (showBadge ? 104 : 72) : 64);
                      return (
                        <div
                          key={seg.id}
                          data-cell={`${r}-${i}`}
                          className={`journey-timeline__seg journey-timeline__seg--${seg.kind}${focused ? " journey-timeline__seg--focused" : ""}`}
                          role="img"
                          aria-label={`${nameOf(r)} — ${segmentName(seg)} : ${clock(seg.start)} à ${clock(seg.end)}, ${duration(seg)}`}
                          style={{
                            left: `calc(${pos(start)} + 1px)`,
                            width: `max(4px, calc(${pos(end)} - ${pos(start)} - 2px))`,
                            ...(seg.kind === "transit" ? transitStyle(seg) : undefined),
                          }}
                          onMouseEnter={(e) => setTip({ x: e.clientX, y: e.clientY, r, seg })}
                          onMouseLeave={() => setTip((t) => (t?.seg === seg ? null : t))}
                        >
                          {width >= 22 &&
                            (mode ? (
                              <ModeIcon mode={mode} size={16} className="journey-timeline__seg-icon" />
                            ) : (
                              <Icons icon="clock" size={14} className="journey-timeline__seg-icon" />
                            ))}
                          {showBadge && seg.line && (
                            <LineBadge size="sm" code={seg.line.code} mode={seg.line.mode} color={seg.line.color} textColor={seg.line.textColor} />
                          )}
                          {showDuration && <span className="journey-timeline__seg-duration">{duration(seg)}</span>}
                        </div>
                      );
                    })}

                    {/* Résumé après le dernier segment. */}
                    {segs.length > 0 && (
                      <span className="journey-timeline__summary" style={{ left: `calc(${pos(lastEnd)} + 12px)` }}>
                        <span className="journey-timeline__total">{s.total}</span>
                        <span aria-hidden="true"> · </span>
                        {s.transfers}
                        <span aria-hidden="true"> · </span>
                        {s.walk}
                        {j.recommended && (
                          <>
                            <span aria-hidden="true"> · </span>
                            <span className="journey-timeline__recommended">Recommandé</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </TimelineShell>

      {tip && (
        <ChartTooltip
          x={tip.x}
          y={tip.y}
          title={`${nameOf(tip.r)}${journeys[tip.r]?.recommended ? " · recommandé" : ""}`}
          rows={[
            {
              id: "segment",
              label: segmentName(tip.seg),
              value: `${clock(tip.seg.start)} – ${clock(tip.seg.end)} · ${duration(tip.seg)}`,
              color: tip.seg.kind === "transit" ? tip.seg.line?.color : undefined,
            },
          ]}
          note={tip.seg.label}
        />
      )}
    </ChartFrame>
  );
};
