import type { ReactNode } from "react";
import { AppLayout, Sidebar, Icons } from "../../components";

/**
 * Coque de démonstration (AppLayout + Sidebar) pour les stories de pattern :
 * fournit les repères `main` (nommé) et `nav` (nommé). Le gabarit du pattern
 * est le contenu de la page.
 */
export const Shell = ({ children, active = "disruptions" }: { children: ReactNode; active?: string }) => (
  <AppLayout
    contentLabel="Contenu de la page"
    sidebar={
      <Sidebar
        product="datahub"
        clientName="Bordeaux Métropole"
        activeId={active}
        sections={[
          { id: "home", label: "Accueil", icon: <Icons icon="home" size={20} /> },
          { id: "disruptions", label: "Perturbations", icon: <Icons icon="alert-triangle" size={20} /> },
          { id: "planning", label: "Planification", icon: <Icons icon="calendar" size={20} /> },
          { id: "settings", label: "Paramètres", icon: <Icons icon="settings-01" size={20} /> },
        ]}
        user={{ name: "Hector Malot" }}
      />
    }
  >
    {children}
  </AppLayout>
);
