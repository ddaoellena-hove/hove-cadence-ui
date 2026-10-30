import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { RichTextContent, RichTextEditor } from "./RichTextEditor";
import { richTextToPlainText, type RichTextDocument } from "./rich-text-utils";

const meta: Meta<typeof RichTextEditor> = {
  title: "Composants/Formulaires/RichTextEditor",
  component: RichTextEditor,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof RichTextEditor>;

const EMPTY: RichTextDocument = { blocks: [] };
const MESSAGE: RichTextDocument = {
  blocks: [
    { type: "paragraph", spans: [{ text: "Circulation " }, { text: "interrompue", bold: true }, { text: " entre Bastille et Nation. " }, { text: "En savoir plus", href: "https://hove.com/" }] },
    { type: "list", ordered: false, items: [[{ text: "Bus de remplacement" }], [{ text: "Billets acceptés sur le réseau" }]] },
  ],
};

const Controlled = ({ initial, onChange, ...props }: Partial<Parameters<typeof RichTextEditor>[0]> & { initial: RichTextDocument }) => {
  const [value, setValue] = useState(initial);
  return (
    <>
      <RichTextEditor label="Message voyageurs" {...props} value={value} onChange={(next) => { setValue(next); onChange?.(next); }} />
      <output data-testid="plain" style={{ display: "block", marginTop: 12, whiteSpace: "pre-wrap", fontSize: 12 }}>{richTextToPlainText(value)}</output>
    </>
  );
};

// userEvent ne simule pas la frappe dans un contentEditable : insertion native
const typeText = (text: string) => document.execCommand("insertText", false, text);

const selectAll = (element: HTMLElement) => {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

/** Mise en forme au clavier et à la souris ; sortie texte simple disponible. */
export const Saisie: Story = {
  render: () => <Controlled initial={EMPTY} placeholder="Décrivez la perturbation" maxLength={200} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "Message voyageurs" });
    await userEvent.click(editor);
    typeText("Ligne coupée");
    await waitFor(() => expect(canvas.getByTestId("plain")).toHaveTextContent("Ligne coupée"));
    await expect(canvas.getByText("12 / 200")).toBeInTheDocument();

    selectAll(editor);
    await userEvent.click(canvas.getByRole("button", { name: "Gras" }));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Gras" })).toHaveAttribute("aria-pressed", "true"));
    await expect(editor.querySelector("b")).toHaveTextContent("Ligne coupée");

    // Annuler et rétablir passent par l'historique natif
    await userEvent.click(canvas.getByRole("button", { name: "Annuler" }));
    await expect(editor.querySelector("b")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Rétablir" }));
    await expect(editor.querySelector("b")).not.toBeNull();

    selectAll(editor);
    await userEvent.click(canvas.getByRole("button", { name: "Liste à puces" }));
    await waitFor(() => expect(canvas.getByTestId("plain")).toHaveTextContent("- Ligne coupée"));
  },
};

/** Barre d'outils : un seul arrêt de tabulation, parcourue aux flèches. */
export const Clavier: Story = {
  render: () => <Controlled initial={MESSAGE} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Gras" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "Italique" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("textbox", { name: "Message voyageurs" })).toHaveFocus();
  },
};

const paste = (target: HTMLElement, html: string) => {
  const data = new DataTransfer();
  data.setData("text/html", html);
  target.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
};

/** Collage hostile : scripts, attributs et adresses dangereuses disparaissent, le texte reste. */
export const CollageAssaini: Story = {
  name: "Collage assaini",
  render: () => <Controlled initial={EMPTY} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "Message voyageurs" });
    await userEvent.click(editor);
    paste(editor, `<style>p{color:red}</style><script>window.__pwned=1</script>
      <p onclick="window.__pwned=1" style="color:red"><b>Gras</b> et <a href="javascript:window.__pwned=1">lien piégé</a></p>
      <img src=x onerror="window.__pwned=1"><ul><li>Un<ul><li>Imbriqué</li></ul></li></ul>
      <a href="https://hove.com">sûr</a>`);
    await waitFor(() => expect(editor.querySelector("b")).toHaveTextContent("Gras"));
    await expect(editor.querySelector("script, style, img, [onclick], [style]")).toBeNull();
    await expect(editor.querySelector('a[href^="javascript"]')).toBeNull();
    await expect(editor).toHaveTextContent("lien piégé");
    await expect(editor.querySelector('a[href="https://hove.com/"]')).not.toBeNull();
    await expect(editor.querySelectorAll("li")).toHaveLength(2);
    await expect((window as unknown as { __pwned?: number }).__pwned).toBeUndefined();
  },
};

