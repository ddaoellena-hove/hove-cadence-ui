import React from "react";
import "./indicator.css";

// ── Variants ───────────────────────────────────────────────────────────────

export type IndicatorVariant =
  | "active"      // En cours — teal
  | "upcoming"    // À venir — violet
  | "completed"   // Passée  — vert
  | "draft"       // Brouillon — gris
  | "warning"     // Ralenti — orange
  | "info"        // Information — bleu
  | "critical"    // Critique — rouge
  | "nominal";    // Nominal — vert doux

// ── Icons (inline SVG) ─────────────────────────────────────────────────────

const IconActive = () => (
  /* Double cercle pulsé — en cours */
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
    <circle cx="7" cy="7" r="3.5" fill="currentColor" />
  </svg>
);

const IconUpcoming = () => (
  /* Horloge — à venir */
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 4V7L9 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCompleted = () => (
  /* Check dans un cercle — passée */
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4.5 7L6.5 9L9.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDraft = () => (
  /* Crayon — brouillon */
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M9.5 2.5L11.5 4.5L5.5 10.5L3 11L3.5 8.5L9.5 2.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 4L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconWarning = () => (
  /* Triangle exclamation — ralenti */
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7 2L12.5 11.5H1.5L7 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M7 6V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="7" cy="10" r="0.75" fill="currentColor" />
  </svg>
);

const IconInfo = () => (
  /* Cercle i — information */
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 6.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="7" cy="4.5" r="0.75" fill="currentColor" />
  </svg>
);

const IconCritical = () => (
  /* Losange × — critique */
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M7 1.5L12.5 7L7 12.5L1.5 7L7 1.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M5.5 5.5L8.5 8.5M8.5 5.5L5.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconNominal = () => (
  /* Double check — nominal */
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7.5L5 10.5L8.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 7.5L9 10.5L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Config par variante ────────────────────────────────────────────────────

const CONFIG: Record<
  IndicatorVariant,
  { icon: React.ReactNode; label: string }
> = {
  active:    { icon: <IconActive />,    label: "En cours"     },
  upcoming:  { icon: <IconUpcoming />,  label: "À venir"      },
  completed: { icon: <IconCompleted />, label: "Passée"       },
  draft:     { icon: <IconDraft />,     label: "Brouillon"    },
  warning:   { icon: <IconWarning />,   label: "Ralenti"      },
  info:      { icon: <IconInfo />,      label: "Information"  },
  critical:  { icon: <IconCritical />,  label: "Critique"     },
  nominal:   { icon: <IconNominal />,   label: "Nominal"      },
};

// ── Component ──────────────────────────────────────────────────────────────

export interface IndicatorProps {
  variant: IndicatorVariant;
  /** Overrides the default label for this variant. */
  label?: string;
  /** Optional extra class name. */
  className?: string;
}

export const Indicator = ({ variant, label, className }: IndicatorProps) => {
  const config = CONFIG[variant];
  const displayLabel = label ?? config.label;

  const rootClass = [
    "indicator",
    `indicator--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <span className="indicator__icon">{config.icon}</span>
      <span className="indicator__label">{displayLabel}</span>
    </div>
  );
};
