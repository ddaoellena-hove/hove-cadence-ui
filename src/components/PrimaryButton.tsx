/**
 * PrimaryButton component.
 *
 * A versatile button supporting filled and outline variants, destructive actions,
 * and optional icon placement (left, right, or icon-only).
 */
import React, { useState, useEffect } from "react";
import { Icons, type IconsProps } from "./Icons";
import "./primary-button.css";

export interface PrimaryButtonProps {
  /** Visual interaction state. Hover/clicked states are also managed internally via DOM events. */
  state?: "clicked" | "disabled" | "enabled" | "hover";

  /** Icon placement relative to the label. */
  withIcon?: "left" | "no" | "only" | "right";

  /** Render as an outline (ghost) button. */
  outline?: boolean;

  /** Apply destructive (danger) styling. */
  destructive?: boolean;

  /** Button label text shown when withIcon is not "only". */
  label?: string;

  /** Icon name to display (used when withIcon is not "no"). */
  icon?: IconsProps["icon"];

  /** Optional extra class name for custom styling. */
  className?: string;

  /** Click handler. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;

  /** Native disabled attribute — also sets state to "disabled". */
  disabled?: boolean;

  /** Fallback URL used by the Icons component for the "map-01" icon. */
  iconMap?: string;
}

/**
 * PrimaryButton renders a styled button element with support for filled/outline,
 * destructive variants, and optional icon placement.
 */
export const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  PrimaryButtonProps
>(
  (
    {
      state: stateProp = "enabled",
      withIcon = "no",
      outline = false,
      destructive = false,
      label = "Label",
      icon = "map-01",
      iconMap = "https://c.animaapp.com/moieyt2ccA1Ry9/img/icon-map-01-1_1.svg",
      className,
      onClick,
      disabled = false,
    },
    ref
  ) => {
    const isDisabled = disabled || stateProp === "disabled";

    const [internalState, setInternalState] = useState<string>(
      isDisabled ? "disabled" : (stateProp ?? "enabled")
    );

    useEffect(() => {
      setInternalState(
        isDisabled ? "disabled" : (stateProp ?? "enabled")
      );
    }, [stateProp, isDisabled]);

    const handleMouseEnter = () => {
      if (internalState !== "disabled") setInternalState("hover");
    };

    const handleMouseLeave = () => {
      if (internalState !== "disabled")
        setInternalState(isDisabled ? "disabled" : (stateProp ?? "enabled"));
    };

    const handleMouseDown = () => {
      if (internalState !== "disabled") setInternalState("clicked");
    };

    const handleMouseUp = () => {
      if (internalState !== "disabled") setInternalState("hover");
    };

    const rootClass = [
      "primary-button",
      internalState,
      withIcon,
      `outline-${outline}`,
      `destructive-${destructive}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconEl = (
      <Icons className="icons-instance" icon={icon} iconMap={iconMap} />
    );

    let content: React.ReactNode;
    if (withIcon === "only") {
      content = <span className="label">{iconEl}</span>;
    } else if (withIcon === "left") {
      content = (
        <span className="label">
          {iconEl}
          <span className="text-wrapper-2">{label}</span>
        </span>
      );
    } else if (withIcon === "right") {
      content = (
        <span className="label">
          <span className="text-wrapper">{label}</span>
          {iconEl}
        </span>
      );
    } else {
      // withIcon === "no"
      content = <span className="label">{label}</span>;
    }

    return (
      <button
        ref={ref}
        className={rootClass}
        disabled={isDisabled}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        aria-disabled={isDisabled}
        type="button"
      >
        {content}
      </button>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";
