import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BarList } from "./BarList";
import { Badge } from "./Badge";
import { topImpactedLines } from "../stories/fixtures/transport";

const meta: Meta<typeof BarList> = {
  title: "Components/BarList",
  component: BarList,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BarList>;

const onShowAll = fn();
const onItemClick = fn();

/** Les 10 lignes les plus impactées : 5 affichées, « Voir tout », lignes cliquables. */
export const LignesLesPlusImpactees: Story = {
  name: "Lignes les plus impactées",
  args: {
    title: "Lignes les plus impactées",
    description: "Perturbations du 14 au 20 octobre 2026, variation vs semaine précédente",
    unit: "perturbations",
    goodDirection: "down",
    items: topImpactedLines,
    limit: 5,
    onShowAll,
    onItemClick,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onShowAll.mockClear();
    onItemClick.mockClear();
    const list = canvas.getByRole("list", { name: "Lignes les plus impactées" });
    await expect(within(list).getAllByRole("listitem")).toHaveLength(5);

    // Nom accessible complet : valeur, unité et variation jugée
    const line13 = canvas.getByRole("button", { name: "Ligne 13 : 42 perturbations, en hausse de 12 %, défavorable" });
    await userEvent.click(line13);
    await expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ id: "l13" }));

    // Au clavier
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect(onItemClick).toHaveBeenCalledTimes(2);

    await userEvent.click(canvas.getByRole("button", { name: "Voir tout (10)" }));
    await expect(onShowAll).toHaveBeenCalledTimes(1);

    // Alternative tabulaire : les 10 lignes, même celles masquées par limit
    await expect(within(canvas.getByRole("table", { name: "Lignes les plus impactées" })).getAllByRole("row")).toHaveLength(11);
  },
};

/** Sans variation ni clic, trié par valeur décroissante. */
export const Simple: Story = {
  args: {
    title: "Retard cumulé par mode",
    unit: "min",
    sort: "desc",
    items: [
      { id: "metro", label: "Métro", value: 1240 },
      { id: "rer", label: "RER", value: 2610 },
      { id: "bus", label: "Bus", value: 3820 },
      { id: "tram", label: "Tram", value: 640 },
    ],
  },
  play: async ({ canvasElement }) => {
    const rows = within(canvasElement).getAllByRole("group");
    await expect(rows[0]).toHaveAccessibleName("Bus : 3 820 min");
  },
};

/** Libellé en ReactNode (ici un Badge) : `ariaLabel` donne le nom accessible. */
export const LibelleEnrichi: Story = {
  name: "Libellé enrichi",
  args: {
    title: "Lignes RER",
    unit: "perturbations",
    goodDirection: "down",
    items: [
      { id: "rera", label: <Badge label="RER A" />, ariaLabel: "RER A", value: 24, delta: { value: 4 } },
      { id: "rerb", label: <Badge label="RER B" />, ariaLabel: "RER B", value: 38, delta: { value: 31 } },
    ],
  },
};

/** États : chargement, vide, erreur. */
export const Chargement: Story = { args: { title: "Lignes les plus impactées", items: [], state: "loading" } };

export const Vide: Story = {
  args: { title: "Lignes les plus impactées", items: [], state: "empty", emptyMessage: "Aucune perturbation sur la période." },
};

export const Erreur: Story = { args: { title: "Lignes les plus impactées", items: [], state: "error", onRetry: fn() } };
