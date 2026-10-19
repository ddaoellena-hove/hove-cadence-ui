import { ICONS, type IconName } from "./icon-registry";
import "./icons.css";

export type { IconName };

export interface IconsProps {
  /** Nom de l'icône (voir le registre `icon-registry.ts`). */
  icon: IconName;

  /** Classe CSS additionnelle appliquée au `<svg>`. */
  className?: string;

  /** Taille de l'icône en px (largeur = hauteur). Défaut : 24. */
  size?: number;

  /** Couleur du trait. Défaut : `"currentColor"` (hérite de la couleur du texte). */
  color?: string;

  /**
   * Texte accessible. Si fourni, l'icône passe en `role="img"` + `aria-label`.
   * Sinon, elle est `aria-hidden`.
   */
  title?: string;

  /**
   * @deprecated Conservé pour compatibilité ascendante — ignoré.
   * Les icônes ne sont plus chargées depuis une URL.
   */
  iconMap?: string;
}

/**
 * Icône du design system — rend un SVG inline issu de `@untitledui/icons`.
 * Aucune requête réseau ; l'icône suit `currentColor` par défaut.
 */
export const Icons = ({
  icon = "search-md",
  className,
  size = 24,
  color = "currentColor",
  title,
}: IconsProps) => {
  const Component = ICONS[icon] ?? ICONS["search-md"];
  const classes = ["icons", className].filter(Boolean).join(" ");

  // Accessibilité : décoratif par défaut, sinon exposé comme image nommée.
  const a11y = title
    ? { role: "img" as const, "aria-label": title, "aria-hidden": undefined }
    : { "aria-hidden": true as const };

  return <Component className={classes} size={size} color={color} {...a11y} />;
};
