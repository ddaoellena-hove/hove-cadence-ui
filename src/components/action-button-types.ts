// Types partagés par PrimaryButton et GhostButton : même API, seul le rendu change.

import type { MouseEventHandler } from "react";
import type { IconName } from "./Icons";

export type ActionButtonTone = "default" | "danger";
export type ActionButtonSize = "sm" | "md";

export interface ActionButtonBaseProps {
  /** Ton sémantique. "danger" = action destructive. Défaut "default". */
  tone?: ActionButtonTone;
  /** Gabarit : "sm" (tableau, barre d'outils, popover) ou "md" (défaut). Ne porte pas de sens. */
  size?: ActionButtonSize;
  /** Icône avant le libellé. */
  iconStart?: IconName;
  /** Icône après le libellé. */
  iconEnd?: IconName;
  /** En cours : clics ignorés, aria-busy, spinner, largeur conservée. */
  loading?: boolean;
  disabled?: boolean;
  /** Occupe toute la largeur du conteneur. */
  fullWidth?: boolean;
  /** Défaut "button" : jamais de soumission involontaire. */
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

/** Contenu : un libellé, ou une icône seule avec un nom accessible obligatoire. */
export type ActionButtonContentProps =
  | { label: string; icon?: never; "aria-label"?: string }
  | { icon: IconName; label?: never; "aria-label": string };

export type ActionButtonProps = ActionButtonBaseProps & ActionButtonContentProps;
