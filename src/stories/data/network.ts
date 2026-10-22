/**
 * Données de démonstration cohérentes pour les stories : lignes (avec leurs
 * couleurs de démonstration), arrêts et perturbations. Les couleurs imitent un
 * réseau francilien à titre d'exemple — elles viennent « des données ».
 */
import type { LineMode } from "../../components/LineBadge";

export interface DemoLine {
  code: string;
  mode: LineMode;
  color: string;
  textColor?: string;
}

// Couleurs de démonstration avec leur `textColor` (route_text_color), choisies
// pour atteindre AA. La story « Contraste calculé » montre, elle, le calcul
// automatique quand `textColor` est absent.
export const LINES: DemoLine[] = [
  { code: "1", mode: "metro", color: "#FFCD00", textColor: "#000000" },
  { code: "4", mode: "metro", color: "#6A0DAD", textColor: "#FFFFFF" },
  { code: "13", mode: "metro", color: "#6EC4E8", textColor: "#000000" },
  { code: "RER A", mode: "rer", color: "#B51A0F", textColor: "#FFFFFF" },
  { code: "RER B", mode: "rer", color: "#1D4E89", textColor: "#FFFFFF" },
  { code: "T3b", mode: "tram", color: "#00704A", textColor: "#FFFFFF" },
  { code: "38", mode: "bus", color: "#005E73", textColor: "#FFFFFF" },
];

export const lineByCode = (code: string): DemoLine =>
  LINES.find((l) => l.code === code) ?? { code, mode: "bus", color: "#005E73", textColor: "#FFFFFF" };

export interface DemoStop {
  name: string;
  id: string;
  city: string;
  lineCodes: string[];
}

export const STOPS: DemoStop[] = [
  { name: "Châtelet", id: "stop_area:IDFM:474151", city: "Paris 1er", lineCodes: ["1", "4", "RER A", "RER B"] },
  { name: "Gare de Lyon", id: "stop_area:IDFM:482837", city: "Paris 12e", lineCodes: ["1", "RER A", "14"] },
  { name: "Nation", id: "stop_area:IDFM:473831", city: "Paris 11e", lineCodes: ["1", "RER A"] },
  { name: "Saint-Lazare", id: "stop_area:IDFM:462872", city: "Paris 8e", lineCodes: ["13", "RER A"] },
  { name: "La Défense", id: "stop_area:IDFM:474008", city: "Puteaux", lineCodes: ["1", "RER A", "T3b"] },
];
