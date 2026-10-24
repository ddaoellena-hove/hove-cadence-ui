import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Meter } from "./Meter";

const meta: Meta<typeof Meter> = {
  title: "Composants/Visualisation de données/Meter",
  component: Meter,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Meter>;

const loadThresholds = [
  { value: 80, label: "Charge élevée 80 %" },
  { value: 100, label: "Capacité 100 %" },
];

/** Taux de charge d'une course : plus bas = mieux, seuils de confort et de capacité. */
export const TauxDeCharge: Story = {
  name: "Taux de charge",
  args: { label: "Ligne 13 — course de 8 h 12", value: 92, unit: "%", goodDirection: "down", thresholds: loadThresholds },
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole("meter", { name: "Ligne 13 — course de 8 h 12" });
    await expect(meter).toHaveAttribute("aria-valuenow", "92");
    await expect(meter).toHaveAttribute("aria-valuetext", "92 % — Niveau intermédiaire — Capacité 100 %");
  },
};

/** Surcharge : barre pleine, nombre réel conservé. */
export const Surcharge: Story = {
  args: { label: "RER B — course de 8 h 04", value: 112, unit: "%", max: 100, goodDirection: "down", thresholds: loadThresholds },
  play: async ({ canvasElement }) => {
    const meter = within(canvasElement).getByRole("meter");
    await expect(meter).toHaveAttribute("aria-valuenow", "100");
    await expect(meter).toHaveAttribute("aria-valuetext", "112 % — Objectif non atteint — Capacité 100 %");
  },
};

/** Remplissage d'un parking relais : valeur / capacité dans l'unité métier. */
export const ParkingRelais: Story = {
  name: "Parking relais",
  args: { label: "P+R Porte de la Villette", value: 312, max: 420, unit: "places", goodDirection: "neutral" },
};

/** Plusieurs mesures empilées, comme dans une carte de supervision. */
export const Liste: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Meter label="Ligne 4" value={64} unit="%" goodDirection="down" thresholds={loadThresholds} />
      <Meter label="Ligne 7" value={86} unit="%" goodDirection="down" thresholds={loadThresholds} />
      <Meter label="Ligne 13" value={104} unit="%" goodDirection="down" thresholds={loadThresholds} />
    </div>
  ),
};

/** Proportionnel : décomposition des kilomètres planifiés. */
export const Proportionnel: Story = {
  args: {
    label: "Kilomètres du jour",
    unit: "km",
    max: 1500,
    segments: [
      { id: "commercial", label: "Commerciaux", value: 1020 },
      { id: "hlp", label: "Haut-le-pied", value: 140 },
      { id: "annules", label: "Annulés", value: 80 },
    ],
  },
  play: async ({ canvasElement }) => {
    const img = within(canvasElement).getByRole("img", { name: "Kilomètres du jour" });
    await expect(img).toHaveAccessibleDescription(/Commerciaux : 1\s020\skm \(68\s%\).*Total 1\s240\skm sur 1\s500\skm\./);
  },
};

/** Donnée indisponible : piste vide, annoncée comme telle. */
export const Indisponible: Story = {
  args: { label: "Ligne 13", value: Number.NaN, unit: "%" },
};
