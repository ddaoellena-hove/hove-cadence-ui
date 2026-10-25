import { useState, type ReactNode } from "react";
import {
  AppLayout, Sidebar, PageHeader, Breadcrumbs, PrimaryButton, Toaster, Icons,
} from "@ddaoellena/cadence-ui";

// Pattern — Coque d'application (P1).
// AppLayout (repère `main` nommé) + Sidebar (repère `nav` nommé, périmètre et
// utilisateur en pied) + PageHeader (unique `h1`) + Toaster monté une seule
// fois à la racine. Le contenu de chaque page vit dans `children`.
export const CoquePattern = ({ children }: { children?: ReactNode } = {}) => {
  const [reseau, setReseau] = useState("bordeaux");

  return (
    <AppLayout
      sidebar={
        <Sidebar
          product="datahub"
          clientName="Bordeaux Métropole"
          activeId="scenarios"
          onItemClick={() => {}}
          sections={[
            { id: "home", label: "Accueil", icon: <Icons icon="home" size={20} /> },
            {
              id: "disruptions", label: "Perturbations", icon: <Icons icon="alert-triangle" size={20} />,
              items: [
                { id: "scenarios", label: "Scénarios" },
                { id: "history", label: "Historique" },
              ],
            },
            { id: "settings", label: "Paramètres", icon: <Icons icon="settings-01" size={20} /> },
          ]}
          scope={{
            options: [
              { id: "bordeaux", label: "Bordeaux Métropole" },
              { id: "lyon", label: "Lyon TCL" },
            ],
            value: reseau,
            onChange: setReseau,
          }}
          user={{ name: "Hector Malot" }}
          onLogout={() => {}}
        />
      }
    >
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ id: "home", label: "Accueil" }, { id: "scenarios", label: "Scénarios" }]} />}
        title="Scénarios de perturbation"
        subtitle="Planifiez et suivez les perturbations du réseau."
        actions={<PrimaryButton label="Créer un scénario" onClick={() => {}} />}
      />
      {children ?? <p style={{ color: "var(--cadence-color-text-secondary, #607075)" }}>Le contenu de la page s'insère ici (liste, formulaire, tableau de bord…).</p>}

      {/* Une seule pile de notifications pour toute l'app ; useToast() ailleurs. */}
      <Toaster />
    </AppLayout>
  );
};
