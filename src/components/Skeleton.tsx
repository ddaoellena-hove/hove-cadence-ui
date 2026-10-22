/**
 * Skeleton component.
 *
 * Forme animée qui réserve la place d'un contenu en cours de chargement.
 * Purement décoratif (`aria-hidden`) : c'est le conteneur qui porte
 * `aria-busy="true"` pour annoncer le chargement aux lecteurs d'écran.
 */
import type { CSSProperties } from "react";
import "./skeleton.css";

export interface SkeletonProps {
  /** Forme. Défaut "text". */
  variant?: "text" | "rect" | "circle";
  /** `variant="text"` : nombre de lignes (la dernière est plus courte). Défaut 3. */
  lines?: number;
  /** Largeur : nombre (px) ou unité CSS (« 60% »). "circle" : diamètre. */
  width?: number | string;
  /** Hauteur : nombre (px) ou unité CSS. "circle" : ignorée (= `width`). */
  height?: number | string;
  /** Classe CSS additionnelle. */
  className?: string;
  /** Échappatoire de style en ligne. */
  style?: CSSProperties;
}

/** Normalise une dimension : un nombre devient des px, une chaîne passe telle quelle. */
const toSize = (value: number | string | undefined): string | undefined =>
  typeof value === "number" ? `${value}px` : value;

export const Skeleton = ({
  variant = "text",
  lines = 3,
  width,
  height,
  className,
  style,
}: SkeletonProps) => {
  const rootClass = ["skeleton", `skeleton--${variant}`, className].filter(Boolean).join(" ");

  // Plusieurs lignes de texte : la dernière est raccourcie pour évoquer un paragraphe.
  if (variant === "text") {
    return (
      <span className={rootClass} aria-hidden="true" style={{ width: toSize(width), ...style }}>
        {Array.from({ length: Math.max(1, lines) }, (_, i) => (
          <span
            key={i}
            className="skeleton__line"
            style={i === lines - 1 && lines > 1 ? { width: "60%" } : undefined}
          />
        ))}
      </span>
    );
  }

  // circle : la largeur fait aussi la hauteur ; rect : largeur et hauteur libres.
  const resolvedWidth = toSize(width);
  const resolvedHeight = variant === "circle" ? resolvedWidth : toSize(height);

  return (
    <span
      className={rootClass}
      aria-hidden="true"
      style={{ width: resolvedWidth, height: resolvedHeight, ...style }}
    />
  );
};
