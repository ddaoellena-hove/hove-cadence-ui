import { useMemo, useState } from "react";
import {
  PageHeader, DatasetHealth, FilterBar, Dropdown, DataTable, Drawer, EmptyState, Indicator,
  ValidationIssueInspector, type DataTableColumn, type ValidationIssue, type ValidationVerdict,
} from "@ddaoellena/cadence-ui";

// Pattern — Rapport qualité (déclinaison de Liste + détail latéral).
// DatasetHealth (bilan global) · FilterBar (niveau + recherche) · DataTable des
// constats · Drawer de l'application contenant ValidationIssueInspector.
// Les constats et le verdict sont fournis : aucun fichier n'est analysé ici.
const SAMPLE: ValidationIssue[] = [
  { id: "issue-0001", severity: "error", message: "Arrêt inconnu : gare_404 n’existe pas dans stops.txt.",
    location: { source: "stop_times.txt", line: 42, field: "stop_id", objectId: "gare_404" }, ruleCode: "GTFS-E011",
    correction: "Référencer un arrêt présent dans stops.txt, ou ajouter cet arrêt au fichier source." },
  { id: "issue-0002", severity: "error", message: "Départ antérieur à l’arrivée au même arrêt.",
    location: { source: "stop_times.txt", line: 57, field: "departure_time" }, ruleCode: "GTFS-E025",
    correction: "Vérifier les heures après minuit (25:10 et non 01:10)." },
  { id: "issue-0003", severity: "warning", message: "Deux arrêts homonymes « Gare ».",
    location: { source: "stops.txt", line: 12, field: "stop_name" }, ruleCode: "GTFS-W003" },
  { id: "issue-0004", severity: "info", message: "Le fichier facultatif feed_info.txt est absent.",
    location: { source: "feed_info.txt" } },
];

const SEVERITY = {
  error: { variant: "critical", label: "Erreur" },
  warning: { variant: "warning", label: "Avertissement" },
  info: { variant: "info", label: "Information" },
} as const;

const COLUMNS: DataTableColumn<ValidationIssue>[] = [
  { id: "severity", header: "Niveau", accessor: (r) => r.severity, width: 160,
    cell: (r) => <Indicator variant={SEVERITY[r.severity].variant} label={SEVERITY[r.severity].label} /> },
  { id: "source", header: "Source", accessor: (r) => r.location?.source, width: 160, sortable: true },
  { id: "line", header: "Ligne", accessor: (r) => r.location?.line, width: 90, numeric: true, sortable: true },
  { id: "message", header: "Problème", accessor: (r) => r.message, minWidth: 260 },
];

const LEVELS = [
  { id: "all", label: "Tous les niveaux" },
  { id: "error", label: "Erreurs" },
  { id: "warning", label: "Avertissements" },
  { id: "info", label: "Informations" },
];

export const RapportQualitePattern = ({
  issues = SAMPLE, verdict = "failed", loading = false,
  validatedAt = "2026-10-27T08:00:00Z", now,
}: {
  issues?: ValidationIssue[]; verdict?: ValidationVerdict; loading?: boolean;
  validatedAt?: string; now?: Date;
} = {}) => {
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ValidationIssue | null>(null);
  // Le constat reste affiché pendant la fermeture animée du Drawer.
  const [open, setOpen] = useState(false);

  // Bilan calculé sur tous les constats : indépendant des filtres.
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const rows = useMemo(() => issues.filter((i) =>
    (level === "all" || i.severity === level)
    && `${i.location?.source ?? ""} ${i.location?.field ?? ""} ${i.message}`.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr"))),
  [issues, level, query]);
  const filtering = level !== "all" || query !== "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader title="Rapport qualité" subtitle="Import du 27/10/2026 · offre théorique GTFS" />

      <DatasetHealth label="Offre théorique — GTFS Bordeaux Métropole" verdict={verdict} loading={loading}
        errorCount={loading ? null : errors} warningCount={loading ? null : warnings}
        validatedAt={validatedAt} now={now} timeZone="Europe/Paris" />

      <FilterBar
        search={{ value: query, onChange: setQuery, "aria-label": "Rechercher un constat" }}
        quickFilters={<Dropdown variant="button" aria-label="Niveau" options={LEVELS} value={level} onChange={setLevel} />}
        activeFilters={level !== "all" ? [{ id: "level", label: LEVELS.find((l) => l.id === level)!.label }] : []}
        onRemoveFilter={() => setLevel("all")}
        resultCount={loading ? undefined : rows.length} />

      <DataTable aria-label="Constats de validation" columns={COLUMNS} data={rows} getRowId={(r) => r.id}
        loading={loading} onRowClick={(r) => { setSelected(r); setOpen(true); }}
        emptyState={filtering
          // « Aucun résultat » ne veut pas dire « aucune erreur » : le bilan reste affiché au-dessus.
          ? <EmptyState size="inline" variant="no-results" title="Aucun constat pour ces filtres"
              description="Le bilan global reste inchangé." action={{ label: "Effacer les filtres", onClick: () => { setLevel("all"); setQuery(""); } }} />
          : <EmptyState size="inline" title="Aucun constat" description="La dernière validation n’a relevé aucun problème." />} />

      {/* Drawer géré par la page : l'inspecteur n'en embarque pas */}
      <Drawer isOpen={open} onClose={() => setOpen(false)} title="Détail du constat">
        <ValidationIssueInspector issue={selected} />
      </Drawer>
    </div>
  );
};
