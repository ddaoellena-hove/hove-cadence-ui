import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { PageSection } from "./PageSection";
import { TextInput } from "./TextInput";
import { GhostButton } from "./GhostButton";
import { Accordion } from "./Accordion";
import { Dropdown } from "./Dropdown";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof PageSection> = {
  title: "Composants/Structure et mise en page/PageSection",
  component: PageSection,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof PageSection>;

/** Titre `h2` + contenu empilé. La section est un repère nommé par son titre. */
export const Defaut: Story = {
  name: "Défaut",
  args: {
    title: "Informations générales",
    children: (
      <>
        <TextInput label="Titre" placeholder="Ex : Tronçon Melun – Montereau" />
        <TextInput label="Référence" placeholder="SCN-000" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", { name: "Informations générales" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { level: 2, name: "Informations générales" })).toBeInTheDocument();
  },
};

/** Description sous le titre et actions à droite. */
export const AvecActionsEtDescription: Story = {
  name: "Avec actions et description",
  args: {
    title: "Arrêts concernés",
    description: "Sélectionnez les arrêts touchés par la perturbation.",
    actions: <GhostButton size="sm" iconStart="plus" label="Ajouter" />,
    children: <TextInput label="Rechercher un arrêt" placeholder="Nom ou code" />,
  },
};

/** Niveau de titre `h3` (sous-section). */
export const Niveau3: Story = {
  args: {
    title: "Exceptions de circulation",
    headingLevel: 3,
    children: <TextInput label="Date" placeholder="JJ/MM/AAAA" />,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 3, name: "Exceptions de circulation" })).toBeInTheDocument();
  },
};

import * as lot6Test from "storybook/test";
/** En carte : enveloppe de Card, filet sous l'en-tête, corps bord à bord (ici une liste, puis un contenu rembourré par l'app). */
export const Carte: Story = {
  name: "En carte",
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 640 }}>
      <PageSection surface="card" title="Livrables" description="Exports de la dernière exécution" actions={<GhostButton size="sm" label="Tout télécharger" />}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {["gtfs.zip", "netex.zip", "rapport-qualite.pdf"].map((file) => (
            <li key={file} style={{ padding: "12px 20px", borderBottom: "1px solid var(--cadence-color-divider, #f0f0f0)", fontSize: 13 }}>
              {file}
            </li>
          ))}
        </ul>
      </PageSection>
      <PageSection surface="card" title="Paramètres" icon="settings-01" gap={12}>
        <p style={{ margin: 0, padding: "16px 20px", fontSize: 13 }}>Le corps n’impose pas de padding : l’app choisit le sien.</p>
      </PageSection>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole("region", { name: "Livrables" });
    await expect(section).toHaveClass("page-section--card");
    const head = section.querySelector(".page-section__head") as HTMLElement;
    await expect(getComputedStyle(head).borderBottomStyle).toBe("solid");
    // Corps bord à bord : la liste touche les bords de la carte
    const body = section.querySelector(".page-section__body") as HTMLElement;
    await expect(getComputedStyle(body).paddingLeft).toBe("0px");
  },
};

export const IconesLot6: Story = { render: () => <div style={{ display: "grid", gap: 24 }}>{(["label", "muted", "accent"] as const).map(tone => <PageSection key={tone} title={`Section ${tone}`} icon="database" iconTone={tone} description="Source de données"><span>Contenu</span></PageSection>)}</div>, play: async ({ canvasElement }) => { await lot6Test.expect(lot6Test.within(canvasElement).getAllByRole("heading", { level: 2 })).toHaveLength(3); } };

const Padded = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "20px 16px" }}>{children}</div>
);

