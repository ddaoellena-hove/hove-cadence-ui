import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Timeline, type TimelineRow } from "./Timeline";

const ROWS: TimelineRow[] = [
  { id: "m1", label: "Ligne 1", items: [
    { id: "a", start: "08:00", end: "12:00", label: "Travaux", tone: "warning" },
    { id: "b", start: "14:00", end: "17:30", label: "Ralenti", tone: "critical" },
  ] },
  { id: "rA", label: "RER A", items: [{ id: "c", start: "06:30", end: "09:00", label: "Affluence", tone: "info" }] },
  { id: "t3", label: "T3b", items: [{ id: "d", start: "10:00", end: "11:00", label: "Incident", tone: "nominal" }] },
];

const meta: Meta<typeof Timeline> = {
  title: "Components/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { title: "Perturbations de la journée", rows: ROWS, now: "10:30", onItemClick: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Timeline>;

/** Clavier : flèches pour parcourir les plages, Entrée pour ouvrir. */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("group", { name: /Perturbations de la journée/ });
    grid.focus();
    const status = canvas.getByRole("status");
    // Focus initial sur la 1re plage de la 1re ligne.
    await waitFor(() => expect(status).toHaveTextContent(/Ligne 1/));
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(status).toHaveTextContent(/Ralenti/));
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(status).toHaveTextContent(/RER A/));
    // Entrée ouvre la plage.
    await userEvent.keyboard("{Enter}");
    await expect(args.onItemClick).toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
  },
};

/** « Voir les données » : alternative tabulaire. */
export const VoirLesDonnees: Story = {
  name: "Voir les données",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Voir les données" }));
    await expect(canvas.getByRole("table", { name: /Perturbations/ })).toBeInTheDocument();
    await expect(canvas.getByText("Travaux")).toBeInTheDocument();
  },
};

/** Service après minuit : heures jusqu'à 47:59. */
export const ServiceDeNuit: Story = {
  name: "Service après minuit",
  args: {
    title: "Amplitudes de service",
    now: undefined,
    allowOvernight: true,
    rows: [
      { id: "m1", label: "Ligne 1", items: [{ id: "a", start: "05:30", end: "25:30", label: "Service", tone: "active" }] },
      { id: "n", label: "Noctilien", items: [{ id: "b", start: "00:30", end: "05:30", label: "Service de nuit", tone: "upcoming" }] },
    ],
  },
};

export const Vide: Story = { name: "Vide", args: { state: "empty", rows: [] } };
export const Erreur: Story = { name: "Erreur", args: { state: "error", rows: [], onRetry: fn() } };
