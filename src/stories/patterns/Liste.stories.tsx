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

/** Filtrer → sélectionner → barre d'actions groupées (`BulkActionBar`). */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Perturbations" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("checkbox", { name: "Tout sélectionner" }));
    const bar = canvas.getByRole("region", { name: "Actions groupées" });
    await expect(within(bar).getByRole("button", { name: "Supprimer" })).toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent("4 perturbations sélectionnées");
  },
};

export const Chargement: Story = { args: { rows: [], loading: true } };
export const Vide: Story = { args: { rows: [] } };
