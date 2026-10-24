/**
 * Cadre commun (interne) de Timeline et JourneyTimeline : bandeau « Fenêtre »
 * et sélecteur d'échelle, axe horaire en haut (« 08h15 », pas majeurs en gras),
 * grille verticale, zone défilante horizontalement et aide en pied.
 *
 * Les lignes sont rendues par le composant appelant, avec les classes
 * `timeline-shell__row`, `__gutter` et `__track` ; `pos(v)` donne la position
 * d'une valeur (minutes) en % de la piste, `px(minutes)` une durée en px.
 */
import { useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { SegmentedControl } from "./SegmentedControl";
import { clockTicks, formatClock, formatDuration, formatWindow, pickTickStep, scaleLabel, type TimeMode } from "./timeline-utils";
import "./timeline-shell.css";
import "./scrollbar.css";

/** Props d'échelle et d'aide partagées par Timeline et JourneyTimeline. */
export interface TimelineScaleProps {
  /**
   * Échelles proposées en plus de « Ajuster », en minutes visibles dans la
   * largeur (la zone défile au-delà). Défaut `[60, 30, 15]`. `[]` masque le
   * sélecteur. Une échelle supérieure ou égale à la fenêtre est désactivée.
   */
  scales?: number[];
  /** Échelle initiale : `"fit"` (toute la fenêtre dans la largeur) ou une valeur de `scales`. Défaut `"fit"`. */
  defaultScale?: "fit" | number;
  /** Aide sous la frise. Défaut : phrase adaptée aux interactions. `false` la masque. */
  hint?: string | false;
}

export interface TimelineGeometry {
  /** Position d'une valeur (minutes) en % de la piste. */
  pos: (value: number) => string;
  /** Largeur en px d'une durée (minutes) à l'échelle courante. */
  px: (minutes: number) => number;
}

interface TimelineShellProps {
  mode: TimeMode;
  /** Bornes de la fenêtre, en minutes. */
  min: number;
  max: number;
  scales: number[];
  defaultScale: "fit" | number;
  /** Largeur de la gouttière de libellés (px). */
  gutter: number;
  /** Gouttière collée à gauche au défilement (libellés d'entités). */
  stickyGutter?: boolean;
  /** Hauteur d'une ligne (px). */
  rowHeight: number;
  /** Complément du bandeau : « 3 itinéraires ». */
  meta?: string;
  hint?: string | false;
  /** Calque sous les lignes (annotations, repère « maintenant »), aligné sur la piste. */
  overlay?: (geometry: TimelineGeometry) => ReactNode;
  /**
   * Attributs de la zone qui défile : un appelant sans élément focusable dans
   * ses lignes (TimeSpaceDiagram) y porte son groupe clavier (role, tabIndex,
   * onKeyDown), sinon la zone défilante serait inatteignable au clavier.
   */
  scrollProps?: HTMLAttributes<HTMLDivElement>;
  children: (geometry: TimelineGeometry) => ReactNode;
}

const RIGHT_PAD = 24;
const AXIS_H = 36;
const FALLBACK_WIDTH = 680;

export const TimelineShell = ({
  mode,
  min,
  max,
  scales,
  defaultScale,
  gutter,
  stickyGutter = false,
  rowHeight,
  meta,
  hint,
  overlay,
  scrollProps,
  children,
}: TimelineShellProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState(0);
  const [scale, setScale] = useState<"fit" | number>(defaultScale);

  // Largeur visible, suivie au redimensionnement (pas des graduations, échelle).
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setViewport(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const span = Math.max(1, max - min);
  // Une échelle plus large que la fenêtre n'a pas de sens : retour à « Ajuster ».
  const effective = scale !== "fit" && scale < span ? scale : "fit";
  const visible = (viewport || FALLBACK_WIDTH) - gutter - RIGHT_PAD;
  const plotWidth = effective === "fit" ? visible : (visible * span) / effective;
  const pxPerMinute = Math.max(plotWidth, 1) / span;

  const geometry: TimelineGeometry = {
    pos: (value) => `${((value - min) / span) * 100}%`,
    px: (minutes) => minutes * pxPerMinute,
  };

  const ticks = clockTicks(min, max, pickTickStep(pxPerMinute), mode);

  const canvasStyle = {
    width: effective === "fit" ? "100%" : `${gutter + plotWidth + RIGHT_PAD}px`,
    "--tl-gutter": `${gutter}px`,
    "--tl-right": `${RIGHT_PAD}px`,
    "--tl-axis": `${AXIS_H}px`,
    "--tl-row": `${rowHeight}px`,
  } as CSSProperties;

  return (
    <div className="timeline-shell">
      <div className="timeline-shell__header">
        <p className="timeline-shell__window">
          <span className="timeline-shell__eyebrow">Fenêtre</span>
          <span className="timeline-shell__window-value">{formatWindow(min, max, mode)}</span>
          <span className="timeline-shell__meta">{formatDuration(span)}</span>
          {meta && <span className="timeline-shell__meta">{meta}</span>}
        </p>
        {scales.length > 0 && (
          <div className="timeline-shell__scale">
            <span className="timeline-shell__eyebrow" aria-hidden="true">
              Échelle
            </span>
            <SegmentedControl
              size="sm"
              aria-label="Échelle"
              value={effective === "fit" ? "fit" : String(effective)}
              onChange={(v) => setScale(v === "fit" ? "fit" : Number(v))}
              options={[
                { value: "fit", label: "Ajuster" },
                ...scales.map((s) => ({ value: String(s), label: scaleLabel(s), disabled: s >= span })),
              ]}
            />
          </div>
        )}
      </div>

      <div {...scrollProps} ref={scrollRef} className={`timeline-shell__scroll cadence-scrollbar${scrollProps?.className ? ` ${scrollProps.className}` : ""}`}>
        <div
          className={`timeline-shell__canvas${stickyGutter ? " timeline-shell__canvas--sticky" : ""}`}
          style={canvasStyle}
        >
          {/* Grille : un trait par graduation, plus marqué aux pas majeurs. */}
          <div className="timeline-shell__grid" aria-hidden="true">
            {ticks.map((t) => (
              <span
                key={t.value}
                className={`timeline-shell__gridline${t.major ? " timeline-shell__gridline--major" : ""}`}
                style={{ left: geometry.pos(t.value) }}
              />
            ))}
          </div>

          <div className="timeline-shell__axis" aria-hidden="true">
            <div className="timeline-shell__gutter" />
            <div className="timeline-shell__track">
              {ticks.map((t) => (
                <span
                  key={t.value}
                  className={`timeline-shell__tick${t.major ? " timeline-shell__tick--major" : ""}`}
                  style={{ left: geometry.pos(t.value) }}
                >
                  {formatClock(t.value, mode)}
                </span>
              ))}
            </div>
          </div>

          {overlay && <div className="timeline-shell__overlay">{overlay(geometry)}</div>}

          {children(geometry)}
        </div>
      </div>

      {hint && <p className="timeline-shell__hint">{hint}</p>}
    </div>
  );
};
