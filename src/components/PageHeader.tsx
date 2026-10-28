import { useEffect, useRef, useState, type ReactNode } from "react";
import "./page-header.css";

export interface PageHeaderProps {
  /** Fil d'Ariane au-dessus du titre (`<Breadcrumbs />`). */
  breadcrumbs?: ReactNode;
  /** Titre de la page (rendu en `<h1>`). */
  title: string;
  /** Ligne sous le titre : contexte, date de mise à jour… */
  subtitle?: ReactNode;
  /** Actions à droite : sélecteurs en variante bouton, boutons `sm`. */
  actions?: ReactNode;
  /** Reste collé en haut de l'écran au défilement. Défaut `true`. */
  tabs?: ReactNode;
  tabsActions?: ReactNode;
  sticky?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
}

/**
 * En-tête de page : titre, sous-titre et actions sur une ligne. Collé en haut
 * du conteneur au défilement ; un liseré apparaît quand le contenu passe dessous.
 */
export const PageHeader = ({ breadcrumbs, title, subtitle, actions, tabs, tabsActions, sticky = true, className }: PageHeaderProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // Repère juste avant l'en-tête : dès qu'il sort de la zone visible, le contenu
  // défile sous l'en-tête collé
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sticky || !sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sticky]);

  const rootClass = [
    "page-header",
    sticky ? "page-header--sticky" : "",
    sticky && stuck ? "page-header--stuck" : "",
    tabs ? "page-header--tabs" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {sticky && <div ref={sentinelRef} className="page-header__sentinel" aria-hidden="true" />}
      <header className={rootClass}>
        <div className="page-header__text">
          {breadcrumbs && <div className="page-header__breadcrumbs">{breadcrumbs}</div>}
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
        {tabs && <div className="page-header__tabs"><div className="page-header__tab-list">{tabs}</div>{tabsActions && <div className="page-header__actions">{tabsActions}</div>}</div>}
      </header>
    </>
  );
};
