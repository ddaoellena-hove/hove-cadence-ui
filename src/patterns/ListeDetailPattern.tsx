import { useState } from "react";
import {
  PageHeader, DataTable, Drawer, DescriptionList, Accordion, ActivityFeed, InlineAlert,
  LineBadge, Indicator, type DataTableColumn,
} from "@ddaoellena/cadence-ui";

// Pattern — Liste + détail latéral (P3).
// Une liste (`DataTable`) et un `Drawer` de détail qui s'ouvre sans quitter la
// liste (métadonnées en `DescriptionList`, sections en `Accordion`, historique
// en `ActivityFeed`).
interface Disruption { id: string; title: string; line: string; severity: "critical" | "warning" | "info"; message: string }

const ROWS: Disruption[] = [
  { id: "d1", title: "Travaux entre Châtelet et Nation", line: "Ligne 1", severity: "warning", message: "Interruption jusqu'à 17h00." },
  { id: "d2", title: "Incident d'exploitation", line: "RER A", severity: "critical", message: "Trafic très perturbé." },
];

const COLUMNS: DataTableColumn<Disruption>[] = [
  { id: "title", header: "Perturbation", accessor: (r) => r.title, minWidth: 260 },
  { id: "line", header: "Ligne", accessor: (r) => r.line, width: 140 },
  { id: "severity", header: "Sévérité", accessor: (r) => r.severity, width: 150, cell: (r) => <Indicator variant={r.severity} /> },
];

export const ListeDetailPattern = () => {
  const [selected, setSelected] = useState<Disruption | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader title="Perturbations" subtitle="Cliquez une ligne pour ouvrir le détail." />

      <DataTable aria-label="Perturbations" columns={COLUMNS} data={ROWS} getRowId={(r) => r.id} onRowClick={setSelected} />

      <Drawer isOpen={selected !== null} onClose={() => setSelected(null)} title={selected?.title ?? ""}>
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <InlineAlert type="information">{selected.message}</InlineAlert>
            <Accordion items={[
              {
                id: "infos", title: "Informations", defaultOpen: true, content: (
                  <DescriptionList items={[
                    { id: "line", label: "Ligne", value: <LineBadge code={selected.line.replace(/\D/g, "") || "1"} mode="metro" /> },
                    { id: "sev", label: "Sévérité", value: selected.severity },
                  ]} />
                ),
              },
              {
                id: "history", title: "Historique", content: (
                  <ActivityFeed aria-label="Historique" timeZone="Europe/Paris" items={[
                    { id: "pub", title: "Message voyageurs publié", date: new Date("2026-06-11T07:00:00Z"), author: "Camille Martin", tone: "success" },
                  ]} />
                ),
              },
            ]} />
          </div>
        )}
      </Drawer>
    </div>
  );
};
