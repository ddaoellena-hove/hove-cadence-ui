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
 * rendent le focus au déclencheur, Tab l'amène à l'élément qui le suit. Le clic extérieur ferme aussi ;
 * défilement et redimensionnement replacent le panneau. À ne pas confondre avec Tooltip (lecture seule, sans focus).
 */
import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { CloseButton } from "./CloseButton";
import { useAnchoredPanel } from "./overlay-primitives";
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

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/** Atteignable au clavier : rendu (ni display: none ni hidden) et hors zone inerte. */
const isTabbable = (el: HTMLElement) => el.getClientRects().length > 0 && !el.closest("[inert]");

/** Éléments tabulables d'un conteneur, dans l'ordre du document. */
const tabbablesIn = (root: ParentNode | null | undefined): HTMLElement[] =>
  Array.from(root?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(isTabbable);

/** Élément tabulable suivant le déclencheur dans la page (hors panneau). */
const nextTabbable = (from: HTMLElement, panel: HTMLElement | null): HTMLElement | undefined => {
  const all = tabbablesIn(document).filter((el) => !panel?.contains(el));
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const panelId = useId();

  // Focus dans le panneau au moment où il disparaît : à rendre au déclencheur,
  // y compris quand le parent ferme un Popover contrôlé.
  const focusInside = useRef(false);

  // En mode contrôlé, le parent peut refuser la fermeture : on ne touche pas
  // à la position, le panneau reste visible tant que `open` est vrai.
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
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

  // Position (null tant que non mesurée : panneau masqué), clic extérieur,
  // suivi au défilement / redimensionnement (replacé, pas fermé : clavier
  // virtuel sur mobile) — comportement partagé des panneaux ancrés.
  const pos = useAnchoredPanel({
    open,
    triggerRef,
    panelRef,
    align,
    onOutsideClick: () => close(false),
    onTriggerHidden: () => close(Boolean(panelRef.current?.contains(document.activeElement))),
  });

  // Focus initial : premier élément tabulable du contenu, sinon le panneau.
  useEffect(() => {
    if (!open || !pos) return;
    const panel = panelRef.current;
    if (!panel || panel.contains(document.activeElement)) return;
    (tabbablesIn(panel.querySelector(".popover__body"))[0] ?? panel).focus();
  }, [open, pos]);

  // Fermé alors que le focus y était (fermeture par le parent, clic sur une
  // zone vide) : le focus, tombé sur <body>, revient au déclencheur.
  useEffect(() => {
    if (open || !focusInside.current) return;
    focusInside.current = false;
    const active = document.activeElement;
    if (!active || active === document.body) triggerRef.current?.focus();
  }, [open]);

  return (
    <>
      {/* Enveloppe neutre (display: contents) : coupe l'infobulle intégrée d'un
          déclencheur icône seule, le panneau prenant le relais au clic. */}
      <span className="popover-trigger">{renderTrigger({ ref: triggerRef, open, toggle: () => setOpen(!open) })}</span>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            className={["popover", "cadence-scrollbar", className].filter(Boolean).join(" ")}
            role="dialog"
            aria-labelledby={titleId}
            tabIndex={-1}
            data-cadence-floating=""
            onFocus={() => {
              focusInside.current = true;
            }}
            onBlur={(e) => {
              if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) focusInside.current = false;
            }}
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
                const controls = tabbablesIn(panel);
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
              <CloseButton onClick={() => close()} />
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
