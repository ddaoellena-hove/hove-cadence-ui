import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Treemap } from "./Treemap";

const meta: Meta<typeof Treemap> = {
  title: "Composants/Visualisation de données/Treemap",
  component: Treemap,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 760, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Treemap>;

const kilometres = {
  id: "reseau",
  label: "Réseau",
  children: [
    {
      id: "metro",
      label: "Métro",
      children: [
        { id: "m1", label: "Ligne 1", value: 1620 },
        { id: "m4", label: "Ligne 4", value: 1160 },
        { id: "m7", label: "Ligne 7", value: 1380 },
        { id: "m13", label: "Ligne 13", value: 1840 },
        { id: "m14", label: "Ligne 14", value: 1290 },
      ],
    },
    {
      id: "bus",
      label: "Bus",
      children: [
        { id: "b21", label: "Ligne 21", value: 420 },
        { id: "b38", label: "Ligne 38", value: 360 },
        { id: "b91", label: "Ligne 91", value: 640 },
        { id: "b95", label: "Ligne 95", value: 510 },
        { id: "b183", label: "Ligne 183", value: 580 },
        { id: "b62", label: "Ligne 62", value: 300 },
      ],
    },
    {
      id: "tram",
      label: "Tramway",
      children: [
        { id: "t2", label: "T2", value: 520 },
        { id: "t3a", label: "T3a", value: 720 },
        { id: "t3b", label: "T3b", value: 610 },
      ],
    },
    { id: "rer", label: "RER (part exploitée)", value: 980 },
  ],
};

const onTileClick = fn();

/** Kilomètres commerciaux du jour : réseau → mode → ligne. */
export const KilometresParLigne: Story = {
  name: "Kilomètres par mode et par ligne",
  args: {
    title: "Kilomètres commerciaux du jour",
    description: "Réseau → mode → ligne, jour ouvré type",
    unit: "km",
    data: kilometres,
    onTileClick,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onTileClick.mockClear();
    const plot = canvas.getByRole("group", { name: "Kilomètres commerciaux du jour" });
    plot.focus();
    await userEvent.keyboard("{Home}");
    // Première tuile : la plus grosse ligne de la plus grosse branche
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent(/^Métro › Ligne 13 : 1\s840\skm, \d+,\d\s% du total$/);
    await userEvent.keyboard("{End}{Enter}");
    await expect(onTileClick).toHaveBeenCalledWith(expect.objectContaining({ path: ["RER (part exploitée)"] }));
    // Légende des branches, feuille directe comprise
    const legend = canvas.getByRole("list", { name: "Légende" });
    await expect(within(legend).getAllByRole("listitem")).toHaveLength(4);
    await expect(within(canvas.getByRole("table", { name: "Kilomètres commerciaux du jour" })).getAllByRole("row")).toHaveLength(16);
  },
};

/** Une seule branche : validations par ligne de bus, sans légende. */
export const UnSeulNiveau: Story = {
  name: "Un seul niveau",
  args: {
    title: "Validations par ligne de bus",
    unit: "k validations",
    height: 260,
    data: {
      id: "bus",
      label: "Bus",
      children: kilometres.children[1].children?.map((c) => ({ ...c, value: (c.value ?? 0) * 3 })),
    },
  },
};

/** États : chargement, vide, erreur. */
const empty = { id: "r", label: "Réseau", children: [] };

export const Chargement: Story = { args: { title: "Kilomètres commerciaux", data: empty, state: "loading" } };

export const Vide: Story = { args: { title: "Kilomètres commerciaux", data: empty, state: "empty" } };

export const Erreur: Story = { args: { title: "Kilomètres commerciaux", data: empty, state: "error", onRetry: fn() } };
