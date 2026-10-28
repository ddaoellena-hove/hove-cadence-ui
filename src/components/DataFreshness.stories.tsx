import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { DataFreshness } from "./DataFreshness";

const NOW = "2026-06-12T08:15:00";
const minus = (minutes: number) => new Date(new Date(NOW).getTime() - minutes * 60_000).toISOString();

const meta: Meta<typeof DataFreshness> = {
  title: "Composants/Retours et statuts/DataFreshness",
  component: DataFreshness,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { now: NOW, timeZone: "Europe/Paris" },
};
export default meta;
type Story = StoryObj<typeof DataFreshness>;

/** Donnée fraîche : point vert, libellé relatif compact. */
export const Defaut: Story = {
  name: "Frais",
  args: { updatedAt: minus(2) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Mis à jour il y a 2 min/)).toBeInTheDocument();
    await expect(canvasElement.querySelector(".data-freshness__dot--nominal")).not.toBeNull();
    // Date absolue en title et pour les lecteurs d'écran.
    await expect(canvasElement.querySelector("time")).toHaveAttribute("title", expect.stringContaining("12/06/2026"));
  },
};

/** Donnée vieillissante (au-delà de 5 min) : point orange. */
export const Vieillissant: Story = {
  name: "Vieillissant",
  args: { updatedAt: minus(40) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/il y a 40 min/)).toBeInTheDocument();
    await expect(canvasElement.querySelector(".data-freshness__dot--warning")).not.toBeNull();
  },
};

/** Donnée périmée (au-delà d'1 h) : point rouge. */
export const Perime: Story = {
  name: "Périmé",
  args: { updatedAt: minus(3 * 24 * 60), label: "Données de" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Données de il y a 3 j/)).toBeInTheDocument();
    await expect(canvasElement.querySelector(".data-freshness__dot--critical")).not.toBeNull();
  },
};

/** Au-delà de 7 jours : la date absolue remplace le libellé relatif. */
export const TresAncien: Story = {
  name: "Très ancien (date absolue)",
  args: { updatedAt: minus(10 * 24 * 60) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Mis à jour le 02\/06\/2026/)).toBeInTheDocument();
  },
};

/** Sans point coloré (quand la couleur est portée ailleurs). */
export const SansPoint: Story = { name: "Sans point", args: { updatedAt: minus(2), hideDot: true } };

/** Date invalide : repli discret. */
export const Inconnu: Story = { name: "Date indisponible", args: { updatedAt: "n/a" } };

/** Date future (horloge de la source en avance, donnée erronée) : point neutre, date absolue, mention explicite. */
export const DateFuture: Story = {
  name: "Date future",
  args: { updatedAt: minus(-90) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Mis à jour le 12\/06\/2026 .* \(date future\)/)).toBeInTheDocument();
    await expect(canvasElement.querySelector(".data-freshness__dot--neutral")).not.toBeNull();
    await expect(canvasElement.querySelector(".data-freshness__dot--nominal")).toBeNull();
  },
};

/** Décalage d'horloge de moins d'une minute : « à l'instant ». */
export const DecalageHorloge: Story = {
  name: "Décalage d'horloge (< 1 min)",
  args: { updatedAt: new Date(new Date(NOW).getTime() + 30_000).toISOString() },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText(/Mis à jour à l'instant/)).toBeInTheDocument();
  },
};

export const InverseLot6: Story = {
  args: { updatedAt: minus(40), inverse: true },
  decorators: [Story => <div style={{ background: "var(--cadence-color-primary)", padding: 16 }}><Story /></div>],
};
