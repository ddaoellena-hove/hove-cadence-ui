/**
 * BulkActionBar — barre d'actions groupées flottante pour une sélection
 * multiple (`DataTable selectable`, liste de `TableCard`).
 *
 * Placée juste après la liste, dans le même conteneur : collante en bas de
 * la zone visible (`position: sticky`), centrée, elle reste au-dessus des
 * lignes tant que la liste défile, puis reprend sa place sous la liste.
 * Masquée quand `count` vaut 0.
 *
 * Le compteur est annoncé poliment à chaque changement (région `status`
 * toujours montée, y compris quand la barre est masquée, pour que la première
 * sélection soit annoncée).
 */
import type { ReactNode } from "react";
import "./bulk-action-bar.css";

export interface BulkActionBarProps {
  /** Nombre d'éléments sélectionnés. 0 : barre masquée. */
  count: number;
  /** Actions : `GhostButton` puis `PrimaryButton tone="danger"`, en `size="sm"`. */
  children: ReactNode;
  /**
   * Libellé du compteur, affiché et annoncé. Défaut « 1 élément sélectionné »,
   * « 3 éléments sélectionnés », « Aucun élément sélectionné ».
   */
  countLabel?: (count: number) => string;
  /** Nom accessible de la barre. Défaut « Actions groupées ». */
  "aria-label"?: string;
  className?: string;
}

const numberFormat = new Intl.NumberFormat("fr-FR");

const defaultBulkCountLabel = (count: number) =>
  count === 0
    ? "Aucun élément sélectionné"
    : `${numberFormat.format(count)} ${count > 1 ? "éléments sélectionnés" : "élément sélectionné"}`;

export const BulkActionBar = ({
  count,
  children,
  countLabel = defaultBulkCountLabel,
  "aria-label": ariaLabel = "Actions groupées",
  className,
}: BulkActionBarProps) => {
  const label = countLabel(count);
  const visible = count > 0;

  return (
    <div className={["bulk-action-bar", className].filter(Boolean).join(" ")}>
      {/* Annonce : seule source lue pour le compteur (le texte visible est aria-hidden) */}
      <span className="bulk-action-bar__sr" role="status">{label}</span>
      {visible && (
        <div className="bulk-action-bar__surface" role="region" aria-label={ariaLabel}>
          <span className="bulk-action-bar__count" aria-hidden="true">{label}</span>
          <span className="bulk-action-bar__divider" aria-hidden="true" />
          <div className="bulk-action-bar__actions">{children}</div>
        </div>
      )}
    </div>
  );
};
