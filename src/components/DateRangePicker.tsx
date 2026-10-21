import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CalendarMonth, type CalendarDayState } from "./CalendarMonth";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import { compareDays, dayKey, getKeyboardTarget, isOutsideBounds, isSameDay, formatDate } from "./date-utils";
import {
  DEFAULT_PRESETS,
  exceedsMaxDays,
  findMatchingPreset,
  formatRange,
  normalizeRange,
  type DateRangePreset,
} from "./date-range-utils";
import "./date-range-picker.css";

export type { DateRangePreset };

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  /** Période sélectionnée (contrôlée). */
  value?: DateRange;
  /** Appelé sur « Appliquer » ou au clic sur un préréglage, avec une période normalisée. */
  onChange?: (range: { start: Date; end: Date }) => void;
  /** Label au-dessus du déclencheur (même style que TextInput). */
  label?: string;
  /** Défaut « JJ/MM/AAAA – JJ/MM/AAAA ». */
  placeholder?: string;
  disabled?: boolean;
  /** Bornes : jours hors bornes désactivés. */
  minDate?: Date;
  maxDate?: Date;
  /** Durée maximale de la période, en jours (bornes incluses). */
  maxDays?: number;
  /** Préréglages. Défaut : Aujourd'hui, Hier, 7 et 30 derniers jours, Ce mois-ci, Mois dernier. `[]` pour les masquer. */
  presets?: DateRangePreset[];
  /** Date de référence des préréglages et du jour courant. Défaut : maintenant. */
  referenceDate?: Date;
  /** Nombre de mois affichés côte à côte. Défaut 2. */
  months?: 1 | 2;
  /** Nom accessible sans `label` visible (ex. dans une FilterBar) : « Période ». */
  "aria-label"?: string;
}

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1 7h14" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Premier jour du mois qui suit (ou précède) le mois de `date`. */
const shiftMonth = (year: number, month: number, delta: number) => {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
};

/**
 * Sélection d'une période (début → fin) avec préréglages. Sélection en deux
 * clics, validée par « Appliquer » ; un préréglage s'applique directement.
 * Dates renvoyées en jours entiers : 00:00 → 23:59:59.999.
 */
