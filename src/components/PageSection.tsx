/**
 * PageSection — section de page : un titre `h2` (ou `h3`/`h4`), une description
 * et des actions optionnelles, au-dessus d'un contenu empilé. Remplace le
 * `<section>` + `<h2>` en style inline répété dans les recettes.
 *
 * Nommée par son titre (`aria-labelledby`) : c'est un repère `region`.
 */
import { useId, type ReactNode } from "react";
import { Icons, type IconName } from "./Icons";
import "./page-section.css";

export interface PageSectionProps {
  /** Titre de la section (porte le repère). */
  title: string;
  /** Niveau de titre. Défaut 2. */
  headingLevel?: 2 | 3 | 4;
  icon?: IconName;
  iconElement?: ReactNode;
  iconTone?: "label" | "muted" | "accent";
  /** Description sous le titre. */
  description?: string;
  /** Actions alignées à droite du titre. */
  actions?: ReactNode;
  /** Espacement vertical (échelle 4/8/12/16/20/24/32/48). Défaut 20. */
  gap?: number;
  /**
   * "card" : section en carte — bordure, rayon, fond blanc, en-tête rembourré
   * séparé du corps par un filet. Le corps n'a pas de padding imposé (tableau ou
   * liste bord à bord) ; `gap` espace ses enfants. Défaut "none" (section nue).
   */
  surface?: "none" | "card";
  children: ReactNode;
  id?: string;
  className?: string;
}

export const PageSection = ({
  title,
  headingLevel = 2,
  icon, iconElement, iconTone = "label",
  description,
  actions,
  gap = 20,
  surface = "none",
  children,
  id,
  className,
}: PageSectionProps) => {
  const reactId = useId();
  const headingId = `${id ?? "section"}-${reactId}`;
  const Heading = `h${headingLevel}` as const;

  return (
    <section
      id={id}
      className={["page-section", surface === "card" ? "page-section--card" : "", className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
      // En carte, l'en-tête est séparé du corps par un filet, pas par un espace
      style={{ gap: surface === "card" ? 0 : gap }}
    >
      <div className={`page-section__head${icon || iconElement ? " page-section__head--icon" : ""}`}>
        {(iconElement || icon) && <span aria-hidden="true" className={`page-section__icon page-section__icon--${iconTone}`}>{iconElement ?? <Icons icon={icon!} size={20} />}</span>}
        <div className="page-section__titles">
          <Heading id={headingId} className={`page-section__heading page-section__heading--${headingLevel}`}>
            {title}
          </Heading>
          {description && <p className="page-section__description">{description}</p>}
        </div>
        {actions && <div className="page-section__actions">{actions}</div>}
      </div>
      <div className="page-section__body" style={{ gap }}>
        {children}
      </div>
    </section>
  );
};
