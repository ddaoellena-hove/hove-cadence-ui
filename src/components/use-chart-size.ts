import { useLayoutEffect, useState, type RefObject } from "react";

// Largeur courante d'un graphique : il suit son conteneur (aucune largeur fixe
// en px). Mesurée par ResizeObserver ; `fallback` sert avant la première mesure
// (rendu serveur, tests sans layout).

export const useChartWidth = (ref: RefObject<HTMLElement | null>, fallback = 600) => {
  const [width, setWidth] = useState(fallback);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (element.clientWidth > 0) setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next > 0) setWidth(next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
};
