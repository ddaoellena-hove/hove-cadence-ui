import { useState, type ReactNode } from "react";
import { GhostButton } from "./GhostButton";
import "./chart-frame.css";

export type ChartState = "ready" | "loading" | "empty" | "error";

/** Props communes aux graphiques (LineChart, Heatmap, BarList). */
export interface ChartCommonProps {
  /** Titre affiché au-dessus du graphique (nom accessible). */
  title: string;
  /** Phrase de description (aria-describedby) : « Retard moyen par heure, 7 derniers jours ». */
  description?: string;
  /** Niveau du titre. Défaut 3. */
  headingLevel?: 2 | 3 | 4;
  /** Défaut "ready". "loading" affiche un squelette ; "empty" et "error", un message. */
  state?: ChartState;
  /** Message de l'état vide. Défaut « Aucune donnée sur la période. » */
  emptyMessage?: string;
  /** Message d'erreur. Défaut « Impossible de charger les données. » */
  errorMessage?: string;
  /** Action « Réessayer » de l'état d'erreur. */
  onRetry?: () => void;
  /**
   * Encadre le graphique d'une surface de carte (fond blanc, bordure, coins
   * arrondis, marge intérieure), comme une `Card`. À utiliser quand plusieurs
   * graphiques se côtoient (grille, tableau de bord). Défaut false.
   */
  framed?: boolean;
  /** Classe CSS additionnelle. */
  className?: string;
}

interface ChartFrameProps extends ChartCommonProps {
  /** Ids du titre et de la description, pour relier le graphique (aria-labelledby / -describedby). */
  titleId: string;
  descriptionId: string;
  /** Hauteur réservée au graphique pendant le chargement et pour les messages. */
  height: number;
  /** Légende sous le graphique. */
  legend?: ReactNode;
  /** Alternative tabulaire (ChartDataTable) : dans le DOM, affichée par « Voir les données ». */
  table?: (visible: boolean) => ReactNode;
  /** Sans en-tête visible ni légende (LineChart compact) : le titre reste pour les lecteurs d'écran. */
  compact?: boolean;
  /** En-tête masqué visuellement (titre lu), légende conservée. */
  hideHeader?: boolean;
  /** Classe propre au graphique (« line-chart »…). */
  kind: string;
  children: ReactNode;
}

/**
 * Cadre commun des graphiques (interne) : titre et description reliés, états
 * chargement / vide / erreur, alternative tabulaire, légende.
 */
export const ChartFrame = ({
  title,
  description,
  headingLevel = 3,
  state = "ready",
  emptyMessage = "Aucune donnée sur la période.",
  errorMessage = "Impossible de charger les données.",
  onRetry,
  framed = false,
  className,
  titleId,
  descriptionId,
  height,
  legend,
  table,
  compact = false,
  hideHeader = false,
  kind,
  children,
}: ChartFrameProps) => {
  const [showTable, setShowTable] = useState(false);
  const Heading = `h${headingLevel}` as const;
  const ready = state === "ready";

  const rootClass = ["chart", kind, compact ? "chart--compact" : "", framed ? "chart--framed" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={rootClass}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={state === "loading" || undefined}
    >
      <div className={compact || hideHeader ? "chart__sr-only" : "chart__header"}>
        <div className="chart__heading">
          <Heading id={titleId} className="chart__title">
            {title}
          </Heading>
          {description && (
            <p id={descriptionId} className="chart__description">
              {description}
            </p>
          )}
        </div>
        {ready && table && !compact && !hideHeader && (
          <GhostButton
            size="sm"
            iconStart={showTable ? "eye-off" : "eye"}
            label={showTable ? "Masquer les données" : "Voir les données"}
            onClick={() => setShowTable((v) => !v)}
          />
        )}
      </div>

      {state === "loading" && <div className="chart__skeleton" style={{ height }} aria-hidden="true" />}
      {state === "empty" && (
        <div className="chart__message" style={{ minHeight: compact ? undefined : Math.min(height, 160) }}>
          <p>{emptyMessage}</p>
        </div>
      )}
      {state === "error" && (
        <div className="chart__message chart__message--error" role="alert" style={{ minHeight: compact ? undefined : Math.min(height, 160) }}>
          <p>{errorMessage}</p>
          {onRetry && <GhostButton size="sm" iconStart="refresh-ccw-05" label="Réessayer" onClick={onRetry} />}
        </div>
      )}
      {ready && children}
      {ready && legend && !compact && legend}
      {ready && table?.(showTable)}
    </section>
  );
};
