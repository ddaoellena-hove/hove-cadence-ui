import type { SVGProps } from "react";

// Piéton (marche) : absent d'@untitledui/icons, dessiné au même gabarit
// (grille 24, trait 2, extrémités arrondies, currentColor) pour s'aligner
// sur les autres icônes du registre.
export const Walk = ({ size = 24, color = "currentColor", ...props }: SVGProps<SVGSVGElement> & { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="13.5" cy="4" r="2" stroke={color} strokeWidth="2" />
    <path
      d="M13 8l-1.5 6m0 0-2 8m2-8 2.5 3 1 5M8 11.5 10.5 8.5H13l2 3 2.5 1"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
