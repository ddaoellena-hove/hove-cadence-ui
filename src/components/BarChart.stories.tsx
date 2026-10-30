import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
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
  title: "Composants/Visualisation de données/BarChart",
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
/** Comparaison N vs N-1 : la semaine précédente en trait tireté sur chaque catégorie, l'écart au survol. */
export const ComparaisonN1: Story = {
  name: "Comparaison N vs N-1",
  args: {
    title: "Perturbations, semaine 43 vs semaine 42",
    description: "Toutes causes, par jour",
    unit: "perturbations",
    categories: ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."],
    series: [
      { id: "s43", label: "Semaine 43", data: [14, 18, 31, 16, 15, 8, 6] },
      { id: "s42", label: "Semaine 42", reference: true, data: [16, 15, 17, 19, 14, 9, 7] },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll(".bar-chart__reference")).toHaveLength(7);
    await userEvent.click(canvas.getByRole("group", { name: /Perturbations, semaine 43/ }));
    await userEvent.keyboard("{Home}{ArrowRight}{ArrowRight}");
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent(/^mer\. — Semaine 43 : 31\sperturbations, Semaine 42 : 17\sperturbations\. Écart vs Semaine 42 : \+14\sperturbations$/);
    // Tableau : la référence a sa colonne
    const table = canvas.getByRole("table", { name: "Perturbations, semaine 43 vs semaine 42" });
    await expect(within(table).getByRole("columnheader", { name: "Semaine 42 (perturbations)" })).toBeInTheDocument();
  },
};

/** Empilées par cause, total comparé à la semaine précédente. */
export const ComparaisonN1Empilees: Story = {
  name: "Comparaison N vs N-1 (empilées)",
  args: {
    title: "Perturbations par cause, S43 vs S42",
    unit: "perturbations",
    categories: ["lun.", "mar.", "mer.", "jeu.", "ven."],
    series: [
      { id: "works", label: "Travaux", data: [6, 5, 4, 6, 5] },
      { id: "technical", label: "Incident technique", data: [8, 11, 7, 6, 9] },
      { id: "s42", label: "Total S42", reference: true, data: [12, 19, 16, 10, 12] },
    ],
  },
};

