import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { FilterBar, type FilterBarActiveFilter } from "./FilterBar";
import { Dropdown } from "./Dropdown";
import { GhostButton } from "./GhostButton";

const meta: Meta<typeof FilterBar> = {
  title: "Composants/Données et tableaux/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

const LINE_OPTIONS = [
  { id: "all", label: "Toutes les lignes" },
  { id: "l1", label: "Ligne 1" },
  { id: "l4", label: "Ligne 4" },
  { id: "l13", label: "Ligne 13" },
  { id: "rer-a", label: "RER A" },
];

const PERIOD_OPTIONS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "week", label: "7 jours" },
  { id: "month", label: "30 jours" },
];

const INITIAL_FILTERS: FilterBarActiveFilter[] = [
  { id: "line:l13", label: "Ligne 13" },
  { id: "severity:critical", label: "Critique" },
  { id: "cause:works", label: "Travaux" },
];

/* ── Vide : recherche seule ── */

const onSearchChange = fn();

const EmptyBar = () => {
  const [query, setQuery] = useState("");
  return (
    <FilterBar
      search={{
        value: query,
        onChange: (value) => {
          onSearchChange(value);
          setQuery(value);
        },
        placeholder: "Rechercher un arrêt…",
      }}
    />
  );
};

/** Recherche seule. La valeur n'est appliquée qu'après 300 ms sans frappe. */
export const Vide: Story = {
  render: () => <EmptyBar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    onSearchChange.mockClear();
    const input = canvas.getByRole("searchbox", { name: "Rechercher" });
    await userEvent.type(input, "Châtelet");
    // Saisie visible tout de suite, mais rien n'est encore appliqué
    await expect(input).toHaveValue("Châtelet");
    await expect(onSearchChange).not.toHaveBeenCalled();
    // Un seul appel, avec la valeur complète, une fois le délai écoulé
    await waitFor(() => expect(onSearchChange).toHaveBeenCalledTimes(1), { timeout: 1000 });
    await expect(onSearchChange).toHaveBeenCalledWith("Châtelet");
  },
};

/* ── Avec filtres actifs ── */

const WithFilters = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  return (
    <FilterBar
      activeFilters={filters}
      onRemoveFilter={(id) => setFilters((prev) => prev.filter((f) => f.id !== id))}
      onClearAll={() => setFilters([])}
      resultCount={filters.length === 0 ? 12430 : 87}
    />
  );
};

/** Filtres actifs supprimables ; « Tout effacer » disparaît sous 2 filtres. */
export const AvecFiltresActifs: Story = {
  name: "Avec filtres actifs",
  render: () => <WithFilters />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("87 résultats")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Supprimer Travaux" }));
    await expect(canvas.getByRole("button", { name: "Tout effacer" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Supprimer Critique" }));
    await expect(canvas.queryByRole("button", { name: "Tout effacer" })).not.toBeInTheDocument();
  },
};

/* ── Complète ── */

const FullBar = () => {
  const [query, setQuery] = useState("");
  const [line, setLine] = useState("all");
  const [period, setPeriod] = useState("today");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  return (
    <FilterBar
      search={{ value: query, onChange: setQuery, placeholder: "Rechercher une perturbation…" }}
      quickFilters={
        <>
          {/* Filtres rapides en variante bouton : même gabarit que la recherche */}
          <Dropdown variant="button" aria-label="Ligne" options={LINE_OPTIONS} value={line} onChange={setLine} />
          <Dropdown variant="button" aria-label="Période" options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        </>
      }
      activeFilters={filters}
      onRemoveFilter={(id) => setFilters((prev) => prev.filter((f) => f.id !== id))}
      onClearAll={() => {
        setFilters([]);
        setQuery("");
      }}
      resultCount={12430}
      actions={<GhostButton size="sm" iconStart="download-02" label="Exporter" />}
    />
  );
};

/** Recherche, filtres rapides, actions, filtres actifs et compteur. */
export const Complete: Story = {
  name: "Complète",
  render: () => <FullBar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Recherche et filtres rapides : même hauteur (29px, gabarit des boutons sm)
    const search = canvasElement.querySelector(".search-input") as HTMLElement;
    const height = Math.round(search.getBoundingClientRect().height);
    await expect(height).toBe(29);
    for (const name of [/^Ligne : /, /^Période : /]) {
      await expect(Math.round(canvas.getByRole("button", { name }).getBoundingClientRect().height)).toBe(height);
    }
  },
};
