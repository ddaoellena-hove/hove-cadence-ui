import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SmallMultiples } from "./SmallMultiples";

const meta: Meta<typeof SmallMultiples> = {
  title: "Composants/Visualisation de données/SmallMultiples",
  component: SmallMultiples,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 900, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SmallMultiples>;

const DAYS = Array.from({ length: 14 }, (_, i) => new Date(2026, 9, 7 + i));
const punctuality = (base: number, swing: number, dip = -1) =>
  DAYS.map((x, i) => ({ x, y: Math.round((base + Math.sin(i / 2) * swing - (i === dip ? 7 : 0)) * 10) / 10 }));

/** Ponctualité par ligne sur 14 jours : échelle commune, objectif commun, curseur synchronisé. */
export const PonctualiteParLigne: Story = {
  name: "Ponctualité par ligne",
  args: {
    title: "Ponctualité par ligne, 14 derniers jours",
    description: "Échelle commune de 80 à 100 %",
    unit: "%",
    yDomain: [80, 100],
    thresholds: [{ value: 92, label: "Objectif 92 %" }],
    items: [
      { id: "m1", label: "Ligne 1", data: punctuality(96, 1.2) },
      { id: "m4", label: "Ligne 4", data: punctuality(95, 1.5) },
      { id: "m7", label: "Ligne 7", data: punctuality(93, 2) },
      { id: "m13", label: "Ligne 13", data: punctuality(90, 2.5, 9) },
      { id: "m14", label: "Ligne 14", data: punctuality(98, 0.6) },
      { id: "rera", label: "RER A", data: punctuality(88, 3, 9) },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Une case par ligne, nommée avec sa dernière valeur
    const charts = canvas.getAllByRole("group", { name: /dernière valeur/ });
    await expect(charts).toHaveLength(6);
    // Curseur synchronisé : le point actif d'une case est repéré dans les autres
    charts[0].focus();
    await userEvent.keyboard("{End}");
    await expect(canvasElement.querySelectorAll(".line-chart__crosshair")).toHaveLength(6);
    const table = canvas.getByRole("table", { name: "Ponctualité par ligne, 14 derniers jours" });
    await expect(within(table).getAllByRole("row")).toHaveLength(7);
  },
};

/** États : chargement, vide, erreur. */
export const Chargement: Story = { args: { title: "Ponctualité par ligne", items: [], state: "loading" } };

export const Vide: Story = { args: { title: "Ponctualité par ligne", items: [], state: "empty" } };

export const Erreur: Story = { args: { title: "Ponctualité par ligne", items: [], state: "error", onRetry: fn() } };
