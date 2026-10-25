/**
 * LineBadge component.
 *
 * Pastille d'identité d'une ligne de transport. ⚠️ Seule exception à la règle
 * « tokens uniquement » : la couleur vient des données (GTFS route_color /
 * route_text_color), jamais d'un token. Sans `textColor`, la couleur du texte
 * est calculée et atteint toujours 4,5:1 (blanc, encre ou noir : voir
 * line-badge-utils). Une `textColor` fournie est respectée telle quelle ; si
 * elle n'atteint pas 4,5:1, un avertissement est émis en développement.
 */
import { useEffect, type CSSProperties } from "react";
import { AA_RATIO, contrastRatio, normalizeLineColor, pickTextColor } from "./line-badge-utils";
import { warnOnce } from "./dev-warnings";
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

  // Couleur de texte : fournie (on fait confiance aux données), sinon calculée
  // (toujours AA).
  const resolvedText = textColor ?? (color ? pickTextColor(color).color : undefined);

  // Données GTFS dont le route_text_color ne contraste pas assez : on le
  // respecte, mais on le signale en développement (une fois par couple).
  useEffect(() => {
    if (!color || !textColor) return;
    const ratio = contrastRatio(color, textColor);
    if (ratio >= AA_RATIO) return;
    warnOnce(
      "LineBadge",
      `contrast:${color}/${textColor}`,
      `route_text_color ${textColor} sur ${color} (ligne « ${code} ») : ${ratio.toFixed(2).replace(".", ",")}:1, sous le seuil AA de 4,5:1. Corrigez la donnée, ou omettez textColor pour qu'une couleur lisible soit calculée.`,
    );
  }, [color, textColor, code]);

  const style: CSSProperties | undefined = color
    ? { background: color, color: resolvedText }
    : undefined;

  const rootClass = [
    "line-badge",
    `line-badge--${size}`,
    round ? "line-badge--round" : "line-badge--pill",
    color ? "" : "line-badge--default",
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
