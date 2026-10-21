import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { SecondaryButton } from "./SecondaryButton";

/**
 * ⚠️ **Déprécié** — suppression en 1.0.0. Le bleu plein n'est plus utilisé pour
 * les actions. Correspondance :
 * - `<SecondaryButton outline />` → `<PrimaryButton outline size="sm" />` (ou `GhostButton size="sm"` hors dashboard)
 * - `<SecondaryButton />` (plein) → `<PrimaryButton size="sm" />`, ou `GhostButton size="sm"` selon le rôle
 * - `size="large"` → `size="md"`
 *
 * Migration automatique : `node scripts/codemods/buttons-v2.mjs src`.
 */
const meta: Meta<typeof SecondaryButton> = {
  title: "Components/SecondaryButton (déprécié)",
  component: SecondaryButton,
  tags: ["autodocs", "deprecated"],
  parameters: { a11y: { test: "error" } },
};

export default meta;
type Story = StoryObj<typeof SecondaryButton>;

/** Rendu de l'enveloppe : outline → Primary outline sm, plein → Primary sm. */
export const Correspondance: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <SecondaryButton outline label="Exporter" />
      <SecondaryButton label="Appliquer" />
      <SecondaryButton size="large" label="Large → md" />
      <SecondaryButton withIcon="left" icon="copy-01" label="Dupliquer" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Exporter" })).toHaveClass("primary-button--outline", "base-button--sm");
    await expect(canvas.getByRole("button", { name: "Appliquer" })).toHaveClass("primary-button", "base-button--sm");
    await expect(canvas.getByRole("button", { name: "Large → md" })).toHaveClass("base-button--md");
  },
};
