import { describe, expect, it } from "vitest";
import { isRichTextEmpty, mergeSpans, plainTextToRichText, richTextLength, richTextToPlainText, safeHref, type RichTextDocument } from "./rich-text-utils";

const DOC: RichTextDocument = {
  blocks: [
    { type: "paragraph", spans: [{ text: "Travaux " }, { text: "ligne 1", bold: true }, { text: " : " }, { text: "détails", href: "https://hove.com/" }] },
    { type: "list", ordered: false, items: [[{ text: "Arrêt A" }], [{ text: "Arrêt B" }]] },
    { type: "list", ordered: true, items: [[{ text: "Premier" }]] },
  ],
};

describe("safeHref", () => {
  it("accepte http, https et mailto", () => {
    expect(safeHref("https://hove.com")).toBe("https://hove.com/");
    expect(safeHref("  http://hove.com/a ")).toBe("http://hove.com/a");
    expect(safeHref("mailto:contact@hove.com")).toBe("mailto:contact@hove.com");
  });

  it("refuse les autres protocoles, les adresses relatives et les variantes masquées", () => {
    for (const url of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", " javascript:alert(1)", "java\tscript:alert(1)", "data:text/html,x", "vbscript:x", "/relatif", "hove.com", ""]) {
      expect(safeHref(url)).toBeNull();
    }
  });
});

describe("richTextToPlainText", () => {
  it("garde le sens sans la mise en forme", () => {
    expect(richTextToPlainText(DOC)).toBe("Travaux ligne 1 : détails (https://hove.com/)\n\n- Arrêt A\n- Arrêt B\n\n1. Premier");
  });

  it("ne répète pas une adresse déjà affichée", () => {
    const doc: RichTextDocument = { blocks: [{ type: "paragraph", spans: [{ text: "contact@hove.com", href: "mailto:contact@hove.com" }] }] };
    expect(richTextToPlainText(doc)).toBe("contact@hove.com");
  });
});

describe("plainTextToRichText", () => {
  it("fait un paragraphe par ligne non vide et reste réversible", () => {
    const doc = plainTextToRichText("Un\n\nDeux\r\nTrois");
    expect(doc.blocks).toHaveLength(3);
    expect(richTextToPlainText(doc)).toBe("Un\n\nDeux\n\nTrois");
  });
});

describe("mergeSpans", () => {
  it("fusionne les marques identiques et retire les vides", () => {
    expect(mergeSpans([{ text: "a", bold: true }, { text: "" }, { text: "b", bold: true }, { text: "c" }])).toEqual([{ text: "ab", bold: true }, { text: "c" }]);
  });
});

describe("longueur et vide", () => {
  it("compte le contenu, sans puces ni adresses", () => {
    expect(richTextLength(DOC)).toBe("Travaux ligne 1 : détails".length + "Arrêt AArrêt BPremier".length);
    expect(isRichTextEmpty({ blocks: [] })).toBe(true);
    expect(isRichTextEmpty({ blocks: [{ type: "paragraph", spans: [] }] })).toBe(true);
    expect(isRichTextEmpty(DOC)).toBe(false);
  });
});
