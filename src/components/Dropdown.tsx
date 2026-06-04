import { useState, useRef, useEffect, useId, type ReactNode } from "react";
import "./dropdown.css";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DropdownOption {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** Affiche un séparateur au-dessus de cette option. */
  divider?: boolean;
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

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M2.5 7l3.5 3.5 5.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────────

export const Dropdown = ({
  options,
  label,
  value,
  placeholder = "Sélectionner…",
  disabled = false,
  onChange,
  className,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();

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

  const rootClass = ["dropdown", isOpen ? "dropdown--open" : "", disabled ? "dropdown--disabled" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} ref={containerRef}>
      {label && (
        <label className="text-input__label" htmlFor={triggerId}>
          {label}
        </label>
      )}
      <button
        id={triggerId}
        type="button"
        className="dropdown__trigger"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        {selectedOption?.icon && (
          <span className="dropdown__trigger-icon">{selectedOption.icon}</span>
        )}
        <span className={`dropdown__trigger-label${!selectedOption ? " dropdown__trigger-label--placeholder" : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <ul className="dropdown__menu" role="listbox" aria-label="Options">
          {options.map((option) => (
            <li key={option.id} role="presentation">
              {option.divider && <div className="dropdown__divider" aria-hidden="true" />}
              <button
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
