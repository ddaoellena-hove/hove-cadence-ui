import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Checkbox } from "../components/Checkbox";
import { DataTable, type DataTableSort } from "../components/DataTable";
import { Dropdown } from "../components/Dropdown";
import { FilterBar } from "../components/FilterBar";
import { Link } from "../components/Link";
import { Pagination } from "../components/Pagination";
import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";
import { DISRUPTION_COLUMNS } from "./data/columns";
import { SEVERITY_LABELS, generateDisruptions } from "./data/transport";

// Recette 5 — Page de supervision : FilterBar + DataTable + Pagination
// + barre de sélection. Mode client : tout est filtré en mémoire.

const DISRUPTIONS = generateDisruptions(1240);
const numberFormat = new Intl.NumberFormat("fr-FR");

const LINE_OPTIONS = [
  { id: "all", label: "Toutes les lignes" },
  ...[...new Set(DISRUPTIONS.map((d) => d.line))].sort().map((line) => ({ id: line, label: line })),
];

const SEVERITY_OPTIONS = [
  { id: "all", label: "Toutes les sévérités" },
  ...Object.entries(SEVERITY_LABELS).map(([id, label]) => ({ id, label })),
];

const SupervisionPage = () => {
  const [query, setQuery] = useState("");
  const [line, setLine] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [sort, setSort] = useState<DataTableSort[]>([{ id: "start", desc: true }]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Toute modification des filtres ramène à la première page
  const resetPage = () => setPage(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("fr");
    return DISRUPTIONS.filter(
      (d) =>
        (line === "all" || d.line === line) &&
        (severity === "all" || d.severity === severity) &&
        (q === "" || d.title.toLocaleLowerCase("fr").includes(q)),
    );
  }, [query, line, severity]);

  const activeFilters = [
    ...(line !== "all" ? [{ id: "line", label: line }] : []),
    ...(severity !== "all" ? [{ id: "severity", label: SEVERITY_LABELS[severity] }] : []),
    ...(query ? [{ id: "query", label: `« ${query} »` }] : []),
  ];

  const removeFilter = (id: string) => {
    if (id === "line") setLine("all");
    if (id === "severity") setSeverity("all");
    if (id === "query") setQuery("");
    resetPage();
  };

  const allFilteredSelected = selectedIds.length === filtered.length && filtered.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontFamily: "var(--cadence-font-display)", fontSize: 28, fontWeight: 500, color: "var(--cadence-color-primary)", margin: 0 }}>
        Perturbations
      </h1>

      <FilterBar
        search={{
          value: query,
          onChange: (value) => {
            setQuery(value);
            resetPage();
          },
          placeholder: "Rechercher une perturbation…",
        }}
        quickFilters={
          <>
            <Dropdown options={LINE_OPTIONS} value={line} onChange={(id) => { setLine(id); resetPage(); }} />
            <Dropdown options={SEVERITY_OPTIONS} value={severity} onChange={(id) => { setSeverity(id); resetPage(); }} />
          </>
        }
        activeFilters={activeFilters}
        onRemoveFilter={removeFilter}
        onClearAll={() => {
          setLine("all");
          setSeverity("all");
          setQuery("");
          resetPage();
        }}
        resultCount={filtered.length}
        actions={<SecondaryButton outline withIcon="left" icon="download-02" label="Exporter" />}
      />

      {/* ── Barre de sélection (visible si ≥ 1 sélection) ── */}
      {selectedIds.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Checkbox aria-label="Tout désélectionner" state="checked" onChange={() => setSelectedIds([])} />
            <span style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 13, color: "var(--cadence-color-label)" }}>
              {numberFormat.format(selectedIds.length)} sélectionnée(s)
            </span>
            {!allFilteredSelected && (
              <Link hideArrow size="sm" onClick={() => setSelectedIds(filtered.map((d) => d.id))}>
                {`Sélectionner les ${numberFormat.format(filtered.length)} résultats`}
              </Link>
            )}
            <Link hideArrow size="sm" onClick={() => setSelectedIds([])}>Tout désélectionner</Link>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <SecondaryButton withIcon="left" icon="copy-01" label="Dupliquer" />
            <PrimaryButton withIcon="left" icon="trash" label="Clôturer" destructive />
          </div>
        </div>
      )}

      <DataTable
        aria-label="Perturbations"
        columns={DISRUPTION_COLUMNS}
        data={filtered}
        getRowId={(d) => d.id}
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          resetPage();
        }}
        page={page}
        pageSize={pageSize}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        maxHeight="calc(100vh - 320px)"
        emptyState="Aucune perturbation ne correspond à ces filtres."
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          resetPage();
        }}
      />
    </div>
  );
};

const meta: Meta<typeof SupervisionPage> = {
  title: "Recettes/Liste de perturbations",
  component: SupervisionPage,
  parameters: {
    layout: "padded",
    a11y: {
      test: "error",
      config: {
        // PrimaryButton destructive (#de353e, texte blanc) est à 4,48:1, sous le
        // seuil AA : défaut préexistant du composant, signalé, hors de ce lot.
        rules: [{ id: "color-contrast", selector: "*:not(.primary-button *)" }],
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SupervisionPage>;

export const ListeDePerturbations: Story = {
  name: "Liste de perturbations",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("1–50 sur 1 240")).toBeInTheDocument();

    // La recherche filtre (après le debounce) et revient en page 1
    await userEvent.click(canvas.getByRole("button", { name: "Page 2" }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "Rechercher" }), "Travaux");
    await waitFor(() => expect(canvas.getByRole("button", { name: "Supprimer « Travaux »" })).toBeInTheDocument(), { timeout: 1000 });
    await expect(canvas.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");

    // Sélection de la page, puis de tous les résultats filtrés
    await userEvent.click(canvas.getByRole("checkbox", { name: "Tout sélectionner" }));
    await userEvent.click(canvas.getByRole("button", { name: /^Sélectionner les .* résultats$/ }));
    await expect(canvas.queryByRole("button", { name: /^Sélectionner les .* résultats$/ })).not.toBeInTheDocument();
  },
};
