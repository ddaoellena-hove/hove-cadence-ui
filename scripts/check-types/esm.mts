// Consommateur ESM (node16 / nodenext) : imports nommés et types publics.
import { BarChart, PrimaryButton, type DataTableColumn, type PrimaryButtonProps } from "@ddaoellena/cadence-ui";

type Row = { id: string; nom: string };
export const columns: DataTableColumn<Row>[] = [{ id: "nom", header: "Ligne", accessor: (r) => r.nom }];
export const props: PrimaryButtonProps = { label: "Créer", iconStart: "plus", tone: "danger" };
// @ts-expect-error API supprimée en 1.0.0
export const legacy: PrimaryButtonProps = { label: "Créer", destructive: true };
export const components = [BarChart, PrimaryButton];
