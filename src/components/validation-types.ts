/**
 * Contrats de la qualité des données : bilan de validation d'un jeu de données
 * et constats. Indépendants de toute API : l'application calcule le verdict et
 * les constats, les composants se contentent de les présenter.
 */

/**
 * Verdict de la dernière validation, fourni par l'application.
 * - `not-run` : aucune validation exécutée ;
 * - `unknown` : verdict indisponible (récupération impossible, format inconnu) ;
 * - `passed` / `warning` / `failed` : validation exécutée.
 */
export type ValidationVerdict = "not-run" | "unknown" | "passed" | "warning" | "failed";

/** Sévérité d'un constat. */
export type ValidationSeverity = "error" | "warning" | "info";

/** Localisation d'un constat dans la source : chaque élément est facultatif. */
export interface ValidationIssueLocation {
  /** Fichier, table ou flux (« stop_times.txt »). */
  source?: string;
  /** Numéro de ligne dans la source (1-based). */
  line?: number;
  /** Champ ou colonne (« departure_time »). */
  field?: string;
  /** Identifiant de l'objet concerné (« gare_404 »). */
  objectId?: string;
}

/** Constat de validation, tel que produit par le moteur de l'application. */
export interface ValidationIssue {
  /** Identifiant stable du constat. */
  id: string;
  severity: ValidationSeverity;
  /** Problème constaté, en une phrase. */
  message: string;
  location?: ValidationIssueLocation;
  /** Code de la règle de validation (« GTFS-E042 »). */
  ruleCode?: string;
  /** Correction attendue, rédigée par le moteur ou l'application. */
  correction?: string;
}
