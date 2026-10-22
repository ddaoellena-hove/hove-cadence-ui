/**
 * ActionMenu component.
 *
 * Menu d'actions par ligne, déclenché par un bouton icône (« … »). À utiliser
 * au-delà de 4 actions par ligne, ou pour regrouper des actions dans le slot
 * `actions` d'une TableCard / la colonne d'actions d'un DataTable.
 *
 * Le menu est rendu dans un portail (position fixe) : il échappe à l'overflow
 * du tableau, y compris dans une colonne collée à droite. Pattern ARIA
 * `menu` / `menuitem` (ce sont des actions, pas une sélection de valeur).
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GhostButton } from "./GhostButton";
import { Icons, type IconName } from "./Icons";
import "./action-menu.css";

/** Une action du menu. */
export interface ActionMenuItem {
  /** Identifiant stable. */
  id: string;
  /** Libellé affiché. */
  label: string;
  /** Icône avant le libellé. */
  icon?: IconName;
  /** "danger" : libellé et picto en rouge. Défaut "default". */
  tone?: "default" | "danger";
  /** Item non sélectionnable. */
  disabled?: boolean;
  /** Affiche un séparateur au-dessus de cet item. */
  divider?: boolean;
  /** Appelé à la sélection (le menu se ferme ensuite). */
  onSelect: () => void;
}

export interface ActionMenuProps {
  /** Liste des actions. */
  items: ActionMenuItem[];
  /** Nom accessible du déclencheur icône. Défaut « Plus d'actions ». */
  label?: string;
  /** Libellé visible (variante bouton) au lieu de l'icône seule. */
  triggerLabel?: string;
  /** Icône du déclencheur. Défaut "dots-horizontal". */
  triggerIcon?: IconName;
  /** Bord d'alignement du menu sous le déclencheur. Défaut "end" (bord droit). */
  align?: "start" | "end";
  /** Classe CSS additionnelle sur le conteneur du déclencheur. */
  className?: string;
}

// Marge minimale avec les bords de la fenêtre.
const VIEWPORT_MARGIN = 8;
// Largeur min du menu, alignée sur dropdown.
const MENU_MIN_WIDTH = 180;

interface MenuPosition {
  left: number;
  top: number;
  /** Largeur minimale (au moins celle du déclencheur). */
  minWidth: number;
  /** Ouverture vers le haut (pas de place en dessous). */
  up: boolean;
}

export const ActionMenu = ({
  items,
  label = "Plus d'actions",
  triggerLabel,
  triggerIcon = "dots-horizontal",
  align = "end",
  className,
}: ActionMenuProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPosition | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typeahead = useRef<{ text: string; timer: number }>({ text: "", timer: 0 });

  const enabledIndexes = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);

  // Attributs ARIA que GhostButton ne transmet pas : posés sur l'élément.
  useEffect(() => {
    triggerRef.current?.setAttribute("aria-haspopup", "menu");
  }, []);
  useEffect(() => {
    triggerRef.current?.setAttribute("aria-expanded", String(open));
  }, [open]);

  // ── Positionnement (portail, position: fixed) ───────────────────────────
  // Recalculé dès l'ouverture, une fois le menu monté (pour avoir sa taille).
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    const t = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    // Horizontal : aligné sur le bord droit (end) ou gauche (start), puis borné.
    let left = align === "end" ? t.right - menuRect.width : t.left;
    left = Math.min(Math.max(VIEWPORT_MARGIN, left), vw - menuRect.width - VIEWPORT_MARGIN);

    // Vertical : sous le déclencheur, sinon au-dessus si ça déborde.
    const below = t.bottom + 6;
    const up = below + menuRect.height > vh - VIEWPORT_MARGIN && t.top - 6 - menuRect.height > VIEWPORT_MARGIN;
    const top = up ? t.top - 6 - menuRect.height : below;

    setPos({ left, top, up, minWidth: Math.max(MENU_MIN_WIDTH, t.width) });
  }, [open, align]);

  // Un défilement ou un redimensionnement ferme le menu (évite qu'il « flotte »).
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  // Fermeture au clic extérieur.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Focus sur l'item actif, une fois le menu positionné (sinon il est encore
  // en visibility:hidden et ne peut pas recevoir le focus).
  useEffect(() => {
    if (open && pos) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex, pos]);

  const openMenu = () => {
    setActiveIndex(enabledIndexes[0] ?? 0);
    setOpen(true);
  };

  const closeMenu = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const select = (item: ActionMenuItem) => {
    if (item.disabled) return;
    item.onSelect();
    closeMenu();
  };

  // Déplace le focus vers l'item activable suivant / précédent (avec bouclage).
  const moveActive = (direction: 1 | -1) => {
    if (enabledIndexes.length === 0) return;
    const current = enabledIndexes.indexOf(activeIndex);
    const nextPos = (current + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPos]);
  };

  // Saisie de la première lettre : saute au prochain item dont le libellé correspond.
  const onTypeahead = (char: string) => {
    window.clearTimeout(typeahead.current.timer);
    typeahead.current.text += char.toLowerCase();
    typeahead.current.timer = window.setTimeout(() => {
      typeahead.current.text = "";
    }, 500);
    const query = typeahead.current.text;
    const match = enabledIndexes.find((i) => items[i].label.toLowerCase().startsWith(query));
    if (match !== undefined) setActiveIndex(match);
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(enabledIndexes[0] ?? 0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? 0);
        break;
      case "Escape":
        e.preventDefault();
        closeMenu();
        break;
      case "Tab":
        // Tab ferme le menu sans forcer le focus (il suit le flux normal).
        closeMenu(false);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        select(items[activeIndex]);
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          onTypeahead(e.key);
        }
    }
  };

  // Trigger fermé : les flèches ouvrent le menu (Entrée / Espace via le clic natif).
  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      openMenu();
    }
  };

  const toggle = () => (open ? closeMenu(false) : openMenu());

  return (
    <span
      className={["action-menu", className].filter(Boolean).join(" ")}
      ref={containerRef}
      onKeyDown={onTriggerKeyDown}
    >
      {triggerLabel ? (
        <GhostButton ref={triggerRef} size="sm" label={triggerLabel} iconStart={triggerIcon} onClick={toggle} />
      ) : (
        <GhostButton ref={triggerRef} size="sm" icon={triggerIcon} aria-label={label} onClick={toggle} />
      )}

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={`action-menu__menu${pos?.up ? " action-menu__menu--up" : ""}`}
            role="menu"
            aria-label={label}
            style={{
              position: "fixed",
              left: pos?.left ?? -9999,
              top: pos?.top ?? -9999,
              minWidth: pos?.minWidth ?? MENU_MIN_WIDTH,
              visibility: pos ? "visible" : "hidden",
            }}
            onKeyDown={onMenuKeyDown}
          >
            {items.map((item, i) => (
              <div key={item.id} role="presentation" className="action-menu__section">
                {item.divider && <div className="action-menu__divider" aria-hidden="true" />}
                <button
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  className={[
                    "action-menu__item",
                    item.tone === "danger" ? "action-menu__item--danger" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  tabIndex={i === activeIndex ? 0 : -1}
                  disabled={item.disabled}
                  onClick={() => select(item)}
                >
                  {item.icon && (
                    <span className="action-menu__item-icon">
                      <Icons icon={item.icon} size={16} />
                    </span>
                  )}
                  <span className="action-menu__item-label">{item.label}</span>
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </span>
  );
};
