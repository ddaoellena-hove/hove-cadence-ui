/**
 * Drawer component.
 *
 * Panneau latéral droit pour consulter le détail d'un élément sans quitter la
 * liste (≠ Modal, dialogue bloquant). Voile, Échap, clic sur le voile, bouton
 * fermer, piège à focus et retour du focus sont fournis par les primitives de
 * surcouche partagées (voir overlay-primitives.ts).
 *
 * Avec `onSubmit`, corps et pied sont enveloppés dans un <form> : l'action
 * principale devient le bouton de soumission (Entrée dans un champ soumet).
 */
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CloseButton } from "./CloseButton";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import { inertProps } from "./inert-props";
import { OverlayPortal, useOverlay } from "./overlay-primitives";
import "./drawer.css";
import "./scrollbar.css";

/** Action du pied du Drawer. */
export interface DrawerAction {
  /** Libellé du bouton. */
  label: string;
  /** Clic. Facultatif pour l'action principale d'un Drawer formulaire (`onSubmit`). */
  onClick?: () => void;
  /** Style destructif pour l'action principale. */
  destructive?: boolean;
  /** Envoi en cours : spinner, clics ignorés, largeur conservée. */
  loading?: boolean;
  /** Désactive l'action sans supprimer sa place dans le pied. */
  disabled?: boolean;
}

export interface DrawerProps {
  /** Contrôle la visibilité. */
  isOpen: boolean;
  /** Appelé sur Échap, clic voile ou bouton fermer. */
  onClose: () => void;
  /** Titre du panneau. */
  title: string;
  /** Sous-titre sous le titre. */
  subtitle?: string;
  /** Contenu défilant du corps. */
  children: ReactNode;
  /** Action principale du pied → PrimaryButton (destructive → tone="danger"). */
  primaryAction?: DrawerAction;
  /** Action secondaire du pied → GhostButton (« Fermer », « Annuler »). */
  secondaryAction?: DrawerAction;
  /** Contenu de pied composé ; remplace les actions standard. Hors du corps défilant. */
  footer?: ReactNode;
  /** Largeur : "md" 480px (défaut), "lg" 720px (formulaire, contenu dense). */
  width?: "md" | "intermediate" | "lg";
  headerContent?: ReactNode;
  navigation?: { current: number; total: number; onPrevious: () => void; onNext: () => void };
  /**
   * Fait du panneau un formulaire : corps et pied dans un <form>, l'action
   * principale devient type="submit". L'app appelle preventDefault et valide.
   */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Classe CSS additionnelle sur le panneau. */
  className?: string;
}

// Durée de l'entrée / sortie, cohérente avec la Sidebar (250 ms).
const TRANSITION_MS = 250;

export const Drawer = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryAction,
  footer,
  width = "md",
  headerContent, navigation,
  onSubmit,
  className,
}: DrawerProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // `mounted` garde le panneau dans le DOM pendant la sortie ; `entered`
  // pilote le glissement (transform). Les ouvertures/fermetures s'ajustent
  // pendant le rendu (pattern React), jamais par un setState synchrone en effet.
  // `entered` part toujours de false : un panneau monté déjà ouvert (chargement
  // différé, changement de clé) glisse lui aussi depuis sa position fermée.
  const [mounted, setMounted] = useState(isOpen);
  const [entered, setEntered] = useState(false);

  if (isOpen && !mounted) setMounted(true);
  if (!isOpen && entered) setEntered(false);

  // Entrée : une fois monté, passe en position ouverte à la frame suivante.
  useEffect(() => {
    if (!(mounted && isOpen)) return;
    // Force le calcul de la position fermée (translateX(100%)) avant de passer
    // ouvert : sinon le navigateur peut appliquer directement l'état final, sans
    // glissement, selon ce que les enfants ont mesuré ou non pendant le montage.
    panelRef.current?.getBoundingClientRect();
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [mounted, isOpen]);

  // Sortie : démontage après l'animation (le setState est asynchrone).
  useEffect(() => {
    if (isOpen || !mounted) return;
    const timer = window.setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, mounted]);

  // Comportement modal commun : seulement tant que réellement ouvert.
  useOverlay({ isOpen: isOpen && mounted, onClose, surfaceRef: panelRef });

  if (!mounted) return null;

  const showFooter = footer != null || primaryAction || secondaryAction;
  const panelClass = [
    "drawer__panel",
    `drawer__panel--${width}`,
    entered ? "drawer__panel--open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {/* Corps défilant */}
      <div className="drawer__body cadence-scrollbar" tabIndex={0}>{children}</div>

      {/* Pied fixe */}
      {showFooter && (
        <div className="drawer__footer">
          {footer != null ? footer : <>
          {secondaryAction && (
            <GhostButton label={secondaryAction.label} onClick={secondaryAction.onClick} disabled={secondaryAction.disabled} />
          )}
          {primaryAction && (
            <PrimaryButton
              label={primaryAction.label}
              onClick={primaryAction.onClick}
              tone={primaryAction.destructive ? "danger" : "default"}
              loading={primaryAction.loading}
              disabled={primaryAction.disabled}
              type={onSubmit ? "submit" : "button"}
            />
          )}
          </>}
        </div>
      )}
    </>
  );

  return (
    <OverlayPortal>
      <div className={`drawer__scrim${entered ? " drawer__scrim--open" : ""}`} onClick={onClose}>
        <div
          ref={panelRef}
          className={panelClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          // Pendant la sortie animée (encore monté mais fermé), le panneau est
          // inerte : il ne retient pas le focus, qui revient au déclencheur.
          {...inertProps(!isOpen)}
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête fixe */}
          <div className="drawer__header">
            <div className="drawer__heading">
              <h2 id={titleId} className="drawer__title">
                {title}
              </h2>
              {subtitle && <p className="drawer__subtitle">{subtitle}</p>}
            </div>
            <CloseButton onClick={onClose} />
            {headerContent && <div className="drawer__header-content">{headerContent}</div>}
            {/* Navigation sur une seconde ligne, alignée à droite sous la croix. */}
            {navigation && (
              <nav className="drawer__navigation" aria-label="Navigation entre les éléments">
                <GhostButton size="sm" icon="chevron-left" aria-label="Élément précédent" disabled={navigation.current <= 1} onClick={navigation.onPrevious} />
                <span role="status" aria-atomic="true">
                  {navigation.current} sur {navigation.total}
                </span>
                <GhostButton size="sm" icon="chevron-right" aria-label="Élément suivant" disabled={navigation.current >= navigation.total} onClick={navigation.onNext} />
              </nav>
            )}
          </div>

          {onSubmit ? (
            <form className="drawer__form" onSubmit={onSubmit}>
              {content}
            </form>
          ) : (
            content
          )}
        </div>
      </div>
    </OverlayPortal>
  );
};
