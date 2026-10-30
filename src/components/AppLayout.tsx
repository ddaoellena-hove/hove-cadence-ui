import { useLayoutEffect, useRef, type ReactNode } from "react";
import "./app-layout.css";
import "./scrollbar.css";

export interface AppLayoutProps {
  /** La `Sidebar` de l'app. Sa couleur produit devient le fond de l'app. */
  sidebar: ReactNode;
  /** Contenu de la page, affiché dans le conteneur blanc. */
  children: ReactNode;
  /** Libellé de la zone de contenu pour les lecteurs d'écran. Défaut « Contenu principal ». */
  contentLabel?: string;
  /**
   * Barre d'actions persistante du formulaire en cours : en bas du conteneur,
   * hors de la zone qui défile. Pas un pied de site : voir `PageFooter`.
   */
  actionBar?: ReactNode;
  /** Padding de la barre. "none" : l'app gère ses marges (progression bord à bord). Défaut "default". */
  actionBarPadding?: "default" | "none";
  /** Classe CSS additionnelle. */
  className?: string;
}

/** Distance entre le bas de la fenêtre et le haut de la barre, lue par toaster.css. */
const ACTION_BAR_OFFSET_VAR = "--cadence-app-action-bar-offset";

/**
 * Squelette d'application : la Sidebar à gauche, fondue dans le fond de l'app,
 * et le contenu de la page dans un conteneur blanc arrondi, bordé d'un liseré.
 * Le conteneur suit la largeur de la Sidebar (dépliée ou repliée) sans mesure :
 * les deux sont dans la même ligne flex. Seule la zone intérieure du conteneur
 * défile, et ses barres de scroll restent dans l'arrondi. La barre `actionBar` suit
 * ce conteneur ; sa hauteur courante décale les toasts pour ne pas la recouvrir.
 */
export const AppLayout = ({ sidebar, children, contentLabel = "Contenu principal", actionBar, actionBarPadding = "default", className }: AppLayoutProps) => {
  const rootClass = ["app-layout", className].filter(Boolean).join(" ");
  const actionBarRef = useRef<HTMLDivElement>(null);
  const hasActionBar = actionBar != null;

  // Hauteur mesurée, pas figée : traductions longues et retour à la ligne mobile
  // la font varier. Le Toaster est en position fixe : la valeur passe par la racine.
  useLayoutEffect(() => {
    const el = actionBarRef.current;
    if (!hasActionBar || !el) return;
    const root = document.documentElement;
    const update = () => {
      root.style.setProperty(ACTION_BAR_OFFSET_VAR, `${Math.ceil(window.innerHeight - el.getBoundingClientRect().top)}px`);
    };
    update();
    window.addEventListener("resize", update);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(el);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty(ACTION_BAR_OFFSET_VAR);
    };
  }, [hasActionBar]);

  return (
    <div className={rootClass}>
      <div className="app-layout__sidebar">{sidebar}</div>
      <main className="app-layout__main" aria-label={contentLabel}>
        {/* Cadre arrondi (coupe ce qui dépasse) + zone qui défile : les barres de
            scroll restent dans l'arrondi */}
        <div className="app-layout__container">
          <div className="app-layout__scroll cadence-scrollbar">{children}</div>
          {hasActionBar && (
            <div ref={actionBarRef} className={`app-layout__action-bar${actionBarPadding === "none" ? " app-layout__action-bar--flush" : ""}`}>
              {actionBar}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
