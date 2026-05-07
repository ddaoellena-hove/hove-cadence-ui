import React, { useState, useRef, useEffect, useCallback } from "react";
import "./navigation-dropdown.css";

/** A single item in the dropdown menu. */
export interface NavigationDropdownItem {
  /** Unique identifier for this item. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
  /** When true this item renders as active/selected. */
  active?: boolean;
  /** When true this item is non-interactive. */
  disabled?: boolean;
  /** When true renders a visual divider above this item. */
  dividerAbove?: boolean;
  /** When set, renders a group label above this item. */
  groupLabel?: string;
  /** Click handler for this item. */
  onClick?: () => void;
}

export interface NavigationDropdownProps {
  /** Text label shown on the trigger button. */
  label: string;
  /** Menu items to display. */
  items?: NavigationDropdownItem[];
  /** Aligns the dropdown menu to the right edge of the trigger. */
  align?: "left" | "right";
  /** When true the trigger is disabled and the menu cannot be opened. */
  disabled?: boolean;
  /** Optional extra class name applied to the root element. */
  className?: string;
  /** Called when an item is selected, with its id. */
  onSelect?: (id: string) => void;
}

/**
 * NavigationDropdown — a trigger button that opens a floating menu panel.
 * Closes on outside click, Escape key, and item selection.
 */
export const NavigationDropdown = React.forwardRef<
  HTMLDivElement,
  NavigationDropdownProps
>(
  (
    {
      label,
      items = [],
      align = "left",
      disabled = false,
      className,
      onSelect,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLUListElement>(null);

    // Merge forwarded ref with internal container ref
    const setContainerRef = useCallback(
      (node: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    // Close on outside click
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, [isOpen]);

    const toggleMenu = () => {
      if (disabled) return;
      setIsOpen((prev) => !prev);
    };

    const handleItemClick = (item: NavigationDropdownItem) => {
      if (item.disabled) return;
      item.onClick?.();
      onSelect?.(item.id);
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    const handleItemKeyDown = (
      e: React.KeyboardEvent,
      item: NavigationDropdownItem
    ) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleItemClick(item);
      }
    };

    const rootClass = [
      "navigation-dropdown",
      isOpen ? "open" : "",
      disabled ? "disabled" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const menuClass = [
      "navigation-dropdown-menu",
      align === "right" ? "align-right" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={rootClass} ref={setContainerRef}>
        <button
          ref={triggerRef}
          className="navigation-dropdown-trigger"
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-disabled={disabled}
          disabled={disabled}
          onClick={toggleMenu}
        >
          {label}
          {/* Chevron icon */}
          <span className="navigation-dropdown-chevron" aria-hidden="true">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <ul
            ref={menuRef}
            className={menuClass}
            role="menu"
            aria-label={label}
          >
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.dividerAbove && (
                  <li role="separator">
                    <hr className="navigation-dropdown-divider" />
                  </li>
                )}
                {item.groupLabel && (
                  <li
                    className="navigation-dropdown-label"
                    role="presentation"
                    aria-hidden="true"
                  >
                    {item.groupLabel}
                  </li>
                )}
                <li role="none">
                  <button
                    className={[
                      "navigation-dropdown-item",
                      item.active ? "active" : "",
                      item.disabled ? "disabled" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    role="menuitem"
                    tabIndex={item.disabled ? -1 : 0}
                    aria-disabled={item.disabled}
                    onClick={() => handleItemClick(item)}
                    onKeyDown={(e) => handleItemKeyDown(e, item)}
                    type="button"
                  >
                    {item.icon && (
                      <span className="navigation-dropdown-item-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </button>
                </li>
              </React.Fragment>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

NavigationDropdown.displayName = "NavigationDropdown";
