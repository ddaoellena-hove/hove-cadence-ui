/**
 * ColumnManager component.
 *
 * Popover de gestion des colonnes d'un DataTable : visibilité (Checkbox) et
 * ordre (boutons monter/descendre — pas de glisser-déposer seul), plus
 * « Réinitialiser ». Contrôlé. Le DataTable consomme `visibleIds` (via
 * `hiddenColumnIds`) et `order` (via `columnOrder`).
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronUp } from "@untitledui/icons/ChevronUp";
import { ChevronDown } from "@untitledui/icons/ChevronDown";
import { GhostButton } from "./GhostButton";
import { Checkbox } from "./Checkbox";
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

const MARGIN = 8;

export const ColumnManager = ({ columns, visibleIds, order, onChange, className }: ColumnManagerProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const panelId = useId();

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

  // Positionnement (portail, aligné sur le bord gauche du déclencheur).
  useLayoutEffect(() => {
    if (!open) return;
    const t = triggerRef.current?.getBoundingClientRect();
    const p = panelRef.current?.getBoundingClientRect();
    if (!t || !p) return;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const left = Math.max(MARGIN, Math.min(t.left, vw - p.width - MARGIN));
    const below = t.bottom + 6;
    const top = below + p.height <= vh - MARGIN ? below : Math.max(MARGIN, t.top - p.height - 6);
    setPos({ left, top });
  }, [open]);

  useEffect(() => {
    if (open && pos) panelRef.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [open, pos]);

  // Fermeture : clic extérieur, défilement, Échap (focus au déclencheur).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && panelRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

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

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= ordered.length) return;
    const nextOrder = ordered.map((c) => c.id);
    [nextOrder[index], nextOrder[target]] = [nextOrder[target], nextOrder[index]];
    onChange({ visibleIds, order: nextOrder });
    // Le bouton activé peut devenir désactivé en bout de liste.
    requestAnimationFrame(() => {
      const row = panelRef.current?.querySelectorAll(".column-manager__row")[target];
      row?.querySelector<HTMLElement>("[role=checkbox], input, button:not(:disabled)")?.focus();
    });
  };

  const reset = () => {
    onChange({ visibleIds: columns.map((c) => c.id), order: columns.map((c) => c.id) });
  };

  return (
    <span className={["column-manager", className].filter(Boolean).join(" ")} ref={containerRef}>
      <GhostButton ref={triggerRef} size="sm" label="Colonnes" onClick={() => setOpen((o) => !o)} />

      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            className="column-manager__panel cadence-scrollbar"
            role="dialog"
            aria-labelledby={titleId}
            style={{ position: "fixed", left: pos?.left ?? -9999, top: pos?.top ?? -9999, visibility: pos ? "visible" : "hidden" }}
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
                <li key={col.id} className="column-manager__row">
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
          </div>,
          document.body,
        )}
    </span>
  );
};
