import { createContext, useContext, useEffect, useId } from "react";

// Curseur synchronisé entre graphiques (interne) : contexte partagé par
// ChartSyncGroup et les graphiques qui y participent (LineChart, BarChart).

export interface ChartSyncValue {
  /** Clé de l'abscisse active (timestamp d'une date, ou catégorie), et le graphique qui l'a posée. */
  key: string | null;
  owner: string | null;
  publish: (owner: string, key: string | null) => void;
}

export const ChartSyncContext = createContext<ChartSyncValue | null>(null);

/**
 * Participation d'un graphique au groupe. Renvoie la clé posée par un
 * **autre** graphique (à repérer sans tooltip), et publie la clé active
 * locale à chaque changement.
 */
export const useChartSync = (activeKey: string | null) => {
  const context = useContext(ChartSyncContext);
  const id = useId();
  const publish = context?.publish;
  useEffect(() => {
    publish?.(id, activeKey);
  }, [publish, id, activeKey]);
  useEffect(() => () => publish?.(id, null), [publish, id]);
  return context && context.owner !== id ? context.key : null;
};
