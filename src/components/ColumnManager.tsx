/**
 * ColumnManager component.
 *
 * Popover de gestion des colonnes d'un DataTable : visibilité (Checkbox) et
 * ordre, plus « Réinitialiser ». Contrôlé. Ordre modifiable par glisser-déposer
 * de la poignée (pointeur : souris et tactile, avec repère de dépôt), au
 * clavier sur la poignée (↑ / ↓, nouvelle position annoncée), ou par les
 * boutons monter/descendre — alternative sans glisser. Le DataTable consomme `visibleIds` (via
 * `hiddenColumnIds`) et `order` (via `columnOrder`).
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronUp } from "@untitledui/icons/ChevronUp";
import { ChevronDown } from "@untitledui/icons/ChevronDown";
import { DotsGrid } from "@untitledui/icons/DotsGrid";
import { GhostButton } from "./GhostButton";
import { Checkbox } from "./Checkbox";
import { useAnchoredPanel } from "./overlay-primitives";
import "./column-manager.css";
import "./scrollbar.css";

export interface ColumnManagerColumn {
  id: string;
  label: string;
}

export interface ColumnManagerProps {
  columns: ColumnManagerColumn[];
  /** Ids des colonnes visibles. */
  visibleIds: string[];
  /** Ordre d'affichage (ids). */
  order: string[];
  onChange: (next: { visibleIds: string[]; order: string[] }) => void;
  /** Classe CSS additionnelle. */
  className?: string;
}


