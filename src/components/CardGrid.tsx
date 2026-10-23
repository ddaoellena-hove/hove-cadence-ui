/**
 * CardGrid — grille fluide de cartes / graphiques (`auto-fill` par défaut,
 * `minmax(min, 1fr)`, gap 16). Remplace le `<div style="display:grid;…">`
 * recréé à la main dans les tableaux de bord. Jamais de largeur fixe : les
 * cartes suivent leur conteneur.
 */
import type { ReactNode } from "react";
import "./card-grid.css";

export interface CardGridProps {
  children: ReactNode;
  /** Largeur mini d'une colonne (px). Défaut 240. */
  min?: number;
  /** Espacement (échelle). Défaut 16. */
  gap?: number;
  /** `auto-fit` étire les colonnes pour remplir la dernière rangée. Défaut `auto-fill`. */
  fit?: boolean;
  className?: string;
}

export const CardGrid = ({ children, min = 240, gap = 16, fit = false, className }: CardGridProps) => (
  <div
    className={["card-grid", className].filter(Boolean).join(" ")}
    style={{ gap, gridTemplateColumns: `repeat(${fit ? "auto-fit" : "auto-fill"}, minmax(min(${min}px, 100%), 1fr))` }}
  >
    {children}
  </div>
);
