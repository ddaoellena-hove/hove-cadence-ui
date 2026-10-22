import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Checkbox } from "../components/Checkbox";
import { DataTable, type DataTableSort } from "../components/DataTable";
import { Dropdown } from "../components/Dropdown";
import { FilterBar } from "../components/FilterBar";
import { Link } from "../components/Link";
import { Pagination } from "../components/Pagination";
import { ColumnManager } from "../components/ColumnManager";
import { ExportMenu } from "../components/ExportMenu";
import { InlineAlert } from "../components/InlineAlert";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { compareValues } from "../components/data-table-utils";
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

  const [columnState, setColumnState] = useState({ visibleIds: DISRUPTION_COLUMNS.map((c) => c.id), order: DISRUPTION_COLUMNS.map((c) => c.id) });
  const [exportMessage, setExportMessage] = useState("");

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

  const filteredSelection = filtered.filter((row) => selectedIds.includes(row.id));
  const allFilteredSelected = filteredSelection.length === filtered.length && filtered.length > 0;
  const sorted = [...filtered].sort((a, b) => {
    for (const criterion of sort) {
      const column = DISRUPTION_COLUMNS.find((c) => c.id === criterion.id);
      if (!column) continue;
      const result = compareValues(column.accessor(a), column.accessor(b));
      if (result !== 0) return criterion.desc ? -result : result;
    }
    return 0;
  });
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);
  const exportCsv = (scope: "selection" | "page" | "all") => {
    const rows = scope === "selection" ? filteredSelection : scope === "page" ? pageRows : sorted;
    const cols = columnState.order.map((id) => DISRUPTION_COLUMNS.find((c) => c.id === id)!)
      .filter((c) => columnState.visibleIds.includes(c.id));
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [cols.map((c) => escape(c.header)).join(";"), ...rows.map((row) => cols.map((c) => {
      const value = c.accessor(row);
      return escape(value instanceof Date ? value.toLocaleString("fr-FR") : value);
    }).join(";"))].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `perturbations-${scope}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportMessage(`${numberFormat.format(rows.length)} perturbation(s) exportée(s) en CSV.`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader title="Perturbations" subtitle="Réseau de démonstration · données locales" sticky={false} />
      {exportMessage && <InlineAlert type="success" dismissible onDismiss={() => setExportMessage("")}>{exportMessage}</InlineAlert>}

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
            <Dropdown label="Ligne" options={LINE_OPTIONS} value={line} onChange={(id) => { setLine(id); resetPage(); }} />
            <Dropdown label="Sévérité" options={SEVERITY_OPTIONS} value={severity} onChange={(id) => { setSeverity(id); resetPage(); }} />
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
        actions={<>
          <ColumnManager columns={DISRUPTION_COLUMNS.map((c) => ({ id: c.id, label: c.header }))}
            visibleIds={columnState.visibleIds} order={columnState.order} onChange={setColumnState} />
          <ExportMenu counts={{ selection: filteredSelection.length, page: pageRows.length, total: filtered.length }} formats={["csv"]} onExport={({ scope }) => exportCsv(scope)} />
        </>}
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

        </div>
      )}

      <DataTable
        aria-label="Perturbations"
        columns={DISRUPTION_COLUMNS}
        hiddenColumnIds={DISRUPTION_COLUMNS.filter((c) => !columnState.visibleIds.includes(c.id)).map((c) => c.id)}
        columnOrder={columnState.order}
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
        emptyState={<EmptyState size="inline" variant="no-results" title="Aucune perturbation" description="Modifiez ou effacez les filtres pour afficher des résultats." />}
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
    a11y: { test: "error" },
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
