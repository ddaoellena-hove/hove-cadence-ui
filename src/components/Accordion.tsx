/**
 * Accordion component.
 *
 * Panneaux dépliables (pattern ARIA disclosure). `mode="single"` : un seul
 * panneau ouvert ; `mode="multiple"` : plusieurs. Animation de hauteur coupée
 * sous prefers-reduced-motion.
 */
import { useId, useState, type ReactNode } from "react";
import { inertProps } from "./inert-props";
import "./accordion.css";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  /** Ouvert au premier rendu. */
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** "single" (défaut) : un seul panneau à la fois ; "multiple" : plusieurs. */
  mode?: "single" | "multiple";
  /** Classe CSS additionnelle. */
  className?: string;
}

const Chevron = () => (
  <svg className="accordion__chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Accordion = ({ items, mode = "single", className }: AccordionProps) => {
  const baseId = useId();
  const [open, setOpen] = useState<Set<string>>(
    () => {
      const defaults = items.filter((i) => i.defaultOpen).map((i) => i.id);
      return new Set(mode === "single" ? defaults.slice(0, 1) : defaults);
    },
  );

  const toggle = (id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (mode === "single") next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={["accordion", className].filter(Boolean).join(" ")}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const headerId = `${baseId}-h-${item.id}`;
        const panelId = `${baseId}-p-${item.id}`;
        return (
          <div className={`accordion__item${isOpen ? " accordion__item--open" : ""}`} key={item.id}>
            <h3 className="accordion__heading">
              <button
                id={headerId}
                type="button"
                className="accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span className="accordion__title">{item.title}</span>
                <Chevron />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className="accordion__panel"
              // Fermé : inerte (hors focus et lecteurs d'écran) tout en restant
              // dans le DOM pour animer la hauteur.
              {...inertProps(!isOpen)}
            >
              <div className="accordion__content">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
