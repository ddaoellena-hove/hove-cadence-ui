import { useId, useState } from "react";
import "./presence-strip.css";
export interface PresenceObservation { id: string; label: string; present: boolean | null; current?: boolean }
export interface PresenceStripProps { items: PresenceObservation[]; "aria-label": string; size?: "sm" | "md"; className?: string }
/** Présence binaire, avec donnée inconnue distincte d'une absence. */
export const PresenceStrip = ({ items, "aria-label": label, size = "md", className }: PresenceStripProps) => {
  const id = useId();
  const [dismissed, setDismissed] = useState<string | null>(null);
  const count = items.filter(item => item.present === true).length;
  const missing = items.filter(item => item.present === null).length;
  return <div className={["presence-strip", `presence-strip--${size}`, className].filter(Boolean).join(" ")} role="group" aria-label={label} aria-describedby={id}>
    <span id={id} className="presence-strip__summary">{items.length ? `Présent ${count} fois sur ${items.length}${missing ? `, ${missing} résultat${missing > 1 ? "s" : ""} inconnu${missing > 1 ? "s" : ""}` : ""}` : "Aucune observation"}</span>
    <ol className="presence-strip__items">{items.map(item => <li key={item.id}><span tabIndex={0} data-dismissed={dismissed === item.id || undefined} onFocus={() => setDismissed(null)} onMouseEnter={() => setDismissed(null)} onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); setDismissed(item.id); } }} className={`presence-strip__cell presence-strip__cell--${item.present === null ? "unknown" : item.present ? "present" : "absent"}`} aria-label={`${item.label} : ${item.present === null ? "Donnée inconnue" : item.present ? "Présent" : "Absent"}${item.current ? ", exécution courante" : ""}`} aria-current={item.current || undefined} role="img"><span aria-hidden="true">{item.present === null ? "?" : item.present ? "●" : "○"}</span><span className="presence-strip__tooltip" aria-hidden="true">{item.label} — {item.present === null ? "Inconnu" : item.present ? "Présent" : "Absent"}</span></span></li>)}</ol>
  </div>;
};
