// Passage entre le DOM et le modèle (interne à RichTextEditor). La lecture est
// une liste blanche : balises, attributs et styles inconnus disparaissent, leur
// texte seul est conservé. C'est aussi l'assainissement du collage.
import { mergeSpans, safeHref, type RichTextBlock, type RichTextDocument, type RichTextSpan } from "./rich-text-utils";

type Marks = Pick<RichTextSpan, "bold" | "italic" | "href">;

// Contenu sans texte utile : ni leurs enfants ni leur texte ne sont repris
const IGNORED = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "HEAD", "META", "LINK", "TITLE", "IFRAME", "OBJECT", "EMBED", "SVG", "MATH", "IMG", "VIDEO", "AUDIO", "CANVAS"]);
const BLOCKS = new Set(["P", "DIV", "SECTION", "ARTICLE", "HEADER", "FOOTER", "MAIN", "ASIDE", "BLOCKQUOTE", "PRE", "H1", "H2", "H3", "H4", "H5", "H6", "TABLE", "TR", "BODY"]);

const marksOf = (element: HTMLElement, marks: Marks): Marks => {
  const next = { ...marks };
  const tag = element.tagName;
  const weight = element.style?.fontWeight;
  if (tag === "B" || tag === "STRONG" || weight === "bold" || Number(weight) >= 600) next.bold = true;
  if (tag === "I" || tag === "EM" || element.style?.fontStyle === "italic") next.italic = true;
  if (tag === "A") {
    const href = safeHref(element.getAttribute("href") ?? "");
    if (href) next.href = href;
  }
  return next;
};

const cleanText = (text: string) => text.replace(/\u00a0/g, " ").replace(/[\t\r\n ]+/g, " ");

/** Lit un nœud (éditeur ou HTML collé) en ne gardant que ce que le modèle sait porter. */
export const readRichText = (root: Node): RichTextDocument => {
  const blocks: RichTextBlock[] = [];
  let buffer: RichTextSpan[] = [];

  const flush = () => {
    const spans = mergeSpans(buffer);
    buffer = [];
    if (spans.some((span) => span.text.trim() !== "")) blocks.push({ type: "paragraph", spans });
  };

  const readInline = (node: Node, marks: Marks, into: RichTextSpan[], onBreak: () => void) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        into.push({ text: cleanText(child.textContent ?? ""), ...marks });
      } else if (child.nodeType === 1) {
        const element = child as HTMLElement;
        if (IGNORED.has(element.tagName)) return;
        if (element.tagName === "BR") onBreak();
        else readInline(element, marksOf(element, marks), into, onBreak);
      }
    });
  };

  const readList = (list: HTMLElement) => {
    const items: RichTextSpan[][] = [];
    const visit = (parent: HTMLElement) => {
      Array.from(parent.children).forEach((child) => {
        if (child.tagName === "UL" || child.tagName === "OL") { visit(child as HTMLElement); return; }
        if (child.tagName !== "LI") return;
        const nested = Array.from(child.children).filter((el) => el.tagName === "UL" || el.tagName === "OL");
        const clone = child.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("ul, ol").forEach((el) => el.remove());
        const spans: RichTextSpan[] = [];
        readInline(clone, {}, spans, () => spans.push({ text: " " }));
        const merged = mergeSpans(spans);
        if (merged.some((span) => span.text.trim() !== "")) items.push(merged);
        // Les listes imbriquées sont aplaties : le modèle n'a qu'un niveau
        nested.forEach((el) => visit(el as HTMLElement));
      });
    };
    visit(list);
    if (items.length > 0) blocks.push({ type: "list", ordered: list.tagName === "OL", items });
  };

  const readBlock = (node: Node, marks: Marks) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        buffer.push({ text: cleanText(child.textContent ?? ""), ...marks });
        return;
      }
      if (child.nodeType !== 1) return;
      const element = child as HTMLElement;
      const tag = element.tagName;
      if (IGNORED.has(tag)) return;
      if (tag === "BR") flush();
      else if (tag === "UL" || tag === "OL") { flush(); readList(element); }
      else if (BLOCKS.has(tag)) { flush(); readBlock(element, marks); flush(); }
      else readInlineOrBlock(element, marks);
    });
  };

  // Un élément en ligne peut contenir un bloc (<span><div>…) : on redescend alors
  const readInlineOrBlock = (element: HTMLElement, marks: Marks) => {
    const next = marksOf(element, marks);
    if (element.querySelector("p, div, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, table")) readBlock(element, next);
    else readInline(element, next, buffer, flush);
  };

  readBlock(root, {});
  flush();
  return { blocks };
};

/** Lit du HTML reçu (presse-papiers). DOMParser n'exécute ni script ni chargement. */
export const readRichTextHtml = (html: string): RichTextDocument =>
  readRichText(new DOMParser().parseFromString(html, "text/html").body);

const appendSpans = (parent: HTMLElement, spans: RichTextSpan[]) => {
  spans.forEach((span) => {
    let node: Node = document.createTextNode(span.text);
    if (span.italic) { const el = document.createElement("i"); el.appendChild(node); node = el; }
    if (span.bold) { const el = document.createElement("b"); el.appendChild(node); node = el; }
    const href = span.href ? safeHref(span.href) : null;
    if (href) { const el = document.createElement("a"); el.href = href; el.appendChild(node); node = el; }
    parent.appendChild(node);
  });
};

/** Construit les nœuds du document, sans jamais interpréter de HTML. */
export const writeRichText = (target: HTMLElement, value: RichTextDocument) => {
  target.replaceChildren();
  value.blocks.forEach((block) => {
    if (block.type === "paragraph") {
      const p = document.createElement("p");
      appendSpans(p, block.spans);
      target.appendChild(p);
    } else {
      const list = document.createElement(block.ordered ? "ol" : "ul");
      block.items.forEach((item) => {
        const li = document.createElement("li");
        appendSpans(li, item);
        list.appendChild(li);
      });
      target.appendChild(list);
    }
  });
  if (value.blocks.length === 0) {
    const p = document.createElement("p");
    p.appendChild(document.createElement("br"));
    target.appendChild(p);
  }
};
