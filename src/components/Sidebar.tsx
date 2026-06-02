import React from "react";
import "./sidebar.css";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  /** Sections of navigation items. */
  sections?: SidebarSection[];
  /** The id of the currently active item. */
  activeId?: string;
  /** Called when a nav item is clicked (receives the item id). */
  onItemClick?: (id: string) => void;
  /** Optional logo / header content rendered at the top. */
  header?: React.ReactNode;
  /** Optional footer content rendered at the bottom. */
  footer?: React.ReactNode;
  /** Whether the sidebar is collapsed to icons only. */
  collapsed?: boolean;
  /** Additional class name. */
  className?: string;
  /** Inline style override. */
  style?: React.CSSProperties;
}

export const Sidebar = ({
  sections = [],
  activeId,
  onItemClick,
  header,
  footer,
  collapsed = false,
  className,
  style,
}: SidebarProps) => {
  const rootClass = [
    "sidebar",
    collapsed ? "sidebar--collapsed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={rootClass} style={style} aria-label="Sidebar navigation">
      {header && <div className="sidebar__header">{header}</div>}

      <div className="sidebar__body">
        {sections.map((section) => (
          <div key={section.id} className="sidebar__section">
            {section.title && !collapsed && (
              <p className="sidebar__section-title">{section.title}</p>
            )}
            <ul className="sidebar__list" role="list">
              {section.items.map((item) => {
                const isActive = item.id === activeId;
                const itemClass = [
                  "sidebar__item",
                  isActive ? "sidebar__item--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                const handleClick = () => {
                  item.onClick?.();
                  onItemClick?.(item.id);
                };

                const content = (
                  <>
                    {item.icon && (
                      <span className="sidebar__item-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    {!collapsed && (
                      <span className="sidebar__item-label">{item.label}</span>
                    )}
                  </>
                );

                return (
                  <li key={item.id}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className={itemClass}
                        aria-current={isActive ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                      >
                        {content}
                      </a>
                    ) : (
                      <button
                        type="button"
                        className={itemClass}
                        onClick={handleClick}
                        aria-current={isActive ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {footer && <div className="sidebar__footer">{footer}</div>}
    </nav>
  );
};
