import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { TimeFields } from "./TimeFields";
import { PrimaryButton } from "./PrimaryButton";
import { GhostButton } from "./GhostButton";
import { Icons } from "./Icons";
import { ButtonTriggerContent } from "./ButtonTrigger";
import { buttonTriggerClass, type TriggerVariant } from "./button-trigger-utils";
import { usePopoverFit } from "./use-popover-fit";
import { formatTime, parseTime, timeBounds } from "./time-picker-utils";
import "./time-picker.css";

export interface TimePickerProps {
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
  /** Champ compact (défaut) ou bouton ouvrant le même éditeur. */
  variant?: TriggerVariant;
}
const split = (value: string) => value ? value.split(":") : ["", ""];

/** Heure de service, sans conversion Date. La ref cible la case des heures. */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({ label, "aria-label": ariaLabel, value, onChange, allowOvernight = false, min, max, minuteStep = 1, disabled = false, required = false, helperText, error, id, className, variant = "field" }, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
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
    usePopoverFit(popoverRef, open);
    useEffect(() => {
      inputRef.current?.setCustomValidity(error || (draft !== "" && !inRange ? invalidMessage : localError));
    }, [error, draft, inRange, invalidMessage, localError]);
    useEffect(() => {
      if (open && !disabled) inputRef.current?.focus();
    }, [open, disabled]);
    useEffect(() => {
      if (!open) return;
      const outside = (event: PointerEvent) => {
        if (!rootRef.current?.contains(event.target as Node)) { setParts(split(value)); setLocalError(""); setOpen(false); }
      };
      document.addEventListener("pointerdown", outside);
      return () => document.removeEventListener("pointerdown", outside);
    }, [open, value]);
    const publish = (next: string) => { setParts(split(next)); setLocalError(""); if (next !== value) onChange(next); };
    const commit = () => {
      if (disabled) return false;
      if (draft === "" && !required) { publish(""); return true; }
      if (!inRange) { setLocalError(invalidMessage); return false; }
      publish(formatTime(parsed));
      return true;
    };
    const cancel = () => { setParts(split(value)); setLocalError(""); setOpen(false); triggerRef.current?.focus(); };
    const adjust = (unit: "hour" | "minute", direction: -1 | 1) => {
      const step = unit === "hour" ? 60 : minuteStep;
      const initial = parsed ?? (direction === 1 ? bounds.min - step : bounds.min);
      const next = formatTime(Math.min(bounds.max, Math.max(bounds.min, initial + direction * step)));
      setParts(split(next)); setLocalError("");
    };
    const editor = <>
      <TimeFields hour={parts[0]} minute={parts[1]} hourRef={inputRef} id={inputId} label={name} disabled={disabled} required={required}
        invalid={invalid} describedBy={message ? messageId : undefined} maxHour={allowOvernight ? 47 : 23}
        canDecrease={!inRange || parsed > bounds.min} canIncrease={!inRange || parsed < bounds.max}
        onPasteTime={(next) => { setParts(split(next)); setLocalError(""); }}
        onInvalid={() => setOpen(true)}
        onEdit={(unit, next) => { setParts((current) => unit === "hour" ? [next, current[1]] : [current[0], next]); setLocalError(""); }}
        onStep={adjust} onKeyDown={(event, unit) => {
          if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); adjust(unit, event.key === "ArrowUp" ? 1 : -1); }
          else if (event.key === "Enter") { event.preventDefault(); if (commit()) { setOpen(false); triggerRef.current?.focus(); } }
          else if (event.key === "Escape" && (open || draft !== value || localError)) { event.preventDefault(); event.stopPropagation(); cancel(); }
        }} />
      {allowOvernight && inRange && parsed >= 1440 && <p className="time-picker__message">Jour de service suivant</p>}
      {message && <p id={messageId} className="time-picker__message" role={invalid ? "alert" : undefined}>{message}</p>}
      {<div className="time-picker__footer">
        <GhostButton size="sm" label="Annuler" onClick={cancel} />
        <PrimaryButton size="sm" label="Valider" onClick={() => { if (commit()) { setOpen(false); triggerRef.current?.focus(); } }} />
      </div>}
    </>;
    return <div ref={rootRef} className={["time-picker", `time-picker--${variant}`, invalid ? "time-picker--error" : "", className].filter(Boolean).join(" ")}
      onKeyDown={(event) => { if (open && event.key === "Escape") { event.preventDefault(); event.stopPropagation(); cancel(); } }}>
      {!button && <label className="time-picker__label" htmlFor={`${inputId}-trigger`}>{name}{required && <span aria-hidden="true"> *</span>}</label>}
      <button ref={triggerRef} id={`${inputId}-trigger`} type="button"
        className={button ? buttonTriggerClass(true, open) : `time-picker__trigger${open ? " time-picker__trigger--open" : ""}`}
        disabled={disabled} aria-label={`${name} : ${value || "Choisir une heure"}`} aria-invalid={invalid || undefined}
        aria-describedby={!open && message ? `${inputId}-hint` : undefined}
        aria-haspopup="dialog" aria-expanded={open && !disabled} aria-controls={open ? `${inputId}-popover` : undefined}
        onClick={() => { if (open) cancel(); else { setParts(split(value)); setLocalError(""); setOpen(true); } }}>
        {button ? <ButtonTriggerContent start={<Icons icon="clock" size={12} />} text={value || "Choisir une heure"} isPlaceholder={!value} open={open && !disabled} /> : <>
          <span className={!value ? "time-picker__placeholder" : undefined}>{value || "HH:mm"}</span>
          <Icons icon="clock" size={16} />
        </>}
      </button>
      {!open && message && <p id={`${inputId}-hint`} className="time-picker__message" role={invalid ? "alert" : undefined}>{message}</p>}
      <div ref={popoverRef} hidden={!open || disabled} className="time-picker__popover" id={`${inputId}-popover`} role="dialog" aria-label={`Régler ${name.toLowerCase()}`}
        onBlur={(event) => { if (event.relatedTarget && !rootRef.current?.contains(event.relatedTarget as Node)) { setParts(split(value)); setLocalError(""); setOpen(false); } }}>
        {editor}
      </div>
    </div>;
  },
);
TimePicker.displayName = "TimePicker";
