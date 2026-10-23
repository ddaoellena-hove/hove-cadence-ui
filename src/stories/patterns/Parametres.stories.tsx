import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ParametresPattern } from "../../patterns/ParametresPattern";
import { Shell } from "./_shell";

const meta: Meta<typeof ParametresPattern> = {
  title: "Page patterns/Paramètres",
  component: ParametresPattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell active="settings"><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof ParametresPattern>;

export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Paramètres" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Enregistrer les préférences" })).toBeInTheDocument();
  },
};
