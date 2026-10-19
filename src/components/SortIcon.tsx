import "./sort-icon.css";

// Composant interne (non exporté par index.ts) : flèches de tri partagées
// par TableHeader et DataTable. Les couleurs sont pilotées en CSS.

export type SortIconDirection = "asc" | "desc" | "none";

export interface SortIconProps {
  direction: SortIconDirection;
  /** Classe additionnelle (mise en page propre au composant hôte). */
  className?: string;
}

export const SortIcon = ({ direction, className }: SortIconProps) => (
  <svg
    className={["sort-icon", className].filter(Boolean).join(" ")}
    width="10"
    height="14"
    viewBox="0 0 10 14"
    fill="none"
    aria-hidden="true"
  >
    {/* Flèche haut */}
    <path
      className={`sort-icon__arrow${direction === "asc" ? " sort-icon__arrow--active" : ""}`}
      d="M5 1L1.5 5.5H8.5L5 1Z"
    />
    {/* Flèche bas */}
    <path
      className={`sort-icon__arrow${direction === "desc" ? " sort-icon__arrow--active" : ""}`}
      d="M5 13L8.5 8.5H1.5L5 13Z"
    />
  </svg>
);
