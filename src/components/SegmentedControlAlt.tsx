/**
 * SegmentedControlAlt component.
 *
 * A pill-shaped tab-bar tray that wraps a set of named options in a soft
 * coloured container. It reuses the existing SegmentedControl interaction
 * model while offering a distinct visual style — a lighter, elevated pill
 * background with individual segment pills inside.
 *
 * Supports controlled and uncontrolled usage, disabled state, and up to
 * any number of tabs (2-4 recommended by design).
 */
import React, { useState, useRef, useLayoutEffect } from "react";
import "./segmented-control-alt.css";

export interface SegmentedControlAltOption {
  /** Unique value identifying the tab. */
  value: string;
  /** Label rendered inside the tab. */
  label: string;
}

export interface SegmentedControlAltProps {
  /** The list of tab options to render. */
  options: SegmentedControlAltOption[];

  /** Currently selected value (controlled). */
  value?: string;

  /** Default selected value (uncontrolled). */
  defaultValue?: string;

  /** Called whenever the active tab changes. */
  onChange?: (value: string) => void;

  /** Disables all interaction when true. */
  disabled?: boolean;

  /** Optional extra class name on the root element. */
  className?: string;

  /** Accessible label for the group (e.g. "View mode"). */
  "aria-label"?: string;
}

/**
 * SegmentedControlAlt renders a soft-pill tab bar with an active segment that
 * lifts with a white card shadow, inspired by the iOS-style segmented picker.
 */
export const SegmentedControlAlt = React.forwardRef<HTMLDivElement, SegmentedControlAltProps>(
  (
    {
      options,
      value: valueProp,
      defaultValue,
      onChange,
      disabled = false,
      className,
      "aria-label": ariaLabel = "Tab group",
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
      if (!el) return;
      setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }, [activeValue, options]);

    const handleSelect = (val: string) => {
      if (disabled || val === activeValue) return;
      if (!isControlled) setInternalValue(val);
      onChange?.(val);
    };

    const handleKeyDown = (
      e: React.KeyboardEvent<HTMLButtonElement>,
      idx: number
    ) => {
      if (disabled) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = options[(idx + 1) % options.length];
        handleSelect(next.value);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = options[(idx - 1 + options.length) % options.length];
        handleSelect(prev.value);
      }
    };

    const rootClass = [
      "alternative",
      disabled ? "alternative--disabled" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        className={rootClass}
        role="group"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
      >
        {/* Sliding pill */}
        <span
          className="alternative__pill"
          style={{ left: pillStyle.left, width: pillStyle.width }}
          aria-hidden="true"
        />

        {options.map((option, idx) => {
          const isActive = option.value === activeValue;
          const btnClass = [
            "alternative__tab",
            isActive ? "alternative__tab--active" : "",
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
              disabled={disabled}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              tabIndex={isActive ? 0 : -1}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
);

SegmentedControlAlt.displayName = "SegmentedControlAlt";
