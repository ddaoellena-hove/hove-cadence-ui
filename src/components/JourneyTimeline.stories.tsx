import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { JourneyTimeline, type Journey } from "./JourneyTimeline";

/** Heure du jeudi 11 juin 2026 (heure locale). */
const t = (h: number, m: number) => new Date(2026, 5, 11, h, m);

const BUS_A = { code: "A", mode: "bus" as const, color: "#E3051B" };
const BUS_1 = { code: "1", mode: "bus" as const, color: "#FFCD00", textColor: "#002830" };

const JOURNEYS: Journey[] = [
  {
    id: "j1",
    recommended: true,
    segments: [
      { id: "w1", kind: "walk", start: t(7, 57), end: t(7, 59), label: "Vers l’arrêt Mairie" },
      { id: "b1", kind: "transit", start: t(7, 59), end: t(8, 14), line: BUS_A, label: "Mairie → Gare" },
      { id: "w2", kind: "walk", start: t(8, 14), end: t(8, 17), label: "Vers la destination" },
    ],
  },
  {
    id: "j2",
    segments: [
      { id: "w1", kind: "walk", start: t(7, 59), end: t(8, 1) },
      { id: "b1", kind: "transit", start: t(8, 1), end: t(8, 16), line: BUS_A, label: "Mairie → Gare" },
      { id: "w2", kind: "walk", start: t(8, 16), end: t(8, 19) },
    ],
  },
  {
    id: "j3",
    segments: [
      { id: "w1", kind: "walk", start: t(8, 0), end: t(8, 2) },
      { id: "b1", kind: "transit", start: t(8, 2), end: t(8, 28), line: BUS_1, label: "Église → Gare" },
      { id: "w2", kind: "walk", start: t(8, 28), end: t(8, 31) },
    ],
  },
];

const meta: Meta<typeof JourneyTimeline> = {
  title: "Composants/Transport/JourneyTimeline",
  component: JourneyTimeline,
  tags: ["autodocs"],
  args: {
    title: "Itinéraires proposés",
    journeys: JOURNEYS,
    range: [t(7, 55), t(8, 35)],
    onJourneyClick: fn(),
  },
  decorators: [(Story) => <div style={{ maxWidth: 1000 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof JourneyTimeline>;

/** Maquette : 3 itinéraires sur la fenêtre 07h55 → 08h35, le premier recommandé. */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    // La frise seule (le tableau de données, masqué, reprend les mêmes textes).
    const canvas = within(canvasElement.querySelector<HTMLElement>(".timeline-shell")!);
    await expect(canvas.getByText("Jeu. 11/06/2026 07h55 → 08h35")).toBeInTheDocument();
    await expect(canvas.getByText("3 itinéraires")).toBeInTheDocument();
    await expect(canvas.getByText("Recommandé")).toBeInTheDocument();
    await expect(canvas.getByText("31 min")).toBeInTheDocument();
    // « 1 h » plus large que la fenêtre de 40 min : désactivée.
    await expect(canvas.getByRole("radio", { name: "1 h" })).toBeDisabled();
  },
};

/** Clavier : flèches pour parcourir les étapes, Entrée pour ouvrir l'itinéraire. */
export const Clavier: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: /Itinéraires proposés/ });
    group.focus();
    const status = canvas.getByRole("status");
    await waitFor(() => expect(status).toHaveTextContent(/Itinéraire 1 \(recommandé\), étape 1 sur 3 : Marche/));
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => expect(status).toHaveTextContent(/Bus A, 07h59 à 08h14, 15 min/));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await waitFor(() => expect(status).toHaveTextContent(/Itinéraire 3.*Bus 1.*Total 31 min, 0 correspondance, 5 min de marche/));
    await userEvent.keyboard("{Enter}");
    await expect(args.onJourneyClick).toHaveBeenCalledWith(JOURNEYS[2]);
    await userEvent.keyboard("{Escape}");
  },
};

/** Clic sur une ligne : ouvre l'itinéraire. */
export const ClicSurUnItineraire: Story = {
  name: "Clic sur un itinéraire",
  play: async ({ canvasElement, args }) => {
    const seg = canvasElement.querySelector<HTMLElement>('[data-cell="1-1"]')!;
    await userEvent.click(seg);
    await expect(args.onJourneyClick).toHaveBeenCalledWith(JOURNEYS[1]);
  },
};

/** Échelle 15 min : la frise défile horizontalement. */
export const Echelle15Min: Story = {
  name: "Échelle 15 min",
  args: { defaultScale: 15 },
  play: async ({ canvasElement }) => {
    const scroller = canvasElement.querySelector<HTMLElement>(".timeline-shell__scroll")!;
    await waitFor(() => expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth));
  },
};

/** Avec correspondance et attente, heures de service. */
export const AvecCorrespondance: Story = {
  name: "Avec correspondance",
  args: {
    title: "Trajet avec correspondance",
    range: ["17:50", "18:50"],
    journeys: [
      {
        id: "c1",
        recommended: true,
        segments: [
          { id: "w", kind: "walk", start: "17:52", end: "17:58" },
          { id: "m", kind: "transit", start: "17:58", end: "18:12", line: { code: "13", mode: "metro", color: "#6EC4E8" }, label: "Saint-Lazare → Montparnasse" },
          { id: "a", kind: "wait", start: "18:12", end: "18:17" },
          { id: "r", kind: "transit", start: "18:17", end: "18:38", line: { code: "N", mode: "train", color: "#00A88F" }, label: "Montparnasse → Clamart" },
          { id: "w2", kind: "walk", start: "18:38", end: "18:44" },
        ],
      },
      {
        id: "c2",
        segments: [
          { id: "w", kind: "walk", start: "17:55", end: "17:59" },
          { id: "b", kind: "transit", start: "17:59", end: "18:41", line: { code: "389", mode: "bus" } },
          { id: "w2", kind: "walk", start: "18:41", end: "18:46" },
        ],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.querySelector<HTMLElement>(".timeline-shell")!);
    await expect(canvas.getByText(/1 correspondance/)).toBeInTheDocument();
  },
};

/** « Voir les données » : une ligne par étape et un total par itinéraire. */
export const VoirLesDonnees: Story = {
  name: "Voir les données",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Voir les données" }));
    const table = canvas.getByRole("table", { name: /Itinéraires proposés/ });
    await expect(within(table).getAllByText("Bus A (Mairie → Gare)")).toHaveLength(2);
    await expect(within(table).getByText(/Total, recommandé : 0 correspondance, 5 min de marche/)).toBeInTheDocument();
  },
};

export const Chargement: Story = { args: { state: "loading" } };
export const Vide: Story = { args: { state: "empty", journeys: [], emptyMessage: "Aucun itinéraire sur cette fenêtre." } };
export const Erreur: Story = { args: { state: "error", journeys: [], onRetry: fn() } };
