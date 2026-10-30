import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { PageFooter } from "./PageFooter";

const meta: Meta<typeof PageFooter> = {
  title: "Composants/Structure et mise en page/PageFooter",
  component: PageFooter,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof PageFooter>;

/** Liens externes signalés par une icône et annoncés ; contacts en `mailto:` et `tel:`. */
export const Defaut: Story = {
  name: "Défaut",
  args: {
    copyright: "© 2026 Hove · Tous droits réservés",
    links: [
      { label: "Questions fréquentes", href: "https://www.hove.com/faq", external: true },
      { label: "Support", href: "https://www.hove.com/support", external: true },
      { label: "Par mail", href: "mailto:contact@hove.com" },
      { label: "+33 (0) 809 40 02 95", href: "tel:+33809400295" },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("contentinfo")).toBeInTheDocument();
    const external = canvas.getByRole("link", { name: "Support (nouvel onglet)" });
    await expect(external).toHaveAttribute("target", "_blank");
    await expect(external).toHaveAttribute("rel", "noopener noreferrer");
    await expect(canvas.getByRole("link", { name: "Par mail" })).not.toHaveAttribute("target");
  },
};

/** Sans lien : la mention de copyright seule. */
export const CopyrightSeul: Story = {
  name: "Copyright seul",
  args: { copyright: "© 2026 Hove · Tous droits réservés" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("list")).toBeNull();
  },
};

/** Largeur étroite : les liens passent à la ligne, sans débordement. */
export const Etroit: Story = {
  name: "Largeur étroite",
  args: Defaut.args,
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    const footer = canvasElement.querySelector<HTMLElement>(".page-footer")!;
    await expect(footer.scrollWidth).toBeLessThanOrEqual(footer.clientWidth);
  },
};
