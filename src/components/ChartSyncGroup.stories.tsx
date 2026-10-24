import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { BarChart } from "./BarChart";
import { CardGrid } from "./CardGrid";
import { ChartSyncGroup } from "./ChartSyncGroup";
import { LineChart } from "./LineChart";

const meta: Meta<typeof ChartSyncGroup> = {
  title: "Composants/Visualisation de données/ChartSyncGroup",
  component: ChartSyncGroup,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
};

export default meta;
type Story = StoryObj<typeof ChartSyncGroup>;

const DAYS = ["lun. 14", "mar. 15", "mer. 16", "jeu. 17", "ven. 18", "sam. 19", "dim. 20"];

/** Courbe et barres sur les mêmes jours : survoler l'une repère le même jour dans l'autre. */
export const CurseurSynchronise: Story = {
  name: "Curseur synchronisé",
  render: () => (
    <ChartSyncGroup>
      <CardGrid min={320} fit>
        <LineChart
          framed
          title="Retard moyen"
          unit="min"
          series={[{ id: "r", label: "Retard moyen", data: DAYS.map((x, i) => ({ x, y: [2.1, 2.4, 5.8, 2.6, 2.2, 1.4, 1.1][i] })) }]}
        />
        <BarChart
          framed
          title="Perturbations"
          unit="perturbations"
          categories={DAYS}
          series={[{ id: "p", label: "Perturbations", data: [14, 18, 31, 16, 15, 8, 6] }]}
        />
      </CardGrid>
    </ChartSyncGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const line = canvas.getByRole("group", { name: "Retard moyen" });
    line.focus();
    await userEvent.keyboard("{Home}{ArrowRight}{ArrowRight}");
    // Le BarChart repère le même jour (bande de survol) sans tooltip propre
    await expect(canvasElement.querySelector(".bar-chart__hover")).not.toBeNull();
    // Un seul tooltip (en portail dans le body) : celui du graphique actif
    await expect(document.body.querySelectorAll(".chart-tooltip")).toHaveLength(1);
  },
};
