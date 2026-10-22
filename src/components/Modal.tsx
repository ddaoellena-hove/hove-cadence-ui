import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import { OverlayPortal, useOverlay } from "./overlay-primitives";
import "./modal.css";
import "./scrollbar.css";

export interface ModalAction {
  /** Button label. */
  label: string;
  /** Click handler. */
  onClick: () => void;
  /** Apply destructive styling to the primary action. */
  destructive?: boolean;
}

export interface ModalProps {
  /** Controls visibility. */
  isOpen: boolean;
  /** Called when the user clicks the backdrop or the close button. */
  onClose: () => void;
  /** Modal heading. */
  title?: string;
  /** Nom accessible lorsque le titre visuel est absent. */
  "aria-label"?: string;
  /** Body content. */
  children: React.ReactNode;
  /**
   * Primary action (right button in footer).
   * Bouton principal du pied (PrimaryButton md ; `destructive` → tone="danger").
   */
  primaryAction?: ModalAction;
  /**
   * Action secondaire (à gauche dans le pied, rendue en GhostButton).
   * Typically « Annuler » or a reversible action.
   */
  secondaryAction?: ModalAction;
  /** Modal width variant. Defaults to "medium". */
  size?: "small" | "medium" | "large";
  /** Hide the × close button in the header. */
  hideCloseButton?: boolean;
}

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M12 4L4 12M4 4l8 8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const Modal = ({
  isOpen,
  onClose,
  title,
  "aria-label": ariaLabel,
  children,
  primaryAction,
  secondaryAction,
  size = "medium",
  hideCloseButton = false,
}: ModalProps) => {
  // Échap, piège à focus, retour du focus, verrouillage du défilement et inert :
  // comportement commun mutualisé avec Drawer (voir overlay-primitives.ts).
  const titleId = useId();
  const frameRef = useRef<HTMLDivElement>(null);
  useOverlay({ isOpen, onClose, surfaceRef: frameRef });

  // Corps qui défile : rendu focusable pour défiler au clavier, seulement dans
  // ce cas (sinon il s'ajouterait inutilement à l'ordre de tabulation).
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!isOpen || !body) return;
    setScrollable(body.scrollHeight > body.clientHeight + 1);
  }, [isOpen, children]);

  if (!isOpen) return null;

  const showHeader = title || !hideCloseButton;
  const showFooter = primaryAction || secondaryAction;

  return (
    <OverlayPortal>
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : ariaLabel || "Dialogue"}
    >
      {/* ── Frame (#002830, padding 3px) ── */}
      <div
        ref={frameRef}
        tabIndex={-1}
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header — transparent, texte blanc sur fond sombre ── */}
        {showHeader && (
          <div className="modal__header">
            {title && (
              <h2 id={titleId} className="modal__title">
                {title}
              </h2>
            )}
            {!hideCloseButton && (
              <button
                className="modal__close"
                onClick={onClose}
                aria-label="Fermer"
                type="button"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {/* ── Inner — fond blanc, border-radius 9px ── */}
        <div className="modal__inner">
          <div ref={bodyRef} className="modal__body cadence-scrollbar" tabIndex={scrollable ? 0 : undefined}>
            {children}
          </div>

          {showFooter && (
            <div className="modal__footer">
              {secondaryAction && (
                <GhostButton label={secondaryAction.label} onClick={secondaryAction.onClick} />
              )}
              {primaryAction && (
                <PrimaryButton
                  label={primaryAction.label}
                  onClick={primaryAction.onClick}
                  tone={primaryAction.destructive ? "danger" : "default"}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </OverlayPortal>
  );
};
