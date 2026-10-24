import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { PlanificationPattern } from "../../patterns/PlanificationPattern";
import { Shell } from "./_shell";

const meta: Meta<typeof PlanificationPattern> = {
  title: "Page patterns/Planification",
  component: PlanificationPattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell active="planning"><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof PlanificationPattern>;

export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: /Planifier un service de nuit/ })).toBeInTheDocument();
    // Échelle de la frise : gabarit compact (29px), pas la hauteur de champ
    const echelle = canvas.getByRole("radiogroup", { name: "Échelle" });
    await expect(echelle).toHaveClass("segmented-control--sm");
    await expect(echelle.getBoundingClientRect().height).toBe(29);
  },
};
