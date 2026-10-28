/**
 * Stepper component.
 *
 * Fil des étapes d'un processus (formulaire, import). Horizontal (haut de page)
 * ou vertical (dans un Drawer). Les étapes complétées sont cliquables pour y
 * revenir. L'étape courante porte `aria-current="step"`.
 */
import type { ReactNode } from "react";
import "./stepper.css";

export type StepState = "upcoming" | "current" | "completed" | "error" | "warning";

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  state: StepState;
}

export interface StepperProps {
  steps: StepperStep[];
  /** Orientation. Défaut "horizontal". */
  orientation?: "horizontal" | "vertical";
  /** Clic sur une étape complétée (revenir en arrière). */
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
  return <span aria-hidden="true">{index + 1}</span>;
};

export const Stepper = ({ steps, orientation = "horizontal", onStepClick, className }: StepperProps) => {
  const rootClass = ["stepper", `stepper--${orientation}`, className].filter(Boolean).join(" ");

  return (
    <ol className={rootClass}>
      {steps.map((step, index) => {
        const clickable = step.state === "completed" && Boolean(onStepClick);
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
