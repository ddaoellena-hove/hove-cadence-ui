/**
 * ExportMenu component.
 *
 * Menu d'export bâti sur la primitive de menu (menu-core). Déclencheur
 * « Exporter » (PrimaryButton outline sm). Chaque item est une combinaison
 * portée × format ; la portée « sélection » est désactivée si elle est vide.
 */
import { PrimaryButton } from "./PrimaryButton";
import { Menu, type MenuItemSpec } from "./menu-core";

export type ExportScope = "selection" | "page" | "all";
export type ExportFormat = "csv" | "excel";

export interface ExportScopeCounts {
  /** Nombre d'éléments sélectionnés (portée désactivée si 0). */
  selection?: number;
  /** Nombre d'éléments de la page courante. */
  page?: number;
  /** Nombre total d'éléments du résultat. */
  total?: number;
}

export interface ExportMenuProps {
  counts: ExportScopeCounts;
  /** Formats proposés. Défaut ["csv", "excel"]. */
  formats?: ExportFormat[];
  /** Export en cours (déclencheur en chargement). */
  loading?: boolean;
  onExport: (args: { scope: ExportScope; format: ExportFormat }) => void;
  /** Classe CSS additionnelle. */
  className?: string;
}

const FORMAT_LABEL: Record<ExportFormat, string> = { csv: "CSV", excel: "Excel" };
const SCOPE_LABEL: Record<ExportScope, string> = {
  selection: "Sélection",
  page: "Page courante",
  all: "Tout le résultat",
};
const nf = new Intl.NumberFormat("fr-FR");

export const ExportMenu = ({ counts, formats = ["csv", "excel"], loading = false, onExport, className }: ExportMenuProps) => {
  // Portées disponibles (dans l'ordre), avec leur compteur.
  const scopes = ([
    ["selection", counts.selection],
    ["page", counts.page],
    ["all", counts.total],
  ] as const).filter(([, count]) => typeof count === "number") as [ExportScope, number][];

  const items: MenuItemSpec[] = [];
  scopes.forEach(([scope, count], scopeIndex) => {
    const disabled = count <= 0 || loading;
    formats.forEach((format, formatIndex) => {
      items.push({
        id: `${scope}-${format}`,
        label: FORMAT_LABEL[format],
        icon: "download-02",
        disabled,
        // En-tête de section (portée + compteur) sur le 1er format de chaque portée.
        sectionLabel: formatIndex === 0 ? `${SCOPE_LABEL[scope]} (${nf.format(count)})` : undefined,
        // Séparateur avant chaque nouvelle portée (sauf la première).
        divider: scopeIndex > 0 && formatIndex === 0,
        onSelect: () => onExport({ scope, format }),
      });
    });
  });

  return (
    <Menu
      items={items}
      label="Exporter"
      align="end"
      className={["export-menu", className].filter(Boolean).join(" ")}
      renderTrigger={({ ref, toggle }) => (
        <PrimaryButton ref={ref} outline size="sm" iconStart="download-02" label="Exporter" loading={loading} onClick={toggle} />
      )}
    />
  );
};
