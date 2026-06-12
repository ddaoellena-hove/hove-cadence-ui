import React, { useState, useId } from "react";
import "./text-area.css";

export interface TextAreaProps {
  state?: "enabled" | "hover" | "focus" | "disabled" | "error" | "success";
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  helperText?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      state: stateProp = "enabled",
      label = "Label",
      placeholder = "",
      value,
      onChange,
      helperText,
      rows = 4,
      className,
      disabled = false,
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const isDisabled = disabled || stateProp === "disabled";
    const uid = useId();
    const textareaId = `text-area-${uid}`;

    const [internalState, setInternalState] = useState<string>(
      isDisabled ? "disabled" : stateProp
    );

    React.useEffect(() => {
      setInternalState(isDisabled ? "disabled" : stateProp);
    }, [stateProp, isDisabled]);

    const handleFocus = () => {
      if (internalState !== "disabled") setInternalState("focus");
    };

    const handleBlur = () => {
      if (internalState !== "disabled")
        setInternalState(isDisabled ? "disabled" : stateProp);
    };

    const handleMouseEnter = () => {
      if (internalState === "enabled") setInternalState("hover");
    };

    const handleMouseLeave = () => {
      if (internalState === "hover") setInternalState("enabled");
    };

    const rootClass = ["text-area", `text-area--${internalState}`, className]
      .filter(Boolean)
      .join(" ");

    const fieldClass = [
      "text-area__field",
      `text-area__field--${internalState}`,
    ].join(" ");

    return (
      <div className={rootClass}>
        {label && (
          <label className="text-area__label" htmlFor={textareaId}>
            {label}
          </label>
        )}
        <div
          className={fieldClass}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <textarea
            ref={ref}
            id={textareaId}
            className="text-area__textarea"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
            disabled={isDisabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-label={ariaLabel ?? label}
            aria-invalid={internalState === "error" || undefined}
            aria-describedby={helperText ? `${textareaId}-helper` : undefined}
          />
        </div>
        {helperText && (
          <p
            id={`${textareaId}-helper`}
            className={`text-area__helper text-area__helper--${internalState}`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";
