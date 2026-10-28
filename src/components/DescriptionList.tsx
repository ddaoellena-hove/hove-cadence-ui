import type { CSSProperties, ReactNode } from "react";
import "./description-list.css";

export interface DescriptionItem {
  id: string;
  label: ReactNode;
  /** null/undefined/chaîne vide → libellé de repli. 0 et false sont conservés. */
  value?: ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionItem[];
  /** Nom accessible de la liste de propriétés. */
  "aria-label"?: string;
  layout?: "horizontal" | "stacked";
  labelWidth?: number | "auto";
  appearance?: "default" | "tiles";
  density?: "comfortable" | "compact";
  emptyValue?: string;
  className?: string;
}

/** Métadonnées sémantiques, adaptées aux détails en Drawer et aux synthèses. */
export const DescriptionList = ({ items, "aria-label": ariaLabel, layout = "horizontal", density = "comfortable", labelWidth, appearance = "default", emptyValue = "Non renseigné", className }: DescriptionListProps) => {
  if (!items.length) return null;
  return <dl style={labelWidth !== undefined ? { "--description-label-width": typeof labelWidth === "number" ? `${Math.max(0, labelWidth)}px` : "max-content" } as CSSProperties : undefined} aria-label={ariaLabel} className={["description-list", `description-list--${layout}`, `description-list--${density}`, labelWidth !== undefined && layout === "horizontal" ? "description-list--shared" : "", `description-list--${appearance}`, className].filter(Boolean).join(" ")}>
    {items.map((item) => <div className="description-list__item" key={item.id}>
      <dt className="description-list__label">{item.label}</dt>
      <dd className="description-list__value">{
        item.value === null || item.value === undefined || item.value === "" ? emptyValue :
        typeof item.value === "boolean" ? (item.value ? "Oui" : "Non") : item.value
      }</dd>
    </div>)}
  </dl>;
};
