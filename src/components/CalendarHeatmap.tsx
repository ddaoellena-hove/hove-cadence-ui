import { useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import { ChartFrame, type ChartCommonProps } from "./ChartFrame";
import { ChartTooltip } from "./ChartTooltip";
import { formatKpiValue, formatValueWithUnit } from "./chart-format";
import { sequentialColor } from "./chart-palette";
import {
  buildWeeks,
  cellSize,
  dayKey,
  defaultYearRange,
  formatDayLong,
  monthLabels,
  type CalendarDay,
  type DayInput,
} from "./calendar-heatmap-utils";
import { buildStepScale, heatmapDomain, moveInGrid, rampThresholds, type GridPosition } from "./heatmap-utils";
import { useChartWidth } from "./use-chart-size";
import "./calendar-heatmap.css";

export interface CalendarHeatmapValue {
  /** Jour (Date ou « AAAA-MM-JJ »). */
  date: DayInput;
  /** null = pas de donnée (hachures), différent de 0. */
  value: number | null;
}

export interface CalendarHeatmapAnnotation {
  date: DayInput;
  /** « Grève », « Travaux de nuit » */
  label: string;
}

export interface CalendarHeatmapProps extends ChartCommonProps {
  /** Une valeur par jour ; jour absent = pas de donnée. */
  values: CalendarHeatmapValue[];
  /** Période affichée. Défaut : l'année civile du jour le plus récent. */
  range?: [DayInput, DayInput];
  /** Domaine de la rampe. Défaut [0, max]. 7 classes. */
  domain?: [number, number];
  /** Unité du tooltip et de la légende (« % », « perturbations »). */
  unit?: string;
  /** Formatage des nombres. Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Jours marqués (grève, travaux) : contour, rappel au survol et dans le nom du jour. */
  annotations?: CalendarHeatmapAnnotation[];
  /** Clic ou Entrée sur un jour renseigné (ouvrir le détail du jour). */
  onDayClick?: (day: { date: Date; key: string; value: number | null }) => void;
}

const LABEL_COLUMN = 40;
const GAP = 2;
const WEEKDAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const WEEKDAYS_SHORT = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

/**
 * Calendrier annuel en carte de chaleur : une colonne par semaine, une ligne
 * par jour (lundi en tête), la rampe séquentielle de `Heatmap`. Ponctualité
 * quotidienne, jours de circulation, perturbations. Grille accessible
 * (role="grid") au clavier comme `Heatmap`.
 */
export const CalendarHeatmap = ({
  values,
  range,
  domain: domainProp,
  unit,
  format,
  annotations = [],
  onDayClick,
  ...frame
}: CalendarHeatmapProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const width = useChartWidth(wrapRef);
  const [focus, setFocus] = useState<GridPosition>({ row: 0, col: 0 });
  const [tooltip, setTooltip] = useState<{ day: CalendarDay; x: number; y: number } | null>(null);

  const [start, end] = range ?? defaultYearRange(values.map((v) => v.date));
  const weeks = buildWeeks(start, end);
  const months = monthLabels(weeks);
  const byKey = new Map(values.map((v) => [dayKey(v.date), v.value]));
  const notes = new Map<string, string[]>();
  for (const a of annotations) notes.set(dayKey(a.date), [...(notes.get(dayKey(a.date)) ?? []), a.label]);

  const domain = heatmapDomain(
    values.map((v) => ({ x: "", y: "", value: v.value })),
    domainProp,
  );
  const stepOf = buildStepScale(domain);
  const size = cellSize(width, weeks.length, LABEL_COLUMN, GAP);
  const valueOf = (day: CalendarDay) => (byKey.has(day.key) ? (byKey.get(day.key) ?? null) : null);

  const describe = (day: CalendarDay) => {
    const value = valueOf(day);
    const note = notes.get(day.key);
    return `${formatDayLong(day.date)} : ${value === null ? "pas de donnée" : formatValueWithUnit(value, unit, format)}${note ? `. ${note.join(", ")}` : ""}`;
  };

  const showTooltip = (day: CalendarDay, element: Element) => {
    const rect = element.getBoundingClientRect();
    setTooltip({ day, x: rect.right, y: rect.top });
  };

  const focusCell = (position: GridPosition) => {
    setFocus(position);
    wrapRef.current?.querySelector<HTMLElement>(`[data-cell="${position.row}-${position.col}"]`)?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTableElement>) => {
    const day = weeks[focus.col]?.[focus.row];
    if ((e.key === "Enter" || e.key === " ") && onDayClick) {
      e.preventDefault();
      if (day && valueOf(day) !== null) onDayClick({ date: day.date, key: day.key, value: valueOf(day) });
      return;
    }
    if (e.key === "Escape") {
      setTooltip(null);
      return;
    }
    // Lignes = jours de la semaine, colonnes = semaines
    const next = moveInGrid(focus, e.key, e.ctrlKey || e.metaKey, 7, weeks.length);
    if (!next) return;
    e.preventDefault();
    focusCell(next);
  };

  const ramp = rampThresholds(domain);
  const legend = (
    <div className="calendar-heatmap-legend" aria-label="Légende">
      <span className="calendar-heatmap-legend__bound">{formatKpiValue(domain[0], format)}</span>
      <span className="calendar-heatmap-legend__ramp" aria-hidden="true">
        {ramp.map((r) => (
          <span key={r.step} className="calendar-heatmap-legend__swatch" style={{ background: sequentialColor(r.step) }} />
        ))}
      </span>
      <span className="calendar-heatmap-legend__bound">{formatValueWithUnit(domain[1], unit, format)}</span>
      <span className="calendar-heatmap-legend__item">
        <span className="calendar-heatmap-legend__swatch calendar-heatmap__cell--empty" aria-hidden="true" />
        Pas de donnée
      </span>
      {annotations.length > 0 && (
        <span className="calendar-heatmap-legend__item">
          <span className="calendar-heatmap-legend__swatch calendar-heatmap-legend__swatch--annotated" aria-hidden="true" />
          Événement
        </span>
      )}
      <span className="chart__sr-only">
        {`Échelle de couleur en 7 classes, de ${formatKpiValue(domain[0], format)} à ${formatValueWithUnit(domain[1], unit, format)}, du plus clair au plus foncé.`}
      </span>
    </div>
  );

  const monthAt = new Map(months.map((m) => [m.col, m.label]));
  const tooltipValue = tooltip ? valueOf(tooltip.day) : null;

  return (
    <ChartFrame
      {...frame}
      kind="calendar-heatmap"
      titleId={titleId}
      descriptionId={descriptionId}
      height={(size + GAP) * 8 + 40}
      legend={legend}
    >
      <div ref={wrapRef} className="calendar-heatmap__wrap">
        <table
          role="grid"
          className="calendar-heatmap__grid"
          style={{ width: LABEL_COLUMN + weeks.length * (size + GAP) }}
          aria-labelledby={titleId}
          aria-describedby={frame.description ? descriptionId : undefined}
          onKeyDown={handleKeyDown}
        >
          <thead>
            <tr>
              <td className="calendar-heatmap__corner" style={{ width: LABEL_COLUMN }} />
              {weeks.map((week, col) => {
                const firstDay = week.find((d) => d !== null);
                return (
                  <th key={firstDay?.key ?? col} scope="col" className="calendar-heatmap__month">
                    {/* Mois visible sur sa première semaine ; chaque colonne reste nommée pour les lecteurs d'écran */}
                    {monthAt.has(col) && <span aria-hidden="true">{monthAt.get(col)}</span>}
                    <span className="chart__sr-only">{firstDay ? `Semaine du ${formatDayLong(firstDay.date)}` : ""}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS.map((weekday, row) => (
              <tr key={weekday}>
                <th scope="row" className="calendar-heatmap__weekday">
                  {/* Un jour sur deux visible (lun., mer., ven., dim.), tous lus */}
                  <span className={row % 2 === 0 ? undefined : "chart__sr-only"}>{WEEKDAYS_SHORT[row]}</span>
                </th>
                {weeks.map((week, col) => {
                  const day = week[row];
                  const isFocus = focus.row === row && focus.col === col;
                  if (!day) {
                    return (
                      <td
                        key={col}
                        role="gridcell"
                        data-cell={`${row}-${col}`}
                        tabIndex={isFocus ? 0 : -1}
                        aria-label="Hors période"
                        className="calendar-heatmap__cell calendar-heatmap__cell--outside"
                        style={{ height: size }}
                        onFocus={() => setFocus({ row, col })}
                      />
                    );
                  }
                  const value = valueOf(day);
                  const step = stepOf(value);
                  const clickable = Boolean(onDayClick) && value !== null;
                  return (
                    <td
                      key={day.key}
                      role="gridcell"
                      data-cell={`${row}-${col}`}
                      tabIndex={isFocus ? 0 : -1}
                      aria-label={describe(day)}
                      className={[
                        "calendar-heatmap__cell",
                        step === null ? "calendar-heatmap__cell--empty" : "",
                        notes.has(day.key) ? "calendar-heatmap__cell--annotated" : "",
                        clickable ? "calendar-heatmap__cell--clickable" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ height: size, background: step === null ? undefined : sequentialColor(step) }}
                      onClick={clickable ? () => onDayClick?.({ date: day.date, key: day.key, value }) : undefined}
                      onFocus={(e: FocusEvent<HTMLTableCellElement>) => {
                        setFocus({ row, col });
                        showTooltip(day, e.currentTarget);
                      }}
                      onBlur={() => setTooltip(null)}
                      onMouseEnter={(e: MouseEvent<HTMLTableCellElement>) => showTooltip(day, e.currentTarget)}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="chart__sr-only" aria-live="polite">
          {tooltip ? describe(tooltip.day) : ""}
        </p>
      </div>
      {tooltip && (
        <ChartTooltip
          x={tooltip.x}
          y={tooltip.y}
          title={formatDayLong(tooltip.day.date)}
          rows={[
            {
              id: "value",
              label: unit ? unit.charAt(0).toUpperCase() + unit.slice(1) : "Valeur",
              value: tooltipValue === null ? "Pas de donnée" : formatKpiValue(tooltipValue, format),
            },
          ]}
          note={notes.get(tooltip.day.key)?.join(" · ")}
        />
      )}
    </ChartFrame>
  );
};
