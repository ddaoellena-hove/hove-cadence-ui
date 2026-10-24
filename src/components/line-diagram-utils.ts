// Calculs du LineDiagram (purs, testés) : position des arrêts et des
// véhicules le long de la ligne, statut et écart, empilement des véhicules
// proches, phrases lues.

export interface LineDiagramStopInput {
  id: string;
  name: string;
  distance?: number;
  status?: "normal" | "disrupted" | "closed";
  note?: string;
}

export type VehiclePosition = { at: string } | { from: string; to: string; progress?: number };

export interface LineDiagramVehicleInput {
  id: string;
  label: string;
  direction: "outbound" | "inbound";
  position: VehiclePosition;
  delay?: number;
  incident?: string;
  load?: number;
}

export type VehicleStatus = "incident" | "late" | "early" | "ontime";

export interface DelayThresholds {
  late: number;
  early: number;
}

export const DEFAULT_DELAY_THRESHOLDS: DelayThresholds = { late: 3, early: -1 };

/**
 * Position de chaque arrêt de 0 (premier) à 1 (dernier) : à l'échelle des
 * distances si tous les arrêts en ont une (croissante), sinon régulière.
 */
export const stopFractions = (stops: LineDiagramStopInput[]) => {
  if (stops.length <= 1) return stops.map(() => 0);
  const distances = stops.map((s) => s.distance);
  const scaled =
    distances.every((d): d is number => typeof d === "number" && Number.isFinite(d)) &&
    distances.every((d, i) => i === 0 || d >= (distances[i - 1] as number)) &&
    (distances[distances.length - 1] as number) > (distances[0] as number);
  if (!scaled) return stops.map((_, i) => i / (stops.length - 1));
  const first = distances[0] as number;
  const span = (distances[distances.length - 1] as number) - first;
  return distances.map((d) => ((d as number) - first) / span);
};

/** Position d'un véhicule de 0 à 1 le long de la ligne ; null si ses arrêts sont inconnus. */
export const vehicleFraction = (position: VehiclePosition, stopIndex: Map<string, number>, fractions: number[]) => {
  if ("at" in position) {
    const i = stopIndex.get(position.at);
    return i === undefined ? null : fractions[i];
  }
  const a = stopIndex.get(position.from);
  const b = stopIndex.get(position.to);
  if (a === undefined || b === undefined) return null;
  const progress = Math.min(1, Math.max(0, Number.isFinite(position.progress) ? (position.progress as number) : 0.5));
  return fractions[a] + (fractions[b] - fractions[a]) * progress;
};

/** Statut d'un véhicule : incident, puis retard, puis avance, sinon à l'heure. */
export const vehicleStatus = (vehicle: { delay?: number; incident?: string }, thresholds = DEFAULT_DELAY_THRESHOLDS): VehicleStatus => {
  if (vehicle.incident) return "incident";
  if (typeof vehicle.delay === "number" && Number.isFinite(vehicle.delay)) {
    if (vehicle.delay >= thresholds.late) return "late";
    if (vehicle.delay <= thresholds.early) return "early";
  }
  return "ontime";
};

const MINUS = "−";

/** Écart court affiché sur la pastille : « +4 », « −1 », chaîne vide à l'heure ou sans donnée. */
export const delayBadge = (delay?: number) => {
  if (typeof delay !== "number" || !Number.isFinite(delay)) return "";
  const minutes = Math.round(delay);
  if (minutes === 0) return "";
  return minutes > 0 ? `+${minutes}` : `${MINUS}${Math.abs(minutes)}`;
};

/** Écart lu : « retard 4 min », « avance 1 min », « à l'heure », « écart inconnu ». */
export const delayText = (delay?: number) => {
  if (typeof delay !== "number" || !Number.isFinite(delay)) return "écart inconnu";
  const minutes = Math.round(delay);
  if (minutes === 0) return "à l'heure";
  return `${minutes > 0 ? "retard" : "avance"} ${Math.abs(minutes)} min`;
};

/** Position lue : « à l'arrêt Garibaldi », « entre Garibaldi et Mairie de Saint-Ouen ». */
export const positionText = (position: VehiclePosition, names: Map<string, string>) =>
  "at" in position
    ? `à l'arrêt ${names.get(position.at) ?? position.at}`
    : `entre ${names.get(position.from) ?? position.from} et ${names.get(position.to) ?? position.to}`;

/**
 * Niveau d'empilement (0 à `levels` − 1) des véhicules d'une file, triés par
 * position : un véhicule plus proche que `minGap` d'un autre au même niveau
 * monte d'un niveau. Au-delà du dernier niveau : `overflow` (regroupé « +n »).
 */
export const stackLevels = (fractions: number[], minGap: number, levels = 3) => {
  const order = fractions.map((f, i) => ({ f, i })).sort((a, b) => a.f - b.f);
  const lastAt: number[] = Array.from({ length: levels }, () => -Infinity);
  const result = fractions.map(() => ({ level: 0, overflow: false }));
  for (const { f, i } of order) {
    const level = lastAt.findIndex((last) => f - last >= minGap);
    if (level === -1) {
      result[i] = { level: levels - 1, overflow: true };
    } else {
      result[i] = { level, overflow: false };
      lastAt[level] = f;
    }
  }
  return result;
};

/** Résumé : « 5 véhicules vers Châtillon, 4 vers Saint-Denis, 1 incident, 2 en retard, 1 arrêt fermé ». */
export const describeLine = (
  vehicles: LineDiagramVehicleInput[],
  directions: { outbound: string; inbound: string },
  closedStops: number,
  thresholds = DEFAULT_DELAY_THRESHOLDS,
) => {
  const count = (n: number, one: string, many = `${one}s`) => `${n} ${n > 1 ? many : one}`;
  // « Vers Châtillon » → « vers Châtillon » : seule l'initiale du libellé passe en minuscule
  const inSentence = (label: string) => label.charAt(0).toLowerCase() + label.slice(1);
  const outbound = vehicles.filter((v) => v.direction === "outbound").length;
  const inbound = vehicles.length - outbound;
  const statuses = vehicles.map((v) => vehicleStatus(v, thresholds));
  const incidents = statuses.filter((s) => s === "incident").length;
  const late = statuses.filter((s) => s === "late").length;
  return [
    `${count(outbound, "véhicule")} ${inSentence(directions.outbound)}`,
    `${inbound} ${inSentence(directions.inbound)}`,
    count(incidents, "incident"),
    `${late} en retard`,
    ...(closedStops ? [count(closedStops, "arrêt fermé", "arrêts fermés")] : []),
  ].join(", ");
};
