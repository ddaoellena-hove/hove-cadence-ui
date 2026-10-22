import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Gauge } from "./Gauge";

const meta: Meta<typeof Gauge> = {
  title: "Components/Gauge",
  component: Gauge,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof Gauge>;

/** Ponctualité : objectif atteint → vert. */
export const Ponctualite: Story = {
  name: "Ponctualité",
  args: { value: 92, unit: "%", goodDirection: "up", thresholds: [{ value: 85, label: "Objectif 85 %" }] },
  play: async ({ canvasElement }) => {
    // Nom accessible décrivant la valeur et le seuil.
    await expect(within(canvasElement).getByRole("img", { name: /92 % sur 100/ })).toBeInTheDocument();
  },
};

/** Retard moyen : plus bas = mieux ; au-delà du seuil → rouge. */
export const RetardMoyen: Story = {
  name: "Retard moyen",
  args: { value: 22, max: 30, unit: "min", goodDirection: "down", shape: "ring", thresholds: [{ value: 10, label: "Seuil 10 min" }] },
};

export const SansSeuil: Story = {
  name: "Sans seuil",
  args: { value: 64, unit: "%" },
};

export const ObjectifNonAtteint: Story = {
  args: { value: 72.5, unit: "%", thresholds: [{ value: 85, label: "85 %" }] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("img")).toHaveAccessibleName(/72,5.*Objectif non atteint/);
  },
};
