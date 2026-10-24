import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { DonutChart } from "./DonutChart";

const meta: Meta<typeof DonutChart> = {
  title: "Composants/Visualisation de données/DonutChart",
  component: DonutChart,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DonutChart>;

const tripsByMode = [
  { id: "bus", label: "Bus", value: 1240 },
  { id: "metro", label: "Métro", value: 980 },
  { id: "tram", label: "Tramway", value: 420 },
  { id: "rer", label: "RER", value: 278 },
];

/** Parts modales : total au centre, légende avec valeur et part. */
export const PartsModales: Story = {
  name: "Parts modales",
  args: {
    title: "Parts modales",
    description: "Validations du 14 au 20 octobre 2026, en milliers",
    unit: "k validations",
    slices: tripsByMode,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Parts modales" });
    await expect(plot).toHaveAccessibleDescription(/Total 2\s918\sk validations en 4 parts\. Plus grande part : Bus, 42,5\s%/);

    // Clavier : la première part s'active au focus, les flèches parcourent l'anneau
    // « Voir les données » d'abord, puis l'anneau
    await userEvent.tab();
    await userEvent.tab();
    await expect(plot).toHaveFocus();
    await expect(canvas.getByText(/^Bus : 1\s240\sk validations, 42,5\s%$/)).toBeInTheDocument();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByText(/^Métro : 980\sk validations, 33,6\s%$/)).toBeInTheDocument();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect(canvas.getByText(/^RER : 278\sk validations/)).toBeInTheDocument();

    // Alternative tabulaire : 4 parts + total
    const table = canvas.getByRole("table", { name: "Parts modales" });
    await expect(within(table).getAllByRole("row")).toHaveLength(6);
  },
};

/** État du parc : trois parts, unité « véhicules ». */
export const EtatDuParc: Story = {
  name: "État du parc",
  args: {
    title: "État du parc bus",
    description: "Dépôt de Saint-Denis, 24 octobre 2026 à 6 h",
    unit: "véhicules",
    centerLabel: "Véhicules",
    slices: [
      { id: "service", label: "En service", value: 142 },
      { id: "atelier", label: "En atelier", value: 18 },
      { id: "reserve", label: "Réserve", value: 12 },
    ],
  },
};

/** Au-delà de six parts, les plus petites sont regroupées dans « Autres ». */
export const RegroupementAutres: Story = {
  name: "Regroupement « Autres »",
  args: {
    title: "Causes de perturbation",
    description: "Octobre 2026",
    unit: "perturbations",
    othersLabel: "Autres causes",
    slices: [
      { id: "technique", label: "Incident technique", value: 48 },
      { id: "travaux", label: "Travaux", value: 36 },
      { id: "voyageur", label: "Malaise voyageur", value: 22 },
      { id: "trafic", label: "Trafic routier", value: 19 },
      { id: "meteo", label: "Météo", value: 9 },
      { id: "greve", label: "Mouvement social", value: 6 },
      { id: "colis", label: "Colis suspect", value: 4 },
      { id: "animal", label: "Animal sur la voie", value: 2 },
    ],
  },
  play: async ({ canvasElement }) => {
    const legend = within(canvasElement).getByRole("list", { name: "Légende" });
    const items = within(legend).getAllByRole("listitem");
    await expect(items).toHaveLength(6);
    await expect(items[5]).toHaveTextContent(/Autres causes\s*12/);
  },
};

/** Sans légende, dans un espace réduit. */
export const SansLegende: Story = {
  name: "Sans légende",
  args: { title: "Parts modales", slices: tripsByMode, showLegend: false, size: 160 },
};

/** États : chargement, vide, erreur. */
export const Chargement: Story = { args: { title: "Parts modales", slices: [], state: "loading" } };

export const Vide: Story = { args: { title: "Parts modales", slices: [], state: "empty" } };

export const Erreur: Story = { args: { title: "Parts modales", slices: [], state: "error", onRetry: fn() } };
