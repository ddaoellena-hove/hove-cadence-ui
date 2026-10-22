import { useRef, type KeyboardEvent } from "react";
import { Icons } from "./Icons";
import "./search-input.css";

export interface SearchInputProps {
  /** Texte recherché (contrôlé). */
  value: string;
  /** Appelé à chaque frappe, au clic sur « effacer » et sur Échap, avec le nouveau texte. */
  onChange: (value: string) => void;
  /** Défaut « Rechercher… ». */
  placeholder?: string;
  /** Nom accessible du champ. Défaut « Rechercher ». */
  "aria-label"?: string;
  /** Désactive le champ. */
  disabled?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
}

/**
 * Champ de recherche au gabarit des boutons `sm` (pilule de 29px, bordure et
 * relief de `PrimaryButton outline`) : s'aligne sur les filtres d'une
 * `FilterBar` ou d'un en-tête de dashboard. Loupe à gauche, bouton « effacer »
 * dès qu'il y a du texte ; Échap vide aussi le champ.
 */
export const SearchInput = ({
  value,
  onChange,
  placeholder = "Rechercher…",
  "aria-label": ariaLabel = "Rechercher",
  disabled = false,
  className,
}: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = value.length > 0;

  const clear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  // Échap vide le champ ; vide, il n'est pas intercepté (ferme une modale, etc.)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && hasValue) {
      e.preventDefault();
      e.stopPropagation();
      clear();
    }
  };

  const rootClass = [
    "search-input",
    hasValue ? "search-input--filled" : "",
    disabled ? "search-input--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <Icons icon="search-md" size={12} className="search-input__icon" />
      <input
        ref={inputRef}
        type="search"
        className="search-input__input"
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {hasValue && !disabled && (
        <button type="button" className="search-input__clear" aria-label="Effacer la recherche" onClick={clear}>
          <Icons icon="x-close" size={12} />
        </button>
      )}
    </div>
  );
};
