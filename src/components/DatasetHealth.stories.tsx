import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DatasetHealth } from "./DatasetHealth";
import { VALIDATION_NOW } from "../stories/fixtures/validation";

const meta: Meta<typeof DatasetHealth> = {
  title: "Composants/Retours et statuts/DatasetHealth",
  component: DatasetHealth,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
  args: {
    label: "Offre théorique — GTFS Bordeaux Métropole",
    now: VALIDATION_NOW,
    timeZone: "Europe/Paris",
  },
};
export default meta;
type Story = StoryObj<typeof DatasetHealth>;

const TWO_HOURS_AGO = new Date(VALIDATION_NOW.getTime() - 2 * 3600 * 1000);

/** Validation échouée : verdict, compteurs, date et accès au rapport. */
export const Echec: Story = {
  name: "Échec",
  args: { verdict: "failed", errorCount: 2, warningCount: 1, validatedAt: TWO_HOURS_AGO, onViewReport: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole("region", { name: "Offre théorique — GTFS Bordeaux Métropole" });
    await expect(within(region).getByText("Invalide")).toBeInTheDocument();
    await expect(within(region).getByText("2")).toBeInTheDocument();
    await expect(within(region).getByText(/Validé il y a 2 h/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Voir le rapport" }));
    await expect(args.onViewReport).toHaveBeenCalledOnce();
  },
};

/** Validation réussie sans constat : 0 est affiché tel quel. */
export const Reussite: Story = {
  name: "Réussite",
  args: { verdict: "passed", errorCount: 0, warningCount: 0, validatedAt: TWO_HOURS_AGO },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Valide")).toBeInTheDocument();
    await expect(canvas.getAllByText("0")).toHaveLength(2);
    // Pas de callback : pas de bouton
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

/** Valide avec avertissements. */
export const Avertissements: Story = {
  args: { verdict: "warning", errorCount: 0, warningCount: 14, validatedAt: TWO_HOURS_AGO, onViewReport: fn() },
};

/** Verdict indisponible, compteurs inconnus : rien n'est affiché comme un succès ni comme 0. */
export const Inconnu: Story = {
  args: { verdict: "unknown" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Verdict inconnu")).toBeInTheDocument();
    await expect(canvas.getAllByText("Inconnu")).toHaveLength(2);
    await expect(canvas.queryByText("0")).not.toBeInTheDocument();
    await expect(canvas.getByText("Date inconnue")).toBeInTheDocument();
  },
};

/** Validation jamais exécutée : distincte d'une validation réussie, sans compteurs. */
export const NonExecutee: Story = {
  name: "Non exécutée",
  args: { verdict: "not-run" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Non validé")).toBeInTheDocument();
    await expect(canvas.getByText("Jamais validé")).toBeInTheDocument();
    await expect(canvas.queryByText("Erreurs")).not.toBeInTheDocument();
  },
};

/** Chargement : squelettes, `aria-busy`, ni verdict ni bouton. */
export const Chargement: Story = {
  args: { verdict: "unknown", loading: true, onViewReport: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region")).toHaveAttribute("aria-busy", "true");
    await expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

/** Deux bilans côte à côte : titres et régions distincts. */
export const DeuxInstances: Story = {
  name: "Deux instances",
  decorators: [(Story) => <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", maxWidth: 880 }}><Story /></div>],
  render: (args) => (
    <>
      <DatasetHealth {...args} label="Offre théorique" verdict="failed" errorCount={2} warningCount={1} validatedAt={TWO_HOURS_AGO} />
      <DatasetHealth {...args} label="Temps réel — GTFS-RT" verdict="passed" errorCount={0} warningCount={3} validatedAt={TWO_HOURS_AGO} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const regions = within(canvasElement).getAllByRole("region");
    await expect(regions).toHaveLength(2);
    await expect(regions[0].getAttribute("aria-labelledby")).not.toBe(regions[1].getAttribute("aria-labelledby"));
  },
};
