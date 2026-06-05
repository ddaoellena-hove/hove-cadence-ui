import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { SecondaryButton } from "./SecondaryButton";
import "./date-picker.css";

export interface DatePickerSegmentedOption {
  value: string;
  label: string;
}

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  /** Label displayed above the trigger (same style as TextInput). */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  /** Show hour & minute spinner + Valider button inside the popover */
  withTime?: boolean;
  /** Label for the confirm button when withTime is true */
  labelConfirm?: string;
  /**
   * When provided, renders a SegmentedControlAlt inside the popover header.
   * The parent controls which tab is active via `segmentedValue` + `onSegmentChange`.
   */
  segmentedOptions?: DatePickerSegmentedOption[];
  /** Currently active segment value (controlled). */
  segmentedValue?: string;
  /** Called when the user switches segment. */
  onSegmentChange?: (value: string) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function formatDate(date: Date, withTime = false): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  if (withTime) {
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
  }
  return `${mm}/${dd}/${yyyy}`;
}

function buildWeeks(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push(new Date(year, month, -firstDay + 1 + i));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push(new Date(year, month + 1, d));
    }
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

/** Minimal inline SegmentedControlAlt used only inside the popover */
function InternalSegmented({
  options,
  value: valueProp,
  onChange,
}: {
  options: DatePickerSegmentedOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  useLayoutEffect(() => {
    const idx = options.findIndex((o) => o.value === valueProp);
    const el = tabRefs.current[idx];
    if (!el) return;
    setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [valueProp, options]);

  return (
    <div className="dp-segmented" role="group" aria-label="Tab group">
      <span
        className="dp-segmented__pill"
        style={{ left: pillStyle.left, width: pillStyle.width }}
        aria-hidden="true"
      />
      {options.map((opt, idx) => (
        <button
          key={opt.value}
          ref={(el) => {
            tabRefs.current[idx] = el;
          }}
          type="button"
          role="radio"
          aria-checked={opt.value === valueProp}
          className={`dp-segmented__tab${opt.value === valueProp ? " dp-segmented__tab--active" : ""}`}
          onClick={() => {
            if (opt.value !== valueProp) onChange(opt.value);
          }}
          tabIndex={opt.value === valueProp ? 0 : -1}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export const DatePicker = ({
  value = null,
  onChange,
  label,
  placeholder = "MM/DD/YYYY",
  disabled = false,
  minDate,
  maxDate,
  withTime = false,
  labelConfirm = "Valider",
  segmentedOptions,
  segmentedValue,
  onSegmentChange,
}: DatePickerProps) => {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    value ? value.getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    value ? value.getMonth() : today.getMonth(),
  );
  const [pendingDate, setPendingDate] = useState<Date | null>(value);
  const [hour, setHour] = useState<number>(value ? value.getHours() : 9);
  const [minute, setMinute] = useState<number>(value ? value.getMinutes() : 0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
      setPendingDate(value);
      if (withTime) {
        setHour(value.getHours());
        setMinute(value.getMinutes());
      }
    }
  }, [value, withTime]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const isDisabledDay = (date: Date): boolean => {
    if (
      minDate &&
      date <
        new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
    )
      return true;
    if (
      maxDate &&
      date >
        new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
    )
      return true;
    return false;
  };

  const isOutsideMonth = (date: Date): boolean =>
    date.getMonth() !== viewMonth || date.getFullYear() !== viewYear;

  const handleDayClick = (date: Date) => {
    if (isDisabledDay(date)) return;
    if (withTime) {
      setPendingDate(date);
    } else {
      onChange?.(date);
      setOpen(false);
    }
  };

  const handleConfirm = () => {
    if (!pendingDate) return;
    const result = new Date(pendingDate);
    result.setHours(hour, minute, 0, 0);
    onChange?.(result);
    setOpen(false);
  };

  const cycleHour = (delta: number) => setHour((h) => (h + delta + 24) % 24);
  const cycleMinute = (delta: number) =>
    setMinute((m) => (m + delta + 60) % 60);

  // Effective selected date for display in trigger
  const displayValue = withTime ? (value ?? null) : value;

  const weeks = buildWeeks(viewYear, viewMonth);

  return (
    <div
      className={`date-picker${disabled ? " date-picker--disabled" : ""}`}
      ref={containerRef}
    >
      {label && <span className="date-picker__label">{label}</span>}
      <button
        type="button"
        className={`date-picker__trigger${open ? " date-picker__trigger--open" : ""}`}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span
          className={`date-picker__trigger-text${!displayValue ? " date-picker__trigger-text--placeholder" : ""}`}
        >
          {displayValue ? formatDate(displayValue, withTime) : placeholder}
        </span>
        <svg
          className="date-picker__icon"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="1"
            y="3"
            width="14"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M5 1v4M11 1v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="date-picker__popover"
          role="dialog"
          aria-label="Calendar"
        >
          {/* ── Segmented control (optional) ── */}
          {segmentedOptions &&
            segmentedOptions.length > 0 &&
            segmentedValue !== undefined &&
            onSegmentChange && (
              <div className="date-picker__segmented-header">
                <InternalSegmented
                  options={segmentedOptions}
                  value={segmentedValue}
                  onChange={onSegmentChange}
                />
              </div>
            )}

          {/* ── Header ── */}
          <div className="date-picker__header">
            <button
              type="button"
              className="date-picker__nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous month"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10 12L6 8l4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="date-picker__month-label">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              className="date-picker__nav-btn"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M6 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* ── Calendar grid ── */}
          <div className="date-picker__grid">
            <div className="date-picker__weekdays">
              {WEEKDAYS.map((day) => (
                <span key={day} className="date-picker__weekday">
                  {day}
                </span>
              ))}
            </div>
            <div className="date-picker__weeks">
              {weeks.map((week, wi) => (
                <div key={wi} className="date-picker__week">
                  {week.map((date, di) => {
                    if (!date)
                      return (
                        <span
                          key={di}
                          className="date-picker__day date-picker__day--empty"
                        />
                      );
                    const outside = isOutsideMonth(date);
                    const disabled_ = isDisabledDay(date);
                    const selected = withTime
                      ? pendingDate
                        ? isSameDay(date, pendingDate)
                        : false
                      : value
                        ? isSameDay(date, value)
                        : false;
                    const today_ = isToday(date);
                    const classes = [
                      "date-picker__day",
                      outside ? "date-picker__day--outside" : "",
                      disabled_ ? "date-picker__day--disabled" : "",
                      selected ? "date-picker__day--selected" : "",
                      today_ && !selected ? "date-picker__day--today" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        key={di}
                        type="button"
                        className={classes}
                        onClick={() => handleDayClick(date)}
                        disabled={disabled_}
                        tabIndex={outside ? -1 : 0}
                        aria-pressed={selected}
                        aria-label={formatDate(date)}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ── Time picker (only when withTime) ── */}
          {withTime && (
            <>
              <div className="date-picker__time-section">
                <div className="date-picker__time-col">
                  <button
                    type="button"
                    className="date-picker__time-arrow"
                    onClick={() => cycleHour(1)}
                    aria-label="Increase hour"
                  >
                    ▲
                  </button>
                  <div className="date-picker__time-box">
                    {String(hour).padStart(2, "0")}
                  </div>
                  <button
                    type="button"
                    className="date-picker__time-arrow"
                    onClick={() => cycleHour(-1)}
                    aria-label="Decrease hour"
                  >
                    ▼
                  </button>
                </div>
                <span className="date-picker__time-sep">:</span>
                <div className="date-picker__time-col">
                  <button
                    type="button"
                    className="date-picker__time-arrow"
                    onClick={() => cycleMinute(15)}
                    aria-label="Increase minute"
                  >
                    ▲
                  </button>
                  <div className="date-picker__time-box">
                    {String(minute).padStart(2, "0")}
                  </div>
                  <button
                    type="button"
                    className="date-picker__time-arrow"
                    onClick={() => cycleMinute(-15)}
                    aria-label="Decrease minute"
                  >
                    ▼
                  </button>
                </div>
              </div>

              <div className="date-picker__footer">
                <SecondaryButton
                  label={labelConfirm}
                  state={pendingDate ? "enabled" : "disabled"}
                  disabled={!pendingDate}
                  onClick={handleConfirm}
                  className="date-picker__confirm-btn"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
