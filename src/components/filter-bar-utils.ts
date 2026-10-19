// Fonctions pures de FilterBar (internes, non exportées par index.ts).

const numberFormat = new Intl.NumberFormat("fr-FR");

/** « Aucun résultat » / « 1 résultat » / « 12 430 résultats ». */
export const formatResultCount = (count: number): string => {
  if (count <= 0) return "Aucun résultat";
  return `${numberFormat.format(count)} ${count > 1 ? "résultats" : "résultat"}`;
};
