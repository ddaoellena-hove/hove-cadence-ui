// Compatibilité 0.3.0 : traduit les anciennes props de PrimaryButton et
// SecondaryButton (withIcon, destructive, size medium/large, state)
// vers l'API v2. Fonctions pures, testées sans DOM.
// Suppression annoncée pour la 1.0.0.

import type { IconName } from "./Icons";
import type { ActionButtonBaseProps, ActionButtonContentProps, ActionButtonSize } from "./action-button-types";
import { isDevMode } from "./dev-mode";

export type LegacyWithIcon = "left" | "no" | "only" | "right";
export type LegacySize = "medium" | "large";
export type LegacyState = "clicked" | "disabled" | "enabled" | "hover";

/** Anciennes props encore acceptées (dépréciées). */
export interface LegacyButtonFlags {
  /** @deprecated Utiliser `tone="danger"`. */
  destructive?: boolean;
  /** @deprecated Ignoré : survol et appui sont gérés en CSS (`"disabled"` équivaut à `disabled`). */
  state?: LegacyState;
  /** @deprecated Ignoré. */
  iconMap?: string;
}

type BaseWithLegacySize = Omit<ActionButtonBaseProps, "size"> & {
  /** "sm" | "md". @deprecated pour "medium" | "large". */
  size?: ActionButtonSize | LegacySize;
};

/** Variante de PrimaryButton (pas de GhostButton). */
export interface PrimaryVariantProps {
  /** Variante contour : action secondaire visible, ex. dans un dashboard. Défaut false (plein). */
  outline?: boolean;
}

/** Nouvelle API, avec les anciens drapeaux encore tolérés. */
export type ModernButtonProps = BaseWithLegacySize & PrimaryVariantProps & LegacyButtonFlags & ActionButtonContentProps;

/** Ancienne API à `withIcon` (icône et libellé optionnels). */
export type LegacyIconButtonProps = BaseWithLegacySize &
  PrimaryVariantProps &
  LegacyButtonFlags & {
    /** @deprecated Utiliser `iconStart` / `iconEnd` / `icon`. */
    withIcon: LegacyWithIcon;
    icon?: IconName;
    label?: string;
    "aria-label"?: string;
  };

export type CompatButtonProps = ModernButtonProps | LegacyIconButtonProps;

/** Props normalisées, prêtes pour le rendu. */
export type ResolvedButtonProps = ActionButtonBaseProps & {
  label?: string;
  icon?: IconName;
  "aria-label"?: string;
};

export interface ResolvedButton {
  /** "outline" pour `outline`. */
  variant: "primary" | "outline";
  props: ResolvedButtonProps;
  /** Anciennes props rencontrées (pour les avertissements). */
  deprecated: DeprecatedProp[];
}

export type DeprecatedProp = "withIcon" | "destructive" | "size" | "state" | "iconMap";

// Icône par défaut de l'ancienne API quand `withIcon` est fourni sans `icon`
const LEGACY_DEFAULT_ICON: IconName = "map-01";

/** « arrow-narrow-up-right » → « arrow narrow up right » : nom accessible de repli. */
export const humanizeIcon = (icon: IconName): string => icon.replace(/-\d+$/, "").replace(/-/g, " ");

/**
 * Traduit des props (nouvelles ou anciennes) en props v2.
 * `component` change seulement la correspondance des tailles :
 * SecondaryButton medium → "sm", large → "md".
 */
