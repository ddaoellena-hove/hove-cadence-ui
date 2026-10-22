import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  argTypes: {
    variant: { options: ["text", "rect", "circle"], control: { type: "select" } },
    lines: { control: { type: "number" } },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

/** Trois lignes de texte, la dernière plus courte. */
export const Texte: Story = {
  render: () => (
    <div role="status" aria-busy="true" aria-label="Chargement du contenu" style={{ width: 320 }}>
      <Skeleton variant="text" lines={3} />
    </div>
  ),
};

/**
 * Squelette d'une carte en chargement : vignette ronde + titre et deux lignes.
 * C'est le conteneur qui porte `aria-busy="true"`.
 */
export const Carte: Story = {
  render: () => (
    <div
      role="status"
      aria-busy="true"
      aria-label="Chargement de la carte"
      style={{
        display: "flex",
        gap: 12,
        width: 320,
        padding: 16,
        border: "1px solid var(--cadence-color-border, #e5e5e5)",
        borderRadius: "var(--cadence-radius-lg, 10px)",
      }}
    >
      <Skeleton variant="circle" width={40} />
      <div style={{ flex: 1 }}>
        <Skeleton variant="rect" width="50%" height={14} />
        <div style={{ height: 8 }} />
        <Skeleton variant="text" lines={2} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const region = within(canvasElement).getByLabelText("Chargement de la carte");
    await expect(region).toHaveAttribute("aria-busy", "true");
    // Le squelette lui-même est décoratif (invisible pour les lecteurs d'écran).
    await expect(canvasElement.querySelector(".skeleton")).toHaveAttribute("aria-hidden", "true");
  },
};

/** Ligne de tableau : plusieurs rectangles alignés. */
export const LigneDeTableau: Story = {
  name: "Ligne de tableau",
  render: () => (
    <div
      role="status"
      aria-busy="true"
      aria-label="Chargement du tableau"
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px", gap: 24, width: 520 }}
    >
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} variant="rect" width="70%" height={12} />
      ))}
    </div>
  ),
};
