// Définitions de colonnes partagées par les stories DataTable.
// Déclarées au niveau module : une référence stable évite de recalculer le tri.

import type { DataTableColumn } from "../../components/DataTable";
import { Badge } from "../../components/Badge";
import { Indicator } from "../../components/Indicator";
import { SEVERITY_LABELS, type Disruption, type Trip } from "./transport";

const TRIP_STATUS_LABELS: Record<string, string> = {
  nominal: "À l'heure",
  active: "Léger retard",
  warning: "Retard",
  critical: "Retard important",
};

export const TRIP_COLUMNS: DataTableColumn<Trip>[] = [
  { id: "id", header: "Course", accessor: (t) => t.id, width: 150, sortable: true, cell: (t) => <Badge label={t.id} mono /> },
  { id: "departure", header: "Départ", accessor: (t) => t.departure, width: 150, sortable: true },
  { id: "line", header: "Ligne", accessor: (t) => t.line, width: 120, sortable: true, cell: (t) => <Badge label={t.line} /> },
  { id: "terminus", header: "Direction", accessor: (t) => t.terminus, minWidth: 180, sortable: true },
  { id: "stop", header: "Arrêt", accessor: (t) => t.stop, minWidth: 180, sortable: true },
  { id: "delay", header: "Retard (min)", accessor: (t) => t.delay, numeric: true, width: 140, sortable: true },
  { id: "occupancy", header: "Charge (%)", accessor: (t) => t.occupancy, numeric: true, width: 130, sortable: true },
  {
    id: "status",
    header: "État",
    accessor: (t) => TRIP_STATUS_LABELS[t.status],
    width: 180,
    cell: (t) => <Indicator variant={t.status} label={TRIP_STATUS_LABELS[t.status]} />,
  },
];

export const DISRUPTION_COLUMNS: DataTableColumn<Disruption>[] = [
  { id: "title", header: "Perturbation", accessor: (d) => d.title, minWidth: 260, sortable: true },
  { id: "line", header: "Ligne", accessor: (d) => d.line, width: 120, sortable: true, cell: (d) => <Badge label={d.line} /> },
  { id: "cause", header: "Cause", accessor: (d) => d.cause, width: 180, sortable: true },
  { id: "start", header: "Début", accessor: (d) => d.start, width: 150, sortable: true },
  { id: "impactedStops", header: "Arrêts impactés", accessor: (d) => d.impactedStops, numeric: true, width: 160, sortable: true },
  {
    id: "severity",
    header: "Sévérité",
    accessor: (d) => SEVERITY_LABELS[d.severity],
    width: 160,
    sortable: true,
    cell: (d) => <Indicator variant={d.severity} label={SEVERITY_LABELS[d.severity]} />,
  },
];
