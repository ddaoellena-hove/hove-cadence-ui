import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, spyOn, within } from "storybook/test";
import { LineBadge } from "./LineBadge";
import { LINES } from "../stories/data/network";

const meta: Meta<typeof LineBadge> = {
  title: "Composants/Transport/LineBadge",
  component: LineBadge,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof LineBadge>;

/** Lignes d'un réseau de démonstration (couleurs issues des données). */
export const Reseau: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {LINES.map((l) => (
        <LineBadge key={l.code} code={l.code} mode={l.mode} color={l.color} textColor={l.textColor} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Nom accessible « Ligne …, mode ».
    await expect(within(canvasElement).getByRole("img", { name: "Ligne 1, métro" })).toBeInTheDocument();
  },
};

/** Sans `textColor` : la couleur du texte est calculée pour atteindre AA. */
export const ContrasteAuto: Story = {
  name: "Contraste calculé",
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <LineBadge code="1" color="#FFCD00" />
      <LineBadge code="RER A" mode="rer" color="#E2231A" />
      <LineBadge code="13" color="#6EC4E8" />
    </div>
  ),
};

export const Tailles: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <LineBadge code="13" mode="metro" color="#6EC4E8" textColor="#000000" size="sm" />
      <LineBadge code="13" mode="metro" color="#6EC4E8" textColor="#000000" size="md" />
    </div>
  ),
};

/**
 * Donnée GTFS peu contrastée (route_text_color blanc sur jaune) : respectée
 * telle quelle, avec un avertissement en développement. Omettre `textColor`
 * pour obtenir une couleur calculée lisible.
 */
export const TexteFournitPeuContraste: Story = {
  name: "route_text_color peu contrasté",
  // Démontre une donnée non conforme : le contrôle de contraste est attendu en échec.
  parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } },
  beforeEach: () => {
    const warn = spyOn(console, "warn").mockImplementation(() => {});
    return () => warn.mockRestore();
  },
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <LineBadge code="7" mode="bus" color="#FFCD00" textColor="#FFFFFF" />
      <LineBadge code="7" mode="bus" color="#FFCD00" />
    </div>
  ),
  play: async () => {
    await expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(/route_text_color #ffffff sur #ffcd00/i));
  },
};
