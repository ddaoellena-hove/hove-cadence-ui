/**
 * RichTextEditor — saisie de texte enrichi : paragraphes, gras, italique, listes
 * et liens. Le format stocké est un `RichTextDocument` (JSON), jamais du HTML :
 * voir rich-text-utils.ts. RichTextContent affiche ce format sans éditeur.
 *
 * S'appuie sur `contentEditable` et les commandes du navigateur (historique
 * d'annulation natif). Le contenu est relu à chaque saisie par une liste
 * blanche ; le collage passe par la même lecture.
 */
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { GhostButton } from "./GhostButton";
import { Icons, type IconName } from "./Icons";
import { PrimaryButton } from "./PrimaryButton";
import { TextInput } from "./TextInput";
import { readRichText, readRichTextHtml, writeRichText } from "./rich-text-dom";
import { isRichTextEmpty, plainTextToRichText, richTextLength, safeHref, type RichTextDocument, type RichTextSpan } from "./rich-text-utils";
import "./rich-text-editor.css";

// ── Rendu en lecture ───────────────────────────────────────────────────────────

const Spans = ({ spans }: { spans: RichTextSpan[] }) => (
  <>
    {spans.map((span, index) => {
      let node: ReactNode = span.text;
      if (span.italic) node = <em>{node}</em>;
      if (span.bold) node = <strong>{node}</strong>;
      // Données possiblement anciennes ou modifiées : l'adresse est revérifiée
      const href = span.href ? safeHref(span.href) : null;
      if (href) node = <a href={href} target="_blank" rel="noopener noreferrer">{node}</a>;
      return <span key={index}>{node}</span>;
    })}
  </>
);

export interface RichTextContentProps {
  value: RichTextDocument;
  className?: string;
}

/** Affiche un document sans éditeur : lisible partout, sans HTML injecté. */
export const RichTextContent = ({ value, className }: RichTextContentProps) => (
  <div className={["rich-text-content", className].filter(Boolean).join(" ")}>
    {value.blocks.map((block, index) => {
      if (block.type === "paragraph") return <p key={index}><Spans spans={block.spans} /></p>;
      const List = block.ordered ? "ol" : "ul";
      return <List key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}><Spans spans={item} /></li>)}</List>;
    })}
  </div>
);

// ── Barre d'outils ─────────────────────────────────────────────────────────────

interface ToolProps {
  name: string;
  icon?: IconName;
  focusable: boolean;
  disabled: boolean;
  pressed?: boolean;
  onClick: () => void;
}

const Tool = ({ name, icon, focusable, disabled, pressed, onClick }: ToolProps) => (
  <button
    type="button"
    className="rich-text-editor__tool"
    aria-label={name}
    title={name}
    aria-pressed={pressed}
    tabIndex={focusable ? 0 : -1}
    disabled={disabled}
    // Le clic ne doit pas retirer la sélection de l'éditeur
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
  >
    {icon ? <Icons icon={icon} size={16} /> : <span aria-hidden="true">1.</span>}
  </button>
);

// ── Éditeur ────────────────────────────────────────────────────────────────────

export interface RichTextEditorProps {
  label: string;
  value: RichTextDocument;
  onChange?: (value: RichTextDocument) => void;
  placeholder?: string;
  /** Message d'aide sous le champ. */
  helperText?: string;
  /** Erreur fournie par l'app ; prioritaire sur `helperText`. */
  error?: string;
  /** Champ obligatoire : marque le libellé. La validation reste à l'app. */
  required?: boolean;
  /** Affiche un compteur. La saisie n'est pas bloquée : l'app valide le dépassement. */
  maxLength?: number;
  disabled?: boolean;
  /** Affiche le contenu sans barre d'outils ni édition. */
  readOnly?: boolean;
  className?: string;
}

type Command = "bold" | "italic" | "insertUnorderedList" | "insertOrderedList";
const COMMANDS: Command[] = ["bold", "italic", "insertUnorderedList", "insertOrderedList"];
type ActiveState = Partial<Record<Command | "link", boolean>>;

// document.execCommand reste la seule API qui conserve l'historique natif
// d'annulation d'un contentEditable.
const exec = (command: string, argument?: string) => document.execCommand(command, false, argument);

