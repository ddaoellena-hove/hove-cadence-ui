import { useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { scaleLinear } from "d3-scale";
import { ChartAxisBottom, ChartAxisLeft } from "./ChartAxis";
import { ChartDataTable } from "./ChartDataTable";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartTooltip } from "./ChartTooltip";
import { annotationLabelPlacement, formatKpiValue } from "./chart-format";
import { binLabel, buildBins, describeHistogram, edgePosition, formatBinShare } from "./histogram-utils";
import { formatClock } from "./timeline-utils";
import { useChartWidth } from "./use-chart-size";
import "./histogram.css";

export interface HistogramThreshold {
  value: number;
  /** « Retard 5 min » — toujours affiché sur le trait. */
  label: string;
}

export interface HistogramDatum { index: number; lower: number; upper: number; count: number; share: number; openStart: boolean; openEnd: boolean }

export interface HistogramProps extends ChartCommonProps {
  /** Observations brutes (retards en minutes, temps de parcours…). Valeurs non finies ignorées. */
  values: number[];
  onDatumClick?: (datum: HistogramDatum) => void;
  selectedBin?: number;
  clickHint?: string;
  /**
   * Nombre de classes visé (bornes « rondes » couvrant toutes les valeurs) ou
   * bornes imposées `[0, 2, 5, 10, 15]` : les valeurs en dehors rejoignent la
   * première ou la dernière classe (« moins de 0 min », « 15 min et plus »).
   * Défaut : règle de Sturges.
   */
  bins?: number | number[];
  /** Unité des valeurs observées (« min »). */
  unit?: string;
  /** Ce que l'on compte, au pluriel (« courses », « passages »). Défaut « observations ». */
  countLabel?: string;
  /** Formatage des bornes. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Traits verticaux libellés (seuil de retard, objectif). */
  thresholds?: HistogramThreshold[];
  /** Lignes de grille. Défaut true. */
  showGrid?: boolean;
  /** En-tête masqué visuellement (titre toujours lu). */
  hideTitle?: boolean;
  /** Hauteur du tracé. Défaut 280. */
  height?: number;
  /**
   * Valeurs en heures de service : minutes depuis 00:00 du jour de service,
   * au-delà de 1 440 après minuit (1 530 = 25h30). Classes alignées sur
   * l'horloge, bornes et tooltip en « 22h30 ». Défaut false.
   */
  serviceTime?: boolean;
  /**
   * Événements ou périodes à signaler sur l'axe des valeurs : trait (une
   * valeur) ou bande (`[début, fin]`), libellé, rappelé au survol de la classe.
   */
  annotations?: HistogramAnnotation[];
}

export interface HistogramAnnotation {
  at: number | [number, number];
  /** « Grève » */
  label: string;
}

const MARGIN = { top: 20, right: 16, bottom: 28, left: 52 };
const COUNT_FORMAT = { maximumFractionDigits: 0 };

/**
 * Distribution d'une mesure : effectif par classe de valeurs (retards,
 * temps de parcours, intervalles entre passages). Classes contiguës, seuils
 * libellés, tooltip et navigation au clavier, alternative tabulaire.
 */