export const DateRangePicker = ({
  value,
  onChange,
  label,
  placeholder = "JJ/MM/AAAA – JJ/MM/AAAA",
  disabled = false,
  minDate,
  maxDate,
  maxDays,
  presets = DEFAULT_PRESETS,
  referenceDate,
  months = 2,
  "aria-label": ariaLabel,
}: DateRangePickerProps) => {
  const reference = referenceDate ?? new Date();
  const triggerId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const keyboardNavRef = useRef(false);

  const [open, setOpen] = useState(false);
  // Sélection en cours (non appliquée)
  const [draftStart, setDraftStart] = useState<Date | null>(null);
  const [draftEnd, setDraftEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [view, setView] = useState({ year: reference.getFullYear(), month: reference.getMonth() });
  const [focusedDate, setFocusedDate] = useState<Date>(reference);

  const secondView = shiftMonth(view.year, view.month, 1);
  const isInView = (date: Date) =>
    (date.getFullYear() === view.year && date.getMonth() === view.month) ||
    (months === 2 && date.getFullYear() === secondView.year && date.getMonth() === secondView.month);

  // ── Ouverture / fermeture ──
  const openPopover = () => {
    const start = value?.start ?? null;
    const end = value?.end ?? null;
    setDraftStart(start);
    setDraftEnd(end);
    setHoverDate(null);
    // Mois de gauche : celui du début ; à deux mois, la fin reste visible si possible
    const anchor = start ?? reference;
    const left = months === 2 && end && compareDays(end, anchor) > 0 && end.getMonth() !== anchor.getMonth()
      ? shiftMonth(end.getFullYear(), end.getMonth(), -1)
      : { year: anchor.getFullYear(), month: anchor.getMonth() };
    setView(left);
    setFocusedDate(start ?? reference);
    setOpen(true);
  };

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Après une navigation clavier, le focus suit le jour ciblé
  useEffect(() => {
    if (!keyboardNavRef.current) return;
    keyboardNavRef.current = false;
    containerRef.current?.querySelector<HTMLElement>(`[data-day="${dayKey(focusedDate)}"]`)?.focus();
  });

  // ── Sélection ──
  const choosingEnd = draftStart !== null && draftEnd === null;

  const isDisabledDay = (date: Date) =>
    isOutsideBounds(date, minDate, maxDate) ||
    (draftStart !== null && draftEnd === null && exceedsMaxDays(draftStart, date, maxDays));

  const handleSelect = (date: Date) => {
    if (isDisabledDay(date)) return;
    setFocusedDate(date);
    if (draftStart === null || draftEnd !== null) {
      setDraftStart(date);
      setDraftEnd(null);
      return;
    }
    // 2e clic : fin de période (inversée si elle précède le début)
    if (compareDays(date, draftStart) < 0) {
      setDraftEnd(draftStart);
      setDraftStart(date);
    } else {
      setDraftEnd(date);
    }
    setHoverDate(null);
  };

  const getDayState = (date: Date): CalendarDayState => {
    // Pendant le choix de la fin, le survol prévisualise la période
    const previewEnd = choosingEnd ? hoverDate : draftEnd;
    if (!draftStart) return { disabled: isDisabledDay(date) };
    const end = previewEnd ?? draftStart;
    const [first, last] = compareDays(draftStart, end) <= 0 ? [draftStart, end] : [end, draftStart];
    return {
      disabled: isDisabledDay(date),
      rangeStart: isSameDay(date, first),
      rangeEnd: isSameDay(date, last) && (draftEnd !== null || hoverDate !== null),
      inRange: compareDays(date, first) > 0 && compareDays(date, last) < 0,
    };
  };

  const apply = () => {
    if (!draftStart || !draftEnd) return;
    onChange?.(normalizeRange(draftStart, draftEnd));
    close();
  };

  const applyPreset = (preset: DateRangePreset) => {
    const range = preset.getRange(reference);
    onChange?.(normalizeRange(range.start, range.end));
    close();
  };

  // ── Clavier ──
  const handleDayKeyDown = (e: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const target = getKeyboardTarget(date, e.key);
    if (!target) return;
    e.preventDefault();
    keyboardNavRef.current = true;
    setFocusedDate(target);
    if (choosingEnd) setHoverDate(target);
    if (!isInView(target)) {
      // Le jour ciblé sort des mois affichés : on décale d'un mois dans le bon sens
      const delta = compareDays(target, new Date(view.year, view.month, 1)) < 0 ? -1 : 1;
      setView((v) => shiftMonth(v.year, v.month, delta));
    }
  };

  // ── Rendu ──
  const matchingPreset = findMatchingPreset(value, presets, reference);
  const triggerText = matchingPreset
    ? matchingPreset.label
    : value?.start && value.end
      ? formatRange(value.start, value.end)
      : null;

  const activePresetId = draftStart && draftEnd
    ? findMatchingPreset({ start: draftStart, end: draftEnd }, presets, reference)?.id
    : undefined;

  const focusFor = (year: number, month: number) =>
    focusedDate.getFullYear() === year && focusedDate.getMonth() === month ? focusedDate : null;
  // Sans jour focalisable dans les mois affichés, le 1er du mois de gauche prend le relais
  const leftFocus = focusFor(view.year, view.month) ??
    (months === 2 && focusFor(secondView.year, secondView.month) ? null : new Date(view.year, view.month, 1));

  const status = draftStart
    ? draftEnd
      ? `Période : ${formatRange(draftStart, draftEnd)}`
      : `Début : ${formatDate(draftStart)} — choisissez la date de fin`
    : "Choisissez la date de début";

  const rootClass = ["date-range-picker", disabled ? "date-range-picker--disabled" : ""].filter(Boolean).join(" ");

  return (
    <div
      className={rootClass}
      ref={containerRef}
      onKeyDown={(e) => {
        // Échap : ferme sans appliquer et rend le focus au déclencheur
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          close();
        }
      }}
    >
      {label && (
        <label className="date-range-picker__label" htmlFor={triggerId}>
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={`date-range-picker__trigger${open ? " date-range-picker__trigger--open" : ""}`}
        onClick={() => (open ? close(false) : !disabled && openPopover())}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={!label && ariaLabel ? `${ariaLabel} : ${triggerText ?? "aucune période"}` : undefined}
      >
        <span
          className={`date-range-picker__trigger-text${triggerText ? "" : " date-range-picker__trigger-text--placeholder"}`}
        >
          {triggerText ?? placeholder}
        </span>
        <span className="date-range-picker__icon">
          <CalendarIcon />
        </span>
      </button>

      {open && (
        <div className="date-range-picker__popover" role="dialog" aria-label="Choisir une période">
          {presets.length > 0 && (
            <ul className="date-range-picker__presets" aria-label="Préréglages">
              {presets.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    className={`date-range-picker__preset${preset.id === activePresetId ? " date-range-picker__preset--active" : ""}`}
                    aria-current={preset.id === activePresetId || undefined}
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="date-range-picker__main">
            <div className="date-range-picker__months">
              <CalendarMonth
                year={view.year}
                month={view.month}
                onPrevMonth={() => setView((v) => shiftMonth(v.year, v.month, -1))}
                onNextMonth={months === 1 ? () => setView((v) => shiftMonth(v.year, v.month, 1)) : undefined}
                today={reference}
                focusedDate={leftFocus}
                getDayState={getDayState}
                onSelect={handleSelect}
                onKeyDown={handleDayKeyDown}
                onHoverDay={choosingEnd ? setHoverDate : undefined}
                showOutsideDays={false}
              />
              {months === 2 && (
                <CalendarMonth
                  year={secondView.year}
                  month={secondView.month}
                  onNextMonth={() => setView((v) => shiftMonth(v.year, v.month, 1))}
                  today={reference}
                  focusedDate={focusFor(secondView.year, secondView.month)}
                  getDayState={getDayState}
                  onSelect={handleSelect}
                  onKeyDown={handleDayKeyDown}
                  onHoverDay={choosingEnd ? setHoverDate : undefined}
                  showOutsideDays={false}
                />
              )}
            </div>

            <div className="date-range-picker__footer">
              <div className="date-range-picker__status">
                <span aria-live="polite">{status}</span>
                {maxDays !== undefined && <span className="date-range-picker__hint">{maxDays} jours maximum</span>}
              </div>
              <div className="date-range-picker__actions">
                <GhostButton size="sm" label="Annuler" onClick={() => close()} />
                <PrimaryButton size="sm" label="Appliquer" disabled={!draftStart || !draftEnd} onClick={apply} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
