import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { BarChart } from "./BarChart";
import {
  delayByLineAndCause,
  disruptionsByCause,
  disruptionsByModeWeekly,
  LINES_RANKED,
  WEEK_DAYS,
  WEEKS,
} from "../stories/fixtures/transport";

const meta: Meta<typeof BarChart> = {
  title: "Components/BarChart",
  component: BarChart,
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
type Story = StoryObj<typeof BarChart>;

/** Barres empilées : perturbations par cause et par jour, total au survol. */
export const Empilees: Story = {
  name: "Empilées (perturbations par cause)",
  args: {
    title: "Perturbations par cause",
    description: "Du mercredi 14 au mardi 20 octobre 2026",
    unit: "perturbations",
    categories: WEEK_DAYS,
    series: disruptionsByCause,
    showValues: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Perturbations par cause" });

    // Clavier : « Voir les données », puis le tracé ; ←/→ entre les catégories
    await userEvent.tab();
    await userEvent.tab();
    await expect(plot).toHaveFocus();
    const live = plot.querySelector("[aria-live]") as HTMLElement;
    await waitFor(() => expect(live).toHaveTextContent(/^mer\. 14 — Travaux : 6\sperturbations/));
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    // Vendredi : la grève apparaît, total de la pile
    await expect(live).toHaveTextContent(/^ven\. 16 — .*Mouvement social : 18\sperturbations\. Total : 34\sperturbations$/);
    await userEvent.keyboard("{End}");
    await expect(live).toHaveTextContent(/^mar\. 20/);
    await expect(document.body.querySelector(".chart-tooltip")).not.toBeNull();

    // Motif par série (sauf la première, unie) : pas de sens par la couleur seule
    await expect(canvasElement.querySelectorAll("svg.chart__svg pattern")).toHaveLength(3);
  },
};

/** Barres groupées : perturbations par mode, semaine par semaine ; légende cliquable. */
export const Groupees: Story = {
  name: "Groupées (par mode et par semaine)",
  args: {
    title: "Perturbations par mode",
    description: "4 dernières semaines",
    layout: "grouped",
    unit: "perturbations",
    categories: WEEKS,
    series: disruptionsByModeWeekly,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll(".bar-chart__bar")).toHaveLength(12);
    const rer = canvas.getByRole("button", { name: "RER" });
    await userEvent.click(rer);
    await expect(rer).toHaveAttribute("aria-pressed", "false");
    await expect(canvasElement.querySelectorAll(".bar-chart__bar")).toHaveLength(8);
  },
};

/** Horizontal : libellés longs ; ↑/↓ entre les lignes. */
export const Horizontal: Story = {
  name: "Horizontal (retard par ligne et par cause)",
  args: {
    title: "Retard cumulé par ligne",
    description: "Semaine du 14 octobre 2026, par cause",
    orientation: "horizontal",
    unit: "min",
    categories: LINES_RANKED,
    series: delayByLineAndCause,
    showValues: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Retard cumulé par ligne" });
    plot.focus();
    await userEvent.keyboard("{ArrowDown}");
    const live = plot.querySelector("[aria-live]") as HTMLElement;
    await expect(live).toHaveTextContent(/^RER B — Travaux : 210\smin, Incident technique : 280\smin, Malaise voyageur : 60\smin\. Total : 550\smin$/);
  },
};

/** Alternative tabulaire avec total par catégorie. */
export const VoirLesDonnees: Story = {
  name: "Voir les données",
  args: { ...Empilees.args, showValues: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Voir les données" }));
    const table = canvas.getByRole("table", { name: "Perturbations par cause" });
    await expect(within(table).getByRole("columnheader", { name: "Total" })).toBeInTheDocument();
    await expect(within(table).getAllByRole("row")).toHaveLength(8);
  },
};

/** Le graphique suit la largeur de son conteneur. */
export const Redimensionnement: Story = {
  render: (args) => {
    const [width, setWidth] = useState(600);
    return (
      <div>
        <button type="button" onClick={() => setWidth(360)}>
          Réduire à 360 px
        </button>
        <div style={{ width }}>
          <BarChart {...args} />
        </div>
      </div>
    );
  },
  args: { ...Empilees.args, showValues: false },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector(".chart__svg") as SVGSVGElement;
    await waitFor(() => expect(svg.getAttribute("width")).toBe("600"));
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Réduire à 360 px" }));
    await waitFor(() => expect(svg.getAttribute("width")).toBe("360"));
  },
};

/** États : chargement, vide, erreur. */
export const Chargement: Story = { args: { title: "Perturbations par cause", categories: [], series: [], state: "loading" } };

export const Vide: Story = { args: { title: "Perturbations par cause", categories: [], series: [], state: "empty" } };

export const Erreur: Story = {
  args: { title: "Perturbations par cause", categories: [], series: [], state: "error", onRetry: fn() },
};
