// Fonctions pures de CounterInput (internes, non exportées par index.ts).

export interface CounterBounds {
  min?: number;
  max?: number;
  step: number;
}

/** Nombre de décimales du pas (0.5 → 1, 0.25 → 2) : corrige les erreurs d'arrondi flottant. */
const stepDecimals = (step: number) => (String(step).split(".")[1] ?? "").length;

/**
 * Arrondit au pas d'abord, puis borne : le résultat est toujours dans
 * [min, max], même si la borne n'est pas un multiple du pas
 * (max 58, pas 5 : 60 → 58).
 */
export const normalizeCounterValue = (next: number, { min, max, step }: CounterBounds): number => {
  const rounded = Number((Math.round(next / step) * step).toFixed(stepDecimals(step)));
  return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, rounded));
};

/** « − » actif tant que la valeur n'est pas déjà sur `min` (il va alors jusqu'à la borne). */
export const canDecrementCounter = (value: number, min?: number) => min === undefined || value > min;

/** « + » actif tant que la valeur n'est pas déjà sur `max` (il va alors jusqu'à la borne). */
export const canIncrementCounter = (value: number, max?: number) => max === undefined || value < max;
