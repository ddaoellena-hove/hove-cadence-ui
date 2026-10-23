import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { TabList, type TabListProps } from "./TabList";
import { Tab } from "./Tab";
import { SecondaryTab } from "./SecondaryTab";

const meta: Meta<typeof TabList> = {
  title: "Composants/Navigation/TabList",
  component: TabList,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof TabList>;

const TABS = [
  { id: "current", label: "En cours" },
  { id: "upcoming", label: "À venir" },
  { id: "past", label: "Passées", disabled: true },
  { id: "draft", label: "Brouillons" },
];

/** Rangée de Tab reliée à ses panneaux (id / controls ↔ tabpanel). */
const Rangee = ({ activation, initial = "current" }: { activation?: TabListProps["activation"]; initial?: string | null }) => {
  const [active, setActive] = useState<string | null>(initial);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TabList aria-label="État des scénarios" activation={activation}>
        {TABS.map((tab) => (
          <Tab
            key={tab.id}
            id={`tab-${tab.id}`}
            controls={`panel-${tab.id}`}
            label={tab.label}
            disabled={tab.disabled}
            variant={tab.id === active ? "active" : "default"}
            onClick={() => setActive(tab.id)}
          />
        ))}
      </TabList>
      {TABS.filter((tab) => tab.id === active).map((tab) => (
        <div key={tab.id} role="tabpanel" id={`panel-${tab.id}`} aria-labelledby={`tab-${tab.id}`} tabIndex={0}>
          Scénarios : {tab.label.toLowerCase()}
        </div>
      ))}
    </div>
  );
};

const tabIndexes = (canvas: { getAllByRole: (role: "tab") => HTMLElement[] }) =>
  canvas.getAllByRole("tab").map((tab) => tab.getAttribute("tabindex"));

/** Activation automatique : ←/→ (en boucle), Début / Fin ; l'onglet désactivé est sauté. */
export const Defaut: Story = {
  name: "Défaut",
  render: () => <Rangee />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("tablist", { name: "État des scénarios" });
    await expect(list).toHaveAttribute("aria-orientation", "horizontal");

    // Roving tabindex : seul l'onglet actif est tabulable
    await expect(tabIndexes(canvas)).toEqual(["0", "-1", "-1", "-1"]);
    await expect(canvas.getByRole("tab", { name: "En cours" })).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tab", { name: "En cours" })).toHaveAttribute("aria-controls", "panel-current");
    await expect(canvas.getByRole("tabpanel", { name: "En cours" })).toBeInTheDocument();

    // Tab entre dans la rangée sur l'onglet actif
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "En cours" })).toHaveFocus();

    // → : onglet suivant, activé
    await userEvent.keyboard("{ArrowRight}");
    const upcoming = canvas.getByRole("tab", { name: "À venir" });
    await expect(upcoming).toHaveFocus();
    await expect(upcoming).toHaveAttribute("aria-selected", "true");
    await expect(tabIndexes(canvas)).toEqual(["-1", "0", "-1", "-1"]);

    // → : « Passées » est désactivé, sauté
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Brouillons" })).toHaveFocus();

    // → en boucle : retour au premier
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "En cours" })).toHaveFocus();

    // ← en boucle : dernier
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("tab", { name: "Brouillons" })).toHaveFocus();

    // Début / Fin
    await userEvent.keyboard("{Home}");
    await expect(canvas.getByRole("tab", { name: "En cours" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("tab", { name: "Brouillons" })).toHaveAttribute("aria-selected", "true");

    // Tab sort de la rangée vers le panneau
    await userEvent.tab();
    await expect(canvas.getByRole("tabpanel", { name: "Brouillons" })).toHaveFocus();
  },
};

/** Activation manuelle : les flèches déplacent le focus, Entrée active. */
export const ActivationManuelle: Story = {
  name: "Activation manuelle",
  render: () => <Rangee activation="manual" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    const upcoming = canvas.getByRole("tab", { name: "À venir" });
    await expect(upcoming).toHaveFocus();
    // Focus déplacé, sélection inchangée
    await expect(upcoming).toHaveAttribute("aria-selected", "false");
    await expect(canvas.getByRole("tab", { name: "En cours" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    await expect(upcoming).toHaveAttribute("aria-selected", "true");
  },
};

/** Sans onglet actif : le premier onglet activable reste atteignable au clavier. */
export const SansOngletActif: Story = {
  name: "Sans onglet actif",
  render: () => <Rangee initial={null} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(tabIndexes(canvas)).toEqual(["0", "-1", "-1", "-1"]);
    await userEvent.tab();
    await expect(canvas.getByRole("tab", { name: "En cours" })).toHaveFocus();
  },
};

/** Rangée de SecondaryTab : `level="secondary"` (écart de 4px). */
export const Secondaire: Story = {
  render: () => {
    const [active, setActive] = useState("all");
    const items = [
      { id: "all", label: "Tous", count: 12 },
      { id: "metro", label: "Métro", count: 4 },
      { id: "bus", label: "Bus", count: 8 },
    ];
    return (
      <TabList aria-label="Mode de transport" level="secondary">
        {items.map((item) => (
          <SecondaryTab
            key={item.id}
            label={item.label}
            count={item.count}
            variant={item.id === active ? "active" : "default"}
            onClick={() => setActive(item.id)}
          />
        ))}
      </TabList>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("tab", { name: /^Bus/ })).toHaveAttribute("aria-selected", "true");
  },
};
