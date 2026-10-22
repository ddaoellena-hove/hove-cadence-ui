// Attribut `inert` portable entre React 18 et 19.
//
// React 19 connaît `inert` (booléen). React 18 l'ignore comme booléen : `true`
// déclenche un avertissement et n'est pas rendu, alors qu'une chaîne vide est
// transmise telle quelle (`inert=""`). Les props sont typées en objet libre pour
// compiler avec @types/react 18 (sans `inert`) comme 19.
import { version } from "react";

const REACT_MAJOR = Number.parseInt(version, 10);

/** Props `inert` pour une version majeure de React donnée (testable). */
export const inertPropsFor = (major: number, inert: boolean): Record<string, unknown> => {
  if (!inert) return {};
  return major >= 19 ? { inert: true } : { inert: "" };
};

/** À étaler sur l'élément : `<div {...inertProps(!isOpen)}>`. */
export const inertProps = (inert: boolean): Record<string, unknown> => inertPropsFor(REACT_MAJOR, inert);
