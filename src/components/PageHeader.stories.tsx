import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { PageHeader } from "./PageHeader";
import { AppLayout } from "./AppLayout";
import { Sidebar, type SidebarNavSection } from "./Sidebar";
import { Icons } from "./Icons";
import { DateRangePicker, type DateRange } from "./DateRangePicker";
import { Dropdown } from "./Dropdown";
import { PrimaryButton } from "./PrimaryButton";
import { Card } from "./Card";
import { Breadcrumbs } from "./Breadcrumbs";

// Date de référence fixe : les stories et leurs tests ne dépendent pas du jour d'exécution
const REFERENCE = new Date(2026, 9, 21, 14, 32);

const meta: Meta<typeof PageHeader> = {
  title: "Composants/Structure et mise en page/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

const SECTIONS: SidebarNavSection[] = [
  { id: "home", label: "Accueil", icon: <Icons icon="home" size={20} /> },
  { id: "data", label: "Données", icon: <Icons icon="file-05" size={20} /> },
  { id: "settings", label: "Paramètres", icon: <Icons icon="settings-01" size={20} /> },
];

const SOURCES = [
  { id: "all", label: "Toutes les sources" },
  { id: "gtfs", label: "GTFS" },
  { id: "siri", label: "SIRI" },
];

/** Actions d'un en-tête de dashboard : tout en sm, sélecteurs en variante bouton. */
const DashboardActions = () => {
  const [range, setRange] = useState<DateRange>({
    start: new Date(2026, 9, 15),
    end: new Date(2026, 9, 21, 23, 59, 59, 999),
  });
  const [source, setSource] = useState("all");
  return (
    <>
      <DateRangePicker
        variant="button"
        aria-label="Période"
        referenceDate={REFERENCE}
        maxDays={92}
        value={range}
        onChange={setRange}
      />
      <Dropdown variant="button" aria-label="Source" options={SOURCES} value={source} onChange={setSource} />
      <PrimaryButton size="sm" outline iconStart="download-02" label="Exporter" />
      <PrimaryButton size="sm" iconStart="upload-02" label="Importer un jeu de données" />
    </>
  );
};

/** Page de dashboard dans AppLayout, avec assez de contenu pour défiler. */
const DashboardPage = () => (
  <AppLayout sidebar={<Sidebar product="datahub" clientName="Bordeaux Métropole" sections={SECTIONS} activeId="data" />}>
    <PageHeader
      title="Pilotage des données"
      subtitle="Dernière synchronisation le 21/10/2026 à 14:32"
      actions={<DashboardActions />}
    />
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
        <Card headingLevel={2} title="Jeux de données publiés" value={4} delta={{ value: 1, label: "vs semaine précédente" }} />
        <Card headingLevel={2} title="Disponibilité du temps réel" value={98.7} unit="%" delta={{ value: -0.4, unit: "pt" }} />
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          style={{ height: 160, borderRadius: "var(--cadence-radius-lg)", background: "var(--cadence-color-surface-alt)" }}
        />
      ))}
    </div>
  </AppLayout>
);

/**
 * En-tête de dashboard collé en haut au défilement. Le popover de période, au
 * bord droit, reste dans la zone visible.
 */
export const Defaut: Story = {
  name: "Défaut",
  render: () => <DashboardPage />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvasElement.querySelector(".page-header") as HTMLElement;
    const scroller = canvasElement.querySelector(".app-layout__scroll") as HTMLElement;
    await expect(canvas.getByRole("heading", { level: 1, name: "Pilotage des données" })).toBeInTheDocument();

    // Le popover de période tient dans la zone visible du conteneur (barre de
    // défilement exclue ; cas du bord droit testé par DateRangePicker / Au bord droit)
    await userEvent.click(canvas.getByRole("button", { name: /^Période : / }));
    const popover = canvas.getByRole("dialog", { name: "Choisir une période" });
    const visibleRight = () => scroller.getBoundingClientRect().left + scroller.clientLeft + scroller.clientWidth;
    await waitFor(() => expect(popover.getBoundingClientRect().right).toBeLessThanOrEqual(visibleRight()));
    // Un popover qui s'élargit après l'ouverture (police chargée plus tard) est
    // recalé : son bord droit reste dans la zone visible
    popover.style.paddingRight = `${parseFloat(getComputedStyle(popover).paddingRight) + 60}px`;
    await waitFor(() => expect(popover.getBoundingClientRect().right).toBeLessThanOrEqual(visibleRight()));
    popover.style.paddingRight = "";
    await userEvent.keyboard("{Escape}");

    // Au défilement, l'en-tête reste en haut et prend son liseré
    const top = header.getBoundingClientRect().top;
    scroller.scrollTop = 400;
    await waitFor(() => expect(header).toHaveClass("page-header--stuck"));
    await expect(Math.round(header.getBoundingClientRect().top)).toBe(Math.round(top));
    // Collé au bord du cadre : rien du contenu ne passe au-dessus
    const frameTop = (canvasElement.querySelector(".app-layout__container") as HTMLElement).getBoundingClientRect().top;
    await expect(Math.round(header.getBoundingClientRect().top)).toBeLessThanOrEqual(Math.round(frameTop) + 1);
    scroller.scrollTop = 0;
    await waitFor(() => expect(header).not.toHaveClass("page-header--stuck"));
  },
};

/** Sans actions ni sous-titre. */
export const TitreSeul: Story = {
  name: "Titre seul",
  render: () => (
    <div style={{ padding: 24 }}>
      <PageHeader title="Paramètres" sticky={false} />
    </div>
  ),
};

/** Fil d'Ariane au-dessus du titre. */
export const AvecFilDAriane: Story = {
  name: "Avec fil d'Ariane",
  render: () => (
    <div style={{ padding: 24 }}>
      <PageHeader
        sticky={false}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { id: "home", label: "Accueil", href: "#" },
              { id: "current", label: "Scénarios de mobilité" },
            ]}
          />
        }
        title="Scénarios de mobilité"
        actions={<PrimaryButton size="sm" iconStart="plus" label="Créer un scénario" />}
      />
    </div>
  ),
};