/** Titre et actions hors de la boîte ; seul le corps porte fond, bordure, rayon et ombre. */
export const Surelevee: Story = {
  name: "Surface surélevée",
  args: {
    title: "Informations générales",
    description: "Communes à tous les impacts de la perturbation.",
    surface: "elevated",
    actions: <GhostButton size="sm" iconStart="plus" label="Ajouter" />,
    children: (
      <Padded>
        <TextInput label="Nom" placeholder="Ex : Travaux de voie" />
        <Dropdown label="Cause" placeholder="Sélectionner" options={[{ id: "works", label: "Travaux" }, { id: "weather", label: "Météo" }, { id: "tech", label: "Incident technique" }]} />
      </Padded>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Informations générales" });
    const head = region.querySelector<HTMLElement>(".page-section__head")!;
    const body = region.querySelector<HTMLElement>(".page-section__body")!;
    const style = getComputedStyle(body);
    await expect(style.borderTopLeftRadius).toBe("12px");
    await expect(style.boxShadow).not.toBe("none");
    await expect(style.overflowY).toBe("visible");
    await expect(getComputedStyle(head).boxShadow).toBe("none");
    // Espace unique de 12px entre l'en-tête extérieur et la boîte
    await expect(Math.round(body.getBoundingClientRect().top - head.getBoundingClientRect().bottom)).toBe(12);
    // Le menu d'un champ n'est pas coupé par la surface
    await userEvent.click(canvas.getByRole("button", { name: /Cause/ }));
    const option = await canvas.findByRole("option", { name: "Incident technique" });
    await expect(option.getBoundingClientRect().bottom).toBeGreaterThan(0);
  },
};

/** Corps sans padding : progression et séparateurs atteignent les bords de la surface. */
export const SureleveeBordABord: Story = {
  name: "Surface surélevée, corps bord à bord",
  args: {
    title: "Impacts de la perturbation",
    surface: "elevated",
    bodyPadding: "none",
    gap: 0,
    children: (
      <>
        <ProgressBar label="Avancement" value={40} />
        <Padded><TextInput label="Objet impacté" /></Padded>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const body = canvasElement.querySelector<HTMLElement>(".page-section__body")!;
    await expect(getComputedStyle(body).paddingLeft).toBe("0px");
  },
};

/** Accordéon en contenu : pas de filet doublé en haut ni en bas, ouvert comme fermé. */
export const SureleveeAvecAccordeon: Story = {
  name: "Surface surélevée avec accordéon",
  args: {
    title: "Informations générales",
    surface: "elevated",
    children: (
      <Accordion items={[
        { id: "details", title: "Détails de la perturbation", content: <TextInput label="Référence" /> },
        { id: "labels", title: "Étiquettes", content: "Aucune étiquette." },
      ]} />
    ),
  },
  play: async ({ canvasElement }) => {
    const accordion = canvasElement.querySelector<HTMLElement>(".accordion")!;
    const items = accordion.querySelectorAll<HTMLElement>(".accordion__item");
    await expect(getComputedStyle(accordion).borderTopWidth).toBe("0px");
    await expect(getComputedStyle(items[items.length - 1]).borderBottomWidth).toBe("0px");
  },
};

/** Second niveau de titre : le groupe reste hors de la boîte, chaque section porte son en-tête dedans, au-dessus d'un filet. */
export const GroupeEnTeteInterne: Story = {
  name: "Groupe et en-tête dans la boîte",
  render: () => (
    <PageSection surface="group" title="Données théoriques" description="Version du 27 août" gap={16}>
      <PageSection headerPlacement="inside" headingLevel={3} title="Chaîne de traitement" description="Exécution du 27 août" bodyPadding="all"><span>Contenu</span></PageSection>
      <PageSection headerPlacement="inside" headingLevel={3} title="Qualité des données" bodyPadding="all"><span>Contenu</span></PageSection>
    </PageSection>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "Données théoriques" })).toBeVisible();
    await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    const head = canvas.getByRole("heading", { level: 3, name: "Chaîne de traitement" }).closest(".page-section__head")!;
    await expect(getComputedStyle(head).borderBottomStyle).toBe("solid");
  },
};
