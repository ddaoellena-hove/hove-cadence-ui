import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { DisruptionScopePicker } from "./DisruptionScopePicker";
import type { TreeNode } from "./tree-view-utils";

const RESEAU: TreeNode[] = [
  {
    id: "metro",
    label: "Métro",
    icon: "train",
    children: [
      { id: "m1", label: "Ligne 1" },
      { id: "m4", label: "Ligne 4" },
      { id: "m14", label: "Ligne 14" },
    ],
  },
  {
    id: "rer",
    label: "RER",
    icon: "train",
    children: [
      { id: "ra", label: "RER A" },
      { id: "rb", label: "RER B" },
    ],
  },
  { id: "bus", label: "Bus", icon: "bus", hasChildren: true },
];

const meta: Meta<typeof DisruptionScopePicker> = {
  title: "Composants/Transport/DisruptionScopePicker",
  component: DisruptionScopePicker,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  args: { label: "Périmètre de la perturbation", nodes: RESEAU },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof DisruptionScopePicker>;

/** Ouverture, sélection d'un réseau entier, chips du périmètre retenu. */
export const Defaut: Story = {
  name: "Défaut",
  render: function Demo(args) {
    const [value, setValue] = useState<string[]>([]);
    return <DisruptionScopePicker {...args} value={value} onChange={setValue} helperText="Lignes et réseaux concernés." />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Tout le réseau/ }));
    const dialog = await within(document.body).findByRole("dialog", { name: /Périmètre de la perturbation/ });
    const panel = within(dialog);
    // Cocher le réseau Métro entier → ses 3 lignes.
    await userEvent.click(panel.getByRole("treeitem", { name: /Métro/ }));
    await waitFor(() => expect(panel.getByRole("treeitem", { name: /Métro/ })).toHaveAttribute("aria-checked", "true"));
    await userEvent.keyboard("{Escape}");
    // Chips sous le champ + résumé sur le champ.
    await waitFor(() => expect(canvas.getByRole("button", { name: "Supprimer Ligne 1" })).toBeInTheDocument());
    await expect(canvas.getByRole("button", { name: /Ligne 1 \+2/ })).toBeInTheDocument();
  },
};

/** Recherche : filtre l'arbre et déplie les branches correspondantes. */
export const Recherche: Story = {
  render: function Demo(args) {
    const [value, setValue] = useState<string[]>([]);
    return <DisruptionScopePicker {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Tout le réseau/ }));
    const dialog = await within(document.body).findByRole("dialog");
    const panel = within(dialog);
    await userEvent.type(panel.getByPlaceholderText("Rechercher une ligne…"), "Ligne 14");
    await waitFor(() => expect(panel.getByRole("treeitem", { name: /Ligne 14/ })).toBeInTheDocument());
    await expect(panel.queryByRole("treeitem", { name: /RER A/ })).toBeNull();
    await userEvent.keyboard("{Escape}");
  },
};

/** Périmètre pré-rempli : chips affichées, retirables. */
export const AvecPerimetre: Story = {
  name: "Périmètre pré-rempli",
  render: function Demo(args) {
    const [value, setValue] = useState<string[]>(["m1", "ra"]);
    return <DisruptionScopePicker {...args} value={value} onChange={setValue} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Supprimer Ligne 1" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Supprimer RER A" })).toBeInTheDocument();
    // Retirer un chip met à jour le périmètre.
    await userEvent.click(canvas.getByRole("button", { name: "Supprimer RER A" }));
    await waitFor(() => expect(canvas.queryByRole("button", { name: "Supprimer RER A" })).toBeNull());
  },
};

/** État d'erreur (ex. périmètre obligatoire non renseigné). */
export const Erreur: Story = {
  args: { state: "error", required: true, helperText: "Sélectionnez au moins une ligne." },
};
