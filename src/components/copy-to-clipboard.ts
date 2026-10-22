/**
 * Copie dans le presse-papiers : API asynchrone si disponible (contexte
 * sécurisé), sinon repli execCommand via un champ temporaire hors écran.
 * Résout `true` si la copie a réussi.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission refusée ou contexte non sécurisé : on tente le repli.
  }
  if (typeof document === "undefined") return false;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  const active = document.activeElement as HTMLElement | null;
  // execCommand copie la sélection du document : le champ doit avoir le focus,
  // sinon la copie peut « réussir » avec un contenu vide.
  field.focus({ preventScroll: true });
  field.select();
  let ok: boolean;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  field.remove();
  active?.focus();
  return ok;
};
