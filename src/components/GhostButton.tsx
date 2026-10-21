/**
 * GhostButton — actions secondaires : sans fond ni bordure au repos, voile au
 * survol, texte en encre. Même API et mêmes dimensions que PrimaryButton.
 */
import { forwardRef } from "react";
import { BaseButton } from "./BaseButton";
import type { ActionButtonProps } from "./action-button-types";
import "./ghost-button.css";

export type GhostButtonProps = ActionButtonProps;

export const GhostButton = forwardRef<HTMLButtonElement, GhostButtonProps>((props, ref) => (
  <BaseButton ref={ref} variant="ghost" {...props} />
));

GhostButton.displayName = "GhostButton";
