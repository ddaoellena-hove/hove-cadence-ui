import { useLayoutEffect, type RefObject } from "react";

// Garde un popover ancré (position: absolute, left: 0) dans la zone visible :
// s'il dépasse à droite, il est décalé vers la gauche (aligné sur le bord du
// déclencheur si possible), sans jamais dépasser à gauche. La zone visible est
// la fenêtre, réduite par le premier ancêtre qui coupe ou fait défiler son
// contenu (ex. le conteneur d'AppLayout). Verticalement, il passe au-dessus du
// déclencheur s'il manque de place en dessous et qu'il y tient : `data-placement`
// porte ce choix, appliqué par le CSS de chaque panneau.

const MARGIN = 8;
const GAP = 6;

/** Côté d'ouverture. "auto" : dessous, retourné au-dessus si la place manque. */
export type PopoverPlacement = "auto" | "top" | "bottom";

/** Bords gauche / droit de la zone où le popover doit tenir. */
const getBounds = (el: HTMLElement) => {
  let left = 0;
  let right = document.documentElement.clientWidth;
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (getComputedStyle(node).overflowX !== "visible") {
      // Zone de contenu visible : sans les bordures ni la barre de défilement
      // verticale (permanente sur certains systèmes, ex. macOS « Toujours »)
      const rect = node.getBoundingClientRect();
      const innerLeft = rect.left + node.clientLeft;
      left = Math.max(left, innerLeft);
      right = Math.min(right, innerLeft + node.clientWidth);
      break;
    }
  }
  return { left: left + MARGIN, right: right - MARGIN };
};

/** Haut / bas de la zone visible : la fenêtre, réduite par chaque ancêtre qui coupe. */
export const getVerticalBounds = (el: HTMLElement) => {
  let top = 0;
  let bottom = document.documentElement.clientHeight;
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    if (getComputedStyle(node).overflowY !== "visible") {
      const rect = node.getBoundingClientRect();
      const innerTop = rect.top + node.clientTop;
      top = Math.max(top, innerTop);
      bottom = Math.min(bottom, innerTop + node.clientHeight);
    }
  }
  return { top: top + MARGIN, bottom: bottom - MARGIN };
};

/** Retourne le panneau, déjà mesuré à sa place par défaut, s'il tient mieux au-dessus. */
const shouldOpenUp = (el: HTMLElement, rect: DOMRect) => {
  const bounds = getVerticalBounds(el);
  if (rect.bottom <= bounds.bottom) return false;
  const anchorTop = (el.offsetParent ?? el.parentElement)?.getBoundingClientRect().top ?? rect.top;
  return anchorTop - GAP - rect.height >= bounds.top;
};

/**
 * Applique le décalage horizontal via la variable --_popover-shift (propriété
 * CSS `translate`) et le côté d'ouverture via `data-placement`.
 */
export const usePopoverFit = (ref: RefObject<HTMLElement | null>, open: boolean, placement: PopoverPlacement = "auto") => {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!open || !el) return;

    const fit = () => {
      el.style.setProperty("--_popover-shift", "0px");
      delete el.dataset.placement;
      const rect = el.getBoundingClientRect();
      if (placement === "top" || (placement === "auto" && shouldOpenUp(el, rect))) el.dataset.placement = "top";
      const bounds = getBounds(el);
      let shift = 0;
      if (rect.right > bounds.right) shift = bounds.right - rect.right;
      if (rect.left + shift < bounds.left) shift = bounds.left - rect.left;
      el.style.setProperty("--_popover-shift", `${Math.round(shift)}px`);
    };

    fit();
    window.addEventListener("resize", fit);
    // Le popover peut s'élargir après l'ouverture (police d'interface chargée
    // plus tard, contenu rendu au tick suivant) : le décalage serait alors
    // périmé. On le recalcule à chaque changement de taille et à la fin du
    // chargement des polices. Le décalage passe par `translate`, qui ne change
    // pas la taille observée : pas de boucle.
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    observer?.observe(el, { box: "border-box" });
    let active = true;
    document.fonts?.ready.then(() => { if (active) fit(); });
    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [ref, open, placement]);
};
