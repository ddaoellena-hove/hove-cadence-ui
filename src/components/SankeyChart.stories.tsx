import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SankeyChart } from "./SankeyChart";

const meta: Meta<typeof SankeyChart> = {
  title: "Composants/Visualisation de données/SankeyChart",
  component: SankeyChart,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 860, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SankeyChart>;

const onLinkClick = fn();

/** Origine → destination : voyages entre gares, en milliers. */
export const OrigineDestination: Story = {
  name: "Origine → destination",
  args: {
    title: "Voyages origine → destination",
    description: "Jour ouvré type, en milliers ; à gauche l'origine, à droite la destination",
    unit: "k voyages",
    nodes: [
      { id: "o-cha", label: "Châtelet", column: 0 },
      { id: "o-gdl", label: "Gare de Lyon", column: 0 },
      { id: "o-gdn", label: "Gare du Nord", column: 0 },
      { id: "d-def", label: "La Défense", column: 1 },
      { id: "d-nat", label: "Nation", column: 1 },
      { id: "d-mon", label: "Montparnasse", column: 1 },
    ],
    links: [
      { source: "o-cha", target: "d-def", value: 88 },
      { source: "o-cha", target: "d-nat", value: 31 },
      { source: "o-cha", target: "d-mon", value: 24 },
      { source: "o-gdl", target: "d-def", value: 46 },
      { source: "o-gdl", target: "d-nat", value: 22 },
      { source: "o-gdn", target: "d-def", value: 27 },
      { source: "o-gdn", target: "d-mon", value: 19 },
    ],
    onLinkClick,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onLinkClick.mockClear();
    const plot = canvas.getByRole("group", { name: "Voyages origine → destination" });
    plot.focus();
    await userEvent.keyboard("{Home}");
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent(/^Châtelet → La Défense : 88\sk voyages, 62\s% des départs de Châtelet$/);
    await userEvent.keyboard("{End}{Enter}");
    await expect(onLinkClick).toHaveBeenCalledWith({ source: "o-gdn", target: "d-mon", value: 19 });
    const table = canvas.getByRole("table", { name: "Voyages origine → destination" });
    await expect(within(table).getAllByRole("row")).toHaveLength(8);
  },
};

/** Trois étapes déduites des liens : mode d'accès → pôle de correspondance → mode de sortie. */
export const Correspondances: Story = {
  args: {
    title: "Correspondances au pôle de Châtelet",
    unit: "k voyageurs",
    nodes: [
      { id: "in-rer", label: "RER (arrivée)" },
      { id: "in-metro", label: "Métro (arrivée)" },
      { id: "in-bus", label: "Bus (arrivée)" },
      { id: "hub", label: "Châtelet – Les Halles" },
      { id: "out-metro", label: "Métro (départ)" },
      { id: "out-rer", label: "RER (départ)" },
      { id: "out-walk", label: "Sortie à pied" },
    ],
    links: [
      { source: "in-rer", target: "hub", value: 120 },
      { source: "in-metro", target: "hub", value: 95 },
      { source: "in-bus", target: "hub", value: 18 },
      { source: "hub", target: "out-metro", value: 104 },
      { source: "hub", target: "out-rer", value: 71 },
      { source: "hub", target: "out-walk", value: 58 },
    ],
  },
};

/** États : chargement, vide, erreur. */
const emptyArgs = { title: "Voyages origine → destination", nodes: [], links: [] };

export const Chargement: Story = { args: { ...emptyArgs, state: "loading" } };

export const Vide: Story = { args: { ...emptyArgs, state: "empty" } };

export const Erreur: Story = { args: { ...emptyArgs, state: "error", onRetry: fn() } };
