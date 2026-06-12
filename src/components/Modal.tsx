import React, { useEffect } from "react";
import { PrimaryButton } from "./PrimaryButton";
import "./modal.css";

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
  /** Body content. */
  children: React.ReactNode;
  /**
   * Primary action (right button in footer).
   * Uses PrimaryButton — size medium, as per guidelines.
   */
  primaryAction?: ModalAction;
  /**
   * Secondary action (left button in footer, rendered as outline).
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
  children,
  primaryAction,
  secondaryAction,
  size = "medium",
  hideCloseButton = false,
}: ModalProps) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const showHeader = title || !hideCloseButton;
  const showFooter = primaryAction || secondaryAction;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* ── Frame (#002830, padding 3px) ── */}
      <div
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header — transparent, texte blanc sur fond sombre ── */}
        {showHeader && (
          <div className="modal__header">
            {title && (
              <h2 id="modal-title" className="modal__title">
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
          <div className="modal__body">{children}</div>

          {showFooter && (
            <div className="modal__footer">
              {secondaryAction && (
                <PrimaryButton
                  outline
                  label={secondaryAction.label}
                  onClick={secondaryAction.onClick}
                />
              )}
              {primaryAction && (
                <PrimaryButton
                  label={primaryAction.label}
                  onClick={primaryAction.onClick}
                  destructive={primaryAction.destructive}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
