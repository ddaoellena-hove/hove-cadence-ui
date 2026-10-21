import type { ReactNode } from "react";
import { Icons } from "./Icons";
import "./base-button.css";
import "./primary-button.css";
import "./button-trigger.css";

// Interne (non exporté par index.ts) : variante « bouton » des déclencheurs de
// DatePicker, DateRangePicker et Dropdown. Le déclencheur reprend exactement
// les classes du PrimaryButton outline sm : il suit les boutons s'ils évoluent.

interface ButtonTriggerContentProps {
  /** Icône avant le texte (12px, comme une icône de bouton sm). */
  start?: ReactNode;
  /** Texte affiché : valeur ou placeholder. */
  text: string;
  /** Vrai si `text` est le placeholder (aucune valeur). */
  isPlaceholder?: boolean;
  /** Ouvert : le chevron se retourne. */
  open: boolean;
}

/** Contenu du déclencheur en variante bouton : icône, texte, chevron. */
export const ButtonTriggerContent = ({ start, text, isPlaceholder, open }: ButtonTriggerContentProps) => (
  <>
    {start && (
      <span className="base-button__icon button-trigger__start" aria-hidden="true">
        {start}
      </span>
    )}
    <span className={`base-button__label button-trigger__text${isPlaceholder ? " button-trigger__text--placeholder" : ""}`}>
      {text}
    </span>
    <Icons
      icon="chevron-down"
      size={12}
      className={`base-button__icon button-trigger__chevron${open ? " button-trigger__chevron--open" : ""}`}
    />
  </>
);
