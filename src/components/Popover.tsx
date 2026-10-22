/**
 * Popover component.
 *
 * Panneau non modal ancré à un déclencheur, pour du contenu libre : aide
 * contextuelle riche, mini-formulaire, détail d'un élément. Rendu en portail
 * (position fixe, couche --cadence-z-popover, ou juste au-dessus d'une Modal /
 * d'un Drawer dont il est issu), gardé dans la fenêtre et retourné au-dessus
 * s'il manque de place en dessous.
 *
 * `role="dialog"` nommé par son titre. Focus déplacé dans le panneau à
 * l'ouverture ; Échap, le bouton Fermer ou une sortie au clavier (Tab après le
 * dernier élément, Maj+Tab avant le premier) ferment : Échap, Fermer et Maj+Tab
 * rendent le focus au déclencheur, Tab l'amène à l'élément qui le suit. Clic extérieur, défilement de la page ou redimensionnement
 * ferment aussi. À ne pas confondre avec Tooltip (lecture seule, sans focus).
 */
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { GhostButton } from "./GhostButton";
import { layerAboveOverlay } from "./overlay-primitives";
import "./popover.css";
import "./scrollbar.css";

export interface PopoverTriggerProps {
  /** À poser sur le bouton déclencheur. */
  ref: Ref<HTMLButtonElement>;
  open: boolean;
  /** Ouvre ou ferme le panneau. */
  toggle: () => void;
}

export interface PopoverProps {
  /** Titre du panneau, qui le nomme (`aria-labelledby`). */
  title: string;
  /** Masque le titre visuellement ; il reste le nom accessible. */
  hideTitle?: boolean;
  /** Contenu, ou fonction recevant `close` (bouton « Appliquer »…). */
  children: ReactNode | ((api: { close: () => void }) => ReactNode);
  /** Rend le déclencheur : poser `ref` sur le bouton, câbler `toggle`. */
  renderTrigger: (props: PopoverTriggerProps) => ReactNode;
  /** Ouverture contrôlée. */
  open?: boolean;
  /** Ouverture initiale (non contrôlé). */
  defaultOpen?: boolean;
  /** Changement d'ouverture demandé (déclencheur, Échap, clic extérieur…). */
  onOpenChange?: (open: boolean) => void;
  /** Bord du déclencheur sur lequel le panneau s'aligne. */
  align?: "start" | "end";
  /** Largeur du panneau en px. */
  width?: number;
  /** Classe CSS additionnelle (panneau). */
  className?: string;
}

const MARGIN = 8;
const GAP = 6;
const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** Élément tabulable suivant le déclencheur dans la page (hors panneau). */
const nextTabbable = (from: HTMLElement, panel: HTMLElement | null): HTMLElement | undefined => {
  const all = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !panel?.contains(el) && !el.closest("[inert]") && el.getClientRects().length > 0,
  );
  return all.find((el) => from.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && !from.contains(el));
};

// Contenu en fonction de `close` : rendu dans un composant à part, `close`
// n'étant appelé que depuis les gestionnaires d'événements du contenu.
const PopoverContent = ({
  render,
  close,
}: {
  render: (api: { close: () => void }) => ReactNode;
  close: () => void;
}) => render({ close });

export const Popover = ({
  title,
  hideTitle = false,
  children,
  renderTrigger,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  align = "start",
  width = 320,
  className,
}: PopoverProps) => {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const [pos, setPos] = useState<{ left: number; top: number; zIndex?: string } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const panelId = useId();

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
    if (!next) setPos(null);
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // ARIA du déclencheur, posé sur le bouton rendu par l'app.
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-expanded", String(open));
    if (open) trigger.setAttribute("aria-controls", panelId);
    else trigger.removeAttribute("aria-controls");
  }, [open, panelId]);

  // Positionnement une fois le panneau monté (masqué tant qu'il n'est pas placé).
  useLayoutEffect(() => {
    if (!open) return;
    const t = triggerRef.current?.getBoundingClientRect();
    const p = panelRef.current?.getBoundingClientRect();
    if (!t || !p) return;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const wanted = align === "end" ? t.right - p.width : t.left;
    const left = Math.max(MARGIN, Math.min(wanted, vw - p.width - MARGIN));
    const below = t.bottom + GAP;
    const top = below + p.height <= vh - MARGIN ? below : Math.max(MARGIN, t.top - p.height - GAP);
    setPos({ left, top, zIndex: layerAboveOverlay(triggerRef.current) });
  }, [open, align]);

  // Focus initial : premier élément focusable, sinon le panneau lui-même.
  useEffect(() => {
    if (!open || !pos) return;
    const panel = panelRef.current;
    if (!panel || panel.contains(document.activeElement)) return;
    const body = panel.querySelector(".popover__body");
    (body?.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus();
  }, [open, pos]);

  // Clic extérieur, défilement de la page, redimensionnement.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close(false);
    };
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) return;
      close(Boolean(panelRef.current?.contains(document.activeElement)));
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
    // close ne dépend que de setters et de refs stables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {renderTrigger({ ref: triggerRef, open, toggle: () => setOpen(!open) })}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            className={["popover", "cadence-scrollbar", className].filter(Boolean).join(" ")}
            role="dialog"
            aria-labelledby={titleId}
            tabIndex={-1}
            style={{ width, position: "fixed", left: pos?.left ?? -9999, top: pos?.top ?? -9999, zIndex: pos?.zIndex, visibility: pos ? "visible" : "hidden" }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                // Consommé ici : une Modal parente ne se ferme pas.
                e.preventDefault();
                e.stopPropagation();
                close();
                return;
              }
              if (e.key === "Tab") {
                const panel = panelRef.current;
                const controls = Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
                const active = document.activeElement;
                const leaving =
                  controls.length === 0 ||
                  (e.shiftKey ? active === controls[0] || active === panel : active === controls[controls.length - 1]);
                if (!leaving) return;
                // Sortie au clavier : le panneau (en portail, en fin de page) est
                // fermé et la tabulation reprend autour du déclencheur.
                e.preventDefault();
                const trigger = triggerRef.current;
                const next = !e.shiftKey && trigger ? nextTabbable(trigger, panel) : undefined;
                close(false);
                (next ?? trigger)?.focus();
              }
            }}
          >
            <div className={`popover__header${hideTitle ? " popover__header--hidden-title" : ""}`}>
              <span id={titleId} className={hideTitle ? "popover__title popover__title--hidden" : "popover__title"}>
                {title}
              </span>
              <GhostButton size="sm" icon="x-close" aria-label="Fermer" onClick={() => close()} />
            </div>
            <div className="popover__body">
              {typeof children === "function" ? <PopoverContent render={children} close={close} /> : children}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
