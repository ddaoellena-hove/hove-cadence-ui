import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ProgressBar } from "./ProgressBar";

const meta: Meta<typeof ProgressBar> = {
  title: "Composants/Retours et statuts/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Defaut: Story = {
  name: "Défaut",
  args: { value: 45, label: "Import du fichier", showValue: true },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("progressbar");
    await expect(bar).toHaveAttribute("aria-valuenow", "45");
    await expect(bar).toHaveAttribute("aria-valuemax", "100");
  },
};

export const Succes: Story = { name: "Succès", args: { value: 100, tone: "success", label: "Terminé", showValue: true } };
export const Danger: Story = { args: { value: 30, tone: "danger", label: "Quota" } };

export const Indetermine: Story = {
  name: "Indéterminé",
  args: { label: "Analyse en cours…", "aria-label": "Analyse en cours" },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("progressbar");
    // Indéterminé : pas de valeur courante.
    await expect(bar).not.toHaveAttribute("aria-valuenow");
  },
};
