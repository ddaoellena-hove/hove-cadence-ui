// Compatibilité 0.3.0 : traduit les anciennes props de PrimaryButton et
// SecondaryButton (withIcon, destructive, size medium/large, state)
// vers l'API v2. Fonctions pures, testées sans DOM.
// Suppression annoncée pour la 1.0.0.

import type { IconName } from "./Icons";
import type { ActionButtonBaseProps, ActionButtonContentProps, ActionButtonSize } from "./action-button-types";

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
  /** "sm" | "md" | "lg". @deprecated pour "medium" | "large". */
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

export type DeprecatedProp = "withIcon" | "destructive" | "size" | "state" | "iconMap" | "missingLabel" | "missingAriaLabel";

// Icône par défaut de l'ancienne API quand `withIcon` est fourni sans `icon`
const LEGACY_DEFAULT_ICON: IconName = "map-01";

/** « arrow-narrow-up-right » → « arrow narrow up right » : nom accessible de repli. */
const humanizeIcon = (icon: IconName): string => icon.replace(/-\d+$/, "").replace(/-/g, " ");

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
    resolvedSize = component === "SecondaryButton" ? (size === "medium" ? "sm" : "md") : size === "medium" ? "md" : "lg";
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
      props["aria-label"] = ariaLabel ?? label ?? humanizeIcon(legacyIcon);
      if (!ariaLabel && !label) deprecated.push("missingAriaLabel");
    } else {
      if (withIcon === "left") props.iconStart = props.iconStart ?? legacyIcon;
      if (withIcon === "right") props.iconEnd = props.iconEnd ?? legacyIcon;
      props.label = label ?? "Label";
      props["aria-label"] = ariaLabel;
      if (label === undefined) deprecated.push("missingLabel");
    }
  } else if (icon !== undefined && label === undefined) {
    props.icon = icon;
    props["aria-label"] = ariaLabel;
  } else {
    props.label = label ?? "Label";
    props["aria-label"] = ariaLabel;
    if (label === undefined) deprecated.push("missingLabel");
  }

  return { variant: outline ? "outline" : "primary", props, deprecated };
};

// ── Avertissements (développement uniquement, une fois par prop) ───────────

// Remplacé par le bundler de l'application (React exige déjà cette définition)
declare const process: { env: { NODE_ENV?: string } };

const MESSAGES: Record<DeprecatedProp, string> = {
  withIcon: "`withIcon` est déprécié : utilisez `iconStart`, `iconEnd` ou `icon` (icône seule + `aria-label`).",
  destructive: '`destructive` est déprécié : utilisez `tone="danger"`.',
  size: '`size="medium" | "large"` est déprécié : utilisez `"sm" | "md" | "lg"`.',
  state: '`state` est ignoré : survol et appui sont gérés en CSS (utilisez `disabled`).',
  iconMap: "`iconMap` est ignoré.",
  missingLabel: "`label` manquant : le libellé « Label » est affiché par défaut.",
  missingAriaLabel: "icône seule sans `aria-label` : le nom de l'icône sert de libellé accessible.",
};

const warned = new Set<string>();

/** Avertit une seule fois par composant et par prop, hors production. */
export const warnOnce = (component: string, key: string, message: string): void => {
  if (process.env.NODE_ENV === "production") return;
  const id = `${component}:${key}`;
  if (warned.has(id)) return;
  warned.add(id);
  console.warn(`[cadence-ui] ${component} : ${message} Suppression prévue en 1.0.0.`);
};

/** Émet les avertissements des anciennes props rencontrées. */
export const warnDeprecated = (component: string, deprecated: DeprecatedProp[]): void => {
  for (const key of deprecated) warnOnce(component, key, MESSAGES[key]);
};

/** Réinitialise la mémoire des avertissements (tests uniquement). */
export const resetWarningsForTests = (): void => warned.clear();
