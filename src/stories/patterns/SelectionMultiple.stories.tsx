import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { SelectionMultiplePattern } from "../../patterns/SelectionMultiplePattern";
import { Shell } from "./_shell";

const meta: Meta<typeof SelectionMultiplePattern> = {
  title: "Page patterns/Sélection multiple",
  component: SelectionMultiplePattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof SelectionMultiplePattern>;

const pick = async (name: string) => {
  const page = within(document.body);
  await userEvent.click(page.getByRole("combobox", { name: "Rechercher" }));
  await userEvent.click(await page.findByRole("option", { name }));
};

/** Annuler ne change rien ; confirmer applique une seule fois. */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    await userEvent.click(canvas.getByRole("button", { name: "Ajouter des objets" }));
    await pick("Ligne 1");
    await userEvent.click(page.getByRole("button", { name: "Annuler" }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull(), { timeout: 1000 });
    await expect(canvas.getByText("Aucun objet")).toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Ajouter des objets" }));
    await pick("Ligne 1");
    await pick("Nation");
    await userEvent.click(page.getByRole("button", { name: "Retirer Ligne 1" }));
    await userEvent.click(page.getByRole("button", { name: "Confirmer (1)" }));
    await waitFor(() => expect(page.queryByRole("dialog")).toBeNull(), { timeout: 1000 });
    await expect(canvas.getByText("Nation")).toBeInTheDocument();
    await expect(canvas.queryByText("Ligne 1")).toBeNull();
  },
};

/** Catalogue indisponible : le message reste dans le panneau, la recherche est suspendue. */
export const Erreur: Story = {
  args: { error: true },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Ajouter des objets" }));
    await expect(within(document.body).getByText("Recherche indisponible")).toBeInTheDocument();
  },
};
