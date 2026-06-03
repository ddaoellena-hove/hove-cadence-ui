import type { ReactNode } from "react";
import "./avatar.css";

// ── Types ──────────────────────────────────────────────────────────────────────

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "offline" | "away" | "busy";

export interface AvatarProps {
  /** Image URL. When provided, displays the image instead of initials. */
  src?: string;
  /** Full name used to derive initials and fallback background color. */
  name?: string;
  /** Visual size of the avatar. */
  size?: AvatarSize;
  /** Optional status badge. */
  status?: AvatarStatus;
  /** Icon slot — overrides initials when no `src` is provided. */
  icon?: ReactNode;
  /** Alt text for the image. Defaults to `name`. */
  alt?: string;
  /** Extra class name. */
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const PALETTE = [
  ["#dbeafe", "#1d4ed8"], // blue
  ["#dcfce7", "#15803d"], // green
  ["#fef3c7", "#b45309"], // amber
  ["#fce7f3", "#be185d"], // pink
  ["#ede9fe", "#6d28d9"], // violet
  ["#ffedd5", "#c2410c"], // orange
  ["#e0f2fe", "#0369a1"], // sky
  ["#f0fdf4", "#166534"], // emerald
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getPalette(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length] as [string, string];
}

// ── Status dot ────────────────────────────────────────────────────────────────

const StatusDot = ({ status }: { status: AvatarStatus }) => (
  <span className={`avatar__status avatar__status--${status}`} aria-label={status} />
);

// ── Component ──────────────────────────────────────────────────────────────────

export const Avatar = ({
  src,
  name,
  size = "md",
  status,
  icon,
  alt,
  className,
}: AvatarProps) => {
  const [bg, fg] = name ? getPalette(name) : ["#e5e7eb", "#6b7280"];
  const initials = name ? getInitials(name) : null;

  const rootClass = ["avatar", `avatar--${size}`, className].filter(Boolean).join(" ");

  return (
    <span className={rootClass} aria-label={name ?? alt ?? "Avatar"}>
      {src ? (
        <img src={src} alt={alt ?? name ?? "Avatar"} className="avatar__img" />
      ) : icon ? (
        <span className="avatar__icon" style={{ background: bg, color: fg }}>
          {icon}
        </span>
      ) : initials ? (
        <span className="avatar__initials" style={{ background: bg, color: fg }}>
          {initials}
        </span>
      ) : (
        <span className="avatar__placeholder" style={{ background: bg, color: fg }}>
          <svg width="60%" height="60%" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 14s-1 0-1-1 1-4 7-4 7 3 7 4-1 1-1 1H2Z"
              fill="currentColor"
            />
          </svg>
        </span>
      )}
      {status && <StatusDot status={status} />}
    </span>
  );
};
