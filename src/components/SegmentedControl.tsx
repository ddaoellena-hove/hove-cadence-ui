/** Sélecteur unique pour choix exclusifs et bascule de vue (apparence Alt conservée). */
import { forwardRef, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import "./segmented-control.css";

export interface SegmentedControlOption {
  /** Unique value identifying the tab. */
  value: string;
  /** Label rendered inside the tab. */
  label: string;
  /** Option indisponible : grisée, ni cliquable ni atteignable aux flèches. */
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** The list of tab options to render. */
  options: SegmentedControlOption[];

  /** Currently selected value (controlled). */
  value?: string;

  /** Default selected value (uncontrolled). */
  defaultValue?: string;

  /** Called whenever the active tab changes. */
  onChange?: (value: string) => void;

  /** Disables all interaction when true. */
  disabled?: boolean;

  /**
   * Gabarit : `"md"` (40px, hauteur de champ — formulaires) ou `"sm"` (29px,
   * hauteur compacte — en-tête de dashboard, barre d'outils). Défaut `"md"`.
   */
  size?: "sm" | "md";

  /** Optional extra class name on the root element. */
  className?: string;

  /** Accessible label for the group (e.g. "View mode"). */
  "aria-label"?: string;
}

/**
 * SegmentedControl renders a soft-pill tab bar with an active segment that
 * lifts with a white card shadow, inspired by the iOS-style segmented picker.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  (
    {
      options,
      value: valueProp,
      defaultValue,
      onChange,
      disabled = false,
      size = "md",
      className,
      "aria-label": ariaLabel = "Choix",
    },
    ref
  ) => {
    const isControlled = valueProp !== undefined;

    const [internalValue, setInternalValue] = useState<string>(
      defaultValue ?? options[0]?.value ?? ""
    );

    const activeValue = isControlled ? valueProp : internalValue;

    // Pill slide animation
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({
      left: 0,
      width: 0,
    });

    useLayoutEffect(() => {
      const activeIdx = options.findIndex((o) => o.value === activeValue);
      const el = tabRefs.current[activeIdx];
      if (!el) { setPillStyle({ left: 0, width: 0 }); return; }
      const measure = () => setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
      measure();
      const observer = new ResizeObserver(measure);
      tabRefs.current.forEach((tab) => { if (tab) observer.observe(tab); });
      return () => observer.disconnect();
    }, [activeValue, options]);

    const handleSelect = (val: string) => {
      if (disabled || val === activeValue) return;
      if (!isControlled) setInternalValue(val);
      onChange?.(val);
    };

    const handleKeyDown = (
      e: KeyboardEvent<HTMLButtonElement>,
      idx: number
    ) => {
      if (disabled || options.length === 0) return;
      // Les options désactivées sont sautées.
      const enabled = options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
      if (enabled.length === 0) return;
      const pos = enabled.indexOf(idx);
      let next: number;
      switch (e.key) {
        case "ArrowRight": case "ArrowDown": next = enabled[(pos + 1) % enabled.length]; break;
        case "ArrowLeft": case "ArrowUp": next = enabled[(pos - 1 + enabled.length) % enabled.length]; break;
        case "Home": next = enabled[0]; break;
        case "End": next = enabled[enabled.length - 1]; break;
        default: return;
      }
      e.preventDefault();
      tabRefs.current[next]?.focus();
      handleSelect(options[next].value);
    };

    const firstEnabled = options.findIndex((o) => !o.disabled);

    const rootClass = [
      "segmented-control",
      size === "sm" ? "segmented-control--sm" : "",
      disabled ? "segmented-control--disabled" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        className={rootClass}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
      >
        {/* Sliding pill */}
        <span
          className="segmented-control__pill"
          style={{ left: pillStyle.left, width: pillStyle.width }}
          aria-hidden="true"
        />

        {options.map((option, idx) => {
          const isActive = option.value === activeValue;
          const btnClass = [
            "segmented-control__tab",
            isActive ? "segmented-control__tab--active" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={option.value}
              ref={(el) => { tabRefs.current[idx] = el; }}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={btnClass}
              disabled={disabled || option.disabled}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              tabIndex={isActive || (idx === firstEnabled && !options.some((item) => item.value === activeValue)) ? 0 : -1}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
);

SegmentedControl.displayName = "SegmentedControl";
