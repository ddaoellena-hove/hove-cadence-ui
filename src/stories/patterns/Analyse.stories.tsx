import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AnalysePattern } from "../../patterns/AnalysePattern";
import { Shell } from "./_shell";

const meta: Meta<typeof AnalysePattern> = {
  title: "Page patterns/Analyse",
  component: AnalysePattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof AnalysePattern>;

export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 1, name: /Analyse des perturbations/ })).toBeInTheDocument();
    // Chaque graphique est encadré ; les voisins d'une même grille ont la même hauteur
    const charts = [...canvasElement.querySelectorAll("section.chart")];
    await expect(charts).toHaveLength(5);
    for (const chart of charts) await expect(chart).toHaveClass("chart--framed");
    await expect(charts[1].getBoundingClientRect().height).toBe(charts[2].getBoundingClientRect().height);
    await expect(charts[3].getBoundingClientRect().height).toBe(charts[4].getBoundingClientRect().height);
  },
};

export const Chargement: Story = { args: { state: "loading" } };
export const Erreur: Story = { args: { state: "error" } };
