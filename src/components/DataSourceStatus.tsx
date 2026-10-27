/**
 * DataSourceStatus — état d'une source de données (flux GTFS-RT, API SIRI,
 * dépôt de fichiers) : disponibilité, dernière observation, dernière
 * récupération réussie, dernière erreur et fraîcheur des données.
 *
 * Trois dimensions indépendantes, jamais déduites l'une de l'autre :
 * - disponibilité : la source répond-elle ? (fournie par l'application) ;
 * - observation / réussite : quand l'a-t-on interrogée, quand a-t-elle répondu ;
 * - fraîcheur : de quand datent les données qu'elle sert.
 * Une source joignable peut servir des données périmées ; une erreur n'efface
 * pas la dernière réussite connue. Aucun polling ni secret de connexion.
 */
import { useId } from "react";
import { DataFreshness } from "./DataFreshness";
import { DescriptionList, type DescriptionItem } from "./DescriptionList";
import { GhostButton } from "./GhostButton";
import { Indicator, type IndicatorVariant } from "./Indicator";
import { Skeleton } from "./Skeleton";
import "./data-source-status.css";

/** Disponibilité de la source, fournie par l'application. */
export type DataSourceAvailability = "available" | "degraded" | "unavailable" | "unknown";

export interface DataSourceStatusProps {
  /** Nom de la source (titre). */
  label: string;
  /** Disponibilité constatée par l'application. */
  availability: DataSourceAvailability;
  /** Dernière fois que la source a été interrogée, réussite ou échec. */
  lastObservedAt?: Date | string | number;
  /** Dernière récupération réussie. Conservée après une erreur. */
  lastSuccessAt?: Date | string | number;
  /** Message de la dernière erreur, tel que fourni par l'application. */
  error?: string;
  /** Horodatage des données servies (pas de la récupération) : fraîcheur. */
  dataUpdatedAt?: Date | string | number;
  /** Seuil « frais » des données, en secondes. Défaut 300. */
  freshWithin?: number;
  /** Seuil « vieillissant » des données, en secondes. Défaut 3600. */
  staleWithin?: number;
  /** Instant de référence des libellés relatifs (horloge de la page, tests). */
  now?: Date | string | number;
  /** Fuseau des dates absolues. */
  timeZone?: string;
  /** Chargement de l'état : squelettes et `aria-busy`. */
  loading?: boolean;
  /** Ouvre le détail de la source. Sans callback, pas de bouton. */
  onViewDetails?: () => void;
  /** Libellé du bouton du détail. Défaut « Voir la source ». */
  detailsLabel?: string;
  /** Niveau du titre. Défaut 3. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

const AVAILABILITY: Record<DataSourceAvailability, { variant: IndicatorVariant; label: string }> = {
  available: { variant: "nominal", label: "Disponible" },
  degraded: { variant: "warning", label: "Dégradée" },
  unavailable: { variant: "critical", label: "Indisponible" },
  unknown: { variant: "draft", label: "État inconnu" },
};

export const DataSourceStatus = ({
  label,
  availability,
  lastObservedAt,
  lastSuccessAt,
  error,
  dataUpdatedAt,
  freshWithin,
  staleWithin,
  now,
  timeZone,
  loading = false,
  onViewDetails,
  detailsLabel = "Voir la source",
  headingLevel = 3,
  className,
}: DataSourceStatusProps) => {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  const { variant, label: availabilityLabel } = AVAILABILITY[availability];

  // Dates d'interrogation sans point coloré : leur âge n'est pas un verdict.
  // Seule la fraîcheur des données porte un ton (frais, vieillissant, périmé).
  const items: DescriptionItem[] = [
    {
      id: "observed",
      label: "Dernière observation",
      value: lastObservedAt !== undefined
        ? <DataFreshness updatedAt={lastObservedAt} now={now} timeZone={timeZone} label="Observée" hideDot />
        : "Jamais observée",
    },
    {
      id: "success",
      label: "Dernière réussite",
      value: lastSuccessAt !== undefined
        ? <DataFreshness updatedAt={lastSuccessAt} now={now} timeZone={timeZone} label="Réussie" hideDot />
        : "Aucune connue",
    },
    {
      id: "freshness",
      label: "Fraîcheur des données",
      value: dataUpdatedAt !== undefined
        ? <DataFreshness updatedAt={dataUpdatedAt} now={now} timeZone={timeZone} freshWithin={freshWithin} staleWithin={staleWithin} label="Produites" />
        : "Inconnue",
    },
    ...(error ? [{
      id: "error",
      label: "Dernière erreur",
      value: <span className="data-source-status__error">{error}</span>,
    }] : []),
  ];

  return (
    <section
      className={["data-source-status", className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
      aria-busy={loading || undefined}
    >
      <div className="data-source-status__header">
        <Heading id={headingId} className="data-source-status__title">{label}</Heading>
        {!loading && <Indicator variant={variant} label={availabilityLabel} />}
      </div>

      {loading ? (
        <Skeleton variant="text" lines={3} />
      ) : (
        <DescriptionList density="compact" items={items} />
      )}

      {onViewDetails && !loading && (
        <div className="data-source-status__actions">
          <GhostButton size="sm" iconStart="arrow-right" label={detailsLabel} onClick={onViewDetails} />
        </div>
      )}
    </section>
  );
};
