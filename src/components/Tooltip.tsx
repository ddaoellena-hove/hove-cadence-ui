import "./tooltip.css";

export interface TooltipProps {
  /** Text displayed inside the tooltip bubble. */
  label?: string;
  /** Color theme. */
  theme?: "light" | "dark";
  /** Direction the arrow tail points. */
  arrow?: "top" | "bottom" | "right" | "left";
  /** Optional extra className. */
  className?: string;
  /** Inline style override. */
  style?: React.CSSProperties;
}

/**
 * Tooltip — a speech-bubble callout with four arrow positions and two themes.
 */
export const Tooltip = ({
  label = "Label",
  theme = "light",
  arrow = "top",
  className,
  style,
}: TooltipProps) => {
  const classes = [
    "tooltip",
    `tooltip--${theme}`,
    `tooltip--arrow-${arrow}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style} role="tooltip">
      <span className="tooltip-inner">
        <span className="tooltip-label">{label}</span>
      </span>
    </div>
  );
};
