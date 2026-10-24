import { useId, useState, type HTMLAttributes, type KeyboardEvent, type MouseEvent } from "react";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartTooltip, type ChartTooltipRow } from "./ChartTooltip";
import { LineBadge, type LineMode } from "./LineBadge";
import { TimelineShell } from "./TimelineShell";
import { stopFractions, type LineDiagramStopInput } from "./line-diagram-utils";
import {
  clock,
  delayWords,
  describePassage,
  describeTrips,
  maxDelay,
  passageDelay,
  serviceTimeToMinutes,
  tripPoints,
  tripSpan,
  tripsWindow,
  type TimeSpacePassageInput,
  type TimeSpaceTripInput,
} from "./time-space-utils";
import "./time-space-diagram.css";

export type TimeSpaceStop = Pick<LineDiagramStopInput, "id" | "name" | "distance">;
export type TimeSpacePassage = TimeSpacePassageInput;
export type TimeSpaceTrip = TimeSpaceTripInput;

export type TimeSpaceScale = "fit" | "4h" | "2h" | "1h" | "30min";

export interface TimeSpaceDiagramProps extends ChartCommonProps {
  /** Ligne (GTFS) : badge en tête. */
  line: { code: string; color?: string; textColor?: string; mode?: LineMode };
  /** Arrêts dans l'ordre de l'aller, de haut en bas ; `distance` sur tous : espacement à l'échelle. */
  stops: TimeSpaceStop[];
  /** Courses : horaire théorique, réalisé facultatif. */
  trips: TimeSpaceTrip[];
  /** Fenêtre (heures de service « HH:mm »). Défaut : englobe les courses, au quart d'heure. */
  range?: [string, string];
  /** Échelles du sélecteur (durée visible dans la largeur). Défaut ["fit", "2h", "1h"]. */
  scales?: TimeSpaceScale[];
  /** Repère « maintenant » (heure de service « HH:mm »). */
  now?: string;
  /** Sens affichés. Défaut "both". */
  show?: "both" | "outbound" | "inbound";
  /** Libellés des sens. Défaut : « Vers <terminus> » / « Vers <origine> ». */
  directions?: { outbound?: string; inbound?: string };
  /** Clic ou Entrée sur une course (ouvrir ses passages). */
  onTripClick?: (trip: TimeSpaceTrip) => void;
}

const SCALE_MINUTES: Record<Exclude<TimeSpaceScale, "fit">, number> = { "4h": 240, "2h": 120, "1h": 60, "30min": 30 };
const GUTTER = 148;
const ROW_GAP = 34; // px par interarrêt
const PAD = 10;

/**
 * Graphique espace-temps (Marey) : une ligne brisée par course, arrêts de
 * haut en bas, heures de service en abscisse. Fréquence, croisements, temps
 * perdus, écart théorique / réalisé. Fenêtre et échelle de `TimelineShell`,
 * clavier course par course et le long de la course, tableau des courses.
 */
