/**
 * ColorField component.
 *
 * Saisie d'une couleur de ligne GTFS (`route_color`), avec `route_text_color`
 * optionnel. Champ de 40 px : pastille qui ouvre un sélecteur HEX dans un
 * Popover (zone saturation / luminosité, réglette de teinte, champ HEX), champ
 * hex validé (avec ou sans `#`) et aperçu `LineBadge` en direct. Le contraste texte/fond
 * est contrôlé via `line-badge-utils` : sous 4,5:1 l'aide passe en erreur et un
 * bouton « Calculer la couleur du texte » propose une couleur lisible.
 */
import { forwardRef, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { LineBadge, type LineMode } from "./LineBadge";
import { GhostButton } from "./GhostButton";
import { Popover } from "./Popover";
import { TextInput } from "./TextInput";
import { normalizeLineColor, contrastRatio, pickTextColor, AA_RATIO } from "./line-badge-utils";
import { clamp, hexToHsv, hsvToHex, type Hsv } from "./color-field-utils";
import "./color-field.css";

export interface ColorFieldProps {
  /** Libellé visible du champ. */
  label: string;
  /** Couleur de fond hex (avec ou sans `#`). */
  value: string;
  /** Appelé avec la couleur normalisée `#RRGGBB`. */
  onChange: (hex: string) => void;
  /** Couleur de texte GTFS (route_text_color), si fournie. */
  textColor?: string;
  /** Appelé par « Calculer la couleur du texte ». */
  onTextColorChange?: (hex: string) => void;
  /** Code affiché dans l'aperçu `LineBadge`. Défaut « 00 ». */
  previewCode?: string;
  /** Mode de l'aperçu (nom accessible du badge). */
  previewMode?: LineMode;
  /** Message d'aide, remplacé par l'erreur de validation/contraste. */
  helperText?: string;
  /** État du champ. "error" force le rendu d'erreur. */
  state?: "enabled" | "error";
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

/** Dégradé de la réglette de teinte (spectre complet). */
const HUE_GRADIENT = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map((h) => `hsl(${h} 100% 50%)`).join(", ")})`;

/**
 * Sélecteur HEX (interne) : zone saturation / luminosité, réglette de teinte et
 * champ HEX. Chaque changement est transmis aussitôt (`onChange`, texte hex).
 */
const ColorPicker = ({ value, onChange }: { value: string | null; onChange: (hex: string) => void }) => {
  // HSV de travail : conserve la teinte quand la couleur passe par le gris.
  const [hsv, setHsv] = useState<Hsv>(() => (value && hexToHsv(value)) || { h: 200, s: 60, v: 80 });
  const [hexDraft, setHexDraft] = useState(value ? value.toUpperCase() : "");
  const areaRef = useRef<HTMLDivElement>(null);
  const hexInvalid = hexDraft.trim() !== "" && normalizeLineColor(hexDraft) === null;

  const apply = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setHexDraft(hex);
    onChange(hex);
  };

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    apply({
      ...hsv,
      s: clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100),
      v: clamp(100 - ((e.clientY - rect.top) / rect.height) * 100, 0, 100),
    });
  };

  // Clavier : ←/→ saturation, ↑/↓ luminosité ; Maj = pas de 10.
  const onAreaKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 1;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const d = delta[e.key];
    if (!d) return;
    e.preventDefault();
    apply({ ...hsv, s: clamp(Math.round(hsv.s) + d[0], 0, 100), v: clamp(Math.round(hsv.v) + d[1], 0, 100) });
  };

  const onHexChange = (text: string) => {
    setHexDraft(text);
    const norm = normalizeLineColor(text);
    const next = norm ? hexToHsv(norm) : null;
    if (!next) return;
    setHsv(next);
    onChange(text);
  };

  const s = Math.round(hsv.s);
  const v = Math.round(hsv.v);
  const current = hsvToHex(hsv);

  return (
    <div className="color-picker">
      <div
        ref={areaRef}
        className="color-picker__area"
        role="slider"
        tabIndex={0}
        aria-label="Saturation et luminosité"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={s}
        aria-valuetext={`Saturation ${s} %, luminosité ${v} %`}
        style={{
          background: `linear-gradient(to top, rgb(0 0 0), transparent), linear-gradient(to right, rgb(255 255 255), transparent), hsl(${Math.round(hsv.h)} 100% 50%)`,
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          e.currentTarget.focus();
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture?.(e.pointerId)) fromPointer(e);
        }}
        onKeyDown={onAreaKeyDown}
      >
        <span className="color-picker__thumb" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, background: current }} aria-hidden="true" />
      </div>

      <input
        type="range"
        className="color-picker__hue"
        min={0}
        max={359}
        step={1}
        value={Math.round(hsv.h) % 360}
        aria-label="Teinte"
        aria-valuetext={`Teinte ${Math.round(hsv.h) % 360}°`}
        style={{ background: HUE_GRADIENT }}
        onChange={(e) => apply({ ...hsv, h: Number(e.target.value) })}
      />

      <div className="color-picker__hex-row">
        <span className="color-picker__preview" style={{ background: hexInvalid ? undefined : current }} aria-hidden="true" />
        <TextInput
          className="color-picker__hex"
          label="HEX"
          value={hexDraft}
          placeholder="#6EC4E8"
          state={hexInvalid ? "error" : "enabled"}
          helperText={hexInvalid ? "Format attendu : #RRGGBB." : undefined}
          onChange={(e) => onHexChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export const ColorField = forwardRef<HTMLInputElement, ColorFieldProps>(
  (
    { label, value, onChange, textColor, onTextColorChange, previewCode = "00", previewMode, helperText, state = "enabled", disabled = false, required = false, id, className },
    ref,
  ) => {
    const uid = useId();
    const inputId = id ?? `color-field-${uid}`;
    const messageId = `${inputId}-message`;

    // Brouillon de saisie (l'utilisateur peut taper sans `#`) ; synchronisé sur `value`.
    const [draft, setDraft] = useState(value);
    const [syncedValue, setSyncedValue] = useState(value);
    if (value !== syncedValue) {
      setSyncedValue(value);
      setDraft(value);
    }

    const normalized = normalizeLineColor(draft);
    const invalidHex = draft.trim() !== "" && normalized === null;

    // Contraste : couleur de texte fournie, sinon calculée pour AA.
    const resolvedText = textColor ?? (normalized ? pickTextColor(normalized).color : undefined);
    const ratio = normalized && resolvedText ? contrastRatio(resolvedText, normalized) : null;
    const lowContrast = Boolean(textColor && ratio !== null && ratio < AA_RATIO);

    const hasError = state === "error" || invalidHex || lowContrast;
    const message = invalidHex
      ? "Couleur hexadécimale invalide (ex. « 6EC4E8 » ou « #6EC4E8 »)."
      : lowContrast
        ? `Contraste insuffisant : ${ratio!.toFixed(1)}:1 (minimum 4,5:1).`
        : helperText;

    const commit = (next: string) => {
      setDraft(next);
      const norm = normalizeLineColor(next);
      if (norm) onChange(norm);
    };

    const rootClass = ["color-field", hasError ? "color-field--error" : "", disabled ? "color-field--disabled" : "", className]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={rootClass}>
        <label className="color-field__label" htmlFor={inputId}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>

        <div className="color-field__row">
          <div className="color-field__box">
            {/* Pastille : ouvre le sélecteur HEX (Popover). */}
            <Popover
              title={label}
              width={264}
              renderTrigger={({ ref: triggerRef, toggle }) => (
                <button
                  ref={triggerRef}
                  type="button"
                  className="color-field__swatch"
                  style={normalized ? { background: normalized } : undefined}
                  disabled={disabled}
                  aria-label={`Choisir la couleur — ${label}`}
                  onClick={toggle}
                />
              )}
            >
              <ColorPicker value={normalized} onChange={commit} />
            </Popover>
            <input
              ref={ref}
              id={inputId}
              type="text"
              className="color-field__hex"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="#6EC4E8"
              value={draft}
              disabled={disabled}
              required={required}
              aria-invalid={hasError || undefined}
              aria-describedby={message ? messageId : undefined}
              onChange={(e) => commit(e.target.value)}
            />
          </div>

          {/* Aperçu en direct */}
          <span className="color-field__preview" aria-hidden={normalized ? undefined : true}>
            <LineBadge code={previewCode} mode={previewMode} color={normalized ?? undefined} textColor={textColor} />
          </span>
        </div>

        {message && (
          <p id={messageId} className="color-field__message" role={hasError ? "alert" : undefined}>
            {message}
          </p>
        )}

        {lowContrast && onTextColorChange && normalized && (
          <div className="color-field__action">
            <GhostButton
              size="sm"
              label="Calculer la couleur du texte"
              onClick={() => onTextColorChange(pickTextColor(normalized).color)}
            />
          </div>
        )}
      </div>
    );
  },
);

ColorField.displayName = "ColorField";