/** Lien sur une sélection ; une adresse dangereuse est refusée avec un message. */
export const Lien: Story = {
  render: () => <Controlled initial={{ blocks: [{ type: "paragraph", spans: [{ text: "Consulter" }] }] }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "Message voyageurs" });
    await userEvent.click(editor);
    selectAll(editor);
    await userEvent.click(canvas.getByRole("button", { name: "Ajouter un lien" }));
    await userEvent.type(canvas.getByLabelText("Adresse du lien"), "javascript:alert(1)");
    await userEvent.click(canvas.getByRole("button", { name: "Ajouter le lien" }));
    await expect(canvas.getByText(/adresse http, https ou mailto/)).toBeInTheDocument();
    await expect(editor.querySelector("a")).toBeNull();

    await userEvent.clear(canvas.getByLabelText("Adresse du lien"));
    await userEvent.type(canvas.getByLabelText("Adresse du lien"), "https://hove.com");
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(editor.querySelector("a")).toHaveAttribute("href", "https://hove.com/"));
    await expect(canvas.getByTestId("plain")).toHaveTextContent("Consulter (https://hove.com/)");
  },
};

/** Enregistrement puis rechargement sans perte : le document est réécrit à l'identique. */
export const Rechargement: Story = {
  args: { onChange: fn() },
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState<RichTextDocument>(EMPTY);
      return (
        <>
          <button type="button" onClick={() => setValue(MESSAGE)}>Recharger</button>
          <RichTextEditor label="Message voyageurs" value={value} onChange={(next) => { setValue(next); args.onChange?.(next); }} />
        </>
      );
    };
    return <Demo />;
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Recharger" }));
    const editor = canvas.getByRole("textbox", { name: "Message voyageurs" });
    await waitFor(() => expect(editor).toHaveTextContent("Bus de remplacement"));
    await userEvent.click(editor);
    window.getSelection()?.selectAllChildren(editor.querySelector("p")!);
    window.getSelection()?.collapseToEnd();
    typeText(".");
    await waitFor(() => expect(args.onChange).toHaveBeenCalled());
    const saved = (args.onChange as ReturnType<typeof fn>).mock.lastCall?.[0] as RichTextDocument;
    await expect(saved.blocks[1]).toEqual(MESSAGE.blocks[1]);
    await expect(richTextToPlainText(saved)).toContain("En savoir plus");
    await expect(saved.blocks[0].type).toBe("paragraph");
  },
};

/** États : erreur et dépassement annoncés, lecture seule sans barre d'outils, désactivé. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <RichTextEditor label="En erreur" value={MESSAGE} required error="Le message est trop long." maxLength={20} />
      <RichTextEditor label="En lecture seule" value={MESSAGE} readOnly />
      <RichTextEditor label="Désactivé" value={MESSAGE} disabled />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const invalid = canvas.getByRole("textbox", { name: /En erreur/ });
    await expect(invalid).toHaveAttribute("aria-invalid", "true");
    await expect(invalid).toHaveAttribute("aria-required", "true");
    await expect(invalid).toHaveAccessibleDescription(/Le message est trop long/);
    const group = canvas.getByRole("group", { name: "En lecture seule" });
    await expect(within(group).queryByRole("toolbar")).toBeNull();
    await expect(within(group).getByRole("link", { name: "En savoir plus" })).toHaveAttribute("rel", "noopener noreferrer");
    await expect(canvas.getByRole("textbox", { name: "Désactivé" })).toHaveAttribute("contenteditable", "false");
  },
};

/** Le rendu en lecture revérifie les adresses, même dans un document stocké modifié. */
export const ContenuSeul: Story = {
  name: "Contenu seul",
  render: () => <RichTextContent value={{ blocks: [{ type: "paragraph", spans: [{ text: "Sans lien", href: "javascript:alert(1)" }, { text: " et " }, { text: "avec", href: "https://hove.com" }] }] }} />,
  play: async ({ canvasElement }) => {
    const links = within(canvasElement).getAllByRole("link");
    await expect(links).toHaveLength(1);
    await expect(links[0]).toHaveTextContent("avec");
  },
};
