import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useId,
  type ReactNode,
} from "react";
import { Badge } from "./Badge";
import "./autocomplete.css";
import "./scrollbar.css";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AutocompleteOption {
  /** Identifiant unique de l'option. */
  id: string;
  /** Libellé affiché et filtré. */
  label: string;
  /** Ligne secondaire (adresse, ville…) affichée sous le libellé. */
  description?: string;
  /**
   * Catégorie de l'option. Les options partageant le même `group` sont
   * regroupées sous un en-tête. L'ordre des groupes suit leur première apparition.
   */
  group?: string;
  /** Icône optionnelle rendue avant le libellé. */
  icon?: ReactNode;
  /** Contenu libre rendu sous le libellé (ex. badges de lignes). */
  content?: ReactNode;
  /** Désactive la sélection de cette option. */
  disabled?: boolean;
}

export interface AutocompleteProps {
  /** Liste complète des options (filtrée en interne selon la saisie). */
  options: AutocompleteOption[];
  /** Label affiché au-dessus du champ (même style que TextInput). */
  label?: string;
  /** Texte affiché quand le champ est vide. */
  placeholder?: string;
  /**
   * Sélection multiple. Avec `false` (défaut), `value` est un `string` (id) ;
   * avec `true`, `value` est un `string[]` (ids).
   */
  multiple?: boolean;
  /**
   * Valeur sélectionnée.
   * Simple : id de l'option (`string`). Multiple : tableau d'ids (`string[]`).
   */
  value?: string | string[];
  /**
   * Appelé à chaque changement de sélection.
   * Simple : `(id: string | null)`. Multiple : `(ids: string[])`.
   */
  onChange?: (value: string | string[] | null) => void;
  /** Désactive le champ. */
  disabled?: boolean;
  /** Ouvre le menu dès le montage (ex. afficher favoris / historique au focus). */
  defaultOpen?: boolean;
  /** Message affiché quand le filtre ne renvoie aucune option. */
  noResultsLabel?: string;
  /** Classe CSS additionnelle. */
  onInputChange?: (query: string) => void;
  /** false : résultats déjà filtrés et ordonnés par l'application. */
  filter?: boolean;
  minChars?: number;
  loading?: boolean;
  limit?: number;
  className?: string;
}

// ── Icons ────────────────────────────────────────────────────────────────────

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className="autocomplete__chevron"
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

// ── Component ────────────────────────────────────────────────────────────────

