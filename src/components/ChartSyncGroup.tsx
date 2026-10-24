import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ChartSyncContext } from "./chart-sync";

// Curseur synchronisé entre graphiques (lot 0.9.7) : les graphiques placés
// dans un même ChartSyncGroup partagent l'abscisse survolée ou parcourue au
// clavier. Le graphique actif affiche son tooltip ; les autres, le repère.

export interface ChartSyncGroupProps {
  children: ReactNode;
}

/**
 * Groupe de graphiques à curseur synchronisé : survoler ou parcourir au
 * clavier une abscisse d'un `LineChart` ou d'un `BarChart` la repère dans
 * tous les graphiques du groupe qui ont la même abscisse (même date, même
 * catégorie). Aucun rendu propre : envelopper la grille de graphiques.
 */
export const ChartSyncGroup = ({ children }: ChartSyncGroupProps) => {
  const [state, setState] = useState<{ key: string | null; owner: string | null }>({ key: null, owner: null });
  // Effacer ne vaut que pour le graphique qui a posé la clé (un autre a pu la reprendre)
  const publish = useCallback(
    (owner: string, key: string | null) =>
      setState((prev) => (key === null ? (prev.owner === owner ? { key: null, owner: null } : prev) : prev.key === key && prev.owner === owner ? prev : { key, owner })),
    [],
  );
  const value = useMemo(() => ({ ...state, publish }), [state, publish]);
  return <ChartSyncContext.Provider value={value}>{children}</ChartSyncContext.Provider>;
};
