import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartTooltip, type ChartTooltipRow } from "./ChartTooltip";
import { formatKpiValue } from "./chart-format";
import { Icons } from "./Icons";
import { LineBadge, type LineMode } from "./LineBadge";
import { ModeIcon, type ModeName } from "./ModeIcon";
import {
  DEFAULT_DELAY_THRESHOLDS,
  delayBadge,
  delayText,
  describeLine,
  positionText,
  stackLevels,
  stopFractions,
  vehicleFraction,
  vehicleStatus,
  type DelayThresholds,
  type LineDiagramStopInput,
  type LineDiagramVehicleInput,
  type VehicleStatus,
} from "./line-diagram-utils";
import { useChartWidth } from "./use-chart-size";
import "./line-diagram.css";

export type LineDiagramStop = LineDiagramStopInput;
export type LineDiagramVehicle = LineDiagramVehicleInput;

export interface LineDiagramProps extends ChartCommonProps {
  /** Ligne supervisée (données GTFS) : badge en tête, couleur de la voie, picto des véhicules. */
  line: { code: string; color?: string; textColor?: string; mode?: LineMode };
  /** Arrêts dans l'ordre de l'aller. `distance` sur tous les arrêts : espacement à l'échelle. */
  stops: LineDiagramStop[];
  /** Positions courantes, fournies par l'application à chaque rafraîchissement. */
  vehicles: LineDiagramVehicle[];
  /** Libellés des sens. Défaut : « Vers <dernier arrêt> » / « Vers <premier arrêt> ». */
  directions?: { outbound?: string; inbound?: string };
  /** Sens affichés. Défaut "both". */
  show?: "both" | "outbound" | "inbound";
  /** Seuils de retard (min) pour le statut. Défaut { late: 3, early: -1 }. */
  delayThresholds?: DelayThresholds;
  /**
   * Annonces aux lecteurs d'écran des changements non sollicités. "incidents"
   * (défaut) : nouvel incident, arrêt qui ferme ; "all" : aussi les passages en
   * retard ou en avance ; "none" : aucune. Regroupées au plus toutes les 10 s.
   */
  announce?: "none" | "incidents" | "all";
  /** Clic ou Entrée sur un véhicule (ouvrir son détail). */
  onVehicleClick?: (vehicle: LineDiagramVehicle) => void;
  /** Clic ou Entrée sur un arrêt : les arrêts deviennent une file au clavier. */
  onStopClick?: (stop: LineDiagramStop) => void;
}

// Modes de ligne GTFS → pictos remplis ModeIcon (comme JourneyTimeline)
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

const MIN_STOP_GAP = 64; // px par interarrêt
const PAD = 48; // marge de chaque côté de la voie
const LEVEL = 28; // hauteur d'un niveau d'empilement
const CHIP_MIN_GAP = 76; // px : en deçà, deux véhicules d'une file s'empilent
const ANNOUNCE_EVERY = 10_000;

type Lane = "outbound" | "inbound" | "stops";

const now = () => Date.now();
/** Délai avant la prochaine annonce : au plus une toutes les 10 s. */
const waitBeforeNotice = (last: number) => Math.max(0, last + ANNOUNCE_EVERY - now());

/**
 * Thermomètre de ligne : arrêts sur une voie horizontale, véhicules de
 * chaque sens au-dessus (aller) et au-dessous (retour), statut écrit (écart,
 * incident), arrêts fermés ou perturbés. Données temps réel fournies par
 * l'application (composant contrôlé) ; clavier par file, annonces regroupées.
 */
