// Calculs du TimeSpaceDiagram (purs, testés) : heures de service, points
// d'une course (arrivée puis départ à chaque arrêt), fenêtre, écarts
// théorique / réalisé, phrases lues.

import { formatClock } from "./timeline-utils";

export interface TimeSpacePassageInput {
  stopId: string;
  arrival?: string;
  departure?: string;
}

export interface TimeSpaceTripInput {
  id: string;
  label: string;
  direction: "outbound" | "inbound";
  scheduled: TimeSpacePassageInput[];
  actual?: TimeSpacePassageInput[];
  status?: "normal" | "cancelled" | "incident";
  note?: string;
}

/** Heure de service « HH:mm » ou « HH:mm:ss » (jusqu'à 47:59:59) en minutes ; null si invalide. */
export const serviceTimeToMinutes = (value?: string): number | null => {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const [h, m, s] = [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
  return h <= 47 && m < 60 && s < 60 ? h * 60 + m + s / 60 : null;
};

export interface TripPoint {
  stopIndex: number;
  /** Minutes depuis 00:00 du jour de service. */
  time: number;
}

/**
 * Points d'une course dans l'ordre de parcours : arrivée puis départ à chaque
 * arrêt (le palier montre l'arrêt). Arrêts inconnus et horaires invalides ignorés.
 */
export const tripPoints = (passages: TimeSpacePassageInput[], stopIndex: Map<string, number>): TripPoint[] =>
  passages.flatMap((p) => {
    const index = stopIndex.get(p.stopId);
    if (index === undefined) return [];
    const times = [serviceTimeToMinutes(p.arrival), serviceTimeToMinutes(p.departure)].filter((t): t is number => t !== null);
    const unique = times.length === 2 && times[0] === times[1] ? [times[0]] : times;
    return unique.map((time) => ({ stopIndex: index, time }));
  });

/** Première et dernière heure d'une course (théorique et réalisé confondus). */
export const tripSpan = (trip: TimeSpaceTripInput, stopIndex: Map<string, number>): [number, number] | null => {
  const times = [...tripPoints(trip.scheduled, stopIndex), ...tripPoints(trip.actual ?? [], stopIndex)].map((p) => p.time);
  return times.length ? [Math.min(...times), Math.max(...times)] : null;
};

/** Fenêtre englobant les courses, arrondie au quart d'heure ; [06:00, 07:00] sans course. */
export const tripsWindow = (trips: TimeSpaceTripInput[], stopIndex: Map<string, number>): [number, number] => {
  const spans = trips.map((t) => tripSpan(t, stopIndex)).filter((s): s is [number, number] => s !== null);
  if (spans.length === 0) return [360, 420];
  const low = Math.floor(Math.min(...spans.map((s) => s[0])) / 15) * 15;
  const high = Math.ceil(Math.max(...spans.map((s) => s[1])) / 15) * 15;
  return [low, high > low ? high : low + 15];
};

/** Heure de passage à un arrêt (départ, sinon arrivée), en minutes. */
const passageTime = (passages: TimeSpacePassageInput[] | undefined, stopId: string) => {
  const p = passages?.find((x) => x.stopId === stopId);
  return p ? (serviceTimeToMinutes(p.departure) ?? serviceTimeToMinutes(p.arrival)) : null;
};

/** Écart réalisé − théorique à un arrêt (minutes) ; null sans les deux heures. */
export const passageDelay = (trip: TimeSpaceTripInput, stopId: string) => {
  const scheduled = passageTime(trip.scheduled, stopId);
  const actual = passageTime(trip.actual, stopId);
  return scheduled === null || actual === null ? null : actual - scheduled;
};

/** Plus grand écart (en valeur absolue) de la course, signe conservé ; null sans réalisé. */
export const maxDelay = (trip: TimeSpaceTripInput) => {
  const delays = trip.scheduled.map((p) => passageDelay(trip, p.stopId)).filter((d): d is number => d !== null);
  return delays.length ? delays.reduce((a, b) => (Math.abs(b) > Math.abs(a) ? b : a)) : null;
};

/** Heure lue : « 06h42 ». */
export const clock = (minutes: number) => formatClock(minutes, "time");

/** Écart lu : « retard 3 min », « avance 1 min », « à l'heure ». */
export const delayWords = (delay: number | null) => {
  if (delay === null) return null;
  const m = Math.round(delay);
  return m === 0 ? "à l'heure" : `${m > 0 ? "retard" : "avance"} ${Math.abs(m)} min`;
};

/** Passage lu : « Garibaldi : prévu 06h39, réalisé 06h42, retard 3 min ». */
export const describePassage = (trip: TimeSpaceTripInput, stopId: string, stopName: string) => {
  const scheduled = passageTime(trip.scheduled, stopId);
  const actual = passageTime(trip.actual, stopId);
  const parts = [
    scheduled !== null ? `prévu ${clock(scheduled)}` : "horaire non renseigné",
    ...(actual !== null ? [`réalisé ${clock(actual)}`] : []),
    ...(scheduled !== null && actual !== null ? [delayWords(actual - scheduled) as string] : []),
  ];
  return `${stopName} : ${parts.join(", ")}`;
};

/** Résumé : « 42 courses dans la fenêtre, 21 vers Montparnasse, 21 vers Saint-Denis, 2 supprimées, 1 incident ». */
export const describeTrips = (trips: TimeSpaceTripInput[], directions: { outbound: string; inbound: string }) => {
  const inSentence = (label: string) => label.charAt(0).toLowerCase() + label.slice(1);
  const outbound = trips.filter((t) => t.direction === "outbound").length;
  const cancelled = trips.filter((t) => t.status === "cancelled").length;
  const incidents = trips.filter((t) => t.status === "incident").length;
  return [
    `${trips.length} course${trips.length > 1 ? "s" : ""} dans la fenêtre`,
    `${outbound} ${inSentence(directions.outbound)}`,
    `${trips.length - outbound} ${inSentence(directions.inbound)}`,
    ...(cancelled ? [`${cancelled} supprimée${cancelled > 1 ? "s" : ""}`] : []),
    ...(incidents ? [`${incidents} incident${incidents > 1 ? "s" : ""}`] : []),
  ].join(", ");
};
