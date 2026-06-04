/**
 * SegmentedControl component.
 *
 * A pill-shaped tab selector that lets users switch between a set of mutually
 * exclusive options. Supports 2 or 3 segments, enabled/disabled state, and
 * full keyboard / ARIA accessibility.
 */
import React, { useState, useRef, useLayoutEffect } from "react";
import "./segmented-control.css";

export interface SegmentedControlOption {
  /** Unique value identifying the segment. */
  value: string;
  /** Label text rendered inside the segment. */
  label: string;
}

export interface SegmentedControlProps {
  /** The list of segments to render (2 or 3 recommended). */
  options: SegmentedControlOption[];

  /** Currently selected value (controlled). */
  value?: string;

  /** Default selected value (uncontrolled). */
  defaultValue?: string;

  /** Called whenever the active segment changes. */
  onChange?: (value: string) => void;

  /** Disables all interaction when true. */
  disabled?: boolean;

  /** Optional extra class name on the root element. */
  className?: string;

  /** Accessible label for the group (e.g. "View mode"). */
  "aria-label"?: string;
}

/**
 * SegmentedControl renders a bordered pill container with sliding active-segment
 * highlight, matching the project&#39;s design tokens.
 */
export const SegmentedControl = React.forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(
  (
    {
      options,
      value: valueProp,
      defaultValue,
      onChange,
      disabled = false,
      className,
      "aria-label": ariaLabel = "Segmented control",
    },
    ref
  ) => {
    const isControlled = valueProp !== undefined;

    const [internalValue, setInternalValue] = useState<string>(
      defaultValue ?? options[0]?.value ?? ""
    );

    const activeValue = isControlled ? valueProp : internalValue;

    // Pill slide animation
    const segmentRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

    useLayoutEffect(() => {
      const activeIdx = options.findIndex((o) => o.value === activeValue);
      const el = segmentRefs.current[activeIdx];
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
      "segmented-control",
      disabled ? "segmented-control--disabled" : "",
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
          className="segmented-control__pill"
          style={{ left: pillStyle.left, width: pillStyle.width }}
          aria-hidden="true"
        />

        {options.map((option, idx) => {
          const isActive = option.value === activeValue;
          const btnClass = [
            "segmented-control__segment",
            isActive ? "segmented-control__segment--active" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={option.value}
              ref={(el) => { segmentRefs.current[idx] = el; }}
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

SegmentedControl.displayName = "SegmentedControl";
