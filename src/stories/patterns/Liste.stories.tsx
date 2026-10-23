import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ListePattern } from "../../patterns/ListePattern";
import { Shell } from "./_shell";

const meta: Meta<typeof ListePattern> = {
  title: "Page patterns/Liste",
  component: ListePattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof ListePattern>;

/** Filtrer → sélectionner → barre d'actions de masse. */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Perturbations" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Tout sélectionner" }));
    await expect(canvas.getByRole("button", { name: "Supprimer" })).toBeInTheDocument();
  },
};

export const Chargement: Story = { args: { rows: [], loading: true } };
export const Vide: Story = { args: { rows: [] } };
