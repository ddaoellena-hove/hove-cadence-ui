import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { TabListContext } from "./tab-list-context";
import "./tab-list.css";

export interface TabListProps {
  /** Nom de la rangée d'onglets, annoncé à l'entrée dans la liste. */
  "aria-label": string;
  /** Écart entre onglets : "primary" 16px (rangée de Tab), "secondary" 4px (rangée de SecondaryTab). Défaut "primary". */
  level?: "primary" | "secondary";
  /**
   * "automatic" (défaut) : les flèches déplacent le focus et activent l'onglet.
   * "manual" : les flèches déplacent le focus, Entrée ou Espace activent.
   */
  activation?: "automatic" | "manual";
  /** Des `Tab` ou des `SecondaryTab`. */
  children: ReactNode;
  /** Classe CSS additionnelle. */
  className?: string;
}

/** Onglets activables de la rangée, dans l'ordre du DOM. */
const getTabs = (list: HTMLElement) =>
  Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]')).filter((tab) => !tab.disabled);

/**
 * Conteneur role="tablist" d'une rangée de `Tab` ou de `SecondaryTab` :
 * roving tabindex (seul l'onglet actif est dans l'ordre de tabulation),
 * ←/→ en boucle, Début / Fin.
 */
export const TabList = ({
  "aria-label": ariaLabel,
  level = "primary",
  activation = "automatic",
  children,
  className,
}: TabListProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // Rangée de Tab : un seul soulignement, qui glisse sous l'onglet actif.
  // Repositionné à chaque rendu et quand un onglet change de taille (police
  // chargée, libellé passé en gras, retour à la ligne).
  useLayoutEffect(() => {
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (level !== "primary" || !list || !indicator) return;
    const place = () => {
      const active = list.querySelector<HTMLElement>(".tab--active");
      if (!active) {
        indicator.style.opacity = "0";
        return;
      }
      // Pas encore dans le document (portail d'un Drawer ou d'une Modal, attaché
      // après les effets des enfants) ou masqué : aucune mesure fiable. Le
      // ResizeObserver replacera l'indicateur, sans glissement, dès qu'il aura une taille.
      if (!list.isConnected || active.offsetWidth === 0) return;
      indicator.style.opacity = "1";
      indicator.style.left = `${active.offsetLeft}px`;
      indicator.style.top = `${active.offsetTop + active.offsetHeight}px`;
      indicator.style.width = `${active.offsetWidth}px`;
      // Pas de glissement au premier placement : seulement aux changements suivants
      requestAnimationFrame(() => indicator.classList.add("tab-list__indicator--ready"));
    };
    place();
    const observer = new ResizeObserver(place);
    list.querySelectorAll('[role="tab"]').forEach((tab) => observer.observe(tab));
    return () => observer.disconnect();
  });

  // Sans onglet actif, le premier onglet activable reste atteignable au clavier
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || list.querySelector('[role="tab"][tabindex="0"]')) return;
    getTabs(list)[0]?.setAttribute("tabindex", "0");
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (!list) return;
    const tabs = getTabs(list);
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1 || tabs.length === 0) return;

    let next: number;
    switch (e.key) {
      case "ArrowRight":
        next = (current + 1) % tabs.length;
        break;
      case "ArrowLeft":
        next = (current - 1 + tabs.length) % tabs.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    tabs[next].focus();
    if (activation === "automatic") tabs[next].click();
  };

  const rootClass = ["tab-list", `tab-list--${level}`, className].filter(Boolean).join(" ");

  return (
    <TabListContext.Provider value={true}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        className={rootClass}
        onKeyDown={handleKeyDown}
      >
        {children}
        {level === "primary" && <span ref={indicatorRef} className="tab-list__indicator" aria-hidden="true" />}
      </div>
    </TabListContext.Provider>
  );
};
