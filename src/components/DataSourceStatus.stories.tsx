import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DataSourceStatus } from "./DataSourceStatus";

const NOW = new Date("2026-10-27T10:00:00+01:00");
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000);

const meta: Meta<typeof DataSourceStatus> = {
  title: "Composants/Retours et statuts/DataSourceStatus",
  component: DataSourceStatus,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
  args: { label: "GTFS-RT — positions des véhicules", now: NOW, timeZone: "Europe/Paris" },
};
export default meta;
type Story = StoryObj<typeof DataSourceStatus>;

/** Source disponible, données fraîches. */
export const Disponible: Story = {
  args: { availability: "available", lastObservedAt: ago(1), lastSuccessAt: ago(1), dataUpdatedAt: ago(2), onViewDetails: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "GTFS-RT — positions des véhicules" });
    await expect(within(region).getByText("Disponible")).toBeInTheDocument();
    await expect(within(region).getByText(/Observée il y a 1 min/)).toBeInTheDocument();
    await expect(within(region).getByText(/Produites il y a 2 min/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Voir la source" }));
    await expect(args.onViewDetails).toHaveBeenCalledOnce();
  },
};

/** Source joignable mais données périmées : disponibilité et fraîcheur sont indépendantes. */
export const JoignableMaisPerimee: Story = {
  name: "Joignable mais périmée",
  args: { availability: "available", lastObservedAt: ago(1), lastSuccessAt: ago(1), dataUpdatedAt: ago(180) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Disponible")).toBeInTheDocument();
    await expect(within(canvasElement).getByText(/Produites il y a 3 h/)).toBeInTheDocument();
    await expect(canvasElement.querySelector(".data-freshness__dot--critical")).not.toBeNull();
  },
};

/** Indisponible : l'erreur s'affiche, la dernière réussite connue reste. */
export const Indisponible: Story = {
  args: {
    availability: "unavailable",
    lastObservedAt: ago(1),
    lastSuccessAt: ago(95),
    dataUpdatedAt: ago(96),
    error: "HTTP 503 — Service Unavailable (délai de 10 s dépassé)",
    onViewDetails: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Indisponible")).toBeInTheDocument();
    await expect(canvas.getByText(/Réussie il y a 2 h/)).toBeInTheDocument();
    await expect(canvas.getByText("Dernière erreur")).toBeInTheDocument();
    await expect(canvas.getByText(/HTTP 503/)).toBeInTheDocument();
    // Une erreur affichée dans la carte n'est pas une alerte annoncée
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};

/** Dégradée : réponses partielles ou lentes. */
export const Degradee: Story = {
  name: "Dégradée",
  args: {
    availability: "degraded",
    lastObservedAt: ago(1),
    lastSuccessAt: ago(1),
    dataUpdatedAt: ago(12),
    error: "3 lignes sur 42 absentes du flux",
  },
};

/** Jamais interrogée : rien n'est présenté comme disponible ni comme frais. */
export const Inconnu: Story = {
  args: { availability: "unknown" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("État inconnu")).toBeInTheDocument();
    await expect(canvas.getByText("Jamais observée")).toBeInTheDocument();
    await expect(canvas.getByText("Aucune connue")).toBeInTheDocument();
    await expect(canvas.getByText("Inconnue")).toBeInTheDocument();
    await expect(canvasElement.querySelector(".data-freshness__dot")).toBeNull();
  },
};

/** Chargement : squelettes, `aria-busy`, ni état ni bouton. */
export const Chargement: Story = {
  args: { availability: "unknown", loading: true, onViewDetails: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region")).toHaveAttribute("aria-busy", "true");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

/** Plusieurs sources dans une grille : même horloge (`now`) et même fuseau pour toutes. */
export const PlusieursSources: Story = {
  name: "Plusieurs sources",
  decorators: [(Story) => <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", maxWidth: 900 }}><Story /></div>],
  render: (args) => (
    <>
      <DataSourceStatus {...args} label="GTFS — offre théorique" availability="available" lastObservedAt={ago(30)} lastSuccessAt={ago(30)} dataUpdatedAt={ago(60 * 20)} freshWithin={86_400} staleWithin={7 * 86_400} />
      <DataSourceStatus {...args} label="GTFS-RT — positions" availability="unavailable" lastObservedAt={ago(1)} lastSuccessAt={ago(14)} dataUpdatedAt={ago(15)} error="Délai de connexion dépassé" />
      <DataSourceStatus {...args} label="SIRI — perturbations" availability="degraded" lastObservedAt={ago(2)} lastSuccessAt={ago(2)} dataUpdatedAt={ago(3)} />
    </>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("region")).toHaveLength(3);
  },
};