export const Histogram = ({
  values, onDatumClick, selectedBin, clickHint = "Entrée ou clic : voir le détail",
  bins: binsProp,
  unit,
  countLabel = "observations",
  format,
  thresholds = [],
  showGrid = true,
  hideTitle = false,
  height = 280,
  serviceTime = false,
  annotations = [],
  ...frame
}: HistogramProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const summaryId = useId();
  const hintId = useId();
  const plotRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(plotRef);
  const [activeIndex, setActive] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ left: 0, top: 0 });

  const bins = useMemo(() => buildBins(values, binsProp, serviceTime), [values, binsProp, serviceTime]);
  const active = activeIndex !== null && activeIndex >= 0 && activeIndex < bins.length ? activeIndex : null;
  const select = (index: number | null) => {
    if (index === null || !bins[index] || !bins[index].count) return;
    const b = bins[index];
    onDatumClick?.({ index, lower: b.x0, upper: b.x1, count: b.count, share: b.share, openStart: Boolean(b.openStart), openEnd: Boolean(b.openEnd) });
  };
  const label = (b: (typeof bins)[number]) => binLabel(b, unit, format, serviceTime);
  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const domain: [number, number] = bins.length ? [bins[0].x0, bins[bins.length - 1].x1] : [0, 1];
  // Bornes des classes ; chaque classe a la même largeur à l'écran
  const edges = bins.length ? [bins[0].x0, ...bins.map((b) => b.x1)] : [];
  const x = (v: number) => edgePosition(edges, v, plotWidth);
  const classWidth = bins.length ? plotWidth / bins.length : 0;
  const y = scaleLinear()
    .domain([0, Math.max(1, ...bins.map((b) => b.count))])
    .range([plotHeight, 0])
    .nice(5);

  const yTicks = y
    .ticks(5)
    .filter((v) => Number.isInteger(v))
    .map((v) => ({ key: String(v), position: y(v), label: formatKpiValue(v, COUNT_FORMAT) }));
  // Bornes sur l'axe X (une sur deux, trois… si elles sont trop serrées)
  const step = Math.max(1, Math.ceil((edges.length * 48) / Math.max(1, plotWidth)));
  const xTicks = edges
    .filter((_, i) => i % step === 0)
    .map((v) => ({ key: String(v), position: x(v), label: serviceTime ? formatClock(v, "time") : formatKpiValue(v, format) }));
  const visibleThresholds = thresholds.filter((t) => Number.isFinite(t.value) && t.value >= domain[0] && t.value <= domain[1]);

  const activeBin = active !== null ? bins[active] : null;
  const describeBin = (i: number) => {
    const b = bins[i];
    return `${label(b)} : ${formatKpiValue(b.count, COUNT_FORMAT)} ${countLabel}, ${formatBinShare(b.share)}`;
  };

  const activate = (index: number | null, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setOrigin({ left: rect.left, top: rect.top });
    setActive(index);
  };

  const indexAt = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - MARGIN.left;
    const y = e.clientY - rect.top - MARGIN.top;
    return x >= 0 && x < plotWidth && y >= 0 && y <= plotHeight && classWidth > 0 ? Math.floor(x / classWidth) : null;
  };
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (bins.length === 0) return;
    activate(indexAt(e), e.currentTarget);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (bins.length === 0) return;
    if (onDatumClick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(active); return; }
    if (e.key === "Escape") {
      setActive(null);
      return;
    }
    const last = bins.length - 1;
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

  const resolvedAnnotations = annotations.flatMap((a) => {
    const [from, to] = Array.isArray(a.at) ? a.at : [a.at, a.at];
    if (!Number.isFinite(from) || !Number.isFinite(to)) return [];
    return [{ label: a.label, from: Math.min(from, to), to: Math.max(from, to), band: Array.isArray(a.at) }];
  });
  const notesFor = (i: number) =>
    [
      ...visibleThresholds.filter((t) => t.value >= bins[i].x0 && t.value <= bins[i].x1).map((t) => t.label),
      ...resolvedAnnotations.filter((a) => a.from <= bins[i].x1 && a.to >= bins[i].x0).map((a) => a.label),
    ].join(" · ") || undefined;

  const table = (show: boolean) => (
    <ChartDataTable
      caption={frame.title}
      visible={show}
      columns={["Classe", `Effectif (${countLabel})`, "Part"]}
      numeric={[1, 2]}
      currentRow={selectedBin}
      rowActions={onDatumClick ? bins.map((b, i) => b.count ? () => select(i) : undefined) : undefined}
      rows={bins.map((b) => [label(b), formatKpiValue(b.count, COUNT_FORMAT), formatBinShare(b.share)])}
    />
  );

  const anchor =
    activeBin !== null && active !== null
      ? { x: origin.left + MARGIN.left + (active + 0.5) * classWidth, y: origin.top + MARGIN.top + y(activeBin.count) }
      : null;

  return (
    <ChartFrame
      {...frame}
      kind="histogram"
      titleId={titleId}
      descriptionId={descriptionId}
      height={height}
      hideHeader={hideTitle}
      table={table}
    >
      <div
        ref={plotRef}
        className={`chart__plot${onDatumClick ? " histogram__plot--clickable" : ""}`}
        style={{ height }}
        tabIndex={0}
        role="group"
        aria-roledescription="histogramme"
        aria-labelledby={titleId}
        aria-describedby={`${frame.description ? `${descriptionId} ` : ""}${summaryId}${onDatumClick ? ` ${hintId}` : ""}`}
        onMouseMove={handleMouseMove}
        onClick={onDatumClick ? e => select(indexAt(e)) : undefined}
        onMouseLeave={() => setActive(null)}
        onFocus={(e) => activate(active ?? (bins.length ? 0 : null), e.currentTarget)}
        onBlur={() => setActive(null)}
        onKeyDown={handleKeyDown}
      >
        <svg className="chart__svg" width={width} height={height} aria-hidden="true">
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            <ChartAxisLeft ticks={yTicks} plotWidth={plotWidth} grid={showGrid} />

            {bins.map((b, i) => {
              const x0 = i * classWidth;
              const barWidth = Math.max(0, classWidth - 1);
              const top = y(b.count);
              return (
                <g key={`${b.x0}-${b.x1}`}>
                  {selectedBin === i && <rect className="histogram__selected" x={x0 + 1} y={1} width={Math.max(0, classWidth - 2)} height={Math.max(0, plotHeight - 2)} />}
                  {active === i && <rect className="histogram__hover" x={x0} y={0} width={barWidth + 1} height={plotHeight} />}
                  {b.count > 0 && (
                    <rect
                      className={`histogram__bar${b.openStart || b.openEnd ? " histogram__bar--open" : ""}`}
                      x={x0 + 0.5}
                      y={top}
                      width={barWidth}
                      height={plotHeight - top}
                      rx={2}
                    />
                  )}
                </g>
              );
            })}

            {/* Annotations : trait ou bande libellés (sous les seuils) */}
            {resolvedAnnotations.map((a) => (
              <g key={`${a.label}-${a.from}`} className="histogram__annotation">
                {a.band && <rect className="histogram__annotation-band" x={x(a.from)} y={0} width={Math.max(1, x(a.to) - x(a.from))} height={plotHeight} />}
                <line className="histogram__annotation-line" x1={x(a.from)} x2={x(a.from)} y1={0} y2={plotHeight} />
                <text className="histogram__annotation-label" {...annotationLabelPlacement(x(a.from), a.band ? x(a.to) : x(a.from), a.label, plotWidth)} y={14}>
                  {a.label}
                </text>
              </g>
            ))}

            {/* Seuils : trait vertical tireté + libellé */}
            {visibleThresholds.map((t) => (
              <g key={`${t.label}-${t.value}`} className="histogram__threshold">
                <line x1={x(t.value)} x2={x(t.value)} y1={0} y2={plotHeight} />
                <text x={x(t.value) + 4} y={-6}>
                  {t.label}
                </text>
              </g>
            ))}

            <ChartAxisBottom ticks={xTicks} y={plotHeight} plotWidth={plotWidth} />
          </g>
        </svg>
        <span id={summaryId} className="chart__sr-only">
          {describeHistogram(values, bins, countLabel, unit, format, serviceTime)}
        </span>
        <p className="chart__sr-only" aria-live="polite">
          {active !== null ? `${describeBin(active)}${notesFor(active) ? `. ${notesFor(active)}` : ""}` : ""}
        </p>
      </div>
      {onDatumClick && <p id={hintId} className="chart__sr-only">{clickHint}{selectedBin !== undefined && bins[selectedBin] ? `. Sélection : ${label(bins[selectedBin])}` : ""}</p>}
      {anchor && activeBin && active !== null && (
        <ChartTooltip
          x={anchor.x}
          y={anchor.y}
          title={label(activeBin)}
          rows={[
            { id: "count", label: countLabel.charAt(0).toUpperCase() + countLabel.slice(1), value: formatKpiValue(activeBin.count, COUNT_FORMAT) },
            { id: "share", label: "Part", value: formatBinShare(activeBin.share) },
          ]}
          note={notesFor(active)}
          hint={onDatumClick && activeBin.count ? clickHint : undefined}
        />
      )}
    </ChartFrame>
  );
};
