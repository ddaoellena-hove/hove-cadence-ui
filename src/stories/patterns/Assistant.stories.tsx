import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { AssistantPattern } from "../../patterns/AssistantPattern";
import { Shell } from "./_shell";

const meta: Meta<typeof AssistantPattern> = {
  title: "Page patterns/Assistant",
  component: AssistantPattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof AssistantPattern>;

export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("heading", { level: 1, name: /Importer un réseau/ })).toBeInTheDocument();
  },
};

/** Étape de vérification : erreurs à corriger (reprise). */
export const Erreur: Story = { args: { step: 2 } };
/** Transfert en cours. */
export const Transfert: Story = { args: { step: 3 } };