export const ColumnManager = ({ columns, visibleIds, order, onChange, className }: ColumnManagerProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const panelId = useId();
  const hintId = useId();
  // Glisser en cours : ligne saisie et point d'insertion (0 … n, avant la ligne n).
  const [drag, setDrag] = useState<{ from: number; insert: number } | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const byId = new Map(columns.map((c) => [c.id, c]));
  // Colonnes dans l'ordre courant (celles connues).
  const ids = [...new Set([...order, ...columns.map((c) => c.id)])];
  const ordered = ids.map((id) => byId.get(id)).filter((c): c is ColumnManagerColumn => Boolean(c));
  const visible = new Set(visibleIds);

  useEffect(() => {
    triggerRef.current?.setAttribute("aria-haspopup", "dialog");
  }, []);
  useEffect(() => {
    triggerRef.current?.setAttribute("aria-expanded", String(open));
    if (open) triggerRef.current?.setAttribute("aria-controls", panelId);
    else triggerRef.current?.removeAttribute("aria-controls");
  }, [open, panelId]);

  // Position, clic extérieur et suivi au défilement : comportement partagé
  // des panneaux ancrés (fermé si le déclencheur sort de la fenêtre).
  const pos = useAnchoredPanel({
    open,
    triggerRef,
    panelRef,
    onOutsideClick: () => setOpen(false),
    onTriggerHidden: () => setOpen(false),
  });

  // Focus à l'ouverture seulement (pas à chaque recalcul de position).
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !pos || !panel || panel.contains(document.activeElement)) return;
    panel.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [open, pos]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const toggleVisible = (id: string) => {
    const next = new Set(visible);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ visibleIds: columns.filter((c) => next.has(c.id)).map((c) => c.id), order: ordered.map((c) => c.id) });
  };

  /** Déplace la colonne `from` à l'index `to` et remet le focus sur la ligne déplacée. */
  const moveTo = (from: number, to: number, focus: "control" | "handle" = "control") => {
    if (to < 0 || to >= ordered.length || to === from) return;
    const nextOrder = ordered.map((c) => c.id);
    const [moved] = nextOrder.splice(from, 1);
    nextOrder.splice(to, 0, moved);
    onChange({ visibleIds, order: nextOrder });
    setAnnouncement(`${byId.get(moved)?.label ?? moved} déplacée en position ${to + 1} sur ${ordered.length}`);
    // Le bouton activé peut devenir désactivé en bout de liste.
    requestAnimationFrame(() => {
      const row = panelRef.current?.querySelectorAll(".column-manager__row")[to];
      const selector = focus === "handle" ? ".column-manager__handle" : "[role=checkbox], input, button:not(:disabled)";
      row?.querySelector<HTMLElement>(selector)?.focus();
    });
  };

  const move = (index: number, delta: -1 | 1) => moveTo(index, index + delta);

  // ── Glisser-déposer (pointeur) ──
  /** Point d'insertion sous le pointeur : avant la première ligne dont le milieu est plus bas. */
  const insertionAt = (clientY: number) => {
    const rows = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(".column-manager__row") ?? []);
    const index = rows.findIndex((row) => {
      const r = row.getBoundingClientRect();
      return clientY < r.top + r.height / 2;
    });
    return index === -1 ? rows.length : index;
  };

  const onHandlePointerDown = (index: number) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    // Capture : la poignée reçoit les déplacements même hors de sa zone.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointeur synthétique ou déjà relâché : le glisser reste possible.
    }
    e.currentTarget.focus();
    setDrag({ from: index, insert: index });
  };

  const onHandlePointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const insert = insertionAt(e.clientY);
    if (insert !== drag.insert) setDrag({ ...drag, insert });
  };

  const onHandlePointerUp = () => {
    if (!drag) return;
    // Insertion après la ligne saisie : l'index final perd une position.
    const to = drag.insert > drag.from ? drag.insert - 1 : drag.insert;
    setDrag(null);
    moveTo(drag.from, to, "handle");
  };

  const onHandleKeyDown = (index: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      moveTo(index, index + (e.key === "ArrowUp" ? -1 : 1), "handle");
    } else if (e.key === "Escape" && drag) {
      e.preventDefault();
      e.stopPropagation();
      setDrag(null);
    }
  };

  /** Classe du repère de dépôt : trait au-dessus de la ligne, ou sous la dernière. */
  const dropClass = (index: number) => {
    if (!drag || drag.insert === drag.from || drag.insert === drag.from + 1) return "";
    if (drag.insert === index) return " column-manager__row--drop-before";
    if (drag.insert === ordered.length && index === ordered.length - 1) return " column-manager__row--drop-after";
    return "";
  };

  const reset = () => {
    onChange({ visibleIds: columns.map((c) => c.id), order: columns.map((c) => c.id) });
  };

  return (
    <span className={["column-manager", className].filter(Boolean).join(" ")}>
      <GhostButton ref={triggerRef} size="sm" label="Colonnes" onClick={() => setOpen((o) => !o)} />

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            className="column-manager__panel cadence-scrollbar"
            role="dialog"
            aria-labelledby={titleId}
            data-cadence-floating=""
            style={{ position: "fixed", left: pos?.left ?? -9999, top: pos?.top ?? -9999, zIndex: pos?.zIndex, visibility: pos ? "visible" : "hidden" }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                close();
              }
              if (e.key === "Tab") {
                const controls = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [role="checkbox"][tabindex="0"]') ?? []);
                const edge = e.shiftKey ? controls[0] : controls[controls.length - 1];
                if (document.activeElement === edge) close();
              }
            }}
            onBlur={(e) => {
              if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
            }}
          >
            <div className="column-manager__header">
              <span id={titleId} className="column-manager__title">Colonnes</span>
              <button type="button" className="column-manager__reset" onClick={reset}>Réinitialiser</button>
            </div>
            <ul className="column-manager__list">
              {ordered.map((col, index) => (
                <li
                  key={col.id}
                  className={`column-manager__row${drag?.from === index ? " column-manager__row--dragging" : ""}${dropClass(index)}`}
                >
                  <button
                    type="button"
                    className="column-manager__handle"
                    aria-label={`Déplacer ${col.label}`}
                    aria-describedby={hintId}
                    onPointerDown={onHandlePointerDown(index)}
                    onPointerMove={onHandlePointerMove}
                    onPointerUp={onHandlePointerUp}
                    onPointerCancel={() => setDrag(null)}
                    onKeyDown={onHandleKeyDown(index)}
                  >
                    <DotsGrid size={16} aria-hidden="true" />
                  </button>
                  <Checkbox
                    state={visible.has(col.id) ? "checked" : "unchecked"}
                    aria-label={`Afficher la colonne ${col.label}`}
                    onChange={() => toggleVisible(col.id)}
                  />
                  <span className="column-manager__label">{col.label}</span>
                  <span className="column-manager__reorder">
                    <button
                      type="button"
                      className="column-manager__move"
                      aria-label={`Monter ${col.label}`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ChevronUp size={16} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="column-manager__move"
                      aria-label={`Descendre ${col.label}`}
                      disabled={index === ordered.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ChevronDown size={16} aria-hidden="true" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <p id={hintId} className="column-manager__hint">
              Glissez la poignée, ou utilisez les flèches haut et bas sur la poignée, pour réordonner.
            </p>
            <p className="column-manager__sr" role="status">{announcement}</p>
          </div>,
          document.body,
        )}
    </span>
  );
};
