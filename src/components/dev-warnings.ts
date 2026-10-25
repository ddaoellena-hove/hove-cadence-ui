// Avertissements et erreurs de développement, une seule fois par composant et
// par clé, coupés en production (isDevMode). Contrôle du contenu des boutons,
// partagé par PrimaryButton et GhostButton (appelé par BaseButton).

import type { IconName } from "./Icons";
import { isDevMode } from "./dev-mode";

/** « arrow-narrow-up-right » → « arrow narrow up right » : nom accessible de repli. */
export const humanizeIcon = (icon: IconName): string => icon.replace(/-\d+$/, "").replace(/-/g, " ");

const warned = new Set<string>();

/** Avertit une seule fois par composant et par clé, hors production. */
export const warnOnce = (component: string, key: string, message: string): void => {
  if (!isDevMode()) return;
  const id = `${component}:${key}`;
  if (warned.has(id)) return;
  warned.add(id);
  console.warn(`[cadence-ui] ${component} : ${message}`);
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
    warnOnce(component, "missingAriaLabel", "icône seule sans `aria-label` : le nom de l'icône sert de libellé accessible.");
    return humanizeIcon(icon);
  }
  return ariaLabel;
};

/** Réinitialise la mémoire des avertissements et erreurs (tests uniquement). */
export const resetWarningsForTests = (): void => {
  warned.clear();
  errored.clear();
};
