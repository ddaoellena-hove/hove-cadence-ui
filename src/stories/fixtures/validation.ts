// Constats de validation de démonstration (stories uniquement) : un import GTFS
// fictif. Aucun fichier n'est analysé : les constats sont fournis tels quels.
import type { ValidationIssue } from "../../components";

/** Instant de référence des stories : dates relatives déterministes. */
export const VALIDATION_NOW = new Date("2026-10-27T10:00:00Z");

export const STOP_UNKNOWN: ValidationIssue = {
  id: "issue-0001",
  severity: "error",
  message: "Arrêt inconnu : gare_404 n’existe pas dans stops.txt.",
  location: { source: "stop_times.txt", line: 42, field: "stop_id", objectId: "gare_404" },
  ruleCode: "GTFS-E011",
  correction: "Référencer un arrêt présent dans stops.txt, ou ajouter cet arrêt au fichier source.",
};

export const TIME_ORDER: ValidationIssue = {
  id: "issue-0002",
  severity: "error",
  message: "Départ antérieur à l’arrivée au même arrêt.",
  location: { source: "stop_times.txt", line: 57, field: "departure_time", objectId: "course-00057" },
  ruleCode: "GTFS-E025",
  correction: "Vérifier les horaires de la course, notamment les heures après minuit (25:10 et non 01:10).",
};

export const STOP_NAME: ValidationIssue = {
  id: "issue-0003",
  severity: "warning",
  message: "Nom d’arrêt peu explicite : deux arrêts homonymes « Gare ».",
  location: { source: "stops.txt", line: 12, field: "stop_name" },
  ruleCode: "GTFS-W003",
};

/** Constat partiel : ni ligne, ni champ, ni règle, ni correction. */
export const FEED_INFO: ValidationIssue = {
  id: "issue-0004",
  severity: "info",
  message: "Le fichier facultatif feed_info.txt est absent.",
  location: { source: "feed_info.txt" },
};

/** Textes longs : message et identifiants sans espace. */
export const LONG_TEXTS: ValidationIssue = {
  id: "issue-2026-10-27-import-bordeaux-metropole-gtfs-stop_times-0000000042",
  severity: "error",
  message:
    "La séquence d’arrêts de la course ne croît pas strictement : la valeur stop_sequence 12 apparaît deux fois, ce qui empêche de reconstituer l’ordre des passages et rend la course inexploitable pour le calcul d’itinéraires.",
  location: {
    source: "stop_times.txt",
    line: 128_431,
    field: "stop_sequence",
    objectId: "OCESN875400F3282103:LOC:SNCF:TER-Nouvelle-Aquitaine:2026-10-27",
  },
  ruleCode: "GTFS-E036-STOP-SEQUENCE-NOT-INCREASING",
};

export const ISSUES: ValidationIssue[] = [STOP_UNKNOWN, TIME_ORDER, STOP_NAME, FEED_INFO];
