import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import {
  Autocomplete,
  CounterInput,
  DatePicker,
  DateRangePicker,
  Dropdown,
  GhostButton,
  PrimaryButton,
  SearchInput,
  SegmentedControl,
  TextInput,
  TimePicker,
} from "../components";

// Deux gabarits de hauteur partagés : --cadence-control-height-compact (29px)
// et --cadence-control-height-field (40px). Chaque story aligne un groupe sur
// une rangée et vérifie que les contrôles mesurent la hauteur du token.

const meta: Meta = {
  title: "Foundation/Hauteurs de contrôle",
  parameters: { a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj;

const LINES = [
  { id: "all", label: "Toutes les lignes" },
  { id: "1", label: "Ligne 1" },
  { id: "4", label: "Ligne 4" },
];
const SOURCES = [
  { id: "gtfs", label: "GTFS théorique" },
  { id: "rt", label: "GTFS-RT" },
];
const REFERENCE = new Date(2026, 9, 22);

/** Hauteurs mesurées (bordure comprise) de tous les éléments ciblés. */
const heights = (root: HTMLElement, selector: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(selector))
    .filter((el) => el.getClientRects().length > 0) // éléments affichés seulement
    .map((el) => Math.round(el.getBoundingClientRect().height));

/**
 * Gabarit compact (29px) : en-tête de dashboard ou barre d'outils —
 * SearchInput, déclencheurs `variant="button"` et boutons `sm`.
 */
export const RangeeCompacte: Story = {
  name: "Rangée compacte (29px)",
  render: function Compact() {
    const [query, setQuery] = useState("");
    const [line, setLine] = useState("all");
    const [range, setRange] = useState<{ start: Date; end: Date } | undefined>();
    const [start, setStart] = useState("06:00");
    return (
      <div data-testid="row" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ width: 240 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un composant…" aria-label="Rechercher un composant" />
        </div>
        <Dropdown variant="button" aria-label="Ligne" options={LINES} value={line} onChange={setLine} />
        <DateRangePicker variant="button" aria-label="Période" referenceDate={REFERENCE} value={range} onChange={setRange} />
        <TimePicker variant="button" aria-label="Début de service" value={start} onChange={setStart} />
        <GhostButton size="sm" iconStart="filter-lines" label="Filtres" />
        <PrimaryButton size="sm" outline iconStart="download-02" label="Exporter" />
        <PrimaryButton size="sm" iconStart="plus" label="Créer un scénario" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>("[data-testid=row]")!;
    const all = heights(row, ".search-input, .base-button");
    await expect(all.length).toBeGreaterThanOrEqual(6);
    await expect(new Set(all)).toEqual(new Set([29]));
  },
};

/**
 * Gabarit de champ (40px) : rangée de formulaire ou de filtres détaillés —
 * TextInput, SegmentedControl et autres champs d'une ligne. Les champs
 * libellés et le SegmentedControl s'alignent par le bas (`alignItems: "flex-end"`).
 */
export const RangeeDeChamps: Story = {
  name: "Rangée de champs (40px)",
  render: function Fields() {
    const [name, setName] = useState("");
    const [mode, setMode] = useState("planned");
    const [source, setSource] = useState("gtfs");
    const [date, setDate] = useState<Date | null>(REFERENCE);
    const [count, setCount] = useState(2);
    const [time, setTime] = useState("06:00");
    const [stop, setStop] = useState<string | string[] | null>(null);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div data-testid="row" style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
        <div style={{ width: 220 }}>
          <TextInput label="Nom du scénario" placeholder="Ex. : Tronçon Melun – Montereau" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <SegmentedControl
          aria-label="Mode de déclenchement"
          options={[{ value: "planned", label: "Planifiée" }, { value: "immediate", label: "Immédiate" }]}
          value={mode}
          onChange={setMode}
        />
        <div style={{ width: 200 }}>
          <Dropdown label="Source" options={SOURCES} value={source} onChange={setSource} />
        </div>
        <DatePicker label="Date" value={date} onChange={setDate} />
      </div>
      <div data-testid="row" style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
        <CounterInput label="Véhicules" min={0} max={20} value={count} onChange={setCount} />
        <TimePicker label="Début" value={time} onChange={setTime} />
        <div style={{ width: 220 }}>
          <Autocomplete label="Arrêt" options={[{ id: "chatelet", label: "Châtelet" }, { id: "nation", label: "Nation" }]} value={stop ?? undefined} onChange={setStop} />
        </div>
      </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const selectors = [
      ".text-input__field",
      ".segmented-control",
      ".dropdown__trigger",
      ".date-picker__trigger",
      ".counter-input",
      ".time-picker__field",
      ".autocomplete__field",
    ];
    for (const selector of selectors) {
      await expect({ selector, heights: heights(canvasElement, selector) }).toEqual({ selector, heights: [40] });
    }
    // Alignés par le bas : dans chaque rangée, même bord inférieur.
    for (const row of canvasElement.querySelectorAll<HTMLElement>("[data-testid=row]")) {
      const bottoms = Array.from(row.querySelectorAll(selectors.join(", "))).map((el) => Math.round(el.getBoundingClientRect().bottom));
      await expect(new Set(bottoms).size).toBe(1);
    }
  },
};

/** SearchInput et PrimaryButton : même gabarit compact. */
export const RechercheEtBouton: Story = {
  name: "SearchInput + PrimaryButton",
  render: function SearchAndButton() {
    const [query, setQuery] = useState("");
    return (
      <div data-testid="row" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 280 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un token…" aria-label="Rechercher un token" />
        </div>
        <PrimaryButton size="sm" iconStart="plus" label="Ajouter un token" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>("[data-testid=row]")!;
    await expect(heights(row, ".search-input, .base-button")).toEqual([29, 29]);
  },
};

/** TextInput et SegmentedControl : même gabarit de champ, alignés par le bas. */
export const ChampEtSegmented: Story = {
  name: "TextInput + SegmentedControl",
  render: function FieldAndSegmented() {
    const [name, setName] = useState("");
    const [density, setDensity] = useState("comfortable");
    return (
      <div data-testid="row" style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
        <div style={{ width: 260 }}>
          <TextInput label="Nom de la vue" placeholder="Ex. : Supervision ligne 1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <SegmentedControl
          aria-label="Densité"
          options={[{ value: "comfortable", label: "Confortable" }, { value: "compact", label: "Compacte" }]}
          value={density}
          onChange={setDensity}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>("[data-testid=row]")!;
    const field = row.querySelector(".text-input__field")!.getBoundingClientRect();
    const segmented = row.querySelector(".segmented-control")!.getBoundingClientRect();
    await expect([Math.round(field.height), Math.round(segmented.height)]).toEqual([40, 40]);
    await expect(Math.round(field.bottom)).toBe(Math.round(segmented.bottom));
  },
};
