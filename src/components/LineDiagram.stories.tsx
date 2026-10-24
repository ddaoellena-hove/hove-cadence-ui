import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { GhostButton } from "./GhostButton";
import { LineDiagram, type LineDiagramStop, type LineDiagramVehicle } from "./LineDiagram";

const meta: Meta<typeof LineDiagram> = {
  title: "Composants/Transport/LineDiagram",
  component: LineDiagram,
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
type Story = StoryObj<typeof LineDiagram>;

const LINE_13 = { code: "13", mode: "metro" as const, color: "#6ec4e8", textColor: "#002830" };

const STOPS: LineDiagramStop[] = [
  { id: "sdu", name: "Saint-Denis Université" },
  { id: "bas", name: "Basilique de Saint-Denis" },
  { id: "pdp", name: "Porte de Paris" },
  { id: "cpl", name: "Carrefour Pleyel" },
  { id: "mso", name: "Mairie de Saint-Ouen" },
  { id: "gar", name: "Garibaldi", status: "closed", note: "Travaux jusqu'au 30/10" },
  { id: "psb", name: "Porte de Saint-Ouen" },
  { id: "gmo", name: "Guy Môquet", status: "disrupted", note: "Ralentissements" },
  { id: "lam", name: "La Fourche" },
  { id: "pcl", name: "Place de Clichy" },
  { id: "lie", name: "Liège" },
  { id: "slz", name: "Saint-Lazare" },
  { id: "mir", name: "Miromesnil" },
  { id: "cel", name: "Champs-Élysées – Clemenceau" },
  { id: "inv", name: "Invalides" },
  { id: "mon", name: "Montparnasse" },
];

const VEHICLES: LineDiagramVehicle[] = [
  { id: "v1", label: "4521", direction: "outbound", position: { from: "bas", to: "pdp", progress: 0.6 }, delay: 4, load: 92 },
  { id: "v2", label: "4498", direction: "outbound", position: { at: "psb" }, delay: 0, load: 78 },
  { id: "v3", label: "4530", direction: "outbound", position: { from: "slz", to: "mir", progress: 0.3 }, incident: "Malaise voyageur", load: 64 },
  { id: "v4", label: "4533", direction: "outbound", position: { from: "slz", to: "mir", progress: 0.5 }, delay: 2 },
  { id: "v5", label: "4477", direction: "inbound", position: { from: "inv", to: "cel", progress: 0.4 }, delay: -1, load: 48 },
  { id: "v6", label: "4502", direction: "inbound", position: { at: "pcl" }, delay: 1, load: 71 },
  { id: "v7", label: "4466", direction: "inbound", position: { from: "cpl", to: "pdp", progress: 0.5 }, delay: 5 },
];

const onVehicleClick = fn();
const onStopClick = fn();

/** Supervision de la ligne 13 : arrêt fermé, tronçon perturbé, incident, retards. */
export const Supervision: Story = {
  args: {
    title: "Ligne 13 — supervision",
    description: "Positions temps réel, réseau de démonstration",
    line: LINE_13,
    stops: STOPS,
    vehicles: VEHICLES,
    directions: { outbound: "Vers Montparnasse", inbound: "Vers Saint-Denis Université" },
    freshness: { updatedAt: "2026-10-24T08:15:00", now: "2026-10-24T08:15:12" },
    onVehicleClick,
    onStopClick,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onVehicleClick.mockClear();
    onStopClick.mockClear();
    const diagram = canvas.getByRole("group", { name: "Ligne 13 — supervision" });
    await expect(diagram).toHaveAccessibleDescription(/4 véhicules vers Montparnasse, 3 vers Saint-Denis Université, 1 incident, 2 en retard, 1 arrêt fermé/);

    // Clavier : premier véhicule de l'aller, puis le suivant, Entrée l'ouvre
    diagram.focus();
    await waitFor(() => expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent(/^4521, Vers Montparnasse, entre Basilique de Saint-Denis et Porte de Paris, retard 4 min, charge 92 %$/));
    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{Enter}");
    await expect(onVehicleClick).toHaveBeenCalledWith(expect.objectContaining({ id: "v2" }));

    // ↓ : file du retour, puis file des arrêts
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Home}");
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent("Arrêt Saint-Denis Université");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");
    await expect(canvasElement.querySelector("[aria-live]")).toHaveTextContent("Arrêt Garibaldi, fermé, Travaux jusqu'au 30/10");
    await userEvent.keyboard("{Enter}");
    await expect(onStopClick).toHaveBeenCalledWith(expect.objectContaining({ id: "gar" }));

    // Tableau des véhicules
    const table = canvas.getByRole("table", { name: "Ligne 13 — supervision" });
    await expect(within(table).getAllByRole("row")).toHaveLength(8);
  },
};

/** Un seul sens, espacement à l'échelle des distances (km). */
export const UnSensAEchelle: Story = {
  name: "Un sens, à l'échelle des distances",
  args: {
    title: "Bus 91 — vers Montparnasse",
    line: { code: "91", mode: "bus", color: "#82c8e6", textColor: "#002830" },
    show: "outbound",
    stops: ["Bastille", "Gare de Lyon", "Austerlitz", "Saint-Marcel", "Gobelins", "Port-Royal", "Observatoire", "Montparnasse"].map((name, i) => ({
      id: `s${i}`,
      name,
      distance: [0, 1.1, 2.0, 2.6, 3.4, 4.6, 5.1, 6.0][i],
    })),
    vehicles: [
      { id: "b1", label: "8812", direction: "outbound", position: { from: "s1", to: "s2", progress: 0.3 }, delay: 1 },
      { id: "b2", label: "8840", direction: "outbound", position: { from: "s1", to: "s2", progress: 0.45 }, delay: 6 },
      { id: "b3", label: "8803", direction: "outbound", position: { at: "s5" }, delay: -2 },
    ],
  },
};

/** Temps réel : positions rafraîchies toutes les 2 s ; incident annoncé (regroupé). */
export const TempsReel: Story = {
  name: "Temps réel",
  render: () => {
    const [tick, setTick] = useState(0);
    const [incident, setIncident] = useState(false);
    useEffect(() => {
      const timer = window.setInterval(() => setTick((t) => t + 1), 2000);
      return () => window.clearInterval(timer);
    }, []);
    const vehicles = VEHICLES.map((v, i) => {
      if (!("from" in v.position)) return v;
      const progress = ((v.position.progress ?? 0.5) + tick * 0.08 + i * 0.01) % 1;
      return { ...v, position: { ...v.position, progress }, ...(incident && v.id === "v1" ? { incident: "Panne de porte" } : {}) };
    });
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <GhostButton size="sm" label="Simuler un incident" onClick={() => setIncident(true)} />
        <LineDiagram title="Ligne 13 — temps réel" line={LINE_13} stops={STOPS} vehicles={vehicles} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Simuler un incident" }));
    const notices = canvasElement.querySelectorAll("[aria-live]");
    await waitFor(() => expect(notices[notices.length - 1]).toHaveTextContent(/^Incident 4521 : Panne de porte, entre /), { timeout: 3000 });
  },
};

/** États : chargement, vide, erreur. */
const emptyArgs = { title: "Ligne 13 — supervision", line: LINE_13, stops: [], vehicles: [] };

export const Chargement: Story = { args: { ...emptyArgs, state: "loading" } };

export const Vide: Story = { args: { ...emptyArgs, state: "empty", emptyMessage: "Aucun véhicule en circulation." } };

export const Erreur: Story = { args: { ...emptyArgs, state: "error", onRetry: fn() } };
