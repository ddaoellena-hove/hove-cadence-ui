import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ListeDetailPattern } from "../../patterns/ListeDetailPattern";
import { Shell } from "./_shell";

const meta: Meta<typeof ListeDetailPattern> = {
  title: "Page patterns/Liste + détail",
  component: ListeDetailPattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof ListeDetailPattern>;

/** Clic sur une ligne → Drawer de détail sans quitter la liste. */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("Incident d'exploitation"));
    const drawer = await within(document.body).findByRole("dialog", { name: /Incident/ });
    await expect(within(drawer).getByText(/Trafic très perturbé/)).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  },
};
