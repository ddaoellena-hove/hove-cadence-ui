/**
 * ValidationIssueInspector — détail d'un constat de validation : sévérité,
 * message, localisation dans la source, règle, correction attendue et accès
 * facultatif à la source.
 *
 * Présentation seule : aucun Drawer embarqué (l'application le fournit, ou
 * place l'inspecteur dans une section), aucune correction ni appel réseau.
 * Les éléments de localisation absents s'affichent « Non renseigné ».
 */
import { CopyableText } from "./CopyableText";
import { DescriptionList, type DescriptionItem } from "./DescriptionList";
import { EmptyState } from "./EmptyState";
import { GhostButton } from "./GhostButton";
import { Indicator, type IndicatorVariant } from "./Indicator";
import { InlineAlert } from "./InlineAlert";
import type { ValidationIssue, ValidationSeverity } from "./validation-types";
import "./validation-issue-inspector.css";

export interface ValidationIssueInspectorProps {
  /** Constat à présenter. `null` : état vide. */
  issue: ValidationIssue | null;
  /** Ouvre la source à l'endroit du constat. Sans callback, pas de bouton. */
  onOpenSource?: (issue: ValidationIssue) => void;
  /** Libellé du bouton de la source. Défaut « Ouvrir dans la source ». */
  openSourceLabel?: string;
  /** Titre de l'état vide. Défaut « Aucun constat sélectionné ». */
  emptyTitle?: string;
  className?: string;
}

const SEVERITIES: Record<ValidationSeverity, { variant: IndicatorVariant; label: string }> = {
  error: { variant: "critical", label: "Erreur" },
  warning: { variant: "warning", label: "Avertissement" },
  info: { variant: "info", label: "Information" },
};

const numberFormat = new Intl.NumberFormat("fr-FR");

export const ValidationIssueInspector = ({
  issue,
  onOpenSource,
  openSourceLabel = "Ouvrir dans la source",
  emptyTitle = "Aucun constat sélectionné",
  className,
}: ValidationIssueInspectorProps) => {
  const rootClass = ["validation-issue-inspector", className].filter(Boolean).join(" ");

  if (!issue) {
    return (
      <div className={rootClass}>
        <EmptyState size="inline" title={emptyTitle} description="Sélectionnez un constat pour en afficher le détail." />
      </div>
    );
  }

  const { severity, message, location = {}, ruleCode, correction } = issue;
  const { variant, label } = SEVERITIES[severity];

  const items: DescriptionItem[] = [
    { id: "source", label: "Source", value: location.source },
    { id: "line", label: "Ligne", value: location.line !== undefined ? numberFormat.format(location.line) : undefined },
    { id: "field", label: "Champ", value: location.field },
    ...(location.objectId !== undefined ? [{
      id: "object",
      label: "Objet",
      value: <CopyableText value={location.objectId} copyLabel={`Copier l’identifiant ${location.objectId}`} />,
    }] : []),
    ...(ruleCode !== undefined ? [{
      id: "rule",
      label: "Règle",
      value: <CopyableText value={ruleCode} copyLabel={`Copier le code de règle ${ruleCode}`} />,
    }] : []),
    {
      id: "issue-id",
      label: "Identifiant du constat",
      value: <CopyableText value={issue.id} copyLabel="Copier l’identifiant du constat" />,
    },
  ];

  return (
    <div className={rootClass}>
      <div className="validation-issue-inspector__summary">
        <Indicator variant={variant} label={label} />
        <p className="validation-issue-inspector__message">{message}</p>
      </div>

      <DescriptionList aria-label="Localisation du constat" density="compact" items={items} />

      {correction && (
        <InlineAlert type="information" title="Correction attendue">{correction}</InlineAlert>
      )}

      {onOpenSource && (
        <div className="validation-issue-inspector__actions">
          <GhostButton size="sm" iconStart="file-05" label={openSourceLabel} onClick={() => onOpenSource(issue)} />
        </div>
      )}
    </div>
  );
};
