import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { MessagesCanauxPattern } from "../../patterns/MessagesCanauxPattern";
import { Shell } from "./_shell";

const meta: Meta<typeof MessagesCanauxPattern> = {
  title: "Page patterns/Messages par canal",
  component: MessagesCanauxPattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Shell><Story /></Shell>],
};
export default meta;
type Story = StoryObj<typeof MessagesCanauxPattern>;

const typeIn = async (editor: HTMLElement, text: string) => {
  await userEvent.click(editor);
  document.execCommand("insertText", false, text);
};

/** Erreur par canal ; les saisies survivent au changement de mode ; aucun envoi annoncé. */
export const Defaut: Story = {
  name: "Défaut",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "SMS" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Par canal" }));
    await typeIn(canvas.getByRole("textbox", { name: /Message — E-mail/ }), "Texte e-mail");
    await userEvent.click(canvas.getByRole("button", { name: "Vérifier les messages" }));
    await expect(canvas.getByText("Rédigez le message de ce canal.")).toBeInTheDocument();
    await expect(canvas.queryByText(/Aucun envoi/)).toBeNull();

    await typeIn(canvas.getByRole("textbox", { name: /Message — SMS/ }), "Texte SMS");
    await waitFor(() => expect(canvas.getByText(/Aucun envoi/)).toBeInTheDocument());
    // Canal sans mise en forme : aperçu en texte simple
    await expect(canvas.getByRole("region", { name: "Aperçu SMS" })).toHaveTextContent("Texte SMS");

    await userEvent.click(canvas.getByRole("radio", { name: "Message commun" }));
    await userEvent.click(canvas.getByRole("radio", { name: "Par canal" }));
    await expect(canvas.getByRole("textbox", { name: /Message — E-mail/ })).toHaveTextContent("Texte e-mail");
  },
};

/** Une langue déjà traduite n'est plus proposée : limite atteinte au nombre de langues. */
export const Traductions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const add = canvas.getByRole("button", { name: "Ajouter une traduction" });
    await userEvent.click(add);
    await userEvent.click(canvas.getByRole("button", { name: "Ajouter une traduction" }));
    await expect(canvas.getByRole("heading", { name: "Traduction Anglais" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "Traduction Espagnol" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Ajouter une traduction" })).toBeDisabled();
  },
};
