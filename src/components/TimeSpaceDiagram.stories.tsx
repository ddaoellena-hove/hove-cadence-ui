import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { TimeSpaceDiagram, type TimeSpaceStop, type TimeSpaceTrip } from "./TimeSpaceDiagram";

const meta: Meta<typeof TimeSpaceDiagram> = {
  title: "Composants/Transport/TimeSpaceDiagram",
  component: TimeSpaceDiagram,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 1100, padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TimeSpaceDiagram>;

const STOPS: TimeSpaceStop[] = [
  { id: "sdu", name: "Saint-Denis Université", distance: 0 },
  { id: "bas", name: "Basilique", distance: 1.2 },
  { id: "cpl", name: "Carrefour Pleyel", distance: 3.1 },
  { id: "mso", name: "Mairie de Saint-Ouen", distance: 4.3 },
  { id: "gmo", name: "Guy Môquet", distance: 6.0 },
  { id: "pcl", name: "Place de Clichy", distance: 7.4 },
  { id: "slz", name: "Saint-Lazare", distance: 8.6 },
  { id: "mon", name: "Montparnasse", distance: 12.4 },
];
// Temps de parcours entre arrêts (min) et arrêt en station (min)
const RUN = [3, 4, 3, 4, 3, 3, 7];
const DWELL = 0.5;

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
const hhmm = (minutes: number) => `${pad(minutes / 60)}:${pad(minutes % 60)}:${pad((minutes % 1) * 60)}`;

/** Passages d'une course partant à `start` (min) ; `lag(i)` : retard cumulé au i-ème arrêt. */
const passages = (start: number, order: TimeSpaceStop[], runs: number[], lag: (i: number) => number = () => 0) => {
  let t = start;
  return order.map((stop, i) => {
    if (i > 0) t += runs[i - 1];
    const arrival = t + lag(i);
    // Départ au terminus à l'heure ronde ; ailleurs, après l'arrêt en station
    const departure = i === 0 ? arrival : i < order.length - 1 ? arrival + DWELL : undefined;
    if (i > 0) t += DWELL;
    return { stopId: stop.id, arrival: i === 0 ? undefined : hhmm(arrival), departure: departure === undefined ? undefined : hhmm(departure) };
  });
};

const NOW = 8 * 60;
const trips: TimeSpaceTrip[] = [];
for (let k = 0; k < 24; k += 1) {
  const start = 5 * 60 + 30 + k * 8;
  const outLag = (i: number) => (k === 9 && i >= 3 ? 4 : k % 5 === 2 ? i * 0.4 : 0);
  trips.push({
    id: `a${k}`,
    label: `13-${String(500 + k * 2).padStart(4, "0")}`,
    direction: "outbound",
    scheduled: passages(start, STOPS, RUN),
    actual: start < NOW ? passages(start, STOPS, RUN, outLag) : undefined,
    status: k === 14 ? "cancelled" : k === 11 ? "incident" : "normal",
    note: k === 11 ? "Malaise voyageur à Guy Môquet" : undefined,
  });
  const back = 5 * 60 + 34 + k * 8;
  trips.push({
    id: `r${k}`,
    label: `13-${String(501 + k * 2).padStart(4, "0")}`,
    direction: "inbound",
    scheduled: passages(back, [...STOPS].reverse(), [...RUN].reverse()),
    actual: back < NOW ? passages(back, [...STOPS].reverse(), [...RUN].reverse(), (i) => (k % 4 === 1 ? i * 0.3 : 0)) : undefined,
  });
}

const onTripClick = fn();

/** Matinée de la ligne 13 : théorique et réalisé, croisements, une course supprimée, un incident. */
export const Matinee: Story = {
  name: "Matinée de la ligne 13",
  args: {
    title: "Ligne 13 — graphique espace-temps",
    description: "Jour ouvré, de 05h30 à 09h30, réalisé jusqu'à 08h00",
    line: { code: "13", mode: "metro", color: "#6ec4e8", textColor: "#002830" },
    stops: STOPS,
    trips,
    range: ["05:30", "09:30"],
    now: "08:00",
    directions: { outbound: "Vers Montparnasse", inbound: "Vers Saint-Denis Université" },
    onTripClick,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onTripClick.mockClear();
    const plot = canvas.getByRole("group", { name: "Ligne 13 — graphique espace-temps" });
    await expect(plot).toHaveAccessibleDescription(/48 courses dans la fenêtre, 24 vers Montparnasse, 24 vers Saint-Denis Université, 1 supprimée, 1 incident/);

    plot.focus();
    const live = () => canvasElement.querySelectorAll("[aria-live]")[0];
    await waitFor(() => expect(live()).toHaveTextContent(/^Course 13-0500 vers Montparnasse, Saint-Denis Université : prévu 05h30, réalisé 05h30, à l'heure$/));
    // ↓ le long de la course
    await userEvent.keyboard("{ArrowDown}");
    await expect(live()).toHaveTextContent(/Basilique : prévu 05h34/);
    // → course suivante du même sens, Entrée l'ouvre
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await expect(onTripClick).toHaveBeenCalledWith(expect.objectContaining({ id: "a1" }));
    // Maj + ↓ : autre sens
    await userEvent.keyboard("{Shift>}{ArrowDown}{/Shift}");
    await expect(live()).toHaveTextContent(/vers Saint-Denis Université, Montparnasse/);

    const table = canvas.getByRole("table", { name: "Ligne 13 — graphique espace-temps" });
    await expect(within(table).getAllByRole("row")).toHaveLength(49);
  },
};

/** Un seul sens, horaire théorique seul, espacement régulier, échelle 1 h par défaut. */
export const HoraireTheorique: Story = {
  name: "Horaire théorique, un sens",
  args: {
    title: "Ligne 13 — horaire vers Montparnasse",
    line: { code: "13", mode: "metro", color: "#6ec4e8", textColor: "#002830" },
    stops: STOPS.map((s) => ({ id: s.id, name: s.name })),
    trips: trips.filter((t) => t.direction === "outbound").map((t) => ({ ...t, actual: undefined })),
    show: "outbound",
    scales: ["1h", "2h", "fit"],
  },
};

/** États : chargement, vide, erreur. */
const emptyArgs = { title: "Ligne 13 — graphique espace-temps", line: { code: "13", mode: "metro" as const }, stops: [], trips: [] };

export const Chargement: Story = { args: { ...emptyArgs, state: "loading" } };

export const Vide: Story = { args: { ...emptyArgs, state: "empty", emptyMessage: "Aucune course sur la période." } };

export const Erreur: Story = { args: { ...emptyArgs, state: "error", onRetry: fn() } };
