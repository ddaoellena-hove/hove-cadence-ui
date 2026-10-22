import { TimeFields } from "./TimeFields";
import { SegmentedControl } from "./SegmentedControl";
import { useState, useRef, useEffect, useId, type KeyboardEvent } from "react";
import { PrimaryButton } from "./PrimaryButton";
import { ButtonTriggerContent } from "./ButtonTrigger";
import { buttonTriggerClass, type TriggerVariant } from "./button-trigger-utils";
import { Icons } from "./Icons";
import { CalendarMonth } from "./CalendarMonth";
import { dayKey, formatDate, getKeyboardTarget, isOutsideBounds, isSameDay } from "./date-utils";
import { usePopoverFit } from "./use-popover-fit";
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
   * When provided, renders a SegmentedControl inside the popover header.
   * The parent controls which tab is active via `segmentedValue` + `onSegmentChange`.
   */
  segmentedOptions?: DatePickerSegmentedOption[];
  /** Currently active segment value (controlled). */
  segmentedValue?: string;
  /** Called when the user switches segment. */
  onSegmentChange?: (value: string) => void;
  /**
   * Apparence du déclencheur : `"field"` (champ de formulaire, défaut) ou
   * `"button"` (PrimaryButton outline sm, pour l'en-tête d'un dashboard).
   */
  variant?: TriggerVariant;
  /** Nom accessible sans `label` visible (variante bouton) : « Date ». */
  "aria-label"?: string;
}

export const DatePicker = ({
  value = null,
  onChange,
  label,
  placeholder,
  disabled = false,
  minDate,
  maxDate,
  withTime = false,
  labelConfirm = "Valider",
  segmentedOptions,
  segmentedValue,
  onSegmentChange,
  variant = "field",
  "aria-label": ariaLabel,
}: DatePickerProps) => {
  const today = new Date();
  const resolvedPlaceholder =
    placeholder ?? (withTime ? "JJ/MM/AAAA HH:mm" : "JJ/MM/AAAA");
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Le popover reste dans la zone visible (ex. déclencheur au bord droit d'un en-tête)
  const popoverRef = useRef<HTMLDivElement>(null);
  usePopoverFit(popoverRef, open);
  const triggerId = useId();
  // Jour qui porte le focus clavier dans la grille
  const [focusedDate, setFocusedDate] = useState<Date>(value ?? today);
  // Après une navigation clavier, le focus suit le jour ciblé
  const keyboardNavRef = useRef(false);

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

  // Nouvelle valeur reçue : on recale le mois affiché, la date en attente et l'heure
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (value) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
      setPendingDate(value);
      setFocusedDate(value);
      if (withTime) {
        setHour(value.getHours());
        setMinute(value.getMinutes());
      }
    }
  }

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

  const isDisabledDay = (date: Date): boolean => isOutsideBounds(date, minDate, maxDate);

  // Le jour focalisable reste dans le mois affiché
  const focusInView =
    focusedDate.getMonth() === viewMonth && focusedDate.getFullYear() === viewYear
      ? focusedDate
      : new Date(viewYear, viewMonth, 1);

  useEffect(() => {
    if (!keyboardNavRef.current) return;
    keyboardNavRef.current = false;
    containerRef.current?.querySelector<HTMLElement>(`[data-day="${dayKey(focusInView)}"]`)?.focus();
  });

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleDayKeyDown = (e: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const target = getKeyboardTarget(date, e.key);
    if (!target) return;
    e.preventDefault();
    keyboardNavRef.current = true;
    setFocusedDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
  };

  const handleDayClick = (date: Date) => {
    if (isDisabledDay(date)) return;
    setFocusedDate(date);
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
  const isButton = variant === "button";

  return (
    <div
      className={`date-picker${disabled ? " date-picker--disabled" : ""}`}
      ref={containerRef}
      onKeyDown={(e) => {
        // Échap : ferme sans valider et rend le focus au déclencheur
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          close();
        }
      }}
    >
      {label && (
        <label className="date-picker__label" htmlFor={triggerId}>
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={
          isButton
            ? buttonTriggerClass(true, open)
            : `date-picker__trigger${open ? " date-picker__trigger--open" : ""}`
        }
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={!label && ariaLabel ? `${ariaLabel} : ${displayValue ? formatDate(displayValue, withTime) : "aucune date"}` : undefined}
      >
        {isButton ? (
          <ButtonTriggerContent
            start={<Icons icon="calendar" size={12} />}
            text={displayValue ? formatDate(displayValue, withTime) : resolvedPlaceholder}
            isPlaceholder={!displayValue}
            open={open}
          />
        ) : (
          <>
            <span
              className={`date-picker__trigger-text${!displayValue ? " date-picker__trigger-text--placeholder" : ""}`}
            >
              {displayValue ? formatDate(displayValue, withTime) : resolvedPlaceholder}
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
          </>
        )}
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="date-picker__popover"
          role="dialog"
          aria-label="Calendrier"
        >
          {/* ── Segmented control (optional) ── */}
          {segmentedOptions &&
            segmentedOptions.length > 0 &&
            segmentedValue !== undefined &&
            onSegmentChange && (
              <div className="date-picker__segmented-header">
                <SegmentedControl aria-label="Période du calendrier"
                  options={segmentedOptions}
                  value={segmentedValue}
                  onChange={onSegmentChange}
                />
              </div>
            )}

          {/* ── Mois (calendrier partagé) ── */}
          <CalendarMonth
            year={viewYear}
            month={viewMonth}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            today={today}
            focusedDate={focusInView}
            onSelect={handleDayClick}
            onKeyDown={handleDayKeyDown}
            getDayState={(date) => ({
              disabled: isDisabledDay(date),
              selected: withTime
                ? pendingDate
                  ? isSameDay(date, pendingDate)
                  : false
                : value
                  ? isSameDay(date, value)
                  : false,
            })}
          />

          {/* ── Time picker (only when withTime) ── */}
          {withTime && (
            <>
              <div className="date-picker__time-section">
                <TimeFields hour={String(hour).padStart(2, "0")} minute={String(minute).padStart(2, "0")}
                  onStep={(unit, direction) => unit === "hour" ? cycleHour(direction) : cycleMinute(direction * 15)} />
              </div>

              <div className="date-picker__footer">
                {/* Seule action du popover : elle valide la saisie */}
                <PrimaryButton
                  size="sm"
                  fullWidth
                  label={labelConfirm}
                  disabled={!pendingDate}
                  onClick={handleConfirm}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
