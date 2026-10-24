import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { SupervisionPattern } from "../../patterns/SupervisionPattern";
import { Shell } from "./_shell";

const meta: Meta<typeof SupervisionPattern> = {
  title: "Page patterns/Supervision",
  component: SupervisionPattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof SupervisionPattern>;

export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Supervision" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { level: 2, name: "Ponctualité" })).toBeInTheDocument();
    // Indicateurs du contrat : statut écrit par ligne
    await expect(canvas.getByRole("group", { name: /^Ponctualité : 94,2\s%, objectif 92\s%, Favorable/ })).toBeInTheDocument();
  },
};

export const Chargement: Story = { args: { loading: true } };
