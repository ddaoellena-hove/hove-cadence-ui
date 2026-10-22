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
    (el) => el.tabIndex >= 0 && !el.closest("[inert]") && !el.matches(":disabled") && getComputedStyle(el).visibility !== "hidden" && el.getClientRects().length > 0,
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

/** Une seule surcouche possède le clavier et le fond à un instant donné. */
const surfaces: HTMLElement[] = [];
let restoreBackground: (() => void) | undefined;
let unlockPage: (() => void) | undefined;
const isTopSurface = (surface: HTMLElement | null) => surfaces.at(-1) === surface;

const refreshBackground = () => {
  restoreBackground?.();
  restoreBackground = undefined;
  const surface = surfaces.at(-1);
  if (!surface) return;
  const host = Array.from(document.body.children).find((el) => el.contains(surface));
  const previous = Array.from(document.body.children)
    .filter((el) => el !== host)
    .map((el) => ({ el, inert: el.getAttribute("inert"), hidden: el.getAttribute("aria-hidden") }));
  previous.forEach(({ el }) => {
    el.setAttribute("inert", "");
    el.setAttribute("aria-hidden", "true");
  });
  restoreBackground = () => previous.forEach(({ el, inert, hidden }) => {
    if (inert === null) el.removeAttribute("inert");
    else el.setAttribute("inert", inert);
    if (hidden === null) el.removeAttribute("aria-hidden");
    else el.setAttribute("aria-hidden", hidden);
  });
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
    if (surfaces.length === 0) unlockPage = lockScroll();
    surfaces.push(surface);
    refreshBackground();

    const focusables = getFocusable(surface);
    (focusables[0] ?? surface).focus();

    return () => {
      const wasTop = isTopSurface(surface);
      surfaces.splice(surfaces.indexOf(surface), 1);
      refreshBackground();
      if (surfaces.length === 0) { unlockPage?.(); unlockPage = undefined; }
      // Une fermeture en arrière-plan ne doit pas voler le focus au dialogue actif.
      if (wasTop && trigger?.isConnected && !trigger.closest("[inert]")) trigger.focus();
      else if (wasTop) {
        const next = surfaces.at(-1);
        if (next) (getFocusable(next)[0] ?? next).focus();
      }
    };
  }, [isOpen, surfaceRef]);

  // Échap + piège à focus.
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !isTopSurface(surfaceRef.current)) return;
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
    // Échap est traité après le contrôle actif : un champ peut annuler son
    // brouillon, ou un menu se fermer, sans fermer aussi le dialogue parent.
    const handleEscape = (e: KeyboardEvent) => {
      if (isTopSurface(surfaceRef.current) && closeOnEscape && e.key === "Escape" && !e.defaultPrevented) {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", handleKey, true);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleKey, true);
      document.removeEventListener("keydown", handleEscape);
    };
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