export const Autocomplete = ({
  options,
  label,
  placeholder = "Rechercher…",
  multiple = false,
  value,
  onChange,
  disabled = false,
  defaultOpen = false,
  noResultsLabel = "Aucun résultat",
  onInputChange, filter = true, minChars = 0, loading = false, limit,
  className,
}: AutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  // Normalisation de la valeur en tableau d'ids
  const selectedIds = useMemo<string[]>(() => {
    if (multiple) return Array.isArray(value) ? value : [];
    return typeof value === "string" && value ? [value] : [];
  }, [value, multiple]);

  // Garder les libellés sélectionnés quand une réponse distante remplace les options.
  const [snapshot, setSnapshot] = useState(options);
  const [retained, setRetained] = useState<AutocompleteOption[]>([]);
  const knownOptions = [...options, ...retained];
  if (snapshot !== options) {
    setSnapshot(options);
    setRetained([...snapshot, ...retained].filter((o, i, all) => selectedIds.includes(o.id) && all.findIndex(x => x.id === o.id) === i));
  }
  const selectedOption = !multiple
    ? knownOptions.find((o) => o.id === selectedIds[0])
    : undefined;

  // Le texte affiché dans l'input en mode simple = libellé sélectionné, sauf si l'utilisateur tape
  const showSelectedLabel = !multiple && selectedOption && query === "";
  const inputDisplay = showSelectedLabel ? selectedOption.label : query;

  // Options filtrées
  const filtered = useMemo(() => {
    const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const q = normalize(query.trim());
    if (loading || query.trim().length < minChars) return [];
    return options.filter((o) => {
      // En multiple, on masque les options déjà sélectionnées (affichées en Badge)
      if (multiple && selectedIds.includes(o.id)) return false;
      if (!filter || q === "") return true;
      return normalize(`${o.label} ${o.description ?? ""}`).includes(q);
    }).slice(0, limit === undefined ? undefined : Math.max(0, Math.floor(limit)));
  }, [options, query, multiple, selectedIds, filter, minChars, loading, limit]);

  // Fermeture au clic extérieur + réinitialisation de la saisie non validée (choix strict)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (query !== "") { setQuery(""); onInputChange?.(""); }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onInputChange, query]);

  // Nouvelle recherche ou ouverture / fermeture : on revient à la 1re option
  const highlightKey = `${query}\u0000${isOpen}`;
  const [lastHighlightKey, setLastHighlightKey] = useState(highlightKey);
  if (highlightKey !== lastHighlightKey) {
    setLastHighlightKey(highlightKey);
    setHighlight(0);
  }

  const activeIndex = filtered[highlight] && !filtered[highlight].disabled ? highlight : filtered.findIndex(o => !o.disabled);
  useEffect(() => {
    if (isOpen && activeIndex >= 0) document.getElementById(`${fieldId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex, fieldId]);
  const updateQuery = (next: string) => { setQuery(next); onInputChange?.(next); };
  const open = () => {
    if (!disabled) setIsOpen(true);
  };

  const commitSelection = (option: AutocompleteOption) => {
    if (disabled || loading || option.disabled) return;
    if (multiple) {
      const next = selectedIds.includes(option.id)
        ? selectedIds.filter((id) => id !== option.id)
        : [...selectedIds, option.id];
      onChange?.(next);
      updateQuery("");
      inputRef.current?.focus();
    } else {
      onChange?.(option.id);
      updateQuery("");
      setIsOpen(false);
    }
  };

  const removeChip = (id: string) => {
    if (disabled) return;
    onChange?.(selectedIds.filter((x) => x !== id));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      open();
      const enabled = filtered.map((o, i) => o.disabled ? -1 : i).filter(i => i >= 0);
      const position = enabled.indexOf(activeIndex);
      const next = !isOpen ? (e.key === "ArrowDown" ? 0 : enabled.length - 1) : Math.max(0, Math.min(enabled.length - 1, position + (e.key === "ArrowDown" ? 1 : -1)));
      setHighlight(enabled[next] ?? 0);
    } else if (e.key === "Enter" && isOpen) {
      e.preventDefault();
      const option = filtered[activeIndex];
      if (option) commitSelection(option);
    } else if (e.key === "Escape") {
      if (isOpen) e.stopPropagation();
      setIsOpen(false);
      updateQuery("");
    } else if (
      e.key === "Backspace" &&
      multiple &&
      query === "" &&
      selectedIds.length > 0
    ) {
      removeChip(selectedIds[selectedIds.length - 1]);
    }
  };

  const rootClass = [
    "autocomplete",
    isOpen ? "autocomplete--open" : "",
    disabled ? "autocomplete--disabled" : "",
    multiple ? "autocomplete--multiple" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} ref={containerRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) { setIsOpen(false); updateQuery(""); }
    }}>
      {label && (
        <label className="autocomplete__label" htmlFor={fieldId}>
          {label}
        </label>
      )}

      <div className="autocomplete__field" onClick={() => inputRef.current?.focus()}>
        {/* Chips (mode multiple) */}
        {multiple &&
          selectedIds.map((id) => {
            const opt = knownOptions.find((o) => o.id === id);
            if (!opt) return null;
            return (
              <Badge
                key={id}
                label={opt.label}
                dismissible={!disabled}
                onDismiss={() => removeChip(id)}
              />
            );
          })}

        {/* Icône de l'option sélectionnée (mode simple) */}
        {showSelectedLabel && selectedOption?.icon && (
          <span className="autocomplete__value-icon">{selectedOption.icon}</span>
        )}

        <input
          ref={inputRef}
          id={fieldId}
          type="text"
          className="autocomplete__input"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${fieldId}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={isOpen && activeIndex >= 0 ? `${fieldId}-option-${activeIndex}` : undefined}
          aria-describedby={isOpen && (loading || query.trim().length < minChars) ? `${fieldId}-status` : undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={selectedIds.length === 0 ? placeholder : ""}
          value={inputDisplay}
          onChange={(e) => {
            updateQuery(e.target.value);
            open();
          }}
          onFocus={open}
          onKeyDown={handleKeyDown}
        />

        <ChevronIcon open={isOpen} />
      </div>

      {isOpen && <span id={`${fieldId}-status`} className="autocomplete__status" role="status">{loading ? "Chargement des résultats…" : query.trim().length < minChars ? `Saisissez au moins ${minChars} caractères.` : `${filtered.length} résultat${filtered.length > 1 ? "s" : ""}`}</span>}
      {isOpen && (
        <ul
          className="autocomplete__menu cadence-scrollbar"
          id={`${fieldId}-listbox`}
          role="listbox"
          aria-busy={loading || undefined}
          aria-label={label ?? "Options"}
        >
          {filtered.length === 0 ? (
            <li className="autocomplete__empty" role="presentation">
              {loading ? "Chargement…" : query.trim().length < minChars ? `Saisissez au moins ${minChars} caractères.` : noResultsLabel}
            </li>
          ) : (
            filtered.map((option, index) => {
              const isSelected = selectedIds.includes(option.id);
              const prevGroup = index > 0 ? filtered[index - 1].group : undefined;
              const showHeader = option.group && option.group !== prevGroup;
              const hasBody = option.description || option.content;
              return (
                <li key={option.id} role="presentation">
                  {showHeader && (
                    <div className="autocomplete__group-label" role="presentation">
                      {option.group}
                    </div>
                  )}
                  <button
                    type="button"
                    role="option"
                    id={`${fieldId}-option-${index}`}
                    tabIndex={-1}
                    onMouseDown={(event) => event.preventDefault()}
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    disabled={option.disabled}
                    className={[
                      "autocomplete__option",
                      index === activeIndex ? "autocomplete__option--highlighted" : "",
                      option.disabled ? "autocomplete__option--disabled" : "",
                      isSelected ? "autocomplete__option--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => commitSelection(option)}
                  >
                    {option.icon && (
                      <span className="autocomplete__option-icon">{option.icon}</span>
                    )}
                    {hasBody ? (
                      <span className="autocomplete__option-body">
                        <span className="autocomplete__option-label">{option.label}</span>
                        {option.description && (
                          <span className="autocomplete__option-description">{option.description}</span>
                        )}
                        {option.content && (
                          <span className="autocomplete__option-content">{option.content}</span>
                        )}
                      </span>
                    ) : (
                      <span className="autocomplete__option-label">{option.label}</span>
                    )}
                    {isSelected && (
                      <span className="autocomplete__option-check">
                        <CheckIcon />
                      </span>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};
