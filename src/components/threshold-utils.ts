// Jugement d'une valeur par rapport à des seuils libellés (interne) : partagé
// par Gauge et Meter. La teinte n'est jamais seule : le libellé du seuil
// pertinent est toujours rendu avec.

export interface ValueThreshold {
  value: number;
  label: string;
}

export type ThresholdTone = "neutral" | "success" | "warning" | "danger";

/**
 * Teinte et libellé du seuil pertinent selon la valeur et le sens favorable.
 * `up` : sous le premier seuil → défavorable, à partir du dernier → favorable,
 * entre les deux → intermédiaire. `down` : l'inverse. Sans seuil ou `neutral`,
 * pas de jugement.
 */
export function evaluateThresholds(
  value: number,
  thresholds: ValueThreshold[] | undefined,
  dir: "up" | "down" | "neutral",
): { tone: ThresholdTone; label: string | null } {
  const valid = thresholds?.filter((t) => Number.isFinite(t.value));
  if (dir === "neutral" || !valid || valid.length === 0) return { tone: "neutral", label: null };
  const sorted = [...valid].sort((a, b) => a.value - b.value);
  const low = sorted[0];
  const high = sorted[sorted.length - 1];
  if (dir === "up") {
    if (value >= high.value) return { tone: "success", label: high.label };
    if (value < low.value) return { tone: "danger", label: low.label };
    return { tone: "warning", label: low.label };
  }
  if (value <= low.value) return { tone: "success", label: low.label };
  if (value > high.value) return { tone: "danger", label: high.label };
  return { tone: "warning", label: high.label };
}

/** Phrase de statut : « Objectif atteint — Objectif 85 % ». */
export const thresholdStatus = (tone: ThresholdTone, label: string | null) =>
  label
    ? `${tone === "success" ? "Objectif atteint" : tone === "warning" ? "Niveau intermédiaire" : "Objectif non atteint"} — ${label}`
    : null;
