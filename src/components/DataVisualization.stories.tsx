import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, spyOn } from "storybook/test";
import { DataVisualization } from "./DataVisualization";
import { resetWarningsForTests } from "./button-compat";
import { disruptionsByModeWeekly, WEEKS } from "../stories/fixtures/transport";

// Déprécié : enveloppe de BarChart. Ces stories vérifient que l'ancienne API
// (type, categories, series sans id) s'affiche toujours.

const series = disruptionsByModeWeekly.map(({ label, data }) => ({ label, data }));

const meta = {
  title: "Composants/Visualisation de données/DataVisualization (déprécié)",
  component: DataVisualization,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
    docs: {
      description: {
        component: "⚠️ Déprécié depuis la 0.5.0, supprimé en 1.0.0 : utiliser `BarChart` (`layout`, `orientation`, `title` obligatoire).",
      },
    },
  },
  args: { categories: WEEKS, series, height: 260 },
  beforeEach: () => {
    // Avertissement « une seule fois » : on repart d'une mémoire vierge pour l'asserter
    resetWarningsForTests();
    const warn = spyOn(console, "warn").mockImplementation(() => {});
    return () => warn.mockRestore();
  },
} satisfies Meta<typeof DataVisualization>;

export default meta;
type Story = StoryObj<typeof meta>;

/** "stacked-vertical" → BarChart layout="stacked". */
export const StackedVertical: Story = {
  name: "stacked-vertical",
  args: { type: "stacked-vertical" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".bar-chart--vertical")).not.toBeNull();
    // Empilé : une barre par série et par semaine, un seul total par semaine dans le tableau
    await expect(canvasElement.querySelectorAll(".bar-chart__bar")).toHaveLength(12);
    await expect(canvasElement.querySelector("th")?.closest("table")?.textContent).toContain("Total");
    await expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/DataVisualization : composant déprécié/));
  },
};

/** "grouped-vertical" → BarChart layout="grouped". */
export const GroupedVertical: Story = {
  name: "grouped-vertical",
  args: { type: "grouped-vertical", showValues: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll(".bar-chart__value")).toHaveLength(12);
  },
};

/** "horizontal" → BarChart layout="grouped" orientation="horizontal". */
export const Horizontal: Story = {
  name: "horizontal",
  args: { type: "horizontal" },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".bar-chart--horizontal")).not.toBeNull();
  },
};

/** Options héritées : sans légende ni grille. */
export const SansLegendeNiGrille: Story = {
  name: "Sans légende ni grille",
  args: { type: "stacked-vertical", showLegend: false, showGridLines: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".chart-legend")).toBeNull();
    await expect(canvasElement.querySelectorAll(".chart__grid-line")).toHaveLength(0);
  },
};
