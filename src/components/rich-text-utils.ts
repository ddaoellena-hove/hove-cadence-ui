// Modèle du texte riche : un document JSON restreint, seul format stocké. Pas de
// HTML dans les données : le rendu passe par React ou par des nœuds construits
// un à un, jamais par du HTML reçu.

/** Morceau de texte et ses marques. */
export interface RichTextSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  /** Adresse http, https ou mailto. */
  href?: string;
}

export type RichTextBlock =
  | { type: "paragraph"; spans: RichTextSpan[] }
  | { type: "list"; ordered: boolean; items: RichTextSpan[][] };

export interface RichTextDocument {
  blocks: RichTextBlock[];
}

const SAFE_PROTOCOLS = ["http:", "https:", "mailto:"];

/** Adresse autorisée, ou null : tout autre protocole est refusé (javascript:, data:…). */
export const safeHref = (url: string): string | null => {
  try {
    const parsed = new URL(url.trim());
    return SAFE_PROTOCOLS.includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
};

const sameMarks = (a: RichTextSpan, b: RichTextSpan) =>
  Boolean(a.bold) === Boolean(b.bold) && Boolean(a.italic) === Boolean(b.italic) && a.href === b.href;

/** Fusionne les morceaux voisins de mêmes marques et retire les vides. */
export const mergeSpans = (spans: RichTextSpan[]): RichTextSpan[] =>
  spans.reduce<RichTextSpan[]>((merged, span) => {
    if (!span.text) return merged;
    const last = merged[merged.length - 1];
    if (last && sameMarks(last, span)) merged[merged.length - 1] = { ...last, text: last.text + span.text };
    else merged.push(span);
    return merged;
  }, []);

const spansText = (spans: RichTextSpan[]) => spans.map((span) => span.text).join("");

const spansPlainText = (spans: RichTextSpan[]) =>
  spans
    .map((span) => {
      if (!span.href) return span.text;
      const target = span.href.replace(/^mailto:/, "");
      return span.text === target || span.text === span.href ? span.text : `${span.text} (${target})`;
    })
    .join("");

/** Sortie texte simple, pour les canaux qui n'acceptent pas la mise en forme. */
export const richTextToPlainText = (document: RichTextDocument): string =>
  document.blocks
    .map((block) =>
      block.type === "paragraph"
        ? spansPlainText(block.spans)
        : block.items.map((item, index) => `${block.ordered ? `${index + 1}.` : "-"} ${spansPlainText(item)}`).join("\n"),
    )
    .join("\n\n");

/** Une ligne de texte devient un paragraphe. */
export const plainTextToRichText = (text: string): RichTextDocument => ({
  blocks: text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) => ({ type: "paragraph", spans: [{ text: line }] })),
});

/** Nombre de caractères du contenu, sans les puces ni les adresses. */
export const richTextLength = (document: RichTextDocument): number =>
  document.blocks.reduce(
    (total, block) =>
      total + (block.type === "paragraph" ? spansText(block.spans).length : block.items.reduce((sum, item) => sum + spansText(item).length, 0)),
    0,
  );

export const isRichTextEmpty = (document: RichTextDocument): boolean => richTextLength(document) === 0;
