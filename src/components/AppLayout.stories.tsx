import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AppLayout } from "./AppLayout";
import { Sidebar, type SidebarNavSection, type SidebarProduct } from "./Sidebar";
import { Icons } from "./Icons";
import { PrimaryButton } from "./PrimaryButton";
import { Card } from "./Card";
import { PageHeader } from "./PageHeader";
import { PageFooter } from "./PageFooter";
import { PageSection } from "./PageSection";
import { TextInput } from "./TextInput";
import { GhostButton } from "./GhostButton";
import { FormActions } from "./FormActions";
import { ProgressBar } from "./ProgressBar";
import { Stepper } from "./Stepper";
import { Toaster } from "./Toaster";
import { useToast } from "./useToast";

const meta: Meta<typeof AppLayout> = {
  title: "Composants/Structure et mise en page/AppLayout",
  component: AppLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof AppLayout>;

const SECTIONS: SidebarNavSection[] = [
  { id: "home", label: "Accueil", icon: <Icons icon="home" size={20} /> },
  {
    id: "disruptions",
    label: "Perturbations",
    icon: <Icons icon="alert-triangle" size={20} />,
    items: [
      { id: "scenarios", label: "Scénarios" },
      { id: "history", label: "Historique" },
    ],
  },
  { id: "map", label: "Carte", icon: <Icons icon="map-01" size={20} /> },
  { id: "users", label: "Utilisateurs", icon: <Icons icon="users-01" size={20} /> },
  { id: "settings", label: "Paramètres", icon: <Icons icon="settings-01" size={20} /> },
];

const RESEAUX = [
  { id: "bordeaux", label: "Bordeaux — TBM" },
  { id: "rennes", label: "Rennes — STAR" },
];

/** Sidebar complète, pilotée par la story. */
const AppSidebar = ({ product = "datahub" }: { product?: SidebarProduct }) => {
  const [activeId, setActiveId] = useState("scenarios");
  const [reseau, setReseau] = useState("bordeaux");
  return (
    <Sidebar
      product={product}
      clientName="Bordeaux Métropole"
      sections={SECTIONS}
      activeId={activeId}
      onItemClick={setActiveId}
      scope={{ options: RESEAUX, value: reseau, onChange: setReseau }}
      user={{ name: "Hector Malot" }}
    />
  );
};

/** Contenu de page d'exemple : titre, action principale, cartes. */
const PageContent = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <PageHeader title="Scénarios" actions={<PrimaryButton iconStart="plus" label="Créer un scénario" />} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
      <Card headingLevel={2}
        title="Importer un réseau GTFS"
        description="Chargez les horaires théoriques d'un réseau pour préparer vos scénarios de perturbation."
        actionLabel="Importer"
        actionIcon="download-02"
      />
      <Card headingLevel={2}
        title="Créer un scénario"
        description="Simulez une fermeture de station ou un détournement de ligne."
        actionLabel="Commencer"
        actionIcon="plus"
      />
      <Card headingLevel={2} title="Inviter un collaborateur" actionLabel="Inviter" />
    </div>
  </div>
);

/** Sidebar fondue dans le fond de l'app, contenu dans un conteneur arrondi et bordé. */
export const Defaut: Story = {
  name: "Défaut",
  render: () => (
    <AppLayout sidebar={<AppSidebar />}>
      <PageContent />
    </AppLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const main = canvas.getByRole("main", { name: "Contenu principal" });
    const before = main.getBoundingClientRect().width;
    // Repli de la Sidebar (220 → 80 px) : le conteneur s'élargit sans mesure côté app
    await userEvent.click(canvas.getByRole("button", { name: "Réduire la sidebar" }));
    await waitFor(() => expect(main.getBoundingClientRect().width).toBeGreaterThan(before + 120), { timeout: 2000 });
    await userEvent.click(canvas.getByRole("button", { name: "Développer la sidebar" }));
  },
};

/** Le fond de l'app suit la couleur produit de la Sidebar. */
export const TrafficReport: Story = {
  render: () => (
    <AppLayout sidebar={<AppSidebar product="traffic-report" />}>
      <PageContent />
    </AppLayout>
  ),
};

/** Contenu long : seul le conteneur défile, la Sidebar reste en place. */
export const ContenuLong: Story = {
  name: "Contenu long",
  render: () => (
    <AppLayout sidebar={<AppSidebar />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <Card headingLevel={2} key={i} title={`Carte ${i + 1}`} description="Contenu de démonstration." actionLabel="Ouvrir" />
        ))}
      </div>
    </AppLayout>
  ),
};

/**
 * Contenu plus large et plus haut que le conteneur : les deux barres de scroll
 * restent dans l'arrondi (c'est la zone intérieure qui défile, le cadre coupe).
 */
