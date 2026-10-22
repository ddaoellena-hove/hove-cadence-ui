/**
 * Primitives de surcouche partagées (internes — non exportées par index.ts).
 *
 * Mutualisent le comportement commun à `Modal` et `Drawer` :
 *  - fermeture sur Échap ;
 *  - piège à focus (Tab / Maj+Tab bouclent dans la surface) ;
 *  - retour du focus au déclencheur à la fermeture ;
 *  - verrouillage du défilement du vrai conteneur scrollant (celui d'AppLayout,
 *    pas forcément `body`) ;
 *  - `inert` + `aria-hidden` sur le reste de la page.
 *
 * Le rendu (voile, panneau, styles) reste propre à chaque composant.
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

// Éléments naturellement focusables d'une surcouche.
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Éléments focusables visibles de la surface, dans l'ordre du DOM. */
const getFocusable = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getClientRects().length > 0,
  );

/**
 * Verrouille le défilement. Le conteneur qui défile dans une app Cadence est
 * `.app-layout__scroll` (overflow: auto), pas `body` ; on verrouille les deux
 * pour couvrir aussi l'usage hors AppLayout (Storybook, page nue). La valeur
 * d'origine est restaurée à la fermeture (pas de reset en dur).
 */
const lockScroll = (): (() => void) => {
  const targets: HTMLElement[] = [document.body];
  document.querySelectorAll<HTMLElement>(".app-layout__scroll").forEach((el) => targets.push(el));
  const previous = targets.map((el) => el.style.overflow);
  targets.forEach((el) => {
    el.style.overflow = "hidden";
  });
  return () => {
    targets.forEach((el, i) => {
      el.style.overflow = previous[i];
    });
  };
};

/**
 * Rend inerte tout le reste de la page : chaque enfant direct de `body` sauf
 * celui qui contient la surface (le nœud du portail). `inert` retire focus,
 * clics et lecture AT ; `aria-hidden` sert de repli. On ne touche qu'aux nœuds
 * qui ne l'étaient pas déjà (surcouches empilées).
 */
const setBackgroundInert = (surface: HTMLElement): (() => void) => {
  const host = Array.from(document.body.children).find((el) => el.contains(surface));
  const changed = (Array.from(document.body.children) as HTMLElement[]).filter(
    (el) => el !== host && !el.hasAttribute("inert"),
  );
  changed.forEach((el) => {
    el.setAttribute("inert", "");
    el.setAttribute("aria-hidden", "true");
  });
  return () => {
    changed.forEach((el) => {
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
    });
  };
};

export interface UseOverlayOptions {
  /** Surcouche ouverte. */
  isOpen: boolean;
  /** Appelé sur Échap. */
  onClose: () => void;
  /** Élément de la surcouche à piéger (le panneau / le dialogue). */
  surfaceRef: RefObject<HTMLElement | null>;
  /** Fermer sur Échap. Défaut true. */
  closeOnEscape?: boolean;
}

/**
 * Pilote le comportement modal commun. À l'ouverture : mémorise le déclencheur,
 * verrouille le défilement, rend le fond inerte et place le focus dans la
 * surface. À la fermeture : tout est restauré et le focus revient au déclencheur.
 */
export const useOverlay = ({ isOpen, onClose, surfaceRef, closeOnEscape = true }: UseOverlayOptions): void => {
  // onClose gardé à jour sans relancer l'effet d'ouverture (sinon le focus
  // initial serait recapturé à chaque rendu du parent).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Ouverture / fermeture : focus, défilement, inert.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const surface = surfaceRef.current;
    if (!surface) return;

    const trigger = document.activeElement as HTMLElement | null;
    const unlockScroll = lockScroll();
    const restoreInert = setBackgroundInert(surface);

    const focusables = getFocusable(surface);
    (focusables[0] ?? surface).focus();

    return () => {
      restoreInert();
      unlockScroll();
      // Rend le focus au déclencheur s'il est toujours dans le document.
      if (trigger && document.contains(trigger)) trigger.focus();
    };
  }, [isOpen, surfaceRef]);

  // Échap + piège à focus.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const surface = surfaceRef.current;
      if (!surface) return;
      const focusables = getFocusable(surface);
      if (focusables.length === 0) {
        e.preventDefault();
        surface.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === surface)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => document.removeEventListener("keydown", handleKey, true);
  }, [isOpen, closeOnEscape, surfaceRef]);
};

/**
 * Portail vers un nœud dédié ajouté en fin de `body` : la surcouche échappe à
 * l'overflow et au contexte d'empilement du contenu de l'app.
 */
export const OverlayPortal = ({ children }: { children: ReactNode }): ReactNode => {
  const [node] = useState<HTMLDivElement | null>(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("div");
    el.className = "cadence-overlay-root";
    return el;
  });

  // useLayoutEffect (et non useEffect) : le portail étant un enfant de Modal /
  // Drawer, son effet de montage s'exécute AVANT le useOverlay du parent, qui
  // a besoin que le nœud soit déjà attaché au DOM pour piéger et poser le focus.
  useLayoutEffect(() => {
    if (!node) return;
    document.body.appendChild(node);
    return () => {
      document.body.removeChild(node);
    };
  }, [node]);

  return node ? createPortal(children, node) : null;
};
