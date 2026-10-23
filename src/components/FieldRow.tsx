/**
 * FieldRow — rangée de champs de formulaire alignés par le bas, largeurs
 * égales, gap 12. Remplace le `<div style="display:flex;gap:12">` + `flex:1`
 * recréé à la main dans les formulaires.
 *
 * ⚠️ Une rangée de champs ne mélange pas les gabarits de hauteur (40 px) avec
 * des contrôles compacts (29 px) — voir « Hauteurs de contrôle ».
 */
import type { ReactNode } from "react";
import "./field-row.css";

export interface FieldRowProps {
  children: ReactNode;
  /** Espacement horizontal (échelle). Défaut 12. */
  gap?: number;
  className?: string;
}

export const FieldRow = ({ children, gap = 12, className }: FieldRowProps) => (
  <div className={["field-row", className].filter(Boolean).join(" ")} style={{ gap }}>
    {children}
  </div>
);
