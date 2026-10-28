/**
 * GhostButton — actions secondaires : sans fond ni bordure au repos, voile au
 * survol, texte en encre. Même API et mêmes dimensions que PrimaryButton.
 */
import { forwardRef } from "react";
import { BaseButton } from "./BaseButton";
import type { ActionButtonProps } from "./action-button-types";
import "./ghost-button.css";

export type GhostButtonProps = ActionButtonProps & { count?: number; countMax?: number; countLabel?: string };

export const GhostButton = forwardRef<HTMLButtonElement, GhostButtonProps>(({ count, countMax = 9, countLabel = "non lues", ...props }, ref) => (
  <BaseButton ref={ref} variant="ghost" {...props} counter={count !== undefined && count > 0 ? { value: count, max: countMax, label: countLabel } : undefined} />
));

GhostButton.displayName = "GhostButton";