const selectionLink = (root: HTMLElement | null) => {
  const node = window.getSelection()?.anchorNode;
  const element = node instanceof Element ? node : node?.parentElement;
  const link = element?.closest("a");
  return link && root?.contains(link) ? link : null;
};

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ label, value, onChange, placeholder, helperText, error, required = false, maxLength, disabled = false, readOnly = false, className }, ref) => {
    const uid = useId();
    const labelId = `${uid}-label`;
    const messageId = `${uid}-message`;
    const counterId = `${uid}-counter`;
    const editorRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => editorRef.current!);
    // Dernier document connu de l'éditeur : réécrire le DOM à chaque frappe
    // perdrait le curseur et l'historique d'annulation.
    const lastValue = useRef<string | null>(null);
    const savedRange = useRef<Range | null>(null);
    const [active, setActive] = useState<ActiveState>({});
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [linkError, setLinkError] = useState("");
    const [toolIndex, setToolIndex] = useState(0);

    useLayoutEffect(() => {
      const serialized = JSON.stringify(value);
      if (readOnly || !editorRef.current || serialized === lastValue.current) return;
      lastValue.current = serialized;
      writeRichText(editorRef.current, value);
    }, [value, readOnly]);

    const refreshActive = () => {
      if (!editorRef.current?.contains(window.getSelection()?.anchorNode ?? null)) return;
      const next: ActiveState = { link: Boolean(selectionLink(editorRef.current)) };
      COMMANDS.forEach((command) => { next[command] = document.queryCommandState(command); });
      setActive(next);
    };

    useEffect(() => {
      document.addEventListener("selectionchange", refreshActive);
      return () => document.removeEventListener("selectionchange", refreshActive);
    });

    const emit = () => {
      if (!editorRef.current) return;
      const next = readRichText(editorRef.current);
      lastValue.current = JSON.stringify(next);
      onChange?.(next);
    };

    const run = (command: string, argument?: string) => {
      editorRef.current?.focus();
      exec(command, argument);
      refreshActive();
    };

    const openLink = () => {
      const link = selectionLink(editorRef.current);
      if (link) {
        // Sur un lien existant, le bouton le retire
        const range = document.createRange();
        range.selectNodeContents(link);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        run("unlink");
        return;
      }
      const selection = window.getSelection();
      savedRange.current = selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode) ? selection.getRangeAt(0).cloneRange() : null;
      setLinkUrl("");
      setLinkError("");
      setLinkOpen(true);
    };

    const applyLink = () => {
      const href = safeHref(linkUrl);
      if (!href) { setLinkError("Saisissez une adresse http, https ou mailto complète."); return; }
      editorRef.current?.focus();
      const selection = window.getSelection();
      if (savedRange.current) {
        selection?.removeAllRanges();
        selection?.addRange(savedRange.current);
      }
      if (savedRange.current && !savedRange.current.collapsed) {
        exec("createLink", href);
      } else {
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.textContent = linkUrl.trim();
        exec("insertHTML", anchor.outerHTML);
      }
      setLinkOpen(false);
    };

    const closeLink = () => {
      setLinkOpen(false);
      editorRef.current?.focus();
    };

    const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const html = event.clipboardData.getData("text/html");
      const pasted = html ? readRichTextHtml(html) : plainTextToRichText(event.clipboardData.getData("text/plain"));
      if (isRichTextEmpty(pasted)) return;
      const holder = document.createElement("div");
      writeRichText(holder, pasted);
      exec("insertHTML", holder.innerHTML);
    };

    const handleEditorKey = (event: KeyboardEvent<HTMLDivElement>) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openLink();
      }
    };

    // Barre d'outils : un seul arrêt de tabulation, flèches pour la parcourir
    const handleToolbarKey = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const buttons = Array.from(toolbarRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
      const next = (toolIndex + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
      event.preventDefault();
      setToolIndex(next);
      buttons[next]?.focus();
    };

    const message = error || helperText;
    const length = richTextLength(value);
    const over = maxLength !== undefined && length > maxLength;
    const describedBy = [message ? messageId : "", maxLength !== undefined ? counterId : ""].filter(Boolean).join(" ") || undefined;
    const rootClass = ["rich-text-editor", error ? "rich-text-editor--error" : "", disabled ? "rich-text-editor--disabled" : "", className].filter(Boolean).join(" ");
    const labelNode = (
      <span id={labelId} className="rich-text-editor__label">
        {label}
        {required && <><span aria-hidden="true"> *</span><span className="rich-text-editor__sr-only"> (obligatoire)</span></>}
      </span>
    );

    if (readOnly) {
      return (
        <div className={rootClass} role="group" aria-labelledby={labelId}>
          {labelNode}
          <RichTextContent value={value} className="rich-text-editor__read" />
        </div>
      );
    }

    return (
      <div className={rootClass}>
        {labelNode}
        <div className="rich-text-editor__box">
          <div ref={toolbarRef} className="rich-text-editor__toolbar" role="toolbar" aria-label={`Mise en forme — ${label}`} onKeyDown={handleToolbarKey}>
            <Tool name="Gras" icon="bold-01" focusable={toolIndex === 0} disabled={disabled} pressed={Boolean(active.bold)} onClick={() => run("bold")} />
            <Tool name="Italique" icon="italic-01" focusable={toolIndex === 1} disabled={disabled} pressed={Boolean(active.italic)} onClick={() => run("italic")} />
            <Tool name="Liste à puces" icon="dotpoints-01" focusable={toolIndex === 2} disabled={disabled} pressed={Boolean(active.insertUnorderedList)} onClick={() => run("insertUnorderedList")} />
            <Tool name="Liste numérotée" focusable={toolIndex === 3} disabled={disabled} pressed={Boolean(active.insertOrderedList)} onClick={() => run("insertOrderedList")} />
            <Tool name={active.link ? "Retirer le lien" : "Ajouter un lien"} icon="link-01" focusable={toolIndex === 4} disabled={disabled} pressed={Boolean(active.link)} onClick={openLink} />
            <Tool name="Annuler" icon="reverse-left" focusable={toolIndex === 5} disabled={disabled} onClick={() => run("undo")} />
            <Tool name="Rétablir" icon="reverse-right" focusable={toolIndex === 6} disabled={disabled} onClick={() => run("redo")} />
          </div>
          {linkOpen && (
            <div className="rich-text-editor__link" onKeyDown={(event) => {
              if (event.key === "Enter") { event.preventDefault(); applyLink(); }
              if (event.key === "Escape") { event.stopPropagation(); closeLink(); }
            }}>
              <TextInput label="Adresse du lien" placeholder="https://" value={linkUrl} state={linkError ? "error" : "enabled"} helperText={linkError || undefined} onChange={(event) => { setLinkUrl(event.target.value); setLinkError(""); }} />
              <div className="rich-text-editor__link-actions">
                <GhostButton size="sm" label="Annuler" onClick={closeLink} />
                <PrimaryButton size="sm" label="Ajouter le lien" onClick={applyLink} />
              </div>
            </div>
          )}
          <div
            ref={editorRef}
            className="rich-text-editor__content rich-text-content"
            role="textbox"
            aria-multiline="true"
            aria-labelledby={labelId}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            aria-required={required || undefined}
            aria-disabled={disabled || undefined}
            contentEditable={!disabled}
            suppressContentEditableWarning
            tabIndex={disabled ? undefined : 0}
            data-placeholder={placeholder}
            data-empty={isRichTextEmpty(value) || undefined}
            onFocus={() => exec("defaultParagraphSeparator", "p")}
            onInput={emit}
            onPaste={handlePaste}
            onKeyDown={handleEditorKey}
          />
        </div>
        {(message || maxLength !== undefined) && (
          <div className="rich-text-editor__footer">
            {message ? <p id={messageId} className={`rich-text-editor__message${error ? " rich-text-editor__message--error" : ""}`}>{message}</p> : <span />}
            {maxLength !== undefined && <span id={counterId} className={`rich-text-editor__counter${over ? " rich-text-editor__counter--over" : ""}`}>{length} / {maxLength}</span>}
          </div>
        )}
      </div>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";
