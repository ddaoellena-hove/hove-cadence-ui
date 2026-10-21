/**
 * @deprecated SecondaryButton disparaît en 1.0.0 : le bleu plein n'est plus
 * utilisé pour les actions. Correspondance 0.3.0 :
 * - `outline` → `<PrimaryButton outline size="sm" />` (rendu conservé), ou `GhostButton size="sm"` hors dashboard
 * - plein → `<PrimaryButton size="sm" />` (ou `GhostButton size="sm"` selon le rôle réel)
 * - `size="large"` → `size="md"`
 * Le codemod `scripts/codemods/buttons-v2.mjs` fait la migration.
 */
import { forwardRef } from "react";
import { PrimaryButton } from "./PrimaryButton";
import type { ActionButtonProps } from "./action-button-types";
import { resolveButtonProps, warnDeprecated, warnOnce, type CompatButtonProps } from "./button-compat";

/** @deprecated Utiliser `PrimaryButtonProps` / `GhostButtonProps`. */
export type SecondaryButtonProps = CompatButtonProps;

/** @deprecated Utiliser `PrimaryButton outline size="sm"` / `GhostButton size="sm"` (outline) ou `PrimaryButton size="sm"` (plein). */
export const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>((props, ref) => {
  const { variant, props: resolved, deprecated } = resolveButtonProps(props, "SecondaryButton");
  warnOnce(
    "SecondaryButton",
    "component",
    'composant déprécié : utilisez `PrimaryButton size="sm"` (`outline` pour la variante contour) ou `GhostButton size="sm"`.',
  );
  warnDeprecated("SecondaryButton", deprecated);
  // Props déjà normalisées : libellé ou icône seule + aria-label
  const normalized = resolved as ActionButtonProps;
  return <PrimaryButton ref={ref} outline={variant === "outline"} {...normalized} />;
});

SecondaryButton.displayName = "SecondaryButton";
