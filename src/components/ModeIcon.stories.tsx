import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ModeIcon } from "./ModeIcon";
import { MODE_NAMES, type ModeName } from "./mode-icons";

const LABELS: Record<ModeName, string> = {
  "all-pt": "Tous modes",
  metro: "Métro",
  "metro-alt": "Métro (alt)",
  train: "Train",
  tram: "Tramway",
  funicular: "Funiculaire",
  bus: "Bus",
  "bus-on-demand": "Bus à la demande",
  "substitute-bus-alt": "Bus de substitution",
  coach: "Autocar",
  "coach-station": "Gare routière",
  plane: "Avion",
  boat: "Bateau",
  car: "Voiture",
  carpool: "Covoiturage",
  taxi: "Taxi",
  bike: "Vélo",
  "bike-parking": "Parking vélo",
  parking: "Parking",
  "park-and-ride-alt": "Parking relais",
  station: "Station",
  network: "Réseau",
  walk: "Marche",
  "slow-walk": "Marche lente",
  "mid-walk": "Marche",
  "fast-walk": "Marche rapide",
  run: "Course",
  home: "Domicile",
  work: "Travail",
  wheelchair: "PMR",
  ticket: "Ticket",
};

const meta: Meta<typeof ModeIcon> = {
  title: "Composants/Médias et icônes/ModeIcon",
  component: ModeIcon,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { mode: "metro", size: 32 },
};
export default meta;
type Story = StoryObj<typeof ModeIcon>;

/** Les 31 pictogrammes de mode (remplis, `currentColor`). */
export const Galerie: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 16, maxWidth: 760, color: "var(--cadence-color-primary, #002830)" }}>
      {MODE_NAMES.map((mode) => (
        <div key={mode} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 12, border: "1px solid var(--cadence-color-divider, #f0f0f0)", borderRadius: 8 }}>
          <ModeIcon mode={mode} size={32} />
          <span style={{ fontSize: 13, fontFamily: "var(--cadence-font-sans, 'ABC Diatype', Helvetica, sans-serif)" }}>{LABELS[mode]}</span>
          <code style={{ fontSize: 11, color: "var(--cadence-color-text-secondary, #607075)" }}>{mode}</code>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Métro")).toBeInTheDocument();
    // 31 pictos décoratifs (aria-hidden) + libellés visibles.
    await expect(canvasElement.querySelectorAll("svg.icons").length).toBe(31);
  },
};

/** Même picto à plusieurs tailles ; suit la couleur du texte. */
export const Tailles: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--cadence-color-primary, #002830)" }}>
      {[16, 24, 32, 48, 64].map((s) => (
        <ModeIcon key={s} mode="tram" size={s} />
      ))}
    </div>
  ),
};

/** Suit `currentColor` (hérite du texte) ou couleur explicite. */
export const Couleur: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <span style={{ color: "var(--cadence-color-primary, #002830)", display: "inline-flex", alignItems: "center", gap: 8 }}>
        <ModeIcon mode="bike" size={40} /> currentColor
      </span>
      <span style={{ color: "var(--cadence-status-warning-fg, #c2410c)", display: "inline-flex", alignItems: "center", gap: 8 }}>
        <ModeIcon mode="substitute-bus-alt" size={40} /> hérite de l'alerte
      </span>
    </div>
  ),
};

/** Picto porteur de sens : fournir `title` → `role="img"` + `aria-label`. */
export const Nomme: Story = {
  name: "Nommé (accessible)",
  args: { mode: "wheelchair", size: 40, title: "Accès PMR" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("img", { name: "Accès PMR" })).toBeInTheDocument();
  },
};
