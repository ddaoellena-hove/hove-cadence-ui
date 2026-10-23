import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { DetailPattern } from "../../patterns/DetailPattern";
import { Shell } from "./_shell";

const meta: Meta<typeof DetailPattern> = {
  title: "Page patterns/Détail",
  component: DetailPattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell active="disruptions"><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof DetailPattern>;

/** Onglets de page + action destructive confirmée par une Modal. */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: /Travaux entre Châtelet et Nation/ })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Supprimer" }));
    const dialog = await within(document.body).findByRole("dialog", { name: /Supprimer cette perturbation/ });
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  },
};
