import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { EtatsPattern } from "../../patterns/EtatsPattern";
import { Shell } from "./_shell";

const meta: Meta<typeof EtatsPattern> = {
  title: "Page patterns/États de page",
  component: EtatsPattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof EtatsPattern>;

export const Chargement: Story = { args: { state: "loading" } };
export const Erreur: Story = { args: { state: "error" } };
export const AccesRefuse: Story = { name: "Accès refusé", args: { state: "denied" } };
export const Introuvable: Story = { args: { state: "not-found" } };

/** Aucune donnée encore créée. */
export const Vide: Story = {
  args: { state: "empty" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Aucun scénario créé pour ce réseau")).toBeInTheDocument();
  },
};
