/**
 * Primitive de menu (interne — non exportée).
 *
 * Menu d'actions rendu en portail (position fixe) : il échappe à l'overflow
 * d'un conteneur (ex. colonne collée d'un DataTable). Pattern ARIA
 * `menu`/`menuitem`, clavier complet (flèches, Début/Fin, saisie de la 1re
 * lettre, Échap, Tab), en-têtes de section et séparateurs.
 *
 * Utilisée par ActionMenu et ExportMenu. Le déclencheur est fourni par
 * l'appelant via `renderTrigger` (le composant pose l'ARIA sur la ref).
 */
import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";
import { Icons, type IconName } from "./Icons";
import { useAnchoredPanel } from "./overlay-primitives";
import "./menu.css";
import "./scrollbar.css";

export interface MenuItemSpec {
  id: string;
  label: ReactNode;
  icon?: IconName;
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Séparateur au-dessus de cet item. */
  divider?: boolean;
  /** En-tête de section affiché au-dessus de cet item. */
  sectionLabel?: string;
  onSelect: () => void;
}

export interface MenuProps {
  items: MenuItemSpec[];
  /** Nom accessible du menu. */
  label: string;
  /** Bord d'alignement du menu sous le déclencheur. Défaut "end". */
  align?: "start" | "end";
  /** Rend le déclencheur : poser `ref` sur le bouton, câbler `toggle`. */
  renderTrigger: (props: { ref: Ref<HTMLButtonElement>; open: boolean; toggle: () => void }) => ReactNode;
  /** Classe CSS du conteneur du déclencheur. */
  className?: string;
}

const MENU_MIN_WIDTH = 180;

export const Menu = ({ items, label, align = "end", renderTrigger, className }: MenuProps) => {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typeahead = useRef<{ text: string; timer: number }>({ text: "", timer: 0 });

  const sectionIds = items.map((_, index) => {
    for (let i = index; i >= 0; i--) if (items[i].sectionLabel) return `${menuId}-section-${i}`;
    return undefined;
  });

  const enabledIndexes = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);

  // ARIA que les boutons du DS ne transmettent pas : posé sur l'élément.
  useEffect(() => {
    triggerRef.current?.setAttribute("aria-haspopup", "menu");
  }, []);
  useEffect(() => {
    triggerRef.current?.setAttribute("aria-expanded", String(open));
    if (open) triggerRef.current?.setAttribute("aria-controls", menuId);
    else triggerRef.current?.removeAttribute("aria-controls");
  }, [open, menuId]);

  useEffect(() => () => window.clearTimeout(typeahead.current.timer), []);

  // Position (portail, position: fixed), clic extérieur, suivi au défilement
  // et au redimensionnement : comportement partagé des panneaux ancrés. Le
  // menu se ferme si son déclencheur sort de la fenêtre (focus rendu).
  const pos = useAnchoredPanel({
    open,
    triggerRef,
    panelRef: menuRef,
    align,
    onOutsideClick: () => setOpen(false),
    onTriggerHidden: () => {
      if (menuRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
      setOpen(false);
    },
  });

  // Focus sur l'item actif, une fois positionné (sinon visibility:hidden).
  useEffect(() => {
    if (open && pos) (itemRefs.current[activeIndex] && !items[activeIndex]?.disabled ? itemRefs.current[activeIndex] : menuRef.current)?.focus();
  }, [open, activeIndex, pos, items]);

  const openMenu = (last = false) => {
    typeahead.current.text = "";
    setActiveIndex((last ? enabledIndexes[enabledIndexes.length - 1] : enabledIndexes[0]) ?? 0);
    setOpen(true);
  };
  const closeMenu = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };
  const select = (item: MenuItemSpec) => {
    if (!item || item.disabled) return;
    closeMenu();
    item.onSelect();
  };
  const moveActive = (direction: 1 | -1) => {
    if (enabledIndexes.length === 0) return;
    const current = enabledIndexes.indexOf(activeIndex);
    const nextPos = (current + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPos]);
  };
  const onTypeahead = (char: string) => {
    window.clearTimeout(typeahead.current.timer);
    typeahead.current.text += char.toLowerCase();
    typeahead.current.timer = window.setTimeout(() => {
      typeahead.current.text = "";
    }, 500);
    const query = typeahead.current.text;
    const match = enabledIndexes.find((i) => {
      const l = items[i].label;
      return typeof l === "string" && l.toLowerCase().startsWith(query);
    });
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
        e.stopPropagation();
        closeMenu();
        break;
      case "Tab":
        closeMenu();
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

  const onContainerKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      openMenu(e.key === "ArrowUp");
    }
  };

  const toggle = () => (open ? closeMenu(false) : openMenu());

  return (
    <span className={["menu", className].filter(Boolean).join(" ")} onKeyDown={onContainerKeyDown}>
      {renderTrigger({ ref: triggerRef, open, toggle })}

      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            tabIndex={-1}
            className={`menu__surface cadence-scrollbar${pos?.up ? " menu__surface--up" : ""}`}
            role="menu"
            aria-label={label}
            data-cadence-floating=""
            style={{
              position: "fixed",
              left: pos?.left ?? -9999,
              top: pos?.top ?? -9999,
              minWidth: `min(${Math.max(MENU_MIN_WIDTH, pos?.triggerWidth ?? 0)}px, calc(100vw - 16px))`,
              zIndex: pos?.zIndex,
              visibility: pos ? "visible" : "hidden",
            }}
            onKeyDown={onMenuKeyDown}
          >
            {items.map((item, i) => (
              <div key={item.id} role="presentation" className="menu__section">
                {item.divider && <div className="menu__divider" aria-hidden="true" />}
                {item.sectionLabel && <div id={`${menuId}-section-${i}`} className="menu__section-label">{item.sectionLabel}</div>}
                <button
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitem"
                  aria-describedby={sectionIds[i]}
                  className={["menu__item", item.tone === "danger" ? "menu__item--danger" : ""].filter(Boolean).join(" ")}
                  tabIndex={i === activeIndex && !item.disabled ? 0 : -1}
                  disabled={item.disabled}
                  onClick={() => select(item)}
                >
                  {item.icon && (
                    <span className="menu__item-icon">
                      <Icons icon={item.icon} size={16} />
                    </span>
                  )}
                  <span className="menu__item-label">{item.label}</span>
                </button>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </span>
  );
};
