import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { CoquePattern } from "../../patterns/CoquePattern";

const meta: Meta<typeof CoquePattern> = {
  title: "Page patterns/Coque d'application",
  component: CoquePattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof CoquePattern>;

/** AppLayout + Sidebar + PageHeader + Toaster : repères `nav` et `main` nommés. */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("navigation", { name: /Navigation principale/ })).toBeInTheDocument();
    await expect(canvas.getByRole("main")).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { level: 1, name: /Scénarios de perturbation/ })).toBeInTheDocument();
  },
};
