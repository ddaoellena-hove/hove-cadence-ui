import { useInTabList } from "./tab-list-context";
import "./tab.css";

export interface TabProps {
  /** Tab label text. */
  label: string;
  /** Visual state of the tab. */
  variant?: "default" | "active";
  /** Click handler. */
  onClick?: () => void;
  /** Disable interaction. */
  disabled?: boolean;
  /** Optional extra class name. */
  className?: string;
  /** `id` du bouton onglet (cible de `aria-labelledby` côté panneau). */
  id?: string;
  /** `id` du panneau contrôlé → `aria-controls`. */
  controls?: string;
}

export const Tab = ({
  label,
  variant = "default",
  onClick,
  disabled = false,
  className,
  id,
  controls,
}: TabProps) => {
  const inTabList = useInTabList("Tab");
  const active = variant === "active";
  const rootClass = [
    "tab",
    `tab--${variant}`,
    disabled ? "tab--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={rootClass}
      onClick={onClick}
      disabled={disabled}
      id={id}
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      // Roving tabindex dans un TabList : seul l'onglet actif est tabulable
      tabIndex={inTabList ? (active ? 0 : -1) : undefined}
    >
      <span className="tab__label">{label}</span>
      {/* Toujours rendu : l'actif le déploie, l'ancien le replie (transition CSS) */}
      <span className="tab__underline" aria-hidden="true" />
    </button>
  );
};
