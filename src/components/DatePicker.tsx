import { TimeFields } from "./TimeFields";
import { DateFields } from "./DateFields";
import { GhostButton } from "./GhostButton";
import { SegmentedControl } from "./SegmentedControl";
import { useState, useRef, useEffect, useId, type KeyboardEvent } from "react";
import { PrimaryButton } from "./PrimaryButton";
import { ButtonTriggerContent } from "./ButtonTrigger";
import { buttonTriggerClass, type TriggerVariant } from "./button-trigger-utils";
import { Icons } from "./Icons";
import { CalendarMonth } from "./CalendarMonth";
import { dateToParts, dayKey, formatDate, getKeyboardTarget, isOutsideBounds, isSameDay, parseDateText, partsToDate } from "./date-utils";
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

/**
 * Variante `field` (défaut) : la date se saisit au clavier dans des cases
 * JJ / MM / AAAA (+ HH:mm) séparées de « / » fixes, comme TimePicker. Seule
 * l'icône calendrier à droite ouvre le panneau. Quitter le champ ou Entrée
 * valide la saisie ; une date invalide ou hors bornes affiche un message.
 */
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
  // Déclencheur du panneau : bouton (variante bouton) ou icône calendrier (champ)
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
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

  // Saisie en cours dans les cases du champ, et son éventuelle erreur
  const [parts, setParts] = useState(() => dateToParts(value, withTime));
  const [localError, setLocalError] = useState("");

  // Nouvelle valeur reçue : on recale les cases, le mois affiché, la date en attente et l'heure
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setParts(dateToParts(value, withTime));
    setLocalError("");
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

  const format = withTime ? "JJ/MM/AAAA HH:mm" : "JJ/MM/AAAA";
  const boundsMessage =
    minDate && maxDate
      ? `Choisissez une date entre le ${formatDate(minDate)} et le ${formatDate(maxDate)}.`
      : minDate
        ? `Choisissez une date à partir du ${formatDate(minDate)}.`
        : `Choisissez une date jusqu'au ${maxDate ? formatDate(maxDate) : ""}.`;

  // Valide la saisie des cases : date réelle et dans les bornes
  const commit = () => {
    if (disabled) return;
    if (parts.every((part) => part === "")) {
      // Pas d'effacement (onChange reçoit toujours une Date) : on rétablit la valeur
      setParts(dateToParts(value, withTime));
      setLocalError("");
      return;
    }
    const typed = partsToDate(parts, withTime);
    if (!typed) { setLocalError(`Saisissez une date valide au format ${format}.`); return; }
    if (isDisabledDay(typed)) { setLocalError(boundsMessage); return; }
    setLocalError("");
    if (!value || typed.getTime() !== value.getTime()) onChange?.(typed);
    else setParts(dateToParts(typed, withTime));
  };

  const editPart = (index: number, next: string) => {
    setParts((current) => current.map((part, i) => (i === index ? next : part)));
    setLocalError("");
  };

  const pasteDate = (text: string) => {
    const pasted = parseDateText(text, withTime);
    if (!pasted) return false;
    setParts(pasted);
    setLocalError("");
    return true;
  };

  const openPanel = () => {
    // Une date déjà saisie positionne le calendrier
    const typed = partsToDate(parts, withTime);
    if (typed) {
      setViewYear(typed.getFullYear());
      setViewMonth(typed.getMonth());
      setFocusedDate(typed);
      setPendingDate(typed);
    }
    keyboardNavRef.current = true;
    setOpen(true);
  };

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
    setLocalError("");
    if (withTime) {
      setPendingDate(date);
    } else {
      setParts(dateToParts(date));
      onChange?.(date);
      close();
    }
  };

  const handleConfirm = () => {
    if (!pendingDate) return;
    const result = new Date(pendingDate);
    result.setHours(hour, minute, 0, 0);
    setParts(dateToParts(result, true));
    setLocalError("");
    onChange?.(result);
    close();
  };

  const cycleHour = (delta: number) => setHour((h) => (h + delta + 24) % 24);
  const cycleMinute = (delta: number) =>
    setMinute((m) => (m + delta + 60) % 60);

  // Effective selected date for display in trigger
  const displayValue = withTime ? (value ?? null) : value;
  const isButton = variant === "button";
  const name = label || ariaLabel || "Date";
  const messageId = `${triggerId}-message`;

  // ARIA que GhostButton ne transmet pas : posé sur l'icône calendrier (champ)
  useEffect(() => {
    if (isButton) return;
    triggerRef.current?.setAttribute("aria-haspopup", "dialog");
    triggerRef.current?.setAttribute("aria-expanded", String(open));
  }, [isButton, open]);

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
      {isButton ? (
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          className={buttonTriggerClass(true, open)}
          onClick={() => !disabled && (open ? setOpen(false) : openPanel())}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={!label && ariaLabel ? `${ariaLabel} : ${displayValue ? formatDate(displayValue, withTime) : "aucune date"}` : undefined}
        >
          <ButtonTriggerContent
            start={<Icons icon="calendar" size={12} />}
            text={displayValue ? formatDate(displayValue, withTime) : resolvedPlaceholder}
            isPlaceholder={!displayValue}
            open={open}
          />
        </button>
      ) : (
        // Champ éditable (allure TextInput). Un clic sur la zone vide cible la
        // case du jour ; quitter le champ valide la saisie.
        <div
          className={`date-picker__field${open ? " date-picker__field--open" : ""}${withTime ? " date-picker__field--time" : ""}${localError ? " date-picker__field--error" : ""}`}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
              firstFieldRef.current?.focus();
            }
          }}
          onBlur={(e) => {
            if (!open && !containerRef.current?.contains(e.relatedTarget as Node)) commit();
          }}
        >
          <DateFields
            parts={parts}
            withTime={withTime}
            id={triggerId}
            firstRef={firstFieldRef}
            label={name}
            disabled={disabled}
            invalid={Boolean(localError)}
            describedBy={localError ? messageId : undefined}
            onEdit={editPart}
            onPaste={pasteDate}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape" && !open) {
                // Échap annule la saisie en cours
                setParts(dateToParts(value, withTime));
                setLocalError("");
              }
            }}
          />
          <GhostButton
            ref={triggerRef}
            className="date-picker__calendar"
            size="sm"
            icon="calendar"
            aria-label={`Ouvrir le calendrier — ${name.toLowerCase()}`}
            disabled={disabled}
            onClick={() => (open ? close() : openPanel())}
          />
        </div>
      )}
      {!isButton && localError && (
        <p id={messageId} className="date-picker__message" role="alert">
          {localError}
        </p>
      )}

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
