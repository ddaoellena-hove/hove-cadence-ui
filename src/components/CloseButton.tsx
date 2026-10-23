import { GhostButton } from "./GhostButton";
import "./close-button.css";

// Composant interne (non exporté par index.ts) : croix de fermeture commune
// aux surcouches et bandeaux (Modal, Drawer, Popover, InlineAlert, AlertToast)
// et au retrait d'un fichier (FileUpload).
// GhostButton icône seule, sans infobulle : la croix se passe de légende, son
// nom reste porté par aria-label.

export interface CloseButtonProps {
  onClick: () => void;
  /** Nom accessible. Défaut « Fermer ». */
  "aria-label"?: string;
  className?: string;
}

export const CloseButton = ({ onClick, "aria-label": ariaLabel = "Fermer", className }: CloseButtonProps) => (
  <GhostButton
    size="sm"
    icon="x-close"
    aria-label={ariaLabel}
    onClick={() => onClick()}
    className={["close-button", className].filter(Boolean).join(" ")}
  />
);
