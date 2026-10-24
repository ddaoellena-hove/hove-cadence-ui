import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";

// Calculs du ScatterChart (purs, testés) : échelles, ordre de parcours au
// clavier, point le plus proche du pointeur.

export interface ScatterPointInput {
  id: string;
  x: number;
  y: number;
  label?: string;
}

/** Échelle d'un axe : `domain` imposé, sinon min(0, valeurs, seuils) → max, arrondi. */
export const buildAxisScale = (values: number[], range: [number, number], domain?: [number, number], includeZero = true) => {
  if (domain) return scaleLinear().domain(domain).range(range);
  const finite = values.filter((v) => Number.isFinite(v));
  const [low, high] = (extent(finite) as [number | undefined, number | undefined]) ?? [];
  const lo = includeZero ? Math.min(0, low ?? 0) : (low ?? 0);
  const hi = high ?? 1;
  return scaleLinear()
    .domain([lo, hi > lo ? hi : lo + 1])
    .range(range)
    .nice(5);
};

/** Ordre de parcours : de gauche à droite, puis de bas en haut à abscisse égale. */
export const traversalOrder = <T extends { x: number; y: number }>(points: T[]) =>
  points
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => Number.isFinite(p.x) && Number.isFinite(p.y))
    .sort((a, b) => a.p.x - b.p.x || a.p.y - b.p.y || a.i - b.i)
    .map(({ p }) => p);

/** Index du point le plus proche (en px) dans un rayon ; -1 si aucun. */
export const nearestPoint = (positions: { px: number; py: number }[], x: number, y: number, radius = 24) => {
  let best = -1;
  let bestDistance = radius * radius;
  positions.forEach(({ px, py }, i) => {
    const d = (px - x) ** 2 + (py - y) ** 2;
    if (d <= bestDistance) {
      best = i;
      bestDistance = d;
    }
  });
  return best;
};
