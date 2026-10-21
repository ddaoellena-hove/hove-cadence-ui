import { forwardRef, type MouseEvent } from "react";
import { Icons, type IconName } from "./Icons";
import type { ActionButtonBaseProps, ActionButtonSize } from "./action-button-types";
import "./base-button.css";

// Composant interne (non exporté par index.ts) : gabarit, icônes, chargement
// et focus communs à PrimaryButton et GhostButton. Les couleurs viennent de
// primary-button.css / ghost-button.css.

export interface BaseButtonProps extends ActionButtonBaseProps {
  variant: "primary" | "ghost";
  label?: string;
  icon?: IconName;
  "aria-label"?: string;
}

const ICON_SIZE: Record<ActionButtonSize, number> = { sm: 12, md: 16, lg: 20 };

const Spinner = () => <span className="base-button__spinner" aria-hidden="true" />;

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      variant,
      tone = "default",
      size = "md",
      iconStart,
      iconEnd,
      icon,
      label,
      loading = false,
      disabled = false,
      fullWidth = false,
      type = "button",
      onClick,
      className,
      "aria-label": ariaLabel,
    },
    ref,
  ) => {
    const iconOnly = icon !== undefined && !label;
    const iconSize = ICON_SIZE[size];
    const root = variant === "primary" ? "primary-button" : "ghost-button";

    const rootClass = [
      "base-button",
      `base-button--${size}`,
      root,
      tone === "danger" ? `${root}--danger` : "",
      iconOnly ? "base-button--icon-only" : "",
      !iconOnly && iconStart ? "base-button--icon-start" : "",
      !iconOnly && iconEnd ? "base-button--icon-end" : "",
      fullWidth ? "base-button--full-width" : "",
      loading ? "base-button--loading" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // En chargement, le bouton reste focusable mais ignore les clics
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      if (loading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const renderIcon = (name: IconName) => <Icons icon={name} size={iconSize} className="base-button__icon" />;

    return (
      <button
        ref={ref}
        type={type}
        className={rootClass}
        disabled={disabled}
        onClick={handleClick}
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
      >
        {iconOnly ? (
          loading ? <Spinner /> : renderIcon(icon)
        ) : (
          <>
            {iconStart && (loading ? <Spinner /> : renderIcon(iconStart))}
            <span className="base-button__label">{label}</span>
            {iconEnd && renderIcon(iconEnd)}
            {/* Sans icône de début : spinner centré, libellé masqué (largeur conservée) */}
            {loading && !iconStart && (
              <span className="base-button__spinner-overlay" aria-hidden="true">
                <Spinner />
              </span>
            )}
          </>
        )}
      </button>
    );
  },
);

BaseButton.displayName = "BaseButton";
