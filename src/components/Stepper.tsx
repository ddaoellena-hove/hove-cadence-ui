/**
 * Stepper component.
 *
 * Fil des étapes d'un processus (formulaire, import). Horizontal (haut de page)
 * ou vertical (dans un Drawer). Les étapes complétées sont cliquables pour y
 * revenir. L'étape courante porte `aria-current="step"`.
 *
 * `density="compact"` : rangée d'icônes pour un pied d'actions, libellé actif à
 * droite, nom complet au survol et au focus. Le produit décide de la
 * disponibilité de chaque étape (`available`) ; aucune validation ici.
 */
import type { ReactNode } from "react";
import { Icons, type IconName } from "./Icons";
import { Tooltip } from "./Tooltip";
import "./stepper.css";

export type StepState = "upcoming" | "current" | "completed" | "error" | "warning";

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  state: StepState;
  /** Icône de l'étape, à la place du numéro. */
  icon?: IconName;
  /** Étape accessible par `onStepClick`. Défaut : seulement si `completed`. */
  available?: boolean;
}

export interface StepperProps {
  steps: StepperStep[];
  /** Orientation. Défaut "horizontal". */
  orientation?: "horizontal" | "vertical";
  /** Densité. "compact" ignore `orientation` et `description`. Défaut "default". */
  density?: "default" | "compact";
  /** Contexte affiché avant le libellé actif en densité compacte : « Impact n° 2 ». */
  context?: ReactNode;
  /** Côté de l'infobulle en densité compacte. Défaut "top" (pied de page). */
  tooltipPlacement?: "top" | "bottom";
  /** Clic sur une étape accessible (terminée, ou `available`). */
  onStepClick?: (id: string) => void;
  /** Classe CSS additionnelle. */
  className?: string;
}

const STATE_LABEL: Record<StepState, string> = {
  upcoming: "À venir", current: "En cours", completed: "Terminée", error: "En erreur", warning: "À vérifier",
};

const CheckMark = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 7.5l2.5 2.5L11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorMark = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M10 4L4 10M4 4l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/** Contenu du marqueur selon l'état (numéro, coche ou croix). */
const marker = (step: StepperStep, index: number): ReactNode => {
  if (step.state === "completed") return <CheckMark />;
  if (step.state === "warning") return <span aria-hidden="true">!</span>;
  if (step.state === "error") return <ErrorMark />;
  if (step.icon) return <Icons icon={step.icon} size={14} />;
  return <span aria-hidden="true">{index + 1}</span>;
};

const isClickable = (step: StepperStep, onStepClick?: (id: string) => void) =>
  Boolean(onStepClick) && step.state !== "current" && (step.available ?? step.state === "completed");

/** Pastille d'état : forme distincte, pour ne pas reposer sur la seule couleur. */
const compactPip = (state: StepState): ReactNode => {
  if (state === "completed") return <Icons icon="check" size={8} />;
  if (state === "error") return <Icons icon="x-close" size={8} />;
  if (state === "warning") return "!";
  return null;
};

const CompactStepper = ({ steps, context, tooltipPlacement = "top", onStepClick, className }: StepperProps) => {
  const total = steps.length;
  const currentIndex = steps.findIndex((step) => step.state === "current");
  const current = steps[currentIndex];

  return (
    <div className={["stepper-compact", className].filter(Boolean).join(" ")}>
      <ol className={`stepper stepper--compact stepper--tip-${tooltipPlacement}`}>
        {steps.map((step, index) => {
          const clickable = isClickable(step, onStepClick);
          const name = `${index + 1}/${total} · ${step.label} — ${STATE_LABEL[step.state]}`;
          const pip = compactPip(step.state);
          return (
            <li key={step.id} className={`stepper__step stepper__step--${step.state}`} aria-current={step.state === "current" ? "step" : undefined}>
              {/* aria-disabled et non disabled : l'étape reste atteignable au
                  clavier, pour lire son nom complet dans l'infobulle */}
              <button
                type="button"
                className="stepper__compact-button"
                aria-label={name}
                aria-disabled={clickable || step.state === "current" ? undefined : true}
                onClick={clickable ? () => onStepClick?.(step.id) : undefined}
              >
                {step.icon ? <Icons icon={step.icon} size={16} /> : <span aria-hidden="true">{index + 1}</span>}
                {pip && <span className="stepper__pip" aria-hidden="true">{pip}</span>}
              </button>
              <span className="stepper__tip" aria-hidden="true">
                <Tooltip label={step.label} theme="light" arrow={tooltipPlacement === "top" ? "bottom" : "top"} />
              </span>
            </li>
          );
        })}
      </ol>
      {(context || current) && (
        <p className="stepper__context" aria-live="polite">
          {context}
          {context && current && " · "}
          {current && <>{currentIndex + 1}/{total} · <strong>{current.label}</strong></>}
        </p>
      )}
    </div>
  );
};

export const Stepper = (props: StepperProps) => {
  const { steps, orientation = "horizontal", density = "default", onStepClick, className } = props;
  if (density === "compact") return <CompactStepper {...props} />;

  const rootClass = ["stepper", `stepper--${orientation}`, className].filter(Boolean).join(" ");

  return (
    <ol className={rootClass}>
      {steps.map((step, index) => {
        const clickable = isClickable(step, onStepClick);
        const Marker = (
          <span className="stepper__marker" aria-hidden="true">
            {marker(step, index)}
          </span>
        );
        const labelBlock = (
          <span className="stepper__text">
            <span className="stepper__label">{step.label}</span>
            <span className="stepper__state">{STATE_LABEL[step.state]}</span>
            {step.description && <span className="stepper__description">{step.description}</span>}
          </span>
        );
        return (
          <li
            key={step.id}
            className={`stepper__step stepper__step--${step.state}`}
            aria-current={step.state === "current" ? "step" : undefined}
          >
            {clickable ? (
              <button type="button" className="stepper__item stepper__item--clickable" onClick={() => onStepClick?.(step.id)}>
                {Marker}
                {labelBlock}
              </button>
            ) : (
              <span className="stepper__item">
                {Marker}
                {labelBlock}
              </span>
            )}
            {index < steps.length - 1 && <span className="stepper__connector" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
};
