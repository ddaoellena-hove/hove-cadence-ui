import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { PageHeader, SegmentedControl, SecondaryTab, TabList, ServiceCalendar, RouteStopList, LineBadge, DataTable, FilterBar, Indicator, InlineAlert, Drawer, DescriptionList, EmptyState, type ServiceCalendarValue, type DataTableColumn } from "../components";

interface Issue { id: string; severity: "error" | "warning"; file: string; row: number; field: string; message: string; correction: string }
const ISSUES: Issue[] = [
  { id: "stop-missing", severity: "error", file: "stop_times.txt", row: 42, field: "stop_id", message: "Arrêt inconnu : gare_404", correction: "Référencer un arrêt présent dans stops.txt ou ajouter cet arrêt dans le fichier source." },
  { id: "time-order", severity: "error", file: "stop_times.txt", row: 57, field: "departure_time", message: "Départ antérieur à l’arrivée", correction: "Vérifier les horaires de la course, notamment les heures après minuit." },
  { id: "stop-name", severity: "warning", file: "stops.txt", row: 12, field: "stop_name", message: "Nom d’arrêt peu explicite", correction: "Préciser le nom pour distinguer les deux arrêts homonymes." },
];
const COLUMNS: DataTableColumn<Issue>[] = [
  { id: "severity", header: "Niveau", accessor: (row) => row.severity, width: 150, cell: (row) => <Indicator variant={row.severity === "error" ? "critical" : "warning"} label={row.severity === "error" ? "Erreur" : "Avertissement"} /> },
  { id: "file", header: "Fichier", accessor: (row) => row.file, width: 160, sortable: true },
  { id: "row", header: "Ligne", accessor: (row) => row.row, width: 80, numeric: true, sortable: true },
  { id: "message", header: "Problème", accessor: (row) => row.message, minWidth: 240 },
];
/** Recette locale : les constats sont fournis, aucun fichier n’est analysé ici. */
function DataQualityReport() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Issue | null>(null);
  const errors = ISSUES.filter((issue) => issue.severity === "error").length;
  const rows = ISSUES.filter((issue) => (filter === "all" || issue.severity === filter) && `${issue.file} ${issue.field} ${issue.message}`.toLocaleLowerCase("fr").includes(search.toLocaleLowerCase("fr")));
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <InlineAlert type="error" title="Import bloqué">{errors} erreurs à corriger et {ISSUES.length - errors} avertissement. Ce bilan porte sur l’ensemble du rapport, indépendamment des filtres.</InlineAlert>
    <TabList aria-label="Niveau des constats" level="secondary">
      {[{ id: "all", label: "Tous", count: ISSUES.length }, { id: "error", label: "Erreurs", count: errors }, { id: "warning", label: "Avertissements", count: ISSUES.length - errors }].map((item) =>
        <SecondaryTab key={item.id} id={`quality-${item.id}`} controls="quality-panel" label={item.label} count={item.count} variant={filter === item.id ? "active" : "default"} onClick={() => setFilter(item.id)} />)}
    </TabList>
    <div role="tabpanel" id="quality-panel" aria-labelledby={`quality-${filter}`} tabIndex={0} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <FilterBar search={{ value: search, onChange: setSearch, "aria-label": "Rechercher un constat" }} resultCount={rows.length} />
      <DataTable aria-label="Constats de qualité" columns={COLUMNS} data={rows} getRowId={(row) => row.id} onRowClick={setSelected}
        emptyState={<EmptyState size="inline" variant="no-results" title="Aucun constat pour ces filtres" description="Le bilan global reste inchangé." />} />
    </div>
    <Drawer isOpen={selected !== null} onClose={() => setSelected(null)} title="Détail du constat">
      {selected && <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <DescriptionList items={[{ id: "file", label: "Fichier", value: selected.file }, { id: "row", label: "Ligne", value: selected.row }, { id: "field", label: "Champ", value: selected.field }, { id: "message", label: "Problème", value: selected.message }]} />
        <InlineAlert type="information" title="Correction attendue">{selected.correction}</InlineAlert>
      </div>}
    </Drawer>
  </div>;
}
function OffreEtQualite({ initialView = "offer" }: { initialView?: string }) {
  const [view, setView] = useState(initialView);
  const [section, setSection] = useState("calendar");
  const [calendar, setCalendar] = useState<ServiceCalendarValue>({ startDate: "2026-11-01", endDate: "2026-11-30", weekdays: [1, 2, 3, 4, 5], exceptions: [{ date: "2026-11-11", type: "removed" }] });
  return <main style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, maxWidth: 1040, margin: "0 auto" }}>
    <PageHeader title="Offre de transport" subtitle="Données de démonstration — modifications locales" />
    <SegmentedControl aria-label="Espace de travail" options={[{ value: "offer", label: "Offre" }, { value: "quality", label: "Qualité" }]} value={view} onChange={setView} />
    {view === "quality" ? <DataQualityReport /> : <>
      <TabList aria-label="Détails de l’offre" level="secondary">
        {[{ id: "calendar", label: "Calendriers" }, { id: "trips", label: "Courses et arrêts" }].map((item) =>
          <SecondaryTab key={item.id} id={`offer-${item.id}`} controls="offer-panel" label={item.label} variant={section === item.id ? "active" : "default"} onClick={() => setSection(item.id)} />)}
      </TabList>
      <div id="offer-panel" role="tabpanel" aria-labelledby={`offer-${section}`} tabIndex={0}>
        {section === "calendar" ? <ServiceCalendar label="Jours de circulation" value={calendar} onChange={setCalendar} /> :
          <RouteStopList label="Course N38 — Gare de Lyon vers Nation" line={<LineBadge code="38" mode="bus" />} stops={[
            { id: "p1", name: "Gare de Lyon", departure: "23:50" },
            { id: "p2", name: "Bastille", skipped: true, note: "Arrêt non desservi pendant les travaux." },
            { id: "p3", name: "Nation", arrival: "24:20" },
          ]} />}
      </div>
    </>}
  </main>;
}
const meta: Meta = { title: "Recettes/Offre et qualité", parameters: { layout: "fullscreen", a11y: { test: "error" } } };
export default meta;
type Story = StoryObj;
export const Parcours: Story = {
  render: () => <OffreEtQualite />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("tab", { name: "Courses et arrêts" }));
    await expect(canvas.getByText("24:20")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("radio", { name: "Qualité" }));
    await expect(canvas.getByRole("table", { name: "Constats de qualité" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("tab", { name: /Avertissements/ }));
    await expect(canvas.getByText("Nom d’arrêt peu explicite")).toBeInTheDocument();
    await expect(canvas.queryByText("Arrêt inconnu : gare_404")).not.toBeInTheDocument();
    await expect(canvas.getByRole("alert")).toHaveTextContent("2 erreurs");
    await userEvent.click(canvas.getByText("Nom d’arrêt peu explicite"));
    const drawer = await within(document.body).findByRole("dialog", { name: "Détail du constat" });
    await expect(within(drawer).getByText("stop_name")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  },
};
export const RapportQualite: Story = {
  name: "Rapport qualité et recherche", render: () => <OffreEtQualite initialView="quality" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox"), "introuvable{Enter}");
    await expect(await canvas.findByText("Aucun constat pour ces filtres")).toBeInTheDocument();
    await expect(canvas.getByRole("alert")).toHaveTextContent("Import bloqué");
  },
};
