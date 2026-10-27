import { useState } from "react";
import { Tooltip, type TooltipProps } from "./Tooltip";
import "./tooltip-trigger.css";

export interface TooltipTriggerProps {
  /** Text content of the tooltip bubble. */
  label?: string;
  /** Color theme of the tooltip. */
  theme?: TooltipProps["theme"];
  /**
   * Which side the tooltip appears on — the arrow points back toward the trigger.
   * e.g. "top" means the tooltip sits above and its arrow points down toward the trigger.
   */
  position?: "top" | "bottom" | "left" | "right";
}

/** Maps position → the arrow direction that points back at the trigger. */
const POSITION_TO_ARROW: Record<
  NonNullable<TooltipTriggerProps["position"]>,
  TooltipProps["arrow"]
> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** Info SVG icon */
const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="currentColor" />
    <rect x="9" y="8.5" width="2" height="6" rx="1" fill="white" />
    <circle cx="10" cy="6" r="1.1" fill="white" />
  </svg>
);

export const TooltipTrigger = ({
  label = "Label",
  theme = "light",
  position = "top",
}: TooltipTriggerProps) => {
  const [visible, setVisible] = useState(false);

  const arrow = POSITION_TO_ARROW[position];

  // Survol ou focus clavier ouvrent la bulle ; Échap la ferme sans déplacer
  // le focus (WCAG 1.4.13). Le texte est déjà le nom du bouton : la bulle
  // est masquée aux lecteurs d'écran pour ne pas le lire deux fois.
  return (
    <div
      className={`tooltip-trigger${visible ? " tooltip-trigger--hovered" : ""}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && visible) {
          event.stopPropagation();
          setVisible(false);
        }
      }}
    >
      <button type="button" className="tooltip-trigger__icon" aria-label={label}>
        <InfoIcon />
      </button>
      {visible && (
        <div
          className={`tooltip-trigger__bubble tooltip-trigger__bubble--${position}`}
          aria-hidden="true"
        >
          <Tooltip label={label} theme={theme} arrow={arrow} />
        </div>
      )}
    </div>
  );
};
