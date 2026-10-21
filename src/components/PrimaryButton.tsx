/**
 * PrimaryButton — action principale, plein (un seul par vue), ou variante
 * `outline` : action secondaire visible, réservée aux dashboards.
 *
 * API v2 commune avec GhostButton (tone, size, iconStart / iconEnd, icon +
 * aria-label, loading, fullWidth, type). Les anciennes props (withIcon,
 * destructive, size medium / large, state) restent acceptées en 0.3.0,
 * traduites par button-compat.ts ; suppression prévue en 1.0.0.
 */
import { forwardRef } from "react";
import { BaseButton } from "./BaseButton";
import { resolveButtonProps, warnDeprecated, type CompatButtonProps } from "./button-compat";
import "./primary-button.css";

export type {
  ActionButtonBaseProps,
  ActionButtonContentProps,
  ActionButtonProps,
  ActionButtonSize,
  ActionButtonTone,
} from "./action-button-types";

/** Nouvelle API (+ `outline`), plus les anciennes props tolérées (dépréciées) jusqu'à la 1.0.0. */
export type PrimaryButtonProps = CompatButtonProps;

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>((props, ref) => {
  const { variant, props: resolved, deprecated } = resolveButtonProps(props, "PrimaryButton");
  warnDeprecated("PrimaryButton", deprecated);
  return <BaseButton ref={ref} variant={variant} {...resolved} />;
});

PrimaryButton.displayName = "PrimaryButton";
