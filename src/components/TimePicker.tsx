import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type KeyboardEvent } from "react";
import { TimeFields } from "./TimeFields";
import { PrimaryButton } from "./PrimaryButton";
import { GhostButton } from "./GhostButton";
import { Icons } from "./Icons";
import { ButtonTriggerContent } from "./ButtonTrigger";
import { buttonTriggerClass, type TriggerVariant } from "./button-trigger-utils";
import { usePopoverFit, type PopoverPlacement } from "./use-popover-fit";
import { formatTime, parseTime, timeBounds } from "./time-picker-utils";
import "./time-picker.css";

export interface TimePickerProps {
  /** Côté d'ouverture : "auto" (dessous, retourné au-dessus si la place manque), "top" ou "bottom". Défaut "auto". */
  placement?: PopoverPlacement;
  label?: string;
  "aria-label"?: string;
  value: string;
  onChange: (value: string) => void;
  allowOvernight?: boolean;
  min?: string;
  max?: string;
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
  id?: string;
  className?: string;
  /** Champ éditable (défaut) ou bouton compact ouvrant le même panneau. */
  variant?: TriggerVariant;
}
const split = (value: string) => (value ? value.split(":") : ["", ""]);

/**
 * Heure de service, sans conversion Date. La ref cible la case des heures.
 *
 * Variante `field` : le champ se saisit directement au clavier (deux cases
 * HH : mm séparées d'un « : » fixe, à l'allure d'un TextInput). Seule l'horloge
 * à droite (GhostButton, sans infobulle) ouvre le panneau de réglage (flèches).
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({ label, "aria-label": ariaLabel, value, onChange, allowOvernight = false, min, max, minuteStep = 1, disabled = false, required = false, helperText, error, id, className, variant = "field", placement = "auto" }, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const clockRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => inputRef.current!);
    const uid = useId();
    const inputId = id ?? `time-picker-${uid}`;
    const messageId = `${inputId}-message`;
    const name = label || ariaLabel || "Heure";
    const [parts, setParts] = useState(() => split(value));
    const [syncedValue, setSyncedValue] = useState(value);
    const [localError, setLocalError] = useState("");
    const [open, setOpen] = useState(false);
    if (value !== syncedValue) { setSyncedValue(value); setParts(split(value)); setLocalError(""); }
    const button = variant === "button";
    const bounds = timeBounds(allowOvernight, min, max);
    const draft = parts.every((part) => part === "") ? "" : parts.join(":");
    const parsed = parseTime(draft, allowOvernight);
    const inRange = parsed !== null && parsed >= bounds.min && parsed <= bounds.max;
    const invalidMessage = `Saisissez une heure entre ${formatTime(bounds.min)} et ${formatTime(bounds.max)}.`;
    const message = error || localError || helperText;
    const invalid = Boolean(error || localError);
    usePopoverFit(popoverRef, open, placement);

    useEffect(() => {
      inputRef.current?.setCustomValidity(error || (draft !== "" && !inRange ? invalidMessage : localError));
    }, [error, draft, inRange, invalidMessage, localError]);

    // ARIA que GhostButton ne transmet pas : posé sur l'horloge (variante champ).
    useEffect(() => { clockRef.current?.setAttribute("aria-haspopup", "dialog"); }, []);
    useEffect(() => { clockRef.current?.setAttribute("aria-expanded", String(open && !disabled)); }, [open, disabled]);

    // À l'ouverture du panneau : focus la 1re flèche (variante champ) ou la case
    // des heures (variante bouton, panneau éditable).
    useEffect(() => {
      if (!open || disabled) return;
      if (button) inputRef.current?.focus();
      else popoverRef.current?.querySelector<HTMLElement>("button, input")?.focus();
    }, [open, disabled, button]);

    useEffect(() => {
      if (!open) return;
      const outside = (event: PointerEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) { setParts(split(value)); setLocalError(""); setOpen(false); }
      };
      document.addEventListener("pointerdown", outside);
      return () => document.removeEventListener("pointerdown", outside);
    }, [open, value]);

    const returnFocus = () => (button ? triggerRef : clockRef).current?.focus();
    const publish = (next: string) => { setParts(split(next)); setLocalError(""); if (next !== value) onChange(next); };
    const commit = () => {
      if (disabled) return false;
      if (draft === "" && !required) { publish(""); return true; }
      if (!inRange) { setLocalError(invalidMessage); return false; }
      publish(formatTime(parsed));
      return true;
    };
    const cancel = () => { setParts(split(value)); setLocalError(""); setOpen(false); returnFocus(); };
    const adjust = (unit: "hour" | "minute", direction: -1 | 1) => {
      const step = unit === "hour" ? 60 : minuteStep;
      const initial = parsed ?? (direction === 1 ? bounds.min - step : bounds.min);
      const next = formatTime(Math.min(bounds.max, Math.max(bounds.min, initial + direction * step)));
      setParts(split(next)); setLocalError("");
    };
    const editPart = (unit: "hour" | "minute", next: string) => { setParts((current) => (unit === "hour" ? [next, current[1]] : [current[0], next])); setLocalError(""); };
    const pasteTime = (next: string) => { setParts(split(next)); setLocalError(""); };

    // Clavier des cases en ligne (champ) : flèches = pas, Entrée = validation en
    // place, Échap = annulation de la saisie.
    const inlineKeyDown = (event: KeyboardEvent<HTMLInputElement>, unit: "hour" | "minute") => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); adjust(unit, event.key === "ArrowUp" ? 1 : -1); }
      else if (event.key === "Enter") { event.preventDefault(); commit(); }
      else if (event.key === "Escape" && (draft !== value || localError)) { event.preventDefault(); setParts(split(value)); setLocalError(""); }
    };
    // Clavier du panneau éditable (variante bouton).
    const popoverKeyDown = (event: KeyboardEvent<HTMLInputElement>, unit: "hour" | "minute") => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); adjust(unit, event.key === "ArrowUp" ? 1 : -1); }
      else if (event.key === "Enter") { event.preventDefault(); if (commit()) { setOpen(false); returnFocus(); } }
      else if (event.key === "Escape" && (open || draft !== value || localError)) { event.preventDefault(); event.stopPropagation(); cancel(); }
    };

    const commonFields = {
      hour: parts[0], minute: parts[1], label: name, disabled, required, invalid,
      describedBy: message ? messageId : undefined, maxHour: allowOvernight ? 47 : 23,
      canDecrease: !inRange || parsed > bounds.min, canIncrease: !inRange || parsed < bounds.max,
      onStep: adjust,
    };

    // Panneau : stepper éditable (bouton) ou en lecture seule + flèches (champ).
    const panel = <>
      <TimeFields {...commonFields} layout="stepper"
        id={button ? inputId : undefined} hourRef={button ? inputRef : undefined}
        onEdit={button ? editPart : undefined} onPasteTime={button ? pasteTime : undefined}
        onInvalid={button ? (() => setOpen(true)) : undefined} onKeyDown={button ? popoverKeyDown : undefined} />
      {allowOvernight && inRange && parsed >= 1440 && <p className="time-picker__message">Jour de service suivant</p>}
      {message && <p id={messageId} className="time-picker__message" role={invalid ? "alert" : undefined}>{message}</p>}
      <div className="time-picker__footer">
        <GhostButton size="sm" label="Annuler" onClick={cancel} />
        <PrimaryButton size="sm" label="Valider" onClick={() => { if (commit()) { setOpen(false); returnFocus(); } }} />
      </div>
    </>;

    return <div ref={rootRef} className={["time-picker", `time-picker--${variant}`, invalid ? "time-picker--error" : "", disabled ? "time-picker--disabled" : "", className].filter(Boolean).join(" ")}
      onKeyDown={(event) => { if (open && event.key === "Escape") { event.preventDefault(); event.stopPropagation(); cancel(); } }}>
      {!button && <label className="time-picker__label" htmlFor={inputId}>{name}{required && <span aria-hidden="true"> *</span>}</label>}

      {button ? (
        <button ref={triggerRef} id={`${inputId}-trigger`} type="button"
          className={buttonTriggerClass(true, open)}
          disabled={disabled} aria-label={`${name} : ${value || "Choisir une heure"}`} aria-invalid={invalid || undefined}
          aria-describedby={!open && message ? `${inputId}-hint` : undefined}
          aria-haspopup="dialog" aria-expanded={open && !disabled} aria-controls={open ? `${inputId}-popover` : undefined}
          onClick={() => { if (open) cancel(); else { setParts(split(value)); setLocalError(""); setOpen(true); } }}>
          <ButtonTriggerContent start={<Icons icon="clock" size={12} />} text={value || "Choisir une heure"} isPlaceholder={!value} open={open && !disabled} />
        </button>
      ) : (
        // Champ éditable (allure TextInput). Un clic sur la zone vide cible la
        // case des heures ; quitter le champ valide la saisie.
        <div className={`time-picker__field${open ? " time-picker__field--open" : ""}`}
          onPointerDown={(event) => { if (event.target === event.currentTarget) { event.preventDefault(); inputRef.current?.focus(); } }}
          onBlur={(event) => { if (!open && !rootRef.current?.contains(event.relatedTarget as Node)) commit(); }}>
          <TimeFields {...commonFields} layout="inline" id={inputId} hourRef={inputRef}
            onEdit={editPart} onPasteTime={pasteTime} onKeyDown={inlineKeyDown} />
          <GhostButton ref={clockRef} className="time-picker__clock" size="sm" icon="clock"
            aria-label={`Ouvrir le sélecteur — ${name.toLowerCase()}`} disabled={disabled}
            onClick={() => { if (open) cancel(); else setOpen(true); } } />
        </div>
      )}

      {!open && message && <p id={`${inputId}-hint`} className="time-picker__message" role={invalid ? "alert" : undefined}>{message}</p>}
      <div ref={popoverRef} hidden={!open || disabled} className="time-picker__popover" id={`${inputId}-popover`} role="dialog" aria-label={`Régler ${name.toLowerCase()}`}
        onBlur={(event) => { if (event.relatedTarget && !rootRef.current?.contains(event.relatedTarget as Node)) { setParts(split(value)); setLocalError(""); setOpen(false); } }}>
        {panel}
      </div>
    </div>;
  },
);
TimePicker.displayName = "TimePicker";
