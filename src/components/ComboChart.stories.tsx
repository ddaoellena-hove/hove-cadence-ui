import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ComboChart } from "./ComboChart";

const meta: Meta<typeof ComboChart> = {
  title: "Composants/Visualisation de données/ComboChart",
  component: ComboChart,
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
type Story = StoryObj<typeof ComboChart>;

const DAYS = ["lun. 14", "mar. 15", "mer. 16", "jeu. 17", "ven. 18", "sam. 19", "dim. 20"];

/** Fréquentation (barres, axe gauche) et ponctualité (courbe, axe droit). */
export const FrequentationEtPonctualite: Story = {
  name: "Fréquentation et ponctualité",
  args: {
    title: "Fréquentation et ponctualité",
    description: "Ligne 13, du 14 au 20 octobre 2026",
    categories: DAYS,
    bars: [{ id: "validations", label: "Validations", data: [412, 428, 236, 405, 398, 262, 188] }],
    lines: [{ id: "ponctualite", label: "Ponctualité", data: [94.2, 93.8, 81.5, 92.9, 91.4, 95.6, 96.1] }],
    barAxis: { label: "Validations", unit: "k" },
    lineAxis: { label: "Ponctualité", unit: "%", domain: [70, 100] },
    lineThresholds: [{ value: 92, label: "Objectif 92 %" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Fréquentation et ponctualité" });

    // Clavier : « Voir les données », puis le tracé ; la catégorie est annoncée
    await userEvent.tab();
    await userEvent.tab();
    await expect(plot).toHaveFocus();
    // Début : première catégorie, même si le pointeur du test survole le tracé
    await userEvent.keyboard("{Home}");
    const live = canvasElement.querySelector("[aria-live]");
    await expect(live).toHaveTextContent(/^lun\. 14 — Validations : 412\sk, Ponctualité : 94,2\s%$/);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(live).toHaveTextContent(/^mer\. 16 — Validations : 236\sk, Ponctualité : 81,5\s%$/);

    // Alternative tabulaire : une colonne par série, avec son unité
    const table = canvas.getByRole("table", { name: "Fréquentation et ponctualité" });
    await expect(within(table).getByRole("columnheader", { name: "Ponctualité (%)" })).toBeInTheDocument();
    await expect(within(table).getAllByRole("row")).toHaveLength(8);
  },
};

/** Offre et demande : deux séries de barres groupées, une courbe de taux de charge. */
export const OffreEtDemande: Story = {
  name: "Offre et demande",
  args: {
    title: "Offre, demande et charge",
    description: "Ligne 4, jour ouvré type, par tranche horaire",
    categories: ["06 h", "07 h", "08 h", "09 h", "10 h", "12 h", "16 h", "17 h", "18 h", "19 h"],
    bars: [
      { id: "offre", label: "Places offertes", data: [14, 22, 26, 20, 12, 12, 18, 24, 26, 16] },
      { id: "demande", label: "Voyageurs", data: [8, 19, 27, 15, 7, 8, 13, 21, 24, 11] },
    ],
    lines: [{ id: "charge", label: "Taux de charge", data: [57, 86, 104, 75, 58, 67, 72, 88, 92, 69] }],
    barAxis: { label: "Volume", unit: "k" },
    lineAxis: { label: "Charge", unit: "%" },
    lineThresholds: [{ value: 100, label: "Capacité 100 %" }],
  },
};

/** Barres empilées par mode, courbe de ponctualité globale. */
export const BarresEmpilees: Story = {
  name: "Barres empilées",
  args: {
    title: "Validations par mode et ponctualité",
    categories: ["S39", "S40", "S41", "S42"],
    barLayout: "stacked",
    bars: [
      { id: "bus", label: "Bus", data: [820, 845, 790, 860] },
      { id: "metro", label: "Métro", data: [1210, 1260, 1105, 1290] },
      { id: "tram", label: "Tramway", data: [410, 430, 395, 445] },
    ],
    lines: [{ id: "ponctualite", label: "Ponctualité", data: [93.4, 94.1, 88.7, 94.6] }],
    barAxis: { label: "Validations", unit: "k" },
    lineAxis: { label: "Ponctualité", unit: "%", domain: [80, 100] },
  },
};

/** États : chargement, vide, erreur. */
const emptyArgs = {
  title: "Fréquentation et ponctualité",
  categories: [],
  bars: [],
  lines: [],
  barAxis: { label: "Validations" },
  lineAxis: { label: "Ponctualité" },
};

export const Chargement: Story = { args: { ...emptyArgs, state: "loading" } };

export const Vide: Story = { args: { ...emptyArgs, state: "empty" } };

export const Erreur: Story = { args: { ...emptyArgs, state: "error", onRetry: fn() } };
