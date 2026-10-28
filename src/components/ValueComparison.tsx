import { useId, type ReactNode } from "react";
import { DescriptionList } from "./DescriptionList";
import "./value-comparison.css";
export interface ValueComparisonItem {
  id: string;
  label: string;
  before?: ReactNode;
  after?: ReactNode;
  /** Obligatoire pour une comparaison métier de contenus React complexes. */
  changed?: boolean;
}
export interface ValueComparisonProps {
  items: ValueComparisonItem[];
  "aria-label": string;
  layout?: "fields" | "versions";
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}
const display = (value: ReactNode) => value === undefined || value === null || value === "" ? "Non renseigné" : typeof value === "boolean" ? value ? "Oui" : "Non" : value;
export const ValueComparison = ({ items, "aria-label": label, layout = "fields", beforeLabel = "Avant", afterLabel = "Après", className }: ValueComparisonProps) => {
  const id = useId();
  const changed = (item: ValueComparisonItem) => item.changed ?? !Object.is(item.before, item.after);
  return <section aria-label={label} className={["value-comparison", `value-comparison--${layout}`, className].filter(Boolean).join(" ")}>
    {layout === "versions" ? <>{(["before", "after"] as const).map(side => <section key={side} aria-labelledby={`${id}-${side}`} className="value-comparison__version"><h3 id={`${id}-${side}`}>{side === "before" ? beforeLabel : afterLabel}</h3><DescriptionList layout="stacked" items={items.map(item => ({ id: item.id, label: <>{item.label}{changed(item) && <span className="value-comparison__changed"> — Modifié</span>}</>, value: item[side] }))} /></section>)}</> : <dl className="value-comparison__fields">{items.map(item => <div key={item.id} className={`value-comparison__field${changed(item) ? " value-comparison__field--changed" : ""}`}><dt>{item.label}{changed(item) && <span className="value-comparison__changed"> — Modifié</span>}</dt><dd><span className="value-comparison__side"><span className="value-comparison__label">{beforeLabel}</span><span>{display(item.before)}</span></span><span className="value-comparison__side"><span className="value-comparison__label">{afterLabel}</span><span>{display(item.after)}</span></span></dd></div>)}</dl>}
  </section>;
};
