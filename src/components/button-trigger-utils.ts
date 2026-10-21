// Variante « bouton » des déclencheurs (DatePicker, DateRangePicker, Dropdown) :
// classes du PrimaryButton outline sm. Le CSS est importé par ButtonTrigger.tsx.

/** Apparence du déclencheur : champ de formulaire ou bouton (en-tête de dashboard). */
export type TriggerVariant = "field" | "button";

/** Classes du déclencheur en variante bouton (PrimaryButton outline sm). */
export const buttonTriggerClass = (hasIconStart: boolean, open: boolean) =>
  [
    "base-button",
    "base-button--sm",
    "primary-button",
    "primary-button--outline",
    hasIconStart ? "base-button--icon-start" : "",
    "base-button--icon-end",
    "button-trigger",
    open ? "button-trigger--open" : "",
  ]
    .filter(Boolean)
    .join(" ");
