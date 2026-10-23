import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PageHeader, PageSection, CardGrid, DataFreshness, DateRangePicker, DataTable,
  Indicator, LineBadge, ModeIcon, type DateRange, type DataTableColumn, type ModeName,
} from "../components";
import { Shell } from "./patterns/_shell";

// ⚠️ STORY DE DÉMO — à supprimer. Sert uniquement à voir les pictos `ModeIcon`
// en contexte (dashboard multimodal). Données fictives, aucune logique réelle.

const COUVERTURE: { mode: ModeName; label: string }[] = [
  { mode: "metro", label: "Métro" }, { mode: "train", label: "Train" }, { mode: "tram", label: "Tramway" },
  { mode: "coach", label: "Autocar" }, { mode: "boat", label: "Bateau" }, { mode: "bike", label: "Vélo" },
  { mode: "carpool", label: "Covoiturage" }, { mode: "walk", label: "Marche" },
];

interface ModeKpi { mode: ModeName; label: string; value: number; unit: string; delta: string; up: boolean }
const KPIS: ModeKpi[] = [
  { mode: "metro", label: "Métro", value: 412880, unit: "voy.", delta: "+1,8 %", up: true },
  { mode: "tram", label: "Tramway", value: 86300, unit: "voy.", delta: "+3,2 %", up: true },
  { mode: "coach", label: "Autocar", value: 54210, unit: "voy.", delta: "−0,6 %", up: false },
  { mode: "bike", label: "Vélo", value: 31540, unit: "trajets", delta: "+7,1 %", up: true },
];

interface Ligne { id: string; mode: ModeName; code: string; name: string; punctuality: "nominal" | "warning" | "critical"; voyageurs: number }
const LIGNES: Ligne[] = [
  { id: "m1", mode: "metro", code: "1", name: "Château de Vincennes ↔ La Défense", punctuality: "nominal", voyageurs: 212400 },
  { id: "t3", mode: "tram", code: "T3b", name: "Porte de Vincennes ↔ Porte d'Asnières", punctuality: "warning", voyageurs: 48300 },
  { id: "ra", mode: "train", code: "RER A", name: "Boissy ↔ Saint-Germain", punctuality: "critical", voyageurs: 1024505 },
  { id: "c38", mode: "coach", code: "38", name: "Gare du Nord ↔ Porte d'Orléans", punctuality: "nominal", voyageurs: 26180 },
  { id: "bat", mode: "boat", code: "N1", name: "Navette fluviale — rive gauche", punctuality: "nominal", voyageurs: 4120 },
];

const nf = new Intl.NumberFormat("fr-FR");

const CODE_LABEL: Partial<Record<ModeName, string>> = { metro: "Métro", train: "Train", tram: "Tramway", coach: "Autocar", boat: "Bateau" };
const lineMode = (m: ModeName): "metro" | "rer" | "tram" | "bus" =>
  m === "metro" ? "metro" : m === "train" ? "rer" : m === "tram" ? "tram" : "bus";

const COLUMNS: DataTableColumn<Ligne>[] = [
  { id: "mode", header: "Mode", accessor: (r) => r.mode, width: 150, cell: (r) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><ModeIcon mode={r.mode} size={20} /> {CODE_LABEL[r.mode]}</span>
  ) },
  { id: "line", header: "Ligne", accessor: (r) => r.code, width: 90, cell: (r) => <LineBadge code={r.code} mode={lineMode(r.mode)} /> },
  { id: "name", header: "Dessert", accessor: (r) => r.name, minWidth: 260 },
  { id: "punct", header: "Ponctualité", accessor: (r) => r.punctuality, width: 150, cell: (r) => <Indicator variant={r.punctuality} /> },
  { id: "voy", header: "Voyageurs", accessor: (r) => r.voyageurs, width: 120, numeric: true, cell: (r) => <span>{nf.format(r.voyageurs)}</span> },
];

const ModeTile = ({ k }: { k: ModeKpi }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, borderRadius: 12, border: "1px solid var(--cadence-color-divider, #f0f0f0)", background: "var(--cadence-color-white, #fff)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--cadence-color-primary, #002830)" }}>
        <ModeIcon mode={k.mode} size={26} /> <span style={{ fontSize: 14, fontWeight: 600 }}>{k.label}</span>
      </span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 600, color: "var(--cadence-color-primary, #002830)", fontVariantNumeric: "tabular-nums" }}>
      {nf.format(k.value)} <span style={{ fontSize: 13, fontWeight: 400, color: "var(--cadence-color-text-secondary, #64757a)" }}>{k.unit}</span>
    </div>
    <span style={{ fontSize: 13, color: k.up ? "var(--cadence-status-nominal-fg, #166534)" : "var(--cadence-status-critical-fg, #b91c1c)" }}>{k.delta} vs période précédente</span>
  </div>
);

const meta: Meta = {
  title: "Démo/Dashboard multimodal (à supprimer)",
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj;

/** Démo jetable : les pictos `ModeIcon` en contexte dashboard. */
export const Vue: Story = {
  render: function Demo() {
    const [period, setPeriod] = useState<DateRange>({ start: new Date("2026-06-05"), end: new Date("2026-06-12") });
    return (
      <Shell>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <PageHeader title="Fréquentation multimodale" subtitle="Réseau de démonstration"
            actions={<DateRangePicker variant="button" aria-label="Période" value={period} onChange={setPeriod} maxDate={new Date()} maxDays={92} />} />

          <DataFreshness updatedAt="2026-06-12T08:12:00" now="2026-06-12T08:15:00" />

          {/* Légende des modes couverts */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {COUVERTURE.map((m) => (
              <span key={m.mode} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--cadence-color-text-secondary, #64757a)" }}>
                <ModeIcon mode={m.mode} size={22} /> {m.label}
              </span>
            ))}
          </div>

          <PageSection title="Fréquentation par mode">
            <CardGrid min={220}>
              {KPIS.map((k) => <ModeTile key={k.mode} k={k} />)}
            </CardGrid>
          </PageSection>

          <PageSection title="Lignes les plus fréquentées">
            <DataTable aria-label="Lignes par mode" columns={COLUMNS} data={LIGNES} getRowId={(r) => r.id} />
          </PageSection>
        </div>
      </Shell>
    );
  },
};
