import { createContext, useContext } from "react";
import { isDevMode } from "./dev-mode";

// Contexte de TabList : indique à Tab / SecondaryTab qu'ils sont dans un
// conteneur role="tablist" (roving tabindex, pas d'avertissement).

export const TabListContext = createContext(false);


const warned = new Set<string>();

/** Vrai dans un TabList ; sinon avertit une fois par composant, en développement. */
export const useInTabList = (component: "Tab" | "SecondaryTab") => {
  const inside = useContext(TabListContext);
  if (!inside && isDevMode() && !warned.has(component)) {
    warned.add(component);
    console.warn(
      `[cadence-ui] <${component}> rendu hors d'un <TabList> : role="tab" exige un conteneur role="tablist". ` +
        `Enveloppez la rangée : <TabList aria-label="…">…</TabList>.`,
    );
  }
  return inside;
};

/** Réinitialise les avertissements (tests). */
export const resetTabWarningsForTests = () => warned.clear();
