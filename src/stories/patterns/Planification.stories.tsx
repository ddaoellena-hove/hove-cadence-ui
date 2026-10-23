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
    await expect(within(canvasElement).getByRole("heading", { level: 1, name: /Planifier un service de nuit/ })).toBeInTheDocument();
  },
};
