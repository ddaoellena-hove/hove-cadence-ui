import { useState, useRef, useEffect, useId, type ReactNode } from "react";
import { ButtonTriggerContent } from "./ButtonTrigger";
import { buttonTriggerClass, type TriggerVariant } from "./button-trigger-utils";
import { usePopoverFit } from "./use-popover-fit";
import "./dropdown.css";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DropdownOption {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** Affiche un séparateur au-dessus de cette option. */
  divider?: boolean;
  /** Libellé de groupe affiché au-dessus de cette option (en-tête de section). */
  groupLabel?: string;
}

export interface DropdownProps {
  /** Liste des options disponibles. */
  options: DropdownOption[];
  /** Label affiché au-dessus du dropdown (même style que TextInput). */
  label?: string;
  /** Valeur sélectionnée (id de l'option). */
  value?: string;
  /** Texte affiché quand aucune option n'est sélectionnée. */
  placeholder?: string;
  /** Désactive le dropdown. */
  disabled?: boolean;
  /** Appelé à chaque sélection avec l'id de l'option. */
  onChange?: (id: string) => void;
  /**
   * Apparence du déclencheur : `"field"` (champ de formulaire, défaut) ou
   * `"button"` (PrimaryButton outline sm, pour l'en-tête d'un dashboard).
   */
  variant?: TriggerVariant;
  /** Nom accessible sans `label` visible (variante bouton) : « Devise ». */
  "aria-label"?: string;
  /** Classe CSS additionnelle. */
  className?: string;
}

// ── Chevron icon ───────────────────────────────────────────────────────────────

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="dropdown__chevron"
    style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}
  >
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Coche de l'option sélectionnée : pastille pleine (currentColor) et coche blanche
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <circle cx="6" cy="6" r="6" fill="currentColor" />
    <path
      className="dropdown__option-check-mark"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.19256 3.54074C9.33575 3.68394 9.33575 3.9161 9.19256 4.05929L5.15922 8.09262C5.01603 8.23581 4.78387 8.23581 4.64068 8.09262L2.80735 6.25929C2.66415 6.1161 2.66415 5.88394 2.80735 5.74074C2.95054 5.59755 3.1827 5.59755 3.32589 5.74074L4.89995 7.3148L8.67401 3.54074C8.8172 3.39755 9.04936 3.39755 9.19256 3.54074Z"
    />
  </svg>
);

/** Section du menu : options qui suivent un en-tête de groupe ou un séparateur. */
interface MenuSection {
  key: string;
  groupLabel?: string;
  divider?: boolean;
  options: DropdownOption[];
}

/** Découpe les options en sections : chaque `groupLabel` ou `divider` en ouvre une nouvelle. */
const toSections = (options: DropdownOption[]): MenuSection[] =>
  options.reduce<MenuSection[]>((sections, option) => {
    const current = sections[sections.length - 1];
    if (!current || option.groupLabel || option.divider) {
      sections.push({ key: option.id, groupLabel: option.groupLabel, divider: option.divider, options: [option] });
    } else {
      current.options.push(option);
    }
    return sections;
  }, []);

// ── Component ──────────────────────────────────────────────────────────────────

export const Dropdown = ({
  options,
  label,
  value,
  placeholder = "Sélectionner…",
  disabled = false,
  onChange,
  variant = "field",
  "aria-label": ariaLabel,
  className,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Le menu reste dans la zone visible (ex. déclencheur au bord droit d'un en-tête)
  const menuRef = useRef<HTMLUListElement>(null);
  usePopoverFit(menuRef, isOpen);
  const triggerId = useId();
  const labelId = useId();
  const menuId = useId();

  const selectedOption = options.find((o) => o.id === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    onChange?.(option.id);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) setIsOpen((prev) => !prev);
    }
  };

  const renderOption = (option: DropdownOption) => (
    <button
      key={option.id}
      type="button"
      role="option"
      className={[
        "dropdown__option",
        option.disabled ? "dropdown__option--disabled" : "",
        option.id === value ? "dropdown__option--selected" : "",
      ].filter(Boolean).join(" ")}
      aria-selected={option.id === value}
      aria-disabled={option.disabled}
      onClick={() => handleSelect(option)}
      disabled={option.disabled}
    >
      {option.icon && <span className="dropdown__option-icon">{option.icon}</span>}
      <span className="dropdown__option-label">{option.label}</span>
      {option.id === value && (
        <span className="dropdown__option-check">
          <CheckIcon />
        </span>
      )}
    </button>
  );

  const rootClass = ["dropdown", isOpen ? "dropdown--open" : "", disabled ? "dropdown--disabled" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} ref={containerRef}>
      {label && (
        <label id={labelId} className="text-input__label" htmlFor={triggerId}>
          {label}
        </label>
      )}
      <button
        id={triggerId}
        type="button"
        className={variant === "button" ? buttonTriggerClass(Boolean(selectedOption?.icon), isOpen) : "dropdown__trigger"}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        aria-label={!label && ariaLabel ? `${ariaLabel} : ${selectedOption ? selectedOption.label : placeholder}` : undefined}
      >
        {variant === "button" ? (
          <ButtonTriggerContent
            start={selectedOption?.icon}
            text={selectedOption ? selectedOption.label : placeholder}
            isPlaceholder={!selectedOption}
            open={isOpen}
          />
        ) : (
          <>
            {selectedOption?.icon && (
              <span className="dropdown__trigger-icon">{selectedOption.icon}</span>
            )}
            <span className={`dropdown__trigger-label${!selectedOption ? " dropdown__trigger-label--placeholder" : ""}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronIcon open={isOpen} />
          </>
        )}
      </button>

      {isOpen && (
        // Nom de la liste : le label visible, sinon l'aria-label (variante bouton)
        <ul
          ref={menuRef}
          className="dropdown__menu"
          role="listbox"
          aria-labelledby={label ? labelId : undefined}
          aria-label={label ? undefined : (ariaLabel ?? "Options")}
        >
          {toSections(options).map((section, index) => {
            const headerId = `${menuId}-group-${index}`;
            const items = section.options.map(renderOption);
            return (
              <li key={section.key} role="presentation" className="dropdown__section">
                {section.divider && <div className="dropdown__divider" aria-hidden="true" />}
                {section.groupLabel ? (
                  // Groupe annoncé : role="group" nommé par son en-tête (non focusable)
                  <div role="group" aria-labelledby={headerId} className="dropdown__group">
                    <div id={headerId} className="dropdown__group-label">
                      {section.groupLabel}
                    </div>
                    {items}
                  </div>
                ) : (
                  items
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
