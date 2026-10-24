import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { DateRangePicker } from "./DateRangePicker";
import { LineChart } from "./LineChart";
import {
  dailyPunctuality,
  hourlyDelays,
  punctualityByMode,
  STRIKE_END,
  STRIKE_START,
  tripsByMode,
} from "../stories/fixtures/transport";

const meta: Meta<typeof LineChart> = {
  title: "Composants/Visualisation de données/LineChart",
  component: LineChart,
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
type Story = StoryObj<typeof LineChart>;

const delaySeries = [{ id: "delay", label: "Retard moyen", data: hourlyDelays }];

/** Retards moyens par heure sur 7 jours : seuil d'alerte et bande « Grève 16/10 ». */
export const RetardsParHeure: Story = {
  name: "Retards par heure (seuil + grève)",
  args: {
    title: "Retard moyen par heure",
    description: "Du mercredi 14 au mardi 20 octobre 2026, toutes lignes",
    unit: "min",
    goodDirection: "down",
    series: delaySeries,
    thresholds: [{ value: 5, label: "Seuil d'alerte 5 min" }],
    annotations: [{ at: [STRIKE_START, STRIKE_END], label: "Grève 16/10" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Retard moyen par heure" });
    await expect(plot).toHaveAccessibleDescription("Du mercredi 14 au mardi 20 octobre 2026, toutes lignes");

    // Clavier : « Voir les données » puis le tracé ; le focus active le premier point
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Voir les données" })).toHaveFocus();
    await userEvent.tab();
    await expect(plot).toHaveFocus();
    const live = plot.querySelector("[aria-live]") as HTMLElement;
    await waitFor(() => expect(live).toHaveTextContent(/^mercredi 14 octobre à 05:00 — Retard moyen : /));
    await userEvent.keyboard("{ArrowRight}");
    await expect(live).toHaveTextContent(/^mercredi 14 octobre à 06:00/);
    await userEvent.keyboard("{End}");
    await expect(live).toHaveTextContent(/^mardi 20 octobre à 23:00/);
    // Le tooltip suit, dans un portail
    await expect(document.body.querySelector(".chart-tooltip")).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect(live).toHaveTextContent("");

    // Pendant la grève, le tooltip signale l'annotation et le seuil franchi
    await userEvent.keyboard("{Home}");
    for (let i = 0; i < 2 * 19 + 3; i++) await userEvent.keyboard("{ArrowRight}");
    await expect(live).toHaveTextContent(/vendredi 16 octobre à 08:00.*Grève 16\/10.*Seuil d'alerte 5 min franchi/);

    // Le seuil est libellé et marqué « franchi »
    await expect(canvasElement.querySelector(".line-chart__threshold--breached")).not.toBeNull();
  },
};

/** Ponctualité sur 30 jours en aire, objectif 95 % (une baisse est défavorable). */
export const PonctualiteEnAire: Story = {
  name: "Ponctualité sur 30 jours (aire)",
  args: {
    title: "Ponctualité",
    description: "Du 21 septembre au 20 octobre 2026",
    variant: "area",
    unit: "%",
    yDomain: [85, 100],
    goodDirection: "up",
    series: [{ id: "punctuality", label: "Ponctualité", data: dailyPunctuality }],
    thresholds: [{ value: 95, label: "Objectif 95 %" }],
    annotations: [{ at: new Date(2026, 9, 16), label: "Grève" }],
  },
};

/** Trois séries : couleur, forme de marqueur et motif de trait distincts ; légende cliquable. */
export const PonctualiteParMode: Story = {
  name: "Ponctualité par mode (3 séries)",
  args: {
    title: "Ponctualité par mode",
    description: "Du 21 septembre au 20 octobre 2026",
    unit: "%",
    yDomain: [85, 100],
    series: punctualityByMode,
    thresholds: [{ value: 95, label: "Objectif 95 %" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rer = canvas.getByRole("button", { name: "RER" });
    await expect(rer).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(rer);
    await expect(rer).toHaveAttribute("aria-pressed", "false");
    await expect(canvasElement.querySelectorAll(".line-chart__line")).toHaveLength(2);
  },
};

/** Aires empilées : courses réalisées par mode. */
export const CoursesEmpilees: Story = {
  name: "Courses par mode (aires empilées)",
  args: {
    title: "Courses réalisées par mode",
    description: "En milliers, du 14 au 20 octobre 2026",
    variant: "area",
    stacked: true,
    unit: "k",
    series: tripsByMode,
    annotations: [{ at: new Date(2026, 9, 16), label: "Grève" }],
  },
};

/** Paliers (`curve="step"`) : l'offre tient d'une tranche horaire à la suivante. */
export const OffreParTranche: Story = {
  name: "Offre par tranche horaire (paliers)",
  args: {
    title: "Passages par heure — Ligne 13",
    description: "Offre planifiée, jour ouvré et samedi",
    curve: "step",
    unit: "passages",
    format: { maximumFractionDigits: 0 },
    series: [
      {
        id: "ouvre",
        label: "Jour ouvré",
        data: [6, 12, 20, 20, 14, 12, 12, 12, 14, 18, 20, 16, 10, 6].map((y, i) => ({ x: `${String(i + 5).padStart(2, "0")} h`, y })),
      },
      {
        id: "samedi",
        label: "Samedi",
        data: [4, 6, 10, 12, 12, 12, 12, 12, 12, 12, 12, 10, 8, 6].map((y, i) => ({ x: `${String(i + 5).padStart(2, "0")} h`, y })),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    // Tracé en paliers : segments horizontaux puis verticaux (commandes H/V ou L alignées)
    const line = canvasElement.querySelector(".line-chart__line");
    await expect(line?.getAttribute("d")).not.toMatch(/C/);
  },
};

/** Heures de service (`serviceTime`) : la soirée continue après minuit, sans couper à 24:00. */
export const ServiceDeNuit: Story = {
  name: "Service de nuit (heures de service)",
  args: {
    title: "Voyageurs à bord — service de nuit",
    description: "Noctilien N13, jour de service du 23 octobre 2026",
    serviceTime: true,
    unit: "voyageurs",
    format: { maximumFractionDigits: 0 },
    series: [
      {
        id: "n13",
        label: "N13",
        data: [
          ["21:30", 140], ["22:00", 182], ["22:30", 205], ["23:00", 230], ["23:30", 260], ["24:00", 310],
          ["24:30", 340], ["25:00", 290], ["25:30", 220], ["26:00", 160], ["27:00", 90], ["28:30", 40],
        ].map(([x, y]) => ({ x: x as string, y: y as number })),
      },
    ],
    annotations: [{ at: "24:00", label: "Changement de jour calendaire" }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Graduations d'horloge au-delà de 24h00
    await expect(canvas.getAllByText("25h00").length).toBeGreaterThan(0);
    // Alternative tabulaire : colonne « Heure », valeurs au format horaire
    const table = canvas.getByRole("table", { name: "Voyageurs à bord — service de nuit" });
    await expect(within(table).getByRole("columnheader", { name: "Heure" })).toBeInTheDocument();
    await expect(within(table).getByRole("rowheader", { name: "25h30" })).toBeInTheDocument();
  },
};

/** Comparaison N vs N-1 : la série de référence (2025, recalée sur les dates 2026) est tiretée, l'écart est rappelé au survol. */
export const ComparaisonN1: Story = {
  name: "Comparaison N vs N-1",
  args: {
    title: "Ponctualité, octobre 2026 vs octobre 2025",
    description: "Réseau bus, ponctualité quotidienne ; 2025 recalée sur les mêmes dates",
    unit: "%",
    yDomain: [85, 100],
    thresholds: [{ value: 92, label: "Objectif 92 %" }],
    series: [
      { id: "n", label: "2026", data: dailyPunctuality },
      { id: "n1", label: "2025", reference: true, data: dailyPunctuality.map((p, i) => ({ x: p.x, y: Math.round((94.1 + Math.sin(i / 3) * 1.4) * 10) / 10 })) },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Légende : la référence garde sa place, avec sa pastille tiretée
    await expect(canvas.getByRole("button", { name: "2025" })).toBeInTheDocument();
    // Clavier : l'écart avec la référence est annoncé
    await userEvent.click(canvas.getByRole("group", { name: /Ponctualité, octobre 2026/ }));
    await userEvent.keyboard("{Home}");
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent(/Écart vs 2025 : [+−]\d+(,\d)?\spt/);
  },
};

const onExport = fn();

/**
 * Export CSV (`exportable`) et fraîcheur (`freshness`) dans l'en-tête, pour
 * tous les graphiques qui ont « Voir les données ». Sans `onExport`, le
 * fichier est téléchargé ; ici, il est intercepté.
 */
export const ExportEtFraicheur: Story = {
  name: "Export CSV et fraîcheur",
  args: {
    title: "Retard moyen par heure",
    description: "7 derniers jours, toutes lignes",
    unit: "min",
    series: [{ id: "delay", label: "Retard moyen", data: hourlyDelays.slice(0, 24) }],
    exportable: "retards-par-heure",
    onExport,
    freshness: { updatedAt: "2026-10-20T08:12:00", now: "2026-10-20T08:15:00" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onExport.mockClear();
    await expect(canvas.getByText(/Mis à jour il y a 3 min/)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Exporter (CSV) : Retard moyen par heure" }));
    await expect(onExport).toHaveBeenCalledTimes(1);
    const { csv, fileName, rows } = onExport.mock.calls[0][0];
    await expect(fileName).toBe("retards-par-heure.csv");
    await expect(csv.startsWith("\uFEFFDate;Retard moyen (min)\r\n")).toBe(true);
    await expect(rows).toHaveLength(24);
  },
};

/**
 * Sélection d'une période (`onRangeSelect`) : glisser sur le tracé, ou Maj + ←/→
 * puis Entrée ; la période choisie règle le `DateRangePicker` de la page.
 */
export const SelectionDePeriode: Story = {
  name: "Sélection de période (zoom)",
  render: () => {
    const [period, setPeriod] = useState<{ start: Date | null; end: Date | null }>({ start: new Date(2026, 8, 21), end: new Date(2026, 9, 20) });
    const inPeriod = dailyPunctuality.filter((p) => (!period.start || p.x >= period.start) && (!period.end || p.x <= period.end));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <DateRangePicker variant="button" aria-label="Période" value={period} onChange={setPeriod} />
        <div style={{ width: "100%" }}>
          <LineChart
            title="Ponctualité quotidienne"
            description="Glisser sur le tracé (ou Maj + flèches puis Entrée) pour choisir la période"
            unit="%"
            yDomain={[85, 100]}
            series={[{ id: "p", label: "Ponctualité", data: inPeriod }]}
            onRangeSelect={([start, end]) => setPeriod({ start: start as Date, end: end as Date })}
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plot = canvas.getByRole("group", { name: "Ponctualité quotidienne" });
    plot.focus();
    await userEvent.keyboard("{Home}{Shift>}{ArrowRight}{ArrowRight}{ArrowRight}{/Shift}");
    await expect(canvasElement.querySelector(".line-chart__selection")).not.toBeNull();
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent(/Sélection du lundi 21 septembre 2026 au jeudi 24 septembre 2026/);
    await userEvent.keyboard("{Enter}");
    // La période de la page suit : il ne reste que 4 jours tracés
    await waitFor(() => expect(within(canvas.getByRole("table", { name: "Ponctualité quotidienne" })).getAllByRole("row")).toHaveLength(5));
  },
};

/** Mode compact, sans axes, pour une Card. */
export const Compact: Story = {
  args: {
    title: "Retard moyen, 7 jours",
    compact: true,
    unit: "min",
    goodDirection: "down",
    series: [{ id: "delay", label: "Retard moyen", data: hourlyDelays.filter((_, i) => i % 6 === 0) }],
    thresholds: [{ value: 5, label: "Seuil 5 min" }],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
};

/** Alternative tabulaire : présente dans le DOM, affichée par « Voir les données ». */
export const VoirLesDonnees: Story = {
  name: "Voir les données",
  args: { ...PonctualiteEnAire.args },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Ponctualité" });
    await expect(table.querySelectorAll("tbody tr")).toHaveLength(30);
    await expect(table.closest(".chart__sr-only")).not.toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Voir les données" }));
    await expect(table.closest(".chart__sr-only")).toBeNull();
    await expect(canvas.getByRole("rowheader", { name: "lundi 21 septembre 2026" })).toBeInTheDocument();
    await expect(canvas.getByRole("columnheader", { name: "Ponctualité (%)" })).toBeInTheDocument();
  },
};

/** Le graphique suit la largeur de son conteneur (ResizeObserver). */
export const Redimensionnement: Story = {
  render: (args) => {
    const [width, setWidth] = useState(600);
    return (
      <div>
        <button type="button" onClick={() => setWidth(360)}>
          Réduire à 360 px
        </button>
        <div style={{ width }} data-testid="conteneur">
          <LineChart {...args} />
        </div>
      </div>
    );
  },
  args: { ...PonctualiteEnAire.args },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvasElement.querySelector(".chart__svg") as SVGSVGElement;
    await waitFor(() => expect(svg.getAttribute("width")).toBe("600"));
    await userEvent.click(canvas.getByRole("button", { name: "Réduire à 360 px" }));
    await waitFor(() => expect(svg.getAttribute("width")).toBe("360"));
  },
};

/** États : chargement, vide, erreur avec « Réessayer ». */
export const Chargement: Story = { args: { title: "Retard moyen par heure", series: [], state: "loading" } };

export const Vide: Story = { args: { title: "Retard moyen par heure", series: [], state: "empty" } };

const onRetry = fn();

export const Erreur: Story = {
  args: { title: "Retard moyen par heure", series: [], state: "error", onRetry },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("Impossible de charger les données.");
    await userEvent.click(canvas.getByRole("button", { name: "Réessayer" }));
    await expect(onRetry).toHaveBeenCalledTimes(1);
  },
};
