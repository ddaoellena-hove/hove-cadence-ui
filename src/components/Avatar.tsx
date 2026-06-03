import "./avatar.css";

export interface AvatarProps {
  /** Image URL for the avatar. If not provided, initials are shown. */
  src?: string;
  /** Alt text for the avatar image. */
  alt?: string;
  /** Display name used to generate initials when no image is provided. */
  name?: string;
  /** Size variant of the avatar. */
  size?: "sm" | "md" | "lg";
  /** Color variant for the initials background. */
  color?: "green" | "blue" | "orange" | "purple" | "gray";
  /** Show an icon placeholder instead of initials when no image is provided. */
  showIcon?: boolean;
  /** Email or subtitle displayed below the name in profile layout. */
  email?: string;
  /** Render as a profile card with name and email beside the avatar. */
  showProfile?: boolean;
  /** Optional additional class name. */
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * A circular avatar component that displays either an image or user initials.
 */
export const Avatar = ({
  src,
  alt = "",
  name = "",
  size = "md",
  color = "gray",
  showIcon = false,
  email,
  showProfile = false,
  className = "",
}: AvatarProps) => {
  const classes = [
    "avatar",
    `avatar--${size}`,
    !src ? `avatar--${color}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconSvg = (
    <svg
      className="avatar__icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );

  const avatarEl = (
    <div className={classes} aria-label={alt || name || "avatar"} role="img">
      {src ? (
        <img className="avatar__image" src={src} alt={alt || name} />
      ) : showIcon ? (
        iconSvg
      ) : (
        <span>{name ? getInitials(name) : "?"}</span>
      )}
    </div>
  );

  if (showProfile) {
    return (
      <div className="avatar-profile">
        {avatarEl}
        <div className="avatar-profile__info">
          {name && <span className="avatar-profile__name">{name}</span>}
          {email && <span className="avatar-profile__email">{email}</span>}
        </div>
      </div>
    );
  }

  return avatarEl;
};
