import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { RapportQualitePattern } from "../../patterns/RapportQualitePattern";
import { VALIDATION_NOW } from "../fixtures/validation";
import { Shell } from "./_shell";

const meta: Meta<typeof RapportQualitePattern> = {
  title: "Page patterns/Rapport qualité",
  component: RapportQualitePattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell><Story /></Shell>],
  args: { now: VALIDATION_NOW },
};
export default meta;
type Story = StoryObj<typeof RapportQualitePattern>;

/** Bilan global, filtres, constat ouvert dans un Drawer ; Échap rend le focus à la ligne. */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Rapport qualité" })).toBeInTheDocument();
    await expect(canvas.getByRole("region", { name: /GTFS Bordeaux Métropole/ })).toHaveTextContent("Invalide");

    const row = canvas.getByText("Départ antérieur à l’arrivée au même arrêt.").closest<HTMLElement>('[role="row"]')!;
    await userEvent.click(row);
    const drawer = await within(document.body).findByRole("dialog", { name: "Détail du constat" });
    await expect(within(drawer).getByText("departure_time")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(row).toHaveFocus());
  },
};

/** Recherche sans résultat : le bilan global reste inchangé. */
export const SansResultat: Story = {
  name: "Recherche sans résultat",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Rechercher un constat" }), "introuvable{Enter}");
    await expect(await canvas.findByText("Aucun constat pour ces filtres")).toBeInTheDocument();
    const health = canvas.getByRole("region", { name: /GTFS Bordeaux Métropole/ });
    await expect(health).toHaveTextContent("Invalide");
    await expect(within(health).getByText("2")).toBeInTheDocument();
  },
};

/** Validation réussie sans constat. */
export const Reussite: Story = {
  name: "Réussite",
  args: { issues: [], verdict: "passed" },
};

/** Chargement du rapport. */
export const Chargement: Story = { args: { issues: [], verdict: "unknown", loading: true } };