/** Annotation : bande libellée sur une catégorie (grève), rappelée au survol. */
export const Annotation: Story = {
  args: {
    title: "Perturbations par jour",
    description: "Semaine 42, toutes causes",
    unit: "perturbations",
    categories: ["lun. 14", "mar. 15", "mer. 16", "jeu. 17", "ven. 18"],
    series: [{ id: "all", label: "Perturbations", data: [14, 18, 31, 16, 15] }],
    annotations: [{ at: "mer. 16", label: "Grève 16/10" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Grève 16/10")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("group", { name: /Perturbations par jour/ }));
    await userEvent.keyboard("{Home}{ArrowRight}{ArrowRight}");
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent(/^mer\. 16 — Perturbations : 31\sperturbations\. Grève 16\/10$/);
  },
};

/** Catégorie cliquable : clic sur la bande, Entrée ou Espace au clavier ; rappel dans le tooltip. */
export const Cliquable: Story = {
  args: {
    title: "Qualité des 7 dernières exécutions",
    description: "Contrôles conformes, en %",
    unit: "%",
    categories: ["21 oct.", "22 oct.", "23 oct.", "24 oct.", "25 oct.", "26 oct.", "27 oct."],
    series: [
      { id: "quality", label: "Qualité", data: [96, 94, 71, 97, 98, null, 95] },
      { id: "average", label: "Moyenne", reference: true, data: [92, 92, 92, 92, 92, 92, 92] },
    ],
    onDatumClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Qualité des 7 dernières exécutions" });
    await expect(plot).toHaveAccessibleDescription("Contrôles conformes, en % Entrée ou clic : voir le détail.");

    // Souris : clic n'importe où dans la bande (ici en haut du tracé, au-dessus de la barre)
    const label = [...plot.querySelectorAll("text")].find((t) => t.textContent === "23 oct.") as SVGTextElement;
    const x = label.getBoundingClientRect().left + label.getBoundingClientRect().width / 2;
    const at = { clientX: x, clientY: plot.getBoundingClientRect().top + 14 };
    fireEvent.mouseMove(plot, at);
    await expect(plot).toHaveClass("bar-chart__plot--clickable");
    fireEvent.click(plot, at);
    await expect(args.onDatumClick).toHaveBeenCalledWith({
      category: "23 oct.",
      index: 2,
      values: [{ seriesId: "quality", value: 71 }],
    });

    // Clavier : Entrée puis Espace sur la catégorie active ; rappel dans le tooltip
    plot.focus();
    await userEvent.keyboard("{Home}{Enter}");
    await expect(args.onDatumClick).toHaveBeenLastCalledWith(expect.objectContaining({ category: "21 oct.", index: 0 }));
    await expect(document.body.querySelector(".chart-tooltip")).toHaveTextContent("Entrée ou clic : voir le détail");
    await userEvent.keyboard("{ArrowRight} ");
    await expect(args.onDatumClick).toHaveBeenLastCalledWith(expect.objectContaining({ category: "22 oct.", index: 1 }));

    // Catégorie sans valeur : ni rappel ni appel
    const calls = (args.onDatumClick as ReturnType<typeof fn>).mock.calls.length;
    await userEvent.keyboard("{End}{ArrowLeft}{Enter}");
    await expect(args.onDatumClick).toHaveBeenCalledTimes(calls);
    await expect(document.body.querySelector(".chart-tooltip")).not.toHaveTextContent("voir le détail");

    // Sans graphique : les en-têtes de ligne du tableau sont des boutons
    await userEvent.click(canvas.getByRole("button", { name: "Voir les données" }));
    const table = canvas.getByRole("table", { name: "Qualité des 7 dernières exécutions" });
    await userEvent.click(within(table).getByRole("button", { name: "24 oct." }));
    await expect(args.onDatumClick).toHaveBeenLastCalledWith(expect.objectContaining({ category: "24 oct.", index: 3 }));
    await expect(within(table).queryByRole("button", { name: "26 oct." })).toBeNull();
  },
};

/** Empilé cliquable : le clic porte sur la colonne, le datum contient les deux séries. */
export const CliquableEmpile: Story = {
  name: "Cliquable empilé",
  args: {
    title: "Contrôles en problème par exécution",
    unit: "contrôles",
    categories: ["21 oct.", "22 oct.", "23 oct.", "24 oct.", "25 oct."],
    series: [
      { id: "errors", label: "Erreurs", data: [2, 0, 9, 1, 0] },
      { id: "warnings", label: "Avertissements", data: [5, 4, 12, 3, 2] },
    ],
    onDatumClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const plot = within(canvasElement).getByRole("group", { name: "Contrôles en problème par exécution" });
    plot.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    await expect(args.onDatumClick).toHaveBeenCalledWith({
      category: "23 oct.",
      index: 2,
      values: [
        { seriesId: "errors", value: 9 },
        { seriesId: "warnings", value: 12 },
      ],
    });
  },
};

/** Sélection contrôlée par l'app (filtre actif) : contour, autres barres atténuées, annonce. */
export const CategorieSelectionnee: Story = {
  name: "Catégorie sélectionnée",
  render: (args) => {
    const [selected, setSelected] = useState<string | undefined>("14 h");
    return (
      <div>
        <BarChart {...args} selectedCategory={selected} onDatumClick={(d) => setSelected(d.category)} />
        <button type="button" onClick={() => setSelected(undefined)}>
          Effacer le filtre
        </button>
      </div>
    );
  },
  args: {
    title: "Activité du flux sur 12 h",
    description: "Réceptions par créneau horaire",
    unit: "réceptions",
    categories: ["08 h", "09 h", "10 h", "11 h", "12 h", "13 h", "14 h", "15 h", "16 h", "17 h", "18 h", "19 h"],
    series: [{ id: "received", label: "Réceptions", data: [58, 60, 59, 61, 60, 0, 12, 60, 59, 60, 61, 58] }],
    annotations: [{ at: ["13 h", "14 h"], label: "Coupure de flux" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Activité du flux sur 12 h" });
    await expect(canvasElement.querySelector(".bar-chart__selected")).not.toBeNull();
    await expect(canvasElement.querySelectorAll(".bar-chart__bar--muted")).toHaveLength(10);
    await expect(plot).toHaveAccessibleDescription(/Sélection : 14 h\.$/);

    // Une catégorie annotée reste cliquable ; l'annonce signale la sélection
    plot.focus();
    await userEvent.keyboard("{End}{Enter}");
    const live = plot.querySelector("[aria-live]") as HTMLElement;
    await waitFor(() => expect(live).toHaveTextContent(/^19 h, sélectionné — Réceptions : 58\sréceptions$/));
    await userEvent.keyboard("{Home}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{Enter}");
    await waitFor(() => expect(live).toHaveTextContent(/^14 h, sélectionné — .*Coupure de flux$/));

    // L'app reste maîtresse de l'effacement
    await userEvent.click(canvas.getByRole("button", { name: "Effacer le filtre" }));
    await expect(canvasElement.querySelector(".bar-chart__selected")).toBeNull();
    await expect(canvasElement.querySelectorAll(".bar-chart__bar--muted")).toHaveLength(0);
  },
};

/** Sans onDatumClick : ni curseur, ni rappel, ni bouton dans le tableau ; Entrée sans effet. */
export const SansClic: Story = {
  name: "Sans clic",
  args: { ...Empilees.args, showValues: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Perturbations par cause" });
    await expect(plot).toHaveAccessibleDescription("Du mercredi 14 au mardi 20 octobre 2026");
    plot.focus();
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(plot).not.toHaveClass("bar-chart__plot--clickable");
    await expect(plot.querySelector("[aria-live]")).toHaveTextContent(/^jeu\. 15 — /);
    await expect(document.body.querySelector(".chart-tooltip")).not.toHaveTextContent("voir le détail");
    const table = canvas.getByRole("table", { name: "Perturbations par cause" });
    await expect(within(table).queryAllByRole("button")).toHaveLength(0);
  },
};

/** Annotation sur les derniers créneaux (flux interrompu « maintenant ») : libellé ancré à droite, jamais coupé. */
export const AnnotationEnFin: Story = {
  name: "Annotation en fin de période",
  args: {
    title: "Réceptions par créneau",
    unit: "réceptions",
    categories: ["08 h", "09 h", "10 h", "11 h", "12 h", "13 h", "14 h", "15 h"],
    series: [{ id: "received", label: "Réceptions", data: [58, 60, 59, 61, 60, 12, 0, 0] }],
    annotations: [{ at: ["14 h", "15 h"], label: "Aucune réception depuis 14 h" }],
  },
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByText("Aucune réception depuis 14 h");
    await expect(label).toHaveAttribute("text-anchor", "end");
    const svg = canvasElement.querySelector(".chart__svg") as SVGSVGElement;
    await waitFor(() => expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(svg.getBoundingClientRect().right));
  },
};

export const Chargement: Story = { args: { title: "Perturbations par cause", categories: [], series: [], state: "loading" } };

export const Vide: Story = { args: { title: "Perturbations par cause", categories: [], series: [], state: "empty" } };

export const Erreur: Story = {
  args: { title: "Perturbations par cause", categories: [], series: [], state: "error", onRetry: fn() },
};

import * as lot6Test from "storybook/test";
export const Activite240Lot6: Story = { args: { title: "Activité sur 12 heures", maxTicks: 12, categories: Array.from({ length: 240 }, (_, i) => `${String(Math.floor(i * 3 / 60)).padStart(2, "0")}:${String(i * 3 % 60).padStart(2, "0")}`), series: [{ id: "a", label: "Réceptions", data: Array.from({ length: 240 }, (_, i) => i % 17) }], selectedCategory: "06:00", onDatumClick: lot6Test.fn(), annotations: [{ at: ["04:00", "04:15"], label: "Coupure" }] }, play: async ({ canvasElement, args }) => { const c = lot6Test.within(canvasElement); const plot = c.getByRole("group", { name: "Activité sur 12 heures" }); plot.focus(); await lot6Test.userEvent.keyboard("{End}{Enter}"); await lot6Test.expect(args.onDatumClick).toHaveBeenCalledWith(lot6Test.expect.objectContaining({ index: 239 })); await lot6Test.expect(canvasElement.querySelectorAll(".chart__axis-label--date").length).toBeLessThanOrEqual(12); } };

/** État par créneau : visible même quand la barre est nulle. */
export const BandeEtat: Story = {
  args: {
    title: "Réceptions par créneau",
    unit: "courses",
    categories: ["08:00", "08:03", "08:06", "08:09", "08:12", "08:15"],
    series: [{ id: "courses", label: "Courses reçues", data: [120, 118, 0, 3, null, 122] }],
    statusBand: {
      label: "Santé des réceptions",
      values: ["ok", "ok", "ko", "ko", "gap", "ok"],
      states: [
        { id: "ok", label: "Réception OK", color: "var(--cadence-color-success)" },
        { id: "ko", label: "En erreur", color: "var(--cadence-color-danger)", pattern: "diagonal" },
        { id: "gap", label: "Aucune réception", color: "var(--cadence-color-warning)", pattern: "cross" },
      ],
    },
    onDatumClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // Bouton de série, entrées d'état statiques
    const legend = within(canvas.getByRole("list", { name: "Légende" }));
    await expect(legend.getByRole("button", { name: "Courses reçues" })).toBeInTheDocument();
    await expect(legend.queryByRole("button", { name: "En erreur" })).toBeNull();
    await expect(legend.getByText("En erreur")).toBeInTheDocument();
    const plot = canvas.getByRole("group", { name: "Réceptions par créneau" });
    plot.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(canvasElement.querySelector("[aria-live=polite]")).toHaveTextContent("Santé des réceptions : En erreur"));
    await userEvent.keyboard("{Enter}");
    await expect(args.onDatumClick).toHaveBeenCalledWith(expect.objectContaining({ index: 2 }));
  },
};
