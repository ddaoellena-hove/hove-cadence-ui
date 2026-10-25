/**
 * PrimaryButton — action principale, plein (un seul par vue), ou variante
 * `outline` : action secondaire visible, réservée aux dashboards.
 *
 * API commune avec GhostButton (tone, size, iconStart / iconEnd, icon +
 * aria-label, loading, fullWidth, type). Les anciennes props de la 0.2
 * (withIcon, destructive, size medium / large, state) sont supprimées en 1.0.0.
 */
import { forwardRef } from "react";
import { BaseButton } from "./BaseButton";
import type { ActionButtonProps } from "./action-button-types";
import "./primary-button.css";

export type {
  ActionButtonBaseProps,
  ActionButtonContentProps,
  ActionButtonProps,
  ActionButtonSize,
  ActionButtonTone,
} from "./action-button-types";

/** Variante de PrimaryButton (pas de GhostButton). */
export interface PrimaryVariantProps {
  /** Variante contour : action secondaire visible, ex. dans un dashboard. Défaut false (plein). */
  outline?: boolean;
}

export type PrimaryButtonProps = ActionButtonProps & PrimaryVariantProps;

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(({ outline = false, ...props }, ref) => (
  <BaseButton ref={ref} variant={outline ? "outline" : "primary"} {...props} />
));

PrimaryButton.displayName = "PrimaryButton";
