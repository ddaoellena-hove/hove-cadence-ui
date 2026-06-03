import type { ReactNode } from "react";
import "./header.css";

export interface HeaderNavItem {
  /** Label displayed for the navigation item. */
  label: string;
  /** Whether this nav item is currently active. */
  active?: boolean;
  /** Callback fired when the nav item is clicked. */
  onClick?: () => void;
}

export interface HeaderProps {
  /** Arbitrary content on the left (e.g. a Dropdown). Takes priority over `logo`. */
  leftContent?: ReactNode;
  /** Logo text or brand name displayed on the left (used when `leftContent` is not set). */
  logo?: string;
  /** Navigation items displayed in the center. */
  navItems?: HeaderNavItem[];
  /** Content rendered on the right side (e.g., Avatar, buttons). */
  rightContent?: ReactNode;
  /** Optional additional class name. */
  className?: string;
}

/**
 * A top-level navigation header with left/right content slots and optional nav links.
 */
export const Header = ({
  leftContent,
  logo = "Brand",
  navItems = [],
  rightContent,
  className = "",
}: HeaderProps) => {
  return (
    <header className={`header ${className}`.trim()}>
      <div className="header__left">
        {leftContent ?? <span className="header__logo">{logo}</span>}
      </div>

      {navItems.length > 0 && (
        <nav className="header__center">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`header__nav-item ${item.active ? "header__nav-item--active" : ""}`.trim()}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      <div className="header__right">
        {rightContent}
      </div>
    </header>
  );
};
