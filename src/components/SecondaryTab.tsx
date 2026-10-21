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
}

/**
 * SecondaryTab — onglet de sous-navigation (niveau 2), à placer sous une rangée
 * de `Tab`. Style ghost (comme `GhostButton`) : pastille douce sur l'onglet
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
}: SecondaryTabProps) => {
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
      aria-selected={variant === "active"}
      role="tab"
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
