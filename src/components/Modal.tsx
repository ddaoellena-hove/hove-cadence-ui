import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { CloseButton } from "./CloseButton";
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
  /** Désactive l'action tout en la gardant visible. */
  disabled?: boolean;
  /** Envoi en cours. */
  loading?: boolean;
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
  children: ReactNode;
  /**
   * Primary action (right button in footer).
   * Bouton principal du pied (PrimaryButton md ; `destructive` → tone="danger").
   */
  primaryAction?: ModalAction;
  /**
   * Action secondaire (à gauche dans le pied, rendue en PrimaryButton outline).
   * Typically « Annuler » or a reversible action.
   */
  secondaryAction?: ModalAction;
  /** Pied composé, prioritaire sur les actions standard, hors du corps défilant. */
  footer?: ReactNode;
  /** Modal width variant. Defaults to "medium". */
  size?: "small" | "medium" | "large";
  /** Hide the × close button in the header. */
  hideCloseButton?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  "aria-label": ariaLabel,
  children,
  primaryAction,
  secondaryAction,
  footer,
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
  const showFooter = footer != null || primaryAction || secondaryAction;
  // Message simple (texte seul) : centré, comme une confirmation.
  const isMessage = typeof children === "string";
  const bodyClass = [
    "modal__body",
    "cadence-scrollbar",
    isMessage && "modal__body--message",
    scrollable && "modal__body--scrollable",
  ]
    .filter(Boolean)
    .join(" ");

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
      {/* ── Cadre blanc ── */}
      <div
        ref={frameRef}
        tabIndex={-1}
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── En-tête sur fond discret ── */}
        {showHeader && (
          <div className={`modal__header${title ? "" : " modal__header--no-title"}`}>
            {title && (
              <h2 id={titleId} className="modal__title">
                {title}
              </h2>
            )}
            {!hideCloseButton && <CloseButton onClick={onClose} />}
          </div>
        )}

        <div ref={bodyRef} className={bodyClass} tabIndex={scrollable ? 0 : undefined}>
          {children}
        </div>

        {showFooter && (
          <div className="modal__footer">
            {footer != null ? footer : <>
            {secondaryAction && (
              <PrimaryButton outline label={secondaryAction.label} onClick={secondaryAction.onClick} disabled={secondaryAction.disabled} />
            )}
            {primaryAction && (
              <PrimaryButton
                label={primaryAction.label}
                onClick={primaryAction.onClick}
                tone={primaryAction.destructive ? "danger" : "default"}
                disabled={primaryAction.disabled}
                loading={primaryAction.loading}
              />
            )}
            </>}
          </div>
        )}
      </div>
    </div>
    </OverlayPortal>
  );
};
