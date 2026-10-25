// Types publics des graphiques sans dépendance à d3 : les déclarations
// publiées (BarChart, ComboChart, ScatterChart) les importent d'ici, pour que
// les applications n'aient pas besoin de @types/d3-* (dépendances de dev).

/** Barres empilées ou côte à côte. */
export type BarLayout = "stacked" | "grouped";

/** Point d'un nuage : `label` nomme le point (tooltip, annonce). */
export interface ScatterPointInput {
  id: string;
  x: number;
  y: number;
  label?: string;
}
