import type { ReactNode } from "react";
import "./app-layout.css";
import "./scrollbar.css";

export interface AppLayoutProps {
  /** La `Sidebar` de l'app. Sa couleur produit devient le fond de l'app. */
  sidebar: ReactNode;
  /** Contenu de la page, affiché dans le conteneur blanc. */
  children: ReactNode;
  /** Libellé de la zone de contenu pour les lecteurs d'écran. Défaut « Contenu principal ». */
  contentLabel?: string;
  /** Classe CSS additionnelle. */
  className?: string;
}

/**
 * Squelette d'application : la Sidebar à gauche, fondue dans le fond de l'app,
 * et le contenu de la page dans un conteneur blanc arrondi, bordé d'un liseré.
 * Le conteneur suit la largeur de la Sidebar (dépliée ou repliée) sans mesure :
 * les deux sont dans la même ligne flex. Seule la zone intérieure du conteneur
 * défile, et ses barres de scroll restent dans l'arrondi.
 */
export const AppLayout = ({ sidebar, children, contentLabel = "Contenu principal", className }: AppLayoutProps) => {
  const rootClass = ["app-layout", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div className="app-layout__sidebar">{sidebar}</div>
      <main className="app-layout__main" aria-label={contentLabel}>
        {/* Cadre arrondi (coupe ce qui dépasse) + zone qui défile : les barres de
            scroll restent dans l'arrondi */}
        <div className="app-layout__container">
          <div className="app-layout__scroll cadence-scrollbar">{children}</div>
        </div>
      </main>
    </div>
  );
};
