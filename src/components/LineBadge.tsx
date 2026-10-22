/**
 * LineBadge component.
 *
 * Pastille d'identité d'une ligne de transport. ⚠️ Seule exception à la règle
 * « tokens uniquement » : la couleur vient des données (GTFS route_color /
 * route_text_color), jamais d'un token. Sans `textColor`, la couleur du texte
 * est calculée pour atteindre 4,5:1 (voir line-badge-utils).
 */
import { useEffect, type CSSProperties } from "react";
import { normalizeLineColor, pickTextColor } from "./line-badge-utils";
import "./line-badge.css";

export type LineMode = "metro" | "rer" | "train" | "tram" | "bus" | "car" | "bateau" | "navette";

export interface LineBadgeProps {
  /** Code court de la ligne (« 13 », « RER A », « T3b »). */
  code: string;
  /** Mode de transport : contribue au nom accessible. */
  mode?: LineMode;
  /** Couleur de fond (GTFS route_color). Sans elle : encre neutre. */
  color?: string;
  /** Couleur du texte (GTFS route_text_color). Sinon calculée pour AA. */
  textColor?: string;
  /** Gabarit. Défaut "md". */
  size?: "sm" | "md";
  /** Classe CSS additionnelle. */
  className?: string;
}

/** Libellé FR du mode, pour le nom accessible. */
const MODE_LABEL: Record<LineMode, string> = {
  metro: "métro",
  rer: "RER",
  train: "train",
  tram: "tramway",
  bus: "bus",
  car: "car",
  bateau: "bateau",
  navette: "navette",
};

export const LineBadge = ({ code, mode, color: colorProp, textColor: textColorProp, size = "md", className }: LineBadgeProps) => {
  const color = colorProp ? normalizeLineColor(colorProp) ?? undefined : undefined;
  const textColor = textColorProp ? normalizeLineColor(textColorProp) ?? undefined : undefined;
  // Forme ronde pour un code court, pilule au-delà.
  const round = code.replace(/\s/g, "").length <= 3;

  // Couleur de texte : fournie (on fait confiance aux données), sinon calculée.
  const computed = color && !textColor ? pickTextColor(color) : null;
  const resolvedText = textColor ?? computed?.color;
  // Contraste insuffisant même au mieux : liseré pour détacher du fond.
  const needsOutline = Boolean(computed && !computed.ok);

  // Avertissement en développement si aucune couleur de texte n'atteint AA.
  useEffect(() => {
    if (import.meta.env.DEV && needsOutline && color) {
      console.warn(
        `[cadence-ui] LineBadge : aucune couleur de texte n'atteint 4,5:1 sur ${color} (ligne « ${code} »). Un liseré est ajouté ; fournissez un route_text_color plus contrasté.`,
      );
    }
  }, [needsOutline, color, code]);

  const style: CSSProperties | undefined = color
    ? { background: color, color: resolvedText }
    : undefined;

  const rootClass = [
    "line-badge",
    `line-badge--${size}`,
    round ? "line-badge--round" : "line-badge--pill",
    color ? "" : "line-badge--default",
    needsOutline ? "line-badge--outline" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const accessibleName = mode ? `Ligne ${code}, ${MODE_LABEL[mode]}` : `Ligne ${code}`;

  return (
    <span className={rootClass} style={style} aria-label={accessibleName} role="img">
      <span aria-hidden="true" className="line-badge__code">
        {code}
      </span>
    </span>
  );
};
