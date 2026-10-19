// Données de démonstration pour les stories (courses et perturbations).
// Générateur pseudo-aléatoire déterministe : mêmes données à chaque rendu,
// ce qui garde les tests de stories stables.

import type { IndicatorVariant } from "../../components/Indicator";

const createRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const pick = <T,>(random: () => number, items: readonly T[]): T => items[Math.floor(random() * items.length)];

const LINES = ["Ligne 1", "Ligne 4", "Ligne 6", "Ligne 9", "Ligne 13", "RER A", "RER B", "T3a", "Bus 38", "Bus 91"] as const;

const STOPS = [
  "Châtelet", "Gare de Lyon", "Nation", "République", "Montparnasse – Bienvenüe",
  "Saint-Lazare", "Denfert-Rochereau", "Porte d'Orléans", "Bastille", "Opéra",
  "La Défense", "Gare du Nord", "Place d'Italie", "Barbès – Rochechouart", "Étoile",
  "Bercy", "Vincennes", "Cité Universitaire", "Porte de Clichy", "Mairie de Montreuil",
] as const;

// ── Courses ──────────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  line: string;
  terminus: string;
  stop: string;
  departure: Date;
  delay: number;
  occupancy: number;
  status: IndicatorVariant;
}

const statusFromDelay = (delay: number): IndicatorVariant =>
  delay >= 15 ? "critical" : delay >= 5 ? "warning" : delay > 0 ? "active" : "nominal";

/** `count` courses de la journée du 19/10/2026, triées par heure de départ. */
export const generateTrips = (count: number, seed = 42): Trip[] => {
  const random = createRandom(seed);
  const start = new Date(2026, 9, 19, 5, 30).getTime();
  return Array.from({ length: count }, (_, i) => {
    const delay = random() < 0.7 ? 0 : Math.round(random() * 25);
    return {
      id: `course-${String(i + 1).padStart(5, "0")}`,
      line: pick(random, LINES),
      terminus: pick(random, STOPS),
      stop: pick(random, STOPS),
      departure: new Date(start + Math.floor((i / count) * 19 * 3600 * 1000)),
      delay,
      occupancy: Math.round(random() * 100),
      status: statusFromDelay(delay),
    };
  });
};

// ── Perturbations ────────────────────────────────────────────────────────

export interface Disruption {
  id: string;
  title: string;
  line: string;
  cause: string;
  severity: IndicatorVariant;
  impactedStops: number;
  start: Date;
}

const CAUSES = ["Travaux", "Incident technique", "Mouvement social", "Malaise voyageur", "Météo", "Manifestation"] as const;
const SEVERITIES: IndicatorVariant[] = ["critical", "warning", "info", "nominal"];

export const SEVERITY_LABELS: Record<string, string> = {
  critical: "Critique",
  warning: "Ralenti",
  info: "Information",
  nominal: "Normal",
};

/** `count` perturbations, de la plus récente à la plus ancienne. */
export const generateDisruptions = (count: number, seed = 7): Disruption[] => {
  const random = createRandom(seed);
  const end = new Date(2026, 9, 19, 18, 0).getTime();
  return Array.from({ length: count }, (_, i) => {
    const line = pick(random, LINES);
    const cause = pick(random, CAUSES);
    return {
      id: `perturbation-${String(i + 1).padStart(5, "0")}`,
      title: `${cause} – ${pick(random, STOPS)}`,
      line,
      cause,
      severity: pick(random, SEVERITIES),
      impactedStops: 1 + Math.floor(random() * 18),
      start: new Date(end - i * 7 * 60 * 1000),
    };
  });
};