export const TimeSpaceDiagram = ({
  line,
  stops,
  trips: tripsInput,
  range,
  scales = ["fit", "2h", "1h"],
  now,
  show = "both",
  directions: directionsProp,
  onTripClick,
  ...frame
}: TimeSpaceDiagramProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const summaryId = useId();
  const [focus, setFocus] = useState<{ direction: "outbound" | "inbound"; trip: number; point: number } | null>(null);
  const [hover, setHover] = useState<{ tripId: string; point: number; x: number; y: number } | null>(null);

  const directions = {
    outbound: directionsProp?.outbound ?? `Vers ${stops[stops.length - 1]?.name ?? "terminus"}`,
    inbound: directionsProp?.inbound ?? `Vers ${stops[0]?.name ?? "origine"}`,
  };
  const stopIndex = new Map(stops.map((s, i) => [s.id, i]));
  const fractions = stopFractions(stops);
  const height = Math.max(1, stops.length - 1) * ROW_GAP + 2 * PAD;
  const yOf = (index: number) => PAD + fractions[index] * (height - 2 * PAD);

  const parsedRange = range ? range.map(serviceTimeToMinutes) : null;
  const [min, max] =
    parsedRange && parsedRange[0] !== null && parsedRange[1] !== null && parsedRange[1] > parsedRange[0]
      ? (parsedRange as [number, number])
      : tripsWindow(tripsInput, stopIndex);

  // Courses visibles dans la fenêtre, par sens, dans l'ordre de départ
  const inWindow = tripsInput
    .filter((t) => show === "both" || t.direction === show)
    .map((t) => ({ trip: t, span: tripSpan(t, stopIndex) }))
    .filter((t): t is { trip: TimeSpaceTrip; span: [number, number] } => t.span !== null && t.span[1] >= min && t.span[0] <= max)
    .sort((a, b) => a.span[0] - b.span[0])
    .map(({ trip }) => ({
      trip,
      scheduled: tripPoints(trip.scheduled, stopIndex),
      actual: trip.actual ? tripPoints(trip.actual, stopIndex) : null,
    }));
  const byDirection = {
    outbound: inWindow.filter((t) => t.trip.direction === "outbound"),
    inbound: inWindow.filter((t) => t.trip.direction === "inbound"),
  };
  const directionsShown = (["outbound", "inbound"] as const).filter((d) => byDirection[d].length > 0);

  const stopName = (index: number) => stops[index]?.name ?? "";
  const pointsOf = (t: (typeof inWindow)[number]) => t.actual ?? t.scheduled;
  const passageSentence = (t: (typeof inWindow)[number], pointIndex: number) => {
    const point = pointsOf(t)[pointIndex] ?? t.scheduled[pointIndex];
    if (!point) return "";
    const stop = stops[point.stopIndex];
    const towards = t.trip.direction === "outbound" ? directions.outbound : directions.inbound;
    // « Vers Montparnasse » → « vers Montparnasse » : seule l'initiale passe en minuscule
    return `Course ${t.trip.label} ${towards.charAt(0).toLowerCase()}${towards.slice(1)}, ${describePassage(t.trip, stop.id, stop.name)}${t.trip.status === "cancelled" ? ", supprimée" : t.trip.status === "incident" ? `, incident${t.trip.note ? ` : ${t.trip.note}` : ""}` : ""}`;
  };

  const focusedTrip = focus ? byDirection[focus.direction][focus.trip] : null;
  const hoveredTrip = hover ? inWindow.find((t) => t.trip.id === hover.tripId) : null;
  const activeTripId = hoveredTrip?.trip.id ?? focusedTrip?.trip.id ?? null;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (directionsShown.length === 0) return;
    const current = focus ?? { direction: directionsShown[0], trip: 0, point: 0 };
    const list = byDirection[current.direction];
    const points = list[current.trip] ? pointsOf(list[current.trip]) : [];
    if (e.key === "Escape") {
      setHover(null);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (list[current.trip]) onTripClick?.(list[current.trip].trip);
      return;
    }
    let next: typeof focus = null;
    if (e.shiftKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      const other = directionsShown.find((d) => d !== current.direction) ?? current.direction;
      next = { direction: other, trip: Math.min(current.trip, byDirection[other].length - 1), point: 0 };
    } else if (e.key === "ArrowRight") next = { ...current, trip: Math.min(list.length - 1, current.trip + 1), point: 0 };
    else if (e.key === "ArrowLeft") next = { ...current, trip: Math.max(0, current.trip - 1), point: 0 };
    else if (e.key === "Home") next = { ...current, trip: 0, point: 0 };
    else if (e.key === "End") next = { ...current, trip: Math.max(0, list.length - 1), point: 0 };
    // ↓ / ↑ : passage suivant / précédent le long de la course (dans le sens de parcours)
    else if (e.key === "ArrowDown") next = { ...current, point: Math.min(points.length - 1, current.point + 1) };
    else if (e.key === "ArrowUp") next = { ...current, point: Math.max(0, current.point - 1) };
    if (!next) return;
    e.preventDefault();
    setFocus(next);
  };

  const table = (visible: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={visible}
      columns={["Course", "Sens", "Départ", "Arrivée", "Écart max", "Statut"]}
      rows={inWindow.map(({ trip, scheduled }) => {
        const first = scheduled[0];
        const last = scheduled[scheduled.length - 1];
        return [
          trip.label,
          trip.direction === "outbound" ? directions.outbound : directions.inbound,
          first ? `${stopName(first.stopIndex)} ${clock(first.time)}` : "—",
          last ? `${stopName(last.stopIndex)} ${clock(last.time)}` : "—",
          delayWords(maxDelay(trip)) ?? "—",
          trip.status === "cancelled" ? "Supprimée" : trip.status === "incident" ? `Incident${trip.note ? ` : ${trip.note}` : ""}` : "—",
        ];
      })}
    />
  );

  const nowMinutes = serviceTimeToMinutes(now);
  const scaleValues = scales.filter((s): s is Exclude<TimeSpaceScale, "fit"> => s !== "fit").map((s) => SCALE_MINUTES[s]);

  const tooltipFor = () => {
    const t = hoveredTrip ?? focusedTrip;
    const pointIndex = hover ? hover.point : (focus?.point ?? 0);
    if (!t) return null;
    const point = pointsOf(t)[pointIndex];
    if (!point) return null;
    const stop = stops[point.stopIndex];
    const delay = passageDelay(t.trip, stop.id);
    const rows: ChartTooltipRow[] = [
      { id: "dir", label: "Sens", value: t.trip.direction === "outbound" ? directions.outbound : directions.inbound },
      { id: "stop", label: stop.name, value: describePassage(t.trip, stop.id, stop.name).split(" : ")[1] ?? "" },
      ...(delay !== null ? [{ id: "delay", label: "Écart", value: delayWords(delay) ?? "", tone: Math.round(delay) >= 3 ? ("alert" as const) : ("default" as const) }] : []),
    ];
    return { title: `Course ${t.trip.label}`, rows, note: t.trip.status === "cancelled" ? "Course supprimée" : t.trip.status === "incident" ? `Incident${t.trip.note ? ` : ${t.trip.note}` : ""}` : onTripClick ? "Entrée ou clic : voir les passages" : undefined };
  };
  const tooltip = hover ? tooltipFor() : null;

  return (
    <ChartFrame
      {...frame}
      kind="time-space-diagram"
      titleId={titleId}
      descriptionId={descriptionId}
      height={height + 80}
      table={table}
      legend={
        <ul className="time-space__legend" aria-hidden="true">
          {show !== "inbound" && (
            <li>
              <svg width="24" height="8"><line x1="0" x2="24" y1="4" y2="4" className="time-space__swatch time-space__swatch--outbound" /></svg>
              {directions.outbound}
            </li>
          )}
          {show !== "outbound" && (
            <li>
              <svg width="24" height="8"><line x1="0" x2="24" y1="4" y2="4" className="time-space__swatch time-space__swatch--inbound" /></svg>
              {directions.inbound}
            </li>
          )}
          {inWindow.some((t) => t.actual) && (
            <li>
              <svg width="24" height="8"><line x1="0" x2="24" y1="4" y2="4" className="time-space__swatch time-space__swatch--scheduled" /></svg>
              Théorique (réalisé en trait plein)
            </li>
          )}
        </ul>
      }
    >
      <div className="time-space__header" aria-hidden="true">
        <LineBadge code={line.code} mode={line.mode} color={line.color} textColor={line.textColor} size="sm" />
      </div>
      <div className="time-space__plot">
        <TimelineShell
          mode="time"
          min={min}
          max={max}
          scales={scaleValues}
          defaultScale={scales[0] === "fit" || !scales[0] ? "fit" : SCALE_MINUTES[scales[0]]}
          gutter={GUTTER}
          stickyGutter
          rowHeight={height}
          meta={`${inWindow.length} course${inWindow.length > 1 ? "s" : ""}`}
          hint={false}
          scrollProps={{
            className: "chart__plot",
            tabIndex: 0,
            role: "group",
            "aria-roledescription": "graphique espace-temps",
            "aria-labelledby": titleId,
            "aria-describedby": `${frame.description ? `${descriptionId} ` : ""}${summaryId}`,
            onFocus: (e) => {
              // Mise à jour fonctionnelle : l'état lu au rendu précédent peut être périmé (blur puis focus)
              if (e.target === e.currentTarget && directionsShown.length) setFocus((prev) => prev ?? { direction: directionsShown[0], trip: 0, point: 0 });
            },
            onBlur: () => setFocus(null),
            onKeyDown: handleKeyDown,
          } as HTMLAttributes<HTMLDivElement>}
          overlay={({ pos }) =>
            nowMinutes !== null && nowMinutes >= min && nowMinutes <= max ? (
              <span className="time-space__now" style={{ left: pos(nowMinutes) }}>
                <span className="time-space__now-label">maintenant</span>
              </span>
            ) : null
          }
        >
          {({ px }) => {
            const width = Math.max(1, px(max - min));
            const xOf = (time: number) => px(time - min);
            const path = (points: { stopIndex: number; time: number }[]) => points.map((p, i) => `${i ? "L" : "M"}${xOf(p.time)},${yOf(p.stopIndex)}`).join("");
            const onMove = (e: MouseEvent<SVGGElement>, t: (typeof inWindow)[number]) => {
              const svg = (e.currentTarget.ownerSVGElement ?? e.currentTarget) as SVGGraphicsElement;
              const rect = svg.getBoundingClientRect();
              const y = e.clientY - rect.top;
              const points = pointsOf(t);
              // Passage le plus proche du pointeur, en ordonnée (arrêt)
              let best = 0;
              points.forEach((p, i) => {
                if (Math.abs(yOf(p.stopIndex) - y) < Math.abs(yOf(points[best].stopIndex) - y)) best = i;
              });
              setHover({ tripId: t.trip.id, point: best, x: rect.left + xOf(points[best].time), y: rect.top + yOf(points[best].stopIndex) });
            };
            return (
              <div className="timeline-shell__row time-space__row">
                <div className="timeline-shell__gutter time-space__gutter">
                  {stops.map((s, i) => (
                    <span key={s.id} className="time-space__stop" style={{ top: yOf(i) }} title={s.name}>
                      {s.name}
                    </span>
                  ))}
                </div>
                <div className="timeline-shell__track">
                  <svg className="time-space__svg" width={width} height={height} aria-hidden="true">
                    {stops.map((s, i) => (
                      <line key={s.id} className="time-space__stopline" x1={0} x2={width} y1={yOf(i)} y2={yOf(i)} />
                    ))}
                    {inWindow.map((t) => {
                      const active = activeTripId === t.trip.id;
                      const dimmed = activeTripId !== null && !active;
                      const className = [
                        "time-space__trip",
                        `time-space__trip--${t.trip.direction}`,
                        t.trip.status === "cancelled" ? "time-space__trip--cancelled" : "",
                        t.trip.status === "incident" ? "time-space__trip--incident" : "",
                        active ? "time-space__trip--active" : "",
                        dimmed ? "time-space__trip--dimmed" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");
                      const focusedPoint = focus && focusedTrip?.trip.id === t.trip.id ? pointsOf(t)[focus.point] : null;
                      return (
                        <g
                          key={t.trip.id}
                          className={className}
                          onMouseMove={(e) => onMove(e, t)}
                          onMouseLeave={() => setHover(null)}
                          onClick={() => onTripClick?.(t.trip)}
                        >
                          {/* Théorique en pointillé quand le réalisé est fourni */}
                          <path className={t.actual ? "time-space__line time-space__line--scheduled" : "time-space__line"} d={path(t.scheduled)} />
                          {t.actual && <path className="time-space__line" d={path(t.actual)} />}
                          {/* Zone de survol plus large que le trait */}
                          <path className="time-space__hit" d={path(pointsOf(t))} />
                          {focusedPoint && <circle className="time-space__focus" cx={xOf(focusedPoint.time)} cy={yOf(focusedPoint.stopIndex)} r={5} />}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            );
          }}
        </TimelineShell>
        <span id={summaryId} className="chart__sr-only">
          {describeTrips(inWindow.map((t) => t.trip), directions)}
        </span>
        <p className="chart__sr-only" aria-live="polite">
          {focus && focusedTrip ? passageSentence(focusedTrip, focus.point) : ""}
        </p>
      </div>
      {tooltip && hover && <ChartTooltip x={hover.x} y={hover.y} title={tooltip.title} rows={tooltip.rows} note={tooltip.note} />}
    </ChartFrame>
  );
};
