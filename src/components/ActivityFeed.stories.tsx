import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ActivityFeed } from "./ActivityFeed";

const meta: Meta<typeof ActivityFeed> = {
  title: "Composants/Données et tableaux/ActivityFeed", component: ActivityFeed, tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
  args: { "aria-label": "Historique de la perturbation", timeZone: "Europe/Paris", items: [
    { id: "publish", title: "Message voyageurs publié", date: new Date("2026-10-22T08:30:00Z"), author: "Camille Martin", tone: "success", description: "La reprise du trafic est annoncée à 17:00." },
    { id: "warning", title: "Période de travaux prolongée", date: new Date("2026-10-22T07:15:00Z"), author: "Alex Dupont", tone: "warning", description: "L’horaire de reprise a été révisé." },
    { id: "error", title: "Échec de diffusion initial", date: new Date("2026-10-22T07:10:00Z"), tone: "danger" },
    { id: "create", title: "Perturbation créée", date: new Date("2026-10-22T06:00:00Z"), author: "Camille Martin" },
  ] },
};
export default meta;
type Story = StoryObj<typeof ActivityFeed>;
export const Historique: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("listitem")).toHaveLength(4);
    await expect(canvas.getByText("Succès")).toBeInTheDocument();
    await expect(canvas.getByText("Erreur")).toBeInTheDocument();
    const firstDate = canvasElement.querySelector("time");
    await expect(firstDate).toHaveAttribute("datetime", "2026-10-22T08:30:00.000Z");
    await expect(firstDate).toHaveTextContent("10:30");
  },
};
export const Vide: Story = { args: { items: [] } };
export const Chargement: Story = {
  args: { items: [], loading: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("region", { name: "Historique de la perturbation" })).toHaveAttribute("aria-busy", "true");
  },
};
export const DateManquante: Story = {
  name: "Date invalide",
  args: { items: [{ id: "old", title: "Événement importé", date: new Date("invalid") }] },
  // Code source fixe : le générateur JSX de Storybook appelle toISOString() sur la date invalide et plante.
  parameters: { docs: { source: { code: `<ActivityFeed aria-label="Historique de la perturbation" items={[{ id: "old", title: "Événement importé", date: new Date("invalid") }]} />` } } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Date indisponible")).toBeInTheDocument();
    await expect(canvasElement.querySelector("time")).toBeNull();
  },
};
