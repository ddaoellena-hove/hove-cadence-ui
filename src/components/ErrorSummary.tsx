import { forwardRef, useEffect, useId, useImperativeHandle, useRef, type RefObject } from "react";
import { InlineAlert } from "./InlineAlert";
import { Link } from "./Link";
import "./error-summary.css";

export interface SummaryError {
  /** Identifiant stable et unique de l'erreur. */
  id: string;
  message: string;
  /** Id DOM ou ref vers le champ focusable. Sans cible : texte simple. */
  target?: string | RefObject<HTMLElement | null>;
}

export interface ErrorSummaryProps {
  errors: SummaryError[];
  title?: string;
  /** Focus à l'apparition. Pour une nouvelle soumission, focaliser la ref. */
  focusOnMount?: boolean;
  className?: string;
}

/** Résumé de soumission invalide. Ne calcule pas les erreurs du formulaire. */
export const ErrorSummary = forwardRef<HTMLDivElement, ErrorSummaryProps>(
  ({ errors, title = "Corrigez les champs suivants", focusOnMount = true, className }, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const hasErrors = errors.length > 0;
    useImperativeHandle(ref, () => rootRef.current!);
    useEffect(() => {
      if (hasErrors && focusOnMount) rootRef.current?.focus();
    }, [hasErrors, focusOnMount]);

    if (!hasErrors) return null;
    const focusTarget = (target: NonNullable<SummaryError["target"]>) => {
      const element = typeof target === "string" ? document.getElementById(target) : target.current;
      if (!element) return;
      const selector = "input, select, textarea, button, a[href], [tabindex]";
      const candidates = [element, ...element.querySelectorAll<HTMLElement>(selector)];
      const control = candidates.find((candidate) => candidate.matches(selector)
        && !candidate.matches(":disabled, input[type=hidden]")
        && !candidate.closest("[inert]")
        && candidate.getClientRects().length > 0
        && getComputedStyle(candidate).visibility !== "hidden");
      control?.focus();
    };
    return (
      <div ref={rootRef} tabIndex={-1} role="region" aria-labelledby={titleId}
        className={["error-summary", className].filter(Boolean).join(" ")}>
        <InlineAlert type="error">
          <h2 id={titleId} className="error-summary__title">{title}</h2>
          <ul className="error-summary__list">
            {errors.map((error) => <li key={error.id}>
              {error.target ? <Link hideArrow onClick={() => focusTarget(error.target!)}>{error.message}</Link> : error.message}
            </li>)}
          </ul>
        </InlineAlert>
      </div>
    );
  },
);
ErrorSummary.displayName = "ErrorSummary";
