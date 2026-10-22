import { useInTabList } from "./tab-list-context";
import "./secondary-tab.css";

export interface SecondaryTabProps {
  /** Texte de l'onglet. */
  label: string;
  /** Compteur optionnel affiché entre parenthèses après le libellé (ex. « (4) »). */
  count?: number;
  /** État visuel de l'onglet. */
  variant?: "default" | "active";
  /** Handler de clic. */
  onClick?: () => void;
  /** Désactive l'interaction. */
  disabled?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
  /** `id` du bouton onglet (cible de `aria-labelledby` côté panneau). */
  id?: string;
  /** `id` du panneau contrôlé → `aria-controls`. */
  controls?: string;
}

/**
 * SecondaryTab — onglet de sous-navigation (niveau 2), à placer sous une rangée
 * de `SegmentedControl`. Style ghost (comme `GhostButton`) : pastille douce sur l'onglet
 * actif, inactifs en gris, compteur optionnel. Composant item-level : on rend un
 * `<SecondaryTab>` par onglet dans une rangée.
 */
export const SecondaryTab = ({
  label,
  count,
  variant = "default",
  onClick,
  disabled = false,
  className,
  id,
  controls,
}: SecondaryTabProps) => {
  const inTabList = useInTabList("SecondaryTab");
  const active = variant === "active";
  const rootClass = [
    "secondary-tab",
    `secondary-tab--${variant}`,
    disabled ? "secondary-tab--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={rootClass}
      onClick={onClick}
      disabled={disabled}
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      // Roving tabindex dans un TabList : seul l'onglet actif est tabulable
      tabIndex={inTabList ? (active ? 0 : -1) : undefined}
    >
      <span className="secondary-tab__label">
        {label}
        {count !== undefined && (
          <span className="secondary-tab__count"> ({count})</span>
        )}
      </span>
    </button>
  );
};
