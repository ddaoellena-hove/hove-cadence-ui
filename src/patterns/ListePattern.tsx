import { useState } from "react";
import {
  PageHeader, FilterBar, DataTable, Pagination, Dropdown, EmptyState, Indicator,
  BulkActionBar, GhostButton, PrimaryButton, type DataTableColumn,
} from "@ddaoellena/cadence-ui";

// Pattern — Liste / index (P2).
// FilterBar (recherche + filtres rapides + chips actives) · DataTable (tri,
// sélection, états) · BulkActionBar (actions groupées) · Pagination.
interface Disruption { id: string; title: string; line: string; severity: "critical" | "warning" | "info" }

const SAMPLE: Disruption[] = [
  { id: "d1", title: "Travaux entre Châtelet et Nation", line: "Ligne 1", severity: "warning" },
  { id: "d2", title: "Incident d'exploitation", line: "RER A", severity: "critical" },
  { id: "d3", title: "Affluence exceptionnelle", line: "Ligne 4", severity: "info" },
  { id: "d4", title: "Panne de signalisation", line: "Ligne 1", severity: "critical" },
];

const COLUMNS: DataTableColumn<Disruption>[] = [
  { id: "title", header: "Perturbation", accessor: (r) => r.title, minWidth: 240 },
  { id: "line", header: "Ligne", accessor: (r) => r.line, width: 140, sortable: true },
  { id: "severity", header: "Sévérité", accessor: (r) => r.severity, width: 150, cell: (r) => <Indicator variant={r.severity} /> },
];

export const ListePattern = ({ rows = SAMPLE, loading = false }: { rows?: Disruption[]; loading?: boolean } = {}) => {
  const [query, setQuery] = useState("");
  const [line, setLine] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filtered = rows.filter((r) => (line === "all" || r.line === line) && r.title.toLowerCase().includes(query.toLowerCase()));
  const filtering = query !== "" || line !== "all";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader title="Perturbations" subtitle="Liste du réseau · données de démonstration"
        actions={<PrimaryButton label="Créer un scénario" onClick={() => {}} />} />

      <FilterBar
        search={{ value: query, onChange: (v) => { setQuery(v); setPage(1); }, placeholder: "Rechercher une perturbation…" }}
        quickFilters={<Dropdown variant="button" aria-label="Ligne"
          options={[{ id: "all", label: "Toutes les lignes" }, { id: "Ligne 1", label: "Ligne 1" }, { id: "RER A", label: "RER A" }]}
          value={line} onChange={(id) => { setLine(id); setPage(1); }} />}
        activeFilters={line !== "all" ? [{ id: "line", label: line }] : []}
        onRemoveFilter={() => setLine("all")} onClearAll={() => { setLine("all"); setQuery(""); }}
        resultCount={filtered.length} />

      {/* Tableau et barre d'actions groupées dans le même conteneur (sticky) */}
      <div>
        <DataTable aria-label="Perturbations" columns={COLUMNS} data={filtered} getRowId={(r) => r.id} loading={loading}
          selectable selectedIds={selected} onSelectionChange={setSelected}
          emptyState={<EmptyState size="inline" variant={filtering ? "no-results" : "empty"}
            title={filtering ? "Aucune perturbation pour ces filtres" : "Aucune perturbation"}
            action={filtering ? { label: "Effacer les filtres", onClick: () => { setLine("all"); setQuery(""); } } : { label: "Créer la première", onClick: () => {} }} />} />
        <BulkActionBar count={selected.length}
          countLabel={(n) => (n > 1 ? `${n} perturbations sélectionnées` : `${n} perturbation sélectionnée`)}>
          <GhostButton size="sm" iconStart="copy-01" label="Dupliquer" onClick={() => {}} />
          <PrimaryButton size="sm" tone="danger" iconStart="trash" label="Supprimer" onClick={() => {}} />
        </BulkActionBar>
      </div>

      <Pagination page={page} pageSize={50} totalItems={filtered.length} onPageChange={setPage} />
    </div>
  );
};
