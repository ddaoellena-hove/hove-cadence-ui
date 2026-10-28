import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { BulletChart } from "./BulletChart";

const meta: Meta<typeof BulletChart> = {
  title: "Composants/Visualisation de données/BulletChart",
  component: BulletChart,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BulletChart>;

/** Indicateurs contractuels : plages malus / neutre / bonus, objectif, statut écrit. */
export const IndicateursContractuels: Story = {
  name: "Indicateurs contractuels",
  args: {
    title: "Indicateurs du contrat de service public",
    description: "Octobre 2026, réseau bus — échelle de 80 à 100 %",
    unit: "%",
    min: 80,
    items: [
      {
        id: "ponctualite",
        label: "Ponctualité",
        value: 93.4,
        target: 92,
        ranges: [
          { value: 85, label: "Malus sous 85 %" },
          { value: 92, label: "Bonus dès 92 %" },
        ],
      },
      {
        id: "regularite",
        label: "Régularité",
        value: 88.1,
        target: 90,
        ranges: [
          { value: 82, label: "Malus sous 82 %" },
          { value: 90, label: "Bonus dès 90 %" },
        ],
      },
      {
        id: "offre",
        label: "Taux de réalisation de l'offre",
        value: 96.2,
        target: 98.5,
        ranges: [
          { value: 97, label: "Malus sous 97 %" },
          { value: 98.5, label: "Bonus dès 98,5 %" },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole("list", { name: "Indicateurs du contrat de service public" });
    const rows = within(list).getAllByRole("group");
    await expect(rows).toHaveLength(3);
    await expect(rows[0]).toHaveAccessibleName("Ponctualité : 93,4 %, objectif 92 %, Favorable — Bonus dès 92 %");
    await expect(rows[2]).toHaveAccessibleName(/Défavorable — Malus sous 97 %$/);
    // Alternative tabulaire : en-tête + 3 indicateurs
    await expect(within(canvas.getByRole("table", { name: "Indicateurs du contrat de service public" })).getAllByRole("row")).toHaveLength(4);
  },
};

/** Sens « plus bas = mieux » et unités par ligne. */
export const RetardsEtAttente: Story = {
  name: "Retards et attente",
  args: {
    title: "Qualité de service perçue",
    description: "Semaine 43",
    goodDirection: "down",
    items: [
      {
        id: "retard",
        label: "Retard moyen",
        value: 3.8,
        target: 3,
        max: 8,
        unit: "min",
        ranges: [
          { value: 3, label: "Seuil 3 min" },
          { value: 5, label: "Seuil 5 min" },
        ],
      },
      {
        id: "attente",
        label: "Attente en correspondance",
        value: 6.4,
        target: 5,
        max: 10,
        unit: "min",
        ranges: [
          { value: 5, label: "Seuil 5 min" },
          { value: 8, label: "Seuil 8 min" },
        ],
      },
    ],
  },
};

/** Sans plage : barre et objectif seuls, sans jugement. */
export const SansPlage: Story = {
  name: "Sans plage",
  args: {
    title: "Fréquentation vs prévision",
    unit: "k",
    max: 500,
    goodDirection: "neutral",
    items: [
      { id: "l13", label: "Ligne 13", value: 412, target: 450 },
      { id: "l4", label: "Ligne 4", value: 388, target: 360 },
    ],
  },
};

/** États : chargement, vide, erreur. */
export const Chargement: Story = { args: { title: "Indicateurs du contrat", items: [], state: "loading" } };

export const Vide: Story = { args: { title: "Indicateurs du contrat", items: [], state: "empty" } };

export const Erreur: Story = { args: { title: "Indicateurs du contrat", items: [], state: "error", onRetry: fn() } };

import * as lot6Test from "storybook/test";
export const DistanceEtroiteLot6: Story = { args: { title: "Distance de fusion", goodDirection: "down", max: 500, unit: "m", items: [{ id: "a", label: "Distance", value: 233, ranges: [{ value: 50, label: "Fusion directe sous 50 m" }, { value: 300, label: "Au-delà de 300 m" }] }] }, decorators: [Story => <div style={{ width: 240 }}><Story /></div>], play: async ({ canvasElement }) => { const c = lot6Test.within(canvasElement); await lot6Test.expect(c.getByRole("group", { name: /Intermédiaire — entre 50/ })).toBeVisible(); await lot6Test.expect(canvasElement.querySelector(".bullet-chart__plot")!.getBoundingClientRect().width).toBeGreaterThan(100); } };