export const LineDiagram = ({
  line,
  stops,
  vehicles,
  directions: directionsProp,
  show = "both",
  delayThresholds = DEFAULT_DELAY_THRESHOLDS,
  announce = "incidents",
  onVehicleClick,
  onStopClick,
  ...frame
}: LineDiagramProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const summaryId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewport = useChartWidth(scrollRef);
  const [focus, setFocus] = useState<{ lane: Lane; index: number } | null>(null);
  const [hover, setHover] = useState<{ lane: Lane; index: number; x: number; y: number } | null>(null);

  const directions = {
    outbound: directionsProp?.outbound ?? `Vers ${stops[stops.length - 1]?.name ?? "terminus"}`,
    inbound: directionsProp?.inbound ?? `Vers ${stops[0]?.name ?? "origine"}`,
  };
  const names = new Map(stops.map((s) => [s.id, s.name]));
  const stopIndex = new Map(stops.map((s, i) => [s.id, i]));
  const fractions = stopFractions(stops);
  const width = Math.max(viewport, Math.max(0, stops.length - 1) * MIN_STOP_GAP + 2 * PAD);
  const xOf = (f: number) => PAD + f * (width - 2 * PAD);
  const mode = MODE_ICON[line.mode ?? "bus"];

  // Véhicules placés, par file, de gauche à droite (ordre de la ligne)
  const laneOf = (direction: "outbound" | "inbound") => {
    const placed = vehicles
      .filter((v) => v.direction === direction)
      .map((v) => ({ v, f: vehicleFraction(v.position, stopIndex, fractions) }))
      .filter((p): p is { v: LineDiagramVehicle; f: number } => p.f !== null)
      .sort((a, b) => a.f - b.f);
    const levels = stackLevels(
      placed.map((p) => xOf(p.f)),
      CHIP_MIN_GAP,
    );
    return placed.map((p, i) => ({ ...p, x: xOf(p.f), status: vehicleStatus(p.v, delayThresholds), ...levels[i] }));
  };
  const outbound = show === "inbound" ? [] : laneOf("outbound");
  const inbound = show === "outbound" ? [] : laneOf("inbound");
  const lanes: Lane[] = [...(show !== "inbound" ? (["outbound"] as const) : []), ...(show !== "outbound" ? (["inbound"] as const) : []), ...(onStopClick ? (["stops"] as const) : [])];
  const itemsOf = (lane: Lane) => (lane === "outbound" ? outbound.length : lane === "inbound" ? inbound.length : stops.length);
  const levelsOf = (lane: typeof outbound) => Math.max(1, ...lane.map((c) => c.level + 1));
  const laneHeight = (lane: typeof outbound) => levelsOf(lane) * LEVEL + 8;

  const closed = stops.filter((s) => s.status === "closed").length;
  const summary = describeLine(
    vehicles.filter((v) => show === "both" || v.direction === show),
    directions,
    closed,
    delayThresholds,
  );

  const vehicleSentence = (v: LineDiagramVehicle) =>
    [
      `${v.label}, ${v.direction === "outbound" ? directions.outbound : directions.inbound}`,
      positionText(v.position, names),
      v.incident ? `incident : ${v.incident}` : delayText(v.delay),
      ...(typeof v.load === "number" ? [`charge ${formatKpiValue(v.load, { maximumFractionDigits: 0 })} %`] : []),
    ].join(", ");
  const stopSentence = (s: LineDiagramStop) =>
    `Arrêt ${s.name}${s.status === "closed" ? ", fermé" : s.status === "disrupted" ? ", perturbé" : ""}${s.note ? `, ${s.note}` : ""}`;

  const itemAt = (lane: Lane, index: number) =>
    lane === "stops" ? { stop: stops[index] } : { vehicle: (lane === "outbound" ? outbound : inbound)[index]?.v };
  const sentenceAt = (lane: Lane, index: number) => {
    const item = itemAt(lane, index);
    return item.stop ? stopSentence(item.stop) : item.vehicle ? vehicleSentence(item.vehicle) : "";
  };
  const activate = (lane: Lane, index: number) => {
    const item = itemAt(lane, index);
    if (item.stop) onStopClick?.(item.stop);
    else if (item.vehicle) onVehicleClick?.(item.vehicle);
  };

  // L'élément actif reste visible dans la zone qui défile
  const reveal = (lane: Lane, index: number) =>
    requestAnimationFrame(() =>
      scrollRef.current?.querySelector(`[data-item="${lane}-${index}"]`)?.scrollIntoView?.({ block: "nearest", inline: "nearest" }),
    );

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (lanes.length === 0) return;
    const current = focus ?? { lane: lanes[0], index: 0 };
    if (e.key === "Escape") {
      setHover(null);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate(current.lane, current.index);
      return;
    }
    const count = itemsOf(current.lane);
    let next: { lane: Lane; index: number } | null = null;
    if (e.key === "ArrowRight") next = { ...current, index: Math.min(count - 1, current.index + 1) };
    else if (e.key === "ArrowLeft") next = { ...current, index: Math.max(0, current.index - 1) };
    else if (e.key === "Home") next = { ...current, index: 0 };
    else if (e.key === "End") next = { ...current, index: Math.max(0, count - 1) };
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const at = lanes.indexOf(current.lane) + (e.key === "ArrowDown" ? 1 : -1);
      const lane = lanes[Math.min(lanes.length - 1, Math.max(0, at))];
      next = { lane, index: Math.min(Math.max(0, itemsOf(lane) - 1), current.index) };
    }
    if (!next) return;
    e.preventDefault();
    setFocus(next);
    reveal(next.lane, next.index);
  };

  // ── Annonces regroupées des changements non sollicités ──
  const [notice, setNotice] = useState("");
  const previous = useRef<Map<string, string> | null>(null);
  const pending = useRef<string[]>([]);
  const lastNotice = useRef(0);
  useEffect(() => {
    if (announce === "none") return;
    const current = new Map<string, string>();
    for (const v of vehicles) {
      const status = vehicleStatus(v, delayThresholds);
      if (status === "incident") current.set(`v:${v.id}`, `Incident ${v.label} : ${v.incident}, ${positionText(v.position, names)}`);
      else if (announce === "all" && (status === "late" || status === "early")) current.set(`v:${v.id}`, `${v.label} : ${delayText(v.delay)}`);
    }
    for (const s of stops) if (s.status === "closed") current.set(`s:${s.id}`, `Arrêt ${s.name} fermé${s.note ? ` : ${s.note}` : ""}`);
    const before = previous.current;
    previous.current = current;
    if (!before) return; // premier rendu : état initial, rien à annoncer
    for (const [key, message] of current) if (before.get(key) !== message) pending.current.push(message);
    if (pending.current.length === 0) return;
    const wait = waitBeforeNotice(lastNotice.current);
    const timer = window.setTimeout(() => {
      setNotice(pending.current.join(". "));
      pending.current = [];
      lastNotice.current = now();
    }, wait);
    return () => window.clearTimeout(timer);
    // names est dérivé de stops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, stops, announce, delayThresholds]);

  // ── Rendu ──
  const chip = (c: (typeof outbound)[number], lane: "outbound" | "inbound", index: number) => {
    const active = focus?.lane === lane && focus.index === index;
    const badge = c.v.incident ? null : delayBadge(c.v.delay);
    return (
      <div
        key={c.v.id}
        data-item={`${lane}-${index}`}
        className={[
          "line-diagram__vehicle",
          `line-diagram__vehicle--${c.status}`,
          active ? "line-diagram__vehicle--active" : "",
          c.overflow ? "line-diagram__vehicle--overflow" : "",
          onVehicleClick ? "line-diagram__vehicle--clickable" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ left: c.x, [lane === "outbound" ? "bottom" : "top"]: 4 + c.level * LEVEL }}
        onMouseEnter={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover({ lane, index, x: r.right, y: r.top });
        }}
        onMouseLeave={() => setHover(null)}
        onClick={() => onVehicleClick?.(c.v)}
      >
        <ModeIcon mode={mode} size={14} />
        <span className="line-diagram__vehicle-label">{c.v.label}</span>
        {c.v.incident && <Icons icon="alert-triangle" size={12} />}
        {badge && <span className="line-diagram__vehicle-delay">{badge}</span>}
      </div>
    );
  };

  const statusLabel: Record<VehicleStatus, string> = { incident: "Incident", late: "En retard", early: "En avance", ontime: "À l'heure", unknown: "Écart inconnu" };
  const hovered = hover ? itemAt(hover.lane, hover.index) : null;
  const tooltipRows = (): ChartTooltipRow[] => {
    if (hovered?.vehicle) {
      const v = hovered.vehicle;
      return [
        { id: "dir", label: "Sens", value: v.direction === "outbound" ? directions.outbound : directions.inbound },
        { id: "pos", label: "Position", value: positionText(v.position, names) },
        { id: "status", label: statusLabel[vehicleStatus(v, delayThresholds)], value: v.incident ?? delayText(v.delay), tone: v.incident ? "alert" : "default" },
        ...(typeof v.load === "number" ? [{ id: "load", label: "Charge", value: `${formatKpiValue(v.load, { maximumFractionDigits: 0 })} %` }] : []),
      ];
    }
    if (hovered?.stop) {
      const s = hovered.stop;
      return [{ id: "status", label: "État", value: s.status === "closed" ? "Fermé" : s.status === "disrupted" ? "Perturbé" : "Desservi", tone: s.status && s.status !== "normal" ? "alert" : "default" }];
    }
    return [];
  };

  const table = (visible: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={visible}
      columns={["Véhicule", "Sens", "Position", "Écart", "Charge (%)", "Incident"]}
      numeric={[4]}
      rows={[...outbound, ...inbound].map((c) => [
        c.v.label,
        c.v.direction === "outbound" ? directions.outbound : directions.inbound,
        positionText(c.v.position, names),
        delayText(c.v.delay),
        typeof c.v.load === "number" ? formatKpiValue(c.v.load, { maximumFractionDigits: 0 }) : "—",
        c.v.incident ?? "—",
      ])}
    />
  );

  const tight = (width - 2 * PAD) / Math.max(1, stops.length - 1) < 112;
  const outHeight = show === "inbound" ? 0 : laneHeight(outbound);
  const inHeight = show === "outbound" ? 0 : laneHeight(inbound);
  const trackColor = line.color ?? "var(--cadence-color-primary, #002830)";

  return (
    <ChartFrame
      {...frame}
      kind="line-diagram"
      titleId={titleId}
      descriptionId={descriptionId}
      height={outHeight + inHeight + 120}
      table={table}
    >
      <div className="line-diagram__header" aria-hidden="true">
        <LineBadge code={line.code} mode={line.mode} color={line.color} textColor={line.textColor} size="sm" />
        {show !== "inbound" && (
          <span className="line-diagram__direction">
            {directions.outbound}
            <Icons icon="arrow-right" size={12} />
          </span>
        )}
        {show !== "outbound" && (
          <span className="line-diagram__direction">
            <Icons icon="arrow-left" size={12} />
            {directions.inbound}
            <span className="line-diagram__direction-hint">(sous la voie)</span>
          </span>
        )}
      </div>
      <div
        ref={scrollRef}
        className="chart__plot line-diagram__scroll"
        tabIndex={0}
        role="group"
        aria-roledescription="thermomètre de ligne"
        aria-labelledby={titleId}
        aria-describedby={`${frame.description ? `${descriptionId} ` : ""}${summaryId}`}
        onFocus={(e) => {
          if (e.target === e.currentTarget && !focus && lanes.length) setFocus({ lane: lanes[0], index: 0 });
        }}
        onBlur={() => setFocus(null)}
        onKeyDown={handleKeyDown}
      >
        <div className="line-diagram__canvas" style={{ width }}>
          {show !== "inbound" && (
            <div className="line-diagram__lane" style={{ height: outHeight }}>
              {outbound.map((c, i) => chip(c, "outbound", i))}
            </div>
          )}

          {/* Voie : trait à la couleur de la ligne, tronçons perturbés tiretés, arrêts en pastilles */}
          <div className="line-diagram__track">
            <span className="line-diagram__rail" style={{ left: PAD, width: width - 2 * PAD, background: trackColor }} />
            {stops.map((s, i) =>
              s.status === "disrupted" && i < stops.length - 1 ? (
                <span key={`seg-${s.id}`} className="line-diagram__disrupted" style={{ left: xOf(fractions[i]), width: xOf(fractions[i + 1]) - xOf(fractions[i]) }} />
              ) : null,
            )}
            {stops.map((s, i) => {
              const active = focus?.lane === "stops" && focus.index === i;
              return (
                <span
                  key={s.id}
                  data-item={`stops-${i}`}
                  className={[
                    "line-diagram__stop",
                    s.status === "closed" ? "line-diagram__stop--closed" : "",
                    s.status === "disrupted" ? "line-diagram__stop--disrupted" : "",
                    active ? "line-diagram__stop--active" : "",
                    onStopClick ? "line-diagram__stop--clickable" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ left: xOf(fractions[i]), borderColor: trackColor }}
                  onMouseEnter={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setHover({ lane: "stops", index: i, x: r.right, y: r.top });
                  }}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onStopClick?.(s)}
                >
                  {s.status === "closed" && <Icons icon="x-close" size={10} />}
                </span>
              );
            })}
          </div>

          {show !== "outbound" && (
            <div className="line-diagram__lane line-diagram__lane--inbound" style={{ height: inHeight }}>
              {inbound.map((c, i) => chip(c, "inbound", i))}
            </div>
          )}

          {/* Libellés d'arrêts : deux rangs alternés quand la place manque */}
          <div className={`line-diagram__names${tight ? " line-diagram__names--tight" : ""}`}>
            {stops.map((s, i) => (
              <span
                key={s.id}
                className={[
                  "line-diagram__name",
                  tight && i % 2 === 1 ? "line-diagram__name--low" : "",
                  s.status === "closed" ? "line-diagram__name--closed" : "",
                  // Extrémités : calées sur leur arrêt, vers l'intérieur, pour ne pas sortir du cadre
                  i === 0 ? "line-diagram__name--first" : i === stops.length - 1 ? "line-diagram__name--last" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ left: xOf(fractions[i]), maxWidth: tight ? 120 : 104 }}
                title={s.name}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>
        <span id={summaryId} className="chart__sr-only">
          {summary}
        </span>
        <p className="chart__sr-only" aria-live="polite">
          {focus ? sentenceAt(focus.lane, focus.index) : ""}
        </p>
        <p className="chart__sr-only" aria-live="polite">
          {notice}
        </p>
      </div>
      {hover && hovered && (hovered.vehicle || hovered.stop) && (
        <ChartTooltip
          x={hover.x}
          y={hover.y}
          title={hovered.vehicle ? `${hovered.vehicle.label}` : `${hovered.stop?.name}`}
          rows={tooltipRows()}
          note={hovered.stop?.note ?? ((hovered.vehicle && onVehicleClick) || (hovered.stop && onStopClick) ? "Entrée ou clic : voir le détail" : undefined)}
        />
      )}
    </ChartFrame>
  );
};
