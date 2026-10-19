import type { KeyboardEvent, MouseEvent } from "react";
import { WEEKDAYS, buildWeeks, dayKey, formatLongDate, formatMonthLabel, isSameDay } from "./date-utils";
import "./calendar-month.css";

// Composant interne (non exporté par index.ts) : un mois de calendrier,
// partagé par DatePicker et DateRangePicker. Les classes `date-picker__*`
// sont celles historiques de DatePicker, conservées pour la compatibilité.

export interface CalendarDayState {
  selected?: boolean;
  disabled?: boolean;
  /** Bornes et intérieur d'une période (DateRangePicker). */
  rangeStart?: boolean;
  rangeEnd?: boolean;
  inRange?: boolean;
}

export interface CalendarMonthProps {
  year: number;
  /** Mois affiché (0 = janvier). */
  month: number;
  /** Bouton « Mois précédent ». Sans callback, un espace vide garde la mise en page. */
  onPrevMonth?: () => void;
  /** Bouton « Mois suivant ». Sans callback, un espace vide garde la mise en page. */
  onNextMonth?: () => void;
  /** État d'un jour (sélection, plage, désactivé). */
  getDayState: (date: Date) => CalendarDayState;
  /** Jour qui porte le focus clavier (seul jour dans l'ordre de tabulation). */
  focusedDate: Date | null;
  /** Date du jour (repère « aujourd'hui »). */
  today: Date;
  onSelect: (date: Date) => void;
  onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, date: Date) => void;
  /** Survol d'un jour (aperçu de plage). */
  onHoverDay?: (date: Date | null) => void;
  /** Affiche les jours des mois voisins. Défaut true (false à deux mois : pas de doublon). */
  showOutsideDays?: boolean;
}

const NavIcon = ({ direction }: { direction: "prev" | "next" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d={direction === "prev" ? "M10 12L6 8l4-4" : "M6 4l4 4-4 4"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CalendarMonth = ({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  getDayState,
  focusedDate,
  today,
  onSelect,
  onKeyDown,
  onHoverDay,
  showOutsideDays = true,
}: CalendarMonthProps) => {
  const weeks = buildWeeks(year, month);

  const describe = (date: Date, state: CalendarDayState) => {
    const parts = [formatLongDate(date)];
    if (state.rangeStart && state.rangeEnd) parts.push("début et fin de période");
    else if (state.rangeStart) parts.push("début de période");
    else if (state.rangeEnd) parts.push("fin de période");
    else if (state.inRange) parts.push("dans la période");
    if (isSameDay(date, today)) parts.push("aujourd'hui");
    return parts.join(", ");
  };

  return (
    <div className="calendar-month">
      {/* ── En-tête ── */}
      <div className="date-picker__header">
        {onPrevMonth ? (
          <button type="button" className="date-picker__nav-btn" onClick={onPrevMonth} aria-label="Mois précédent">
            <NavIcon direction="prev" />
          </button>
        ) : (
          <span className="date-picker__nav-btn date-picker__nav-btn--placeholder" aria-hidden="true" />
        )}
        <span className="date-picker__month-label" aria-live="polite">
          {formatMonthLabel(year, month)}
        </span>
        {onNextMonth ? (
          <button type="button" className="date-picker__nav-btn" onClick={onNextMonth} aria-label="Mois suivant">
            <NavIcon direction="next" />
          </button>
        ) : (
          <span className="date-picker__nav-btn date-picker__nav-btn--placeholder" aria-hidden="true" />
        )}
      </div>

      {/* ── Grille ── */}
      <div className="date-picker__grid" onMouseLeave={onHoverDay ? () => onHoverDay(null) : undefined}>
        <div className="date-picker__weekdays" aria-hidden="true">
          {WEEKDAYS.map((day) => (
            <span key={day} className="date-picker__weekday">
              {day}
            </span>
          ))}
        </div>
        <div className="date-picker__weeks">
          {weeks.map((week, wi) => (
            <div key={wi} className="date-picker__week">
              {week.map((date) => {
                const outside = date.getMonth() !== month;
                if (outside && !showOutsideDays) {
                  return <span key={dayKey(date)} className="date-picker__day date-picker__day--empty" />;
                }
                const state = getDayState(date);
                const isRangeEdge = state.rangeStart || state.rangeEnd;
                const selected = Boolean(state.selected || isRangeEdge);
                const focusable = focusedDate !== null && isSameDay(date, focusedDate);
                const classes = [
                  "date-picker__day",
                  outside ? "date-picker__day--outside" : "",
                  state.disabled ? "date-picker__day--disabled" : "",
                  selected ? "date-picker__day--selected" : "",
                  state.inRange && !isRangeEdge ? "date-picker__day--in-range" : "",
                  isSameDay(date, today) && !selected ? "date-picker__day--today" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={dayKey(date)}
                    type="button"
                    className={classes}
                    data-day={dayKey(date)}
                    onClick={(e: MouseEvent) => {
                      e.preventDefault();
                      if (!state.disabled) onSelect(date);
                    }}
                    onKeyDown={(e) => onKeyDown(e, date)}
                    onMouseEnter={onHoverDay ? () => onHoverDay(date) : undefined}
                    aria-disabled={state.disabled || undefined}
                    tabIndex={focusable ? 0 : -1}
                    aria-pressed={selected}
                    aria-label={describe(date, state)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
