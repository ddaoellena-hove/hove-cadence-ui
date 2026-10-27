/**
 * DatasetHealth — bilan de validation d'un jeu de données : verdict, nombre
 * d'erreurs et d'avertissements, date de la dernière validation et accès au
 * rapport.
 *
 * Présentation seule : le verdict et les compteurs sont fournis par
 * l'application. Aucun score, aucun verdict déduit de la fraîcheur ni des
 * compteurs, aucune décision de publication. Un compteur inconnu (`null` ou
 * absent) s'affiche « Inconnu », jamais 0.
 */
import { useId } from "react";
import { DataFreshness } from "./DataFreshness";
import { DescriptionList, type DescriptionItem } from "./DescriptionList";
import { GhostButton } from "./GhostButton";
import { Indicator, type IndicatorVariant } from "./Indicator";
import { Skeleton } from "./Skeleton";
import type { ValidationVerdict } from "./validation-types";
import "./dataset-health.css";

export interface DatasetHealthProps {
  /** Nom du jeu de données (titre du bilan). */
  label: string;
  /** Verdict de la dernière validation, fourni par l'application. */
  verdict: ValidationVerdict;
  /** Nombre d'erreurs. `null` ou absent : inconnu (jamais converti en 0). */
  errorCount?: number | null;
  /** Nombre d'avertissements. `null` ou absent : inconnu. */
  warningCount?: number | null;
  /** Date de la dernière validation (pas de la collecte). */
  validatedAt?: Date | string | number;
  /** Instant de référence du libellé relatif (à fixer pour les tests). */
  now?: Date | string | number;
  /** Fuseau de la date absolue. */
  timeZone?: string;
  /** Chargement du bilan : squelettes et `aria-busy`. */
  loading?: boolean;
  /** Ouvre le rapport détaillé. Sans callback, pas de bouton. */
  onViewReport?: () => void;
  /** Libellé du bouton du rapport. Défaut « Voir le rapport ». */
  reportLabel?: string;
  /** Niveau du titre. Défaut 2. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

const VERDICTS: Record<ValidationVerdict, { variant: IndicatorVariant; label: string }> = {
  "not-run": { variant: "draft", label: "Non validé" },
  unknown: { variant: "draft", label: "Verdict inconnu" },
  passed: { variant: "nominal", label: "Valide" },
  warning: { variant: "warning", label: "Valide avec avertissements" },
  failed: { variant: "critical", label: "Invalide" },
};

const numberFormat = new Intl.NumberFormat("fr-FR");
const formatCount = (count: number | null | undefined) =>
  count === null || count === undefined ? "Inconnu" : numberFormat.format(count);

export const DatasetHealth = ({
  label,
  verdict,
  errorCount,
  warningCount,
  validatedAt,
  now,
  timeZone,
  loading = false,
  onViewReport,
  reportLabel = "Voir le rapport",
  headingLevel = 2,
  className,
}: DatasetHealthProps) => {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  const { variant, label: verdictLabel } = VERDICTS[verdict];
  const notRun = verdict === "not-run";

  // Sans validation exécutée, les compteurs n'ont pas de sens : non affichés.
  const items: DescriptionItem[] = [
    ...(notRun ? [] : [
      { id: "errors", label: "Erreurs", value: formatCount(errorCount) },
      { id: "warnings", label: "Avertissements", value: formatCount(warningCount) },
    ]),
    {
      id: "validated-at",
      label: "Dernière validation",
      value: validatedAt !== undefined
        // Point de fraîcheur masqué : l'âge de la validation n'est pas un verdict.
        ? <DataFreshness updatedAt={validatedAt} now={now} timeZone={timeZone} label="Validé" hideDot />
        : notRun ? "Jamais validé" : "Date inconnue",
    },
  ];

  return (
    <section
      className={["dataset-health", className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
      aria-busy={loading || undefined}
    >
      <div className="dataset-health__header">
        <Heading id={headingId} className="dataset-health__title">{label}</Heading>
        {!loading && <Indicator variant={variant} label={verdictLabel} />}
      </div>

      {loading ? (
        <div className="dataset-health__loading">
          <Skeleton variant="text" lines={3} />
        </div>
      ) : (
        <DescriptionList density="compact" items={items} className="dataset-health__facts" />
      )}

      {onViewReport && !loading && (
        <div className="dataset-health__actions">
          <GhostButton size="sm" iconStart="file-05" label={reportLabel} onClick={onViewReport} />
        </div>
      )}
    </section>
  );
};
