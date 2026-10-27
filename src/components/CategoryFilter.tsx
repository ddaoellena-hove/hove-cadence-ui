import { useRef, type KeyboardEvent, type ReactNode } from "react";
import "./category-filter.css";

export interface CategoryFilterItem {
  /** Identifiant unique de la catégorie, renvoyé par `onChange`. */
  id: string;
  /** Libellé visible (deux lignes réservées, retour à la ligne sans troncature). */
  label: string;
  /** Effectif de la catégorie, formaté en français (`1 234`). 0 reste affiché. */
  count: number;
  /** Pictogramme décoratif (`<Icons />`, `<ModeIcon />` ou SVG métier). */
  icon?: ReactNode;
  /** Catégorie indisponible : grisée, ni cliquable ni atteignable au clavier. */
  disabled?: boolean;
}

export interface CategoryFilterProps {
  /** Catégories proposées, dans l'ordre d'affichage. */
  items: CategoryFilterItem[];
  /** Identifiant de la catégorie sélectionnée (contrôlé ; une catégorie est toujours sélectionnée). */
  value: string;
  /** Sélection d'une autre catégorie. Non appelé quand on reclique la catégorie active. */
  onChange: (id: string) => void;
  /** Nom accessible du groupe (ex. « Catégories du catalogue »). */
  "aria-label": string;
  className?: string;
}

const countFormat = new Intl.NumberFormat("fr-FR");

/**
 * CategoryFilter — filtre exclusif par catégorie : une grille de tuiles
 * compactes (picto + libellé, effectif dessous), chacune entièrement cliquable.
 * Pour choisir la catégorie affichée par le tableau situé dessous.
 *
 * Sémantique de groupe radio : `radiogroup` nommé, chaque tuile est un `radio`
 * (`aria-checked`). Une seule tuile dans l'ordre de tabulation ; flèches,
 * Home/End déplacent le focus et sélectionnent, en sautant les tuiles
 * désactivées. La sélection est obligatoire : recliquer l'active ne fait rien.
 */
export const CategoryFilter = ({
  items,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: CategoryFilterProps) => {
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: string) => {
    if (id !== value) onChange(id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    // Les catégories désactivées sont sautées.
    const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
    if (enabled.length === 0) return;
    const pos = enabled.indexOf(idx);
    let next: number;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": next = enabled[(pos + 1) % enabled.length]; break;
      case "ArrowLeft": case "ArrowUp": next = enabled[(pos - 1 + enabled.length) % enabled.length]; break;
      case "Home": next = enabled[0]; break;
      case "End": next = enabled[enabled.length - 1]; break;
      default: return;
    }
    e.preventDefault();
    tileRefs.current[next]?.focus();
    select(items[next].id);
  };

  // Tuile tabulable : la sélectionnée si elle est active, sinon la première disponible.
  const selectedIdx = items.findIndex((item) => item.id === value && !item.disabled);
  const tabbableIdx = selectedIdx >= 0 ? selectedIdx : items.findIndex((item) => !item.disabled);

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={["category-filter", className].filter(Boolean).join(" ")}
    >
      {items.map((item, idx) => {
        const checked = item.id === value;
        const count = countFormat.format(item.count);
        return (
          <button
            key={item.id}
            ref={(el) => { tileRefs.current[idx] = el; }}
            type="button"
            role="radio"
            aria-checked={checked}
            className={[
              "category-filter__tile",
              checked ? "category-filter__tile--selected" : "",
              item.count === 0 ? "category-filter__tile--empty" : "",
            ].filter(Boolean).join(" ")}
            // Nom explicite « Lignes, 1 984 » : le contenu en blocs flex ferait
            // varier la ponctuation d'un navigateur à l'autre.
            aria-label={`${item.label}, ${count}`}
            disabled={item.disabled}
            tabIndex={idx === tabbableIdx ? 0 : -1}
            onClick={() => select(item.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
          >
            <span className="category-filter__head">
              {item.icon != null && (
                <span className="category-filter__icon" aria-hidden="true">{item.icon}</span>
              )}
              <span className="category-filter__label">{item.label}</span>
            </span>
            <span className="category-filter__count">{count}</span>
          </button>
        );
      })}
    </div>
  );
};