export const resolveButtonProps = (
  input: CompatButtonProps,
  component: "PrimaryButton" | "SecondaryButton",
): ResolvedButton => {
  const {
    withIcon,
    destructive,
    outline,
    state,
    iconMap,
    size,
    icon,
    label,
    "aria-label": ariaLabel,
    tone,
    disabled,
    ...rest
  } = input as LegacyIconButtonProps & ModernButtonProps;
  const deprecated: DeprecatedProp[] = [];

  // ── Taille ──
  let resolvedSize: ActionButtonSize | undefined;
  if (size === "medium" || size === "large") {
    deprecated.push("size");
    // Plus de grande taille : large → md (PrimaryButton comme SecondaryButton large)
    resolvedSize = component === "SecondaryButton" && size === "medium" ? "sm" : "md";
  } else {
    resolvedSize = size ?? (component === "SecondaryButton" ? "sm" : undefined);
  }

  // ── Ton, variante, état ──
  if (destructive !== undefined) deprecated.push("destructive");
  if (state !== undefined) deprecated.push("state");
  if (iconMap !== undefined) deprecated.push("iconMap");
  const resolvedTone = tone ?? (destructive ? "danger" : undefined);
  const resolvedDisabled = disabled || state === "disabled" || undefined;

  const props: ResolvedButtonProps = {
    ...rest,
    size: resolvedSize,
    tone: resolvedTone,
    disabled: resolvedDisabled,
  };

  // ── Contenu ──
  if (withIcon !== undefined) {
    deprecated.push("withIcon");
    const legacyIcon = icon ?? LEGACY_DEFAULT_ICON;
    if (withIcon === "only") {
      props.icon = legacyIcon;
      // L'ancien libellé devient le nom accessible ; sans lui, BaseButton
      // déduit ce nom de l'icône (checkButtonContent)
      props["aria-label"] = ariaLabel ?? label;
    } else {
      if (withIcon === "left") props.iconStart = props.iconStart ?? legacyIcon;
      if (withIcon === "right") props.iconEnd = props.iconEnd ?? legacyIcon;
      props.label = label;
      props["aria-label"] = ariaLabel;
    }
  } else if (icon !== undefined && label === undefined) {
    props.icon = icon;
    props["aria-label"] = ariaLabel;
  } else {
    // Pas de libellé de repli : un bouton vide est signalé par checkButtonContent
    props.label = label;
    props["aria-label"] = ariaLabel;
  }

  return { variant: outline ? "outline" : "primary", props, deprecated };
};

// ── Avertissements (développement uniquement, une fois par prop) ───────────


const MESSAGES: Record<DeprecatedProp, string> = {
  withIcon: "`withIcon` est déprécié : utilisez `iconStart`, `iconEnd` ou `icon` (icône seule + `aria-label`).",
  destructive: '`destructive` est déprécié : utilisez `tone="danger"`.',
  size: '`size="medium" | "large"` est déprécié : utilisez `"sm"` ou `"md"` (plus de grande taille).',
  state: '`state` est ignoré : survol et appui sont gérés en CSS (utilisez `disabled`).',
  iconMap: "`iconMap` est ignoré.",
};

const warned = new Set<string>();

/**
 * Avertit une seule fois par composant et par clé, hors production.
 * `deprecation` : ajoute l'annonce de suppression en 1.0.0.
 */
export const warnOnce = (component: string, key: string, message: string, deprecation = true): void => {
  if (!isDevMode()) return;
  const id = `${component}:${key}`;
  if (warned.has(id)) return;
  warned.add(id);
  console.warn(`[cadence-ui] ${component} : ${message}${deprecation ? " Suppression prévue en 1.0.0." : ""}`);
};

const errored = new Set<string>();

/** Erreur de développement, une seule fois par composant et par clé, hors production. */
export const errorOnce = (component: string, key: string, message: string): void => {
  if (!isDevMode()) return;
  const id = `${component}:${key}`;
  if (errored.has(id)) return;
  errored.add(id);
  console.error(`[cadence-ui] ${component} : ${message}`);
};

/**
 * Contrôle du contenu, commun à PrimaryButton et GhostButton (appelé par
 * BaseButton). Aucun texte de repli n'est jamais affiché :
 * - ni libellé ni icône → erreur en développement, bouton rendu vide ;
 * - icône seule sans aria-label → nom accessible déduit de l'icône + avertissement.
 * Renvoie le nom accessible à poser sur le bouton.
 */
export const checkButtonContent = (
  component: "PrimaryButton" | "GhostButton",
  { label, icon, ariaLabel }: { label?: string; icon?: IconName; ariaLabel?: string },
): string | undefined => {
  if (!label && icon === undefined) {
    errorOnce(component, "missingContent", "`label` ou `icon` + `aria-label` est requis.");
    return ariaLabel;
  }
  if (!label && icon !== undefined && !ariaLabel) {
    warnOnce(component, "missingAriaLabel", "icône seule sans `aria-label` : le nom de l'icône sert de libellé accessible.", false);
    return humanizeIcon(icon);
  }
  return ariaLabel;
};

/** Émet les avertissements des anciennes props rencontrées. */
export const warnDeprecated = (component: string, deprecated: DeprecatedProp[]): void => {
  for (const key of deprecated) warnOnce(component, key, MESSAGES[key]);
};

/** Réinitialise la mémoire des avertissements et erreurs (tests uniquement). */
export const resetWarningsForTests = (): void => {
  warned.clear();
  errored.clear();
};
