/**
 * TextInput component.
 *
 * A fully-featured labeled text input supporting enabled, hover, focus, disabled,
 * error, and success states with inline helper/error messaging.
 */
import React, { useState, useId } from "react";
import "./text-input.css";

export interface TextInputProps {
  /** Visual / validation state of the field. */
  state?: "enabled" | "hover" | "focus" | "disabled" | "error" | "success";

  /** Label displayed above the input. */
  label?: string;

  /** Placeholder text inside the input. */
  placeholder?: string;

  /** Current value (controlled). */
  value?: string;

  /** Change handler (controlled). */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;

  /** Helper or error message displayed below the input. */
  helperText?: string;

  /** Native input type (text, email, password, etc.). */
  type?: React.HTMLInputTypeAttribute;

  /** Optional extra class name for the root element. */
  className?: string;

  /** Native disabled attribute — also sets state to "disabled". */
  disabled?: boolean;

  /** Accessible name override (defaults to label text). */
  "aria-label"?: string;
}

/**
 * TextInput renders a labeled input field with full state support: enabled,
 * hover, focus, disabled, error, and success — matching the project design system.
 */
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      state: stateProp = "enabled",
      label = "Label",
      placeholder = "",
      value,
      onChange,
      helperText,
      type = "text",
      className,
      disabled = false,
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const isDisabled = disabled || stateProp === "disabled";
    const uid = useId();
    const inputId = `text-input-${uid}`;

    const [internalState, setInternalState] = useState<string>(
      isDisabled ? "disabled" : stateProp
    );

    // Keep internalState in sync when props change
    React.useEffect(() => {
      setInternalState(isDisabled ? "disabled" : stateProp);
    }, [stateProp, isDisabled]);

    const handleFocus = () => {
      if (internalState !== "disabled") setInternalState("focus");
    };

    const handleBlur = () => {
      if (internalState !== "disabled") setInternalState(isDisabled ? "disabled" : stateProp);
    };

    const handleMouseEnter = () => {
      if (internalState === "enabled") setInternalState("hover");
    };

    const handleMouseLeave = () => {
      if (internalState === "hover") setInternalState("enabled");
    };

    const rootClass = [
      "text-input",
      `text-input--${internalState}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const fieldClass = [
      "text-input__field",
      `text-input__field--${internalState}`,
    ].join(" ");

    return (
      <div className={rootClass}>
        {label && (
          <label className="text-input__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <div
          className={fieldClass}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <input
            ref={ref}
            id={inputId}
            className="text-input__input"
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={isDisabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-label={ariaLabel ?? label}
            aria-invalid={internalState === "error" || undefined}
            aria-describedby={helperText ? `${inputId}-helper` : undefined}
          />
        </div>
        {helperText && (
          <p
            id={`${inputId}-helper`}
            className={`text-input__helper text-input__helper--${internalState}`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
