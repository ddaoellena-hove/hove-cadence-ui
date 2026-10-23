import { MODE_ICON_PATHS, type ModeName } from "./mode-icons";
import "./icons.css";

export type { ModeName };

export interface ModeIconProps {
  /** Mode de transport (voir `mode-icons.ts` pour la liste). */
  mode: ModeName;
  /** Taille en px (largeur = hauteur). Défaut 24. */
  size?: number;
  /** Couleur de remplissage. Défaut `"currentColor"` (suit la couleur du texte). */
  color?: string;
  /** Classe CSS additionnelle. */
  className?: string;
  /**
   * Texte accessible. Si fourni : `role="img"` + `aria-label`. Sinon
   * `aria-hidden` (picto décoratif, le sens est porté par le texte voisin).
   */
  title?: string;
}

/**
 * ModeIcon — pictogramme **rempli** d'un mode de transport (métro, vélo,
 * marche, voiture, place…). Gabarit 80, suit `currentColor`, aucune requête
 * réseau. Famille distincte des icônes d'interface en trait (`Icons`).
 */
export const ModeIcon = ({ mode, size = 24, color = "currentColor", className, title }: ModeIconProps) => {
  const a11y = title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true as const };

  return (
    <svg
      className={["icons", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      {MODE_ICON_PATHS[mode]}
    </svg>
  );
};
