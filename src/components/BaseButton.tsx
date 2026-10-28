import { forwardRef, useRef, type MouseEvent } from "react";
import { Icons, type IconName } from "./Icons";
import type { ActionButtonBaseProps, ActionButtonSize } from "./action-button-types";
import { checkButtonContent } from "./dev-warnings";
import { Tooltip } from "./Tooltip";
import "./base-button.css";

// Composant interne (non exporté par index.ts) : gabarit, icônes, chargement
// et focus communs à PrimaryButton et GhostButton. Les couleurs viennent de
// primary-button.css / ghost-button.css.

export interface BaseButtonProps extends ActionButtonBaseProps {
  /** "outline" : PrimaryButton contour (classes primary-button + primary-button--outline). */
  counter?: { value: number; max: number; label: string };
  variant: "primary" | "outline" | "ghost";
  label?: string;
  icon?: IconName;
  "aria-label"?: string;
}

const ICON_SIZE: Record<ActionButtonSize, number> = { sm: 12, md: 16 };

const Spinner = () => <span className="base-button__spinner" aria-hidden="true" />;

/** Marge minimale entre l'infobulle et le bord de la zone visible. */
const TIP_MARGIN = 8;

/** Zone visible d'un élément : la fenêtre, réduite par chaque ancêtre qui défile ou rogne horizontalement. */
const visibleBounds = (element: HTMLElement) => {
  let left = 0;
  let right = document.documentElement.clientWidth;
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
    if (getComputedStyle(node).overflowX === "visible") continue;
    const rect = node.getBoundingClientRect();
    left = Math.max(left, rect.left);
    right = Math.min(right, rect.right);
  }
  return { left, right };
};

/**
 * Recale l'infobulle horizontalement pour qu'elle reste dans la zone visible
 * (bord d'une Modal, d'un corps défilant, de la fenêtre). Mesurée juste avant
 * l'affichage : masquée, elle est en display:none et ne mesure rien.
 */
const placeTip = (bubble: HTMLElement | null) => {
  if (!bubble) return;
  bubble.style.setProperty("--base-button-tip-shift", "0px");
  bubble.style.visibility = "hidden";
  bubble.style.display = "block";
  const rect = bubble.getBoundingClientRect();
  bubble.style.removeProperty("display");
  bubble.style.removeProperty("visibility");
  const bounds = visibleBounds(bubble);
  let shift = 0;
  if (rect.right > bounds.right - TIP_MARGIN) shift = bounds.right - TIP_MARGIN - rect.right;
  if (rect.left + shift < bounds.left + TIP_MARGIN) shift = bounds.left + TIP_MARGIN - rect.left;
  bubble.style.setProperty("--base-button-tip-shift", `${Math.round(shift)}px`);
};

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      variant, counter,
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
    const tipRef = useRef<HTMLDivElement>(null);
    const iconOnly = icon !== undefined && !label;
    const iconSize = ICON_SIZE[size];
    const root = variant === "ghost" ? "ghost-button" : "primary-button";
    // Même contrôle pour les deux composants : pas de texte de repli
    const accessibleName = checkButtonContent(variant === "ghost" ? "GhostButton" : "PrimaryButton", {
      label,
      icon,
      ariaLabel,
    });

    const rootClass = [
      "base-button",
      `base-button--${size}`,
      root,
      variant === "outline" ? "primary-button--outline" : "",
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

    const button = (
      <button
        ref={ref}
        type={type}
        className={rootClass}
        disabled={disabled}
        onClick={handleClick}
        aria-label={counter ? `${accessibleName ?? label}, ${counter.value} ${counter.label}` : accessibleName}
        aria-busy={loading || undefined}
        aria-disabled={loading || undefined}
      >
        {iconOnly ? (
          loading ? <Spinner /> : renderIcon(icon)
        ) : (
          <>
            {iconStart && (loading ? <Spinner /> : renderIcon(iconStart))}
            {label && <span className="base-button__label">{label}</span>}
            {iconEnd && renderIcon(iconEnd)}
            {/* Sans icône de début : spinner centré, libellé masqué (largeur conservée) */}
            {loading && !iconStart && (
              <span className="base-button__spinner-overlay" aria-hidden="true">
                <Spinner />
              </span>
            )}
          </>
        )}
        {counter && <span className="base-button__counter" aria-hidden="true">{counter.value > counter.max ? `${counter.max}+` : counter.value}</span>}
      </button>
    );

    // Icône seule : le nom accessible s'affiche aussi en infobulle (survol et
    // focus clavier), pour les utilisateurs qui ne voient que l'icône. Masquée
    // aux lecteurs d'écran : ils ont déjà le nom via aria-label.
    if (!iconOnly) return button;
    return (
      <div className="base-button-tip" onMouseEnter={() => placeTip(tipRef.current)} onFocus={() => placeTip(tipRef.current)}>
        {button}
        <div ref={tipRef} className="base-button-tip__bubble" aria-hidden="true">
          <Tooltip label={accessibleName} theme="light" arrow="top" />
        </div>
      </div>
    );
  },
);

BaseButton.displayName = "BaseButton";
