/**
 * FormActions — barre d'actions de formulaire. Alignée à droite par défaut,
 * gap 8. Ordre attendu des enfants : `Link` (tertiaire) → `GhostButton`
 * (secondaire) → `PrimaryButton` (principal, en dernier).
 *
 * `justify="between"` pour un pied d'assistant (Précédent à gauche, Suivant à
 * droite).
 */
import type { ReactNode } from "react";
import "./form-actions.css";

export interface FormActionsProps {
  children: ReactNode;
  /** Alignement. Défaut "end" (à droite). */
  justify?: "end" | "between" | "start";
  /** Espacement (échelle). Défaut 8. */
  gap?: number;
  className?: string;
}

export const FormActions = ({ children, justify = "end", gap = 8, className }: FormActionsProps) => (
  <div className={["form-actions", `form-actions--${justify}`, className].filter(Boolean).join(" ")} style={{ gap }}>
    {children}
  </div>
);
