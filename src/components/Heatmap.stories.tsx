import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { Heatmap } from "./Heatmap";
import { disruptionsByWeekdayHour, SERVICE_HOURS, WEEKDAYS } from "../stories/fixtures/transport";

const meta: Meta<typeof Heatmap> = {
  title: "Components/Heatmap",
  component: Heatmap,
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
type Story = StoryObj<typeof Heatmap>;

const onCellClick = fn();

/** Perturbations jour × heure sur 4 semaines ; clic ou Entrée ouvre la liste filtrée. */
export const PerturbationsJourHeure: Story = {
  name: "Perturbations jour × heure",
  args: {
    title: "Perturbations par jour et par heure",
    description: "Cumul des 4 dernières semaines, toutes lignes",
    unit: "perturbations",
    xLabels: SERVICE_HOURS,
    yLabels: WEEKDAYS,
    cells: disruptionsByWeekdayHour,
    onCellClick,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onCellClick.mockClear();
    const grid = canvas.getByRole("grid", { name: "Perturbations par jour et par heure" });
    await expect(within(grid).getAllByRole("columnheader")).toHaveLength(20);
    await expect(within(grid).getAllByRole("rowheader")).toHaveLength(7);

    // Une seule cellule tabulable (roving tabindex), la première
    await userEvent.tab();
    const first = within(grid).getByRole("gridcell", { name: /^lun\., 05 h : / });
    await expect(first).toHaveFocus();
    const live = canvasElement.querySelector(".heatmap__wrap [aria-live]") as HTMLElement;
    await expect(live).toHaveTextContent(/^lun\., 05 h : \d+\sperturbations$/);
    await expect(document.body.querySelector(".chart-tooltip")).not.toBeNull();

    // Flèches, Fin, Ctrl+Fin
    await userEvent.keyboard("{ArrowRight}{ArrowDown}");
    await expect(within(grid).getByRole("gridcell", { name: /^mar\., 06 h : / })).toHaveFocus();
    await userEvent.keyboard("{End}");
    await expect(within(grid).getByRole("gridcell", { name: /^mar\., 00 h : / })).toHaveFocus();
    await userEvent.keyboard("{Control>}{End}{/Control}");
    // 0 h le dimanche : pas de service, cellule vide (≠ 0)
    await expect(within(grid).getByRole("gridcell", { name: "dim., 00 h : pas de donnée" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(onCellClick).not.toHaveBeenCalled();

    // Entrée sur une cellule renseignée
    await userEvent.keyboard("{ArrowLeft}{Enter}");
    await expect(onCellClick).toHaveBeenCalledWith(expect.objectContaining({ x: "23 h", y: "dim." }));
  },
};

const LINES = ["Ligne 1", "Ligne 4", "Ligne 7", "Ligne 13", "RER A", "RER B"];
const delayCells = LINES.flatMap((line, l) =>
  WEEKDAYS.map((day, d) => ({
    x: day,
    y: line,
    // Retard moyen (min) : ligne 13 et RER B plus touchés, grève le vendredi
    value: Math.round(((l === 3 || l === 5 ? 6 : 2) + (d === 4 ? 5 : 0) + ((l * 7 + d * 3) % 5) * 0.6) * 10) / 10,
  })),
);

/** Ligne × jour, domaine imposé (0 → 15 min). */
export const RetardLigneJour: Story = {
  name: "Retard par ligne et par jour",
  args: {
    title: "Retard moyen par ligne et par jour",
    description: "Semaine du 14 octobre 2026",
    unit: "min",
    xLabels: WEEKDAYS,
    yLabels: LINES,
    cells: delayCells,
    domain: [0, 15],
    rowHeight: 32,
  },
};

/** États : chargement, vide, erreur. */
export const Chargement: Story = {
  args: { title: "Perturbations par jour et par heure", xLabels: [], yLabels: [], cells: [], state: "loading" },
};

export const Vide: Story = {
  args: { title: "Perturbations par jour et par heure", xLabels: [], yLabels: [], cells: [], state: "empty" },
};

export const Erreur: Story = {
  args: {
    title: "Perturbations par jour et par heure",
    xLabels: [],
    yLabels: [],
    cells: [],
    state: "error",
    errorMessage: "Le service de statistiques ne répond pas.",
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("alert")).toHaveTextContent("Le service de statistiques ne répond pas.");
  },
};
