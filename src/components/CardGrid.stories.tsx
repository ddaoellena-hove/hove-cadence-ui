import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { CardGrid } from "./CardGrid";
import { Card } from "./Card";

const meta: Meta<typeof CardGrid> = {
  title: "Composants/Structure et mise en page/CardGrid",
  component: CardGrid,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof CardGrid>;

/** Grille fluide d'indicateurs (auto-fill, minmax 240, gap 16). */
export const Defaut: Story = {
  name: "Défaut",
  render: () => (
    <CardGrid>
      <Card headingLevel={2} title="Courses réalisées" value={12430} delta={{ value: 1.8, label: "vs période précédente" }} />
      <Card headingLevel={2} title="Ponctualité" value={94.2} unit="%" delta={{ value: -0.6, unit: "pt" }} />
      <Card headingLevel={2} title="Retard moyen" value={3.4} unit="min" goodDirection="down" delta={{ value: 0.2, label: "vs hier" }} />
      <Card headingLevel={2} title="Perturbations actives" value={27} goodDirection="down" />
    </CardGrid>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 2, name: "Ponctualité" })).toBeInTheDocument();
  },
};

/** `fit` étire les colonnes pour remplir la dernière rangée. */
export const AutoFit: Story = {
  name: "Auto-fit",
  render: () => (
    <CardGrid fit min={300}>
      <Card headingLevel={2} title="Retard moyen" value={3.4} unit="min" goodDirection="down" />
      <Card headingLevel={2} title="Ponctualité" value={94.2} unit="%" />
    </CardGrid>
  ),
};