export const ContenuLarge: Story = {
  name: "Contenu large",
  render: () => (
    <AppLayout sidebar={<AppSidebar />}>
      <div
        style={{
          width: 2000,
          height: 1500,
          background: "var(--cadence-color-surface-alt)",
          borderRadius: "var(--cadence-radius-lg)",
        }}
      />
    </AppLayout>
  ),
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector(".app-layout__container") as HTMLElement;
    const scroller = canvasElement.querySelector(".app-layout__scroll") as HTMLElement;
    // Le cadre arrondi coupe, la zone intérieure défile dans les deux sens
    await expect(getComputedStyle(container).overflow).toBe("hidden");
    await expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);
    // La zone qui défile tient dans le cadre (rien ne dépasse de l'arrondi)
    const frame = container.getBoundingClientRect();
    const inner = scroller.getBoundingClientRect();
    await expect(inner.right).toBeLessThanOrEqual(frame.right);
    await expect(inner.bottom).toBeLessThanOrEqual(frame.bottom);
  },
};

/** Formulaire long : corps défilant, actions persistantes hors du scroll, toasts au-dessus de la barre. */
export const BarreActions: Story = {
  name: "Barre d'actions",
  render: function Render() {
    const { toast } = useToast();
    return (
      <>
        <AppLayout
          sidebar={<AppSidebar product="traffic-report" />}
          actionBarPadding="none"
          actionBar={
            <>
              <ProgressBar aria-label="Position dans le parcours" value={50} />
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px var(--cadence-page-padding-inline, 32px)" }}>
                <Stepper
                  density="compact"
                  context="Impact n° 1"
                  steps={[
                    { id: "general", label: "Informations générales", icon: "info-circle", state: "completed" },
                    { id: "severity", label: "Sévérité", icon: "alert-triangle", state: "current" },
                    { id: "messages", label: "Messages", icon: "edit-02", state: "upcoming" },
                  ]}
                />
                <FormActions>
                  <GhostButton size="sm" label="Enregistrer le brouillon" onClick={() => toast({ type: "success", title: "Brouillon enregistré" })} />
                  <PrimaryButton size="sm" label="Créer la perturbation" disabled />
                </FormActions>
              </div>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--cadence-section-gap, 32px)" }}>
            <PageHeader title="Nouvelle perturbation" />
            {Array.from({ length: 6 }, (_, index) => (
              <PageSection key={index} title={`Section ${index + 1}`} surface="elevated">
                <div style={{ padding: "20px 16px" }}><TextInput label={`Champ ${index + 1}`} /></div>
              </PageSection>
            ))}
          </div>
        </AppLayout>
        <Toaster />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const actionBar = canvasElement.querySelector<HTMLElement>(".app-layout__action-bar")!;
    const scroll = canvasElement.querySelector<HTMLElement>(".app-layout__scroll")!;

    // La barre suit le conteneur et n'appartient pas à la zone qui défile
    await expect(scroll.contains(actionBar)).toBe(false);
    await expect(scroll.scrollHeight).toBeGreaterThan(scroll.clientHeight);
    const top = actionBar.getBoundingClientRect().top;
    scroll.scrollTop = scroll.scrollHeight;
    await expect(actionBar.getBoundingClientRect().top).toBe(top);

    // Dernier champ atteignable, non recouvert par la barre
    const last = canvas.getByLabelText("Champ 6");
    await expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(top);

    // Le toast reste au-dessus des actions
    await userEvent.click(canvas.getByRole("button", { name: "Enregistrer le brouillon" }));
    const toaster = await waitFor(() => {
      const el = document.querySelector<HTMLElement>(".toaster");
      if (!el) throw new Error("Toaster absent");
      return el;
    });
    await waitFor(() => expect(toaster.getBoundingClientRect().bottom).toBeLessThanOrEqual(top));
  },
};

/** Pied de site : à la fin de la page, il défile avec elle, à la différence de la barre d'actions. */
export const AvecPiedDePage: Story = {
  name: "Avec pied de page",
  render: () => (
    <AppLayout sidebar={<AppSidebar />}>
      <PageContent />
      <PageFooter
        copyright="© 2026 Hove · Tous droits réservés"
        links={[{ label: "Support", href: "https://www.hove.com/", external: true }]}
      />
    </AppLayout>
  ),
  play: async ({ canvasElement }) => {
    const scroll = canvasElement.querySelector<HTMLElement>(".app-layout__scroll")!;
    const footer = canvasElement.querySelector<HTMLElement>(".page-footer")!;
    await expect(scroll.contains(footer)).toBe(true);
    // Page courte : calé en bas, bord à bord, sans défilement horizontal
    const box = scroll.getBoundingClientRect();
    await expect(Math.round(footer.getBoundingClientRect().bottom)).toBe(Math.round(box.bottom));
    await expect(Math.round(footer.getBoundingClientRect().left)).toBe(Math.round(box.left));
    await expect(scroll.scrollWidth).toBeLessThanOrEqual(scroll.clientWidth);
  },
};
