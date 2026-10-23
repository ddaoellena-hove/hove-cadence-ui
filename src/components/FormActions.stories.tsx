import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { FormActions } from "./FormActions";
import { PrimaryButton } from "./PrimaryButton";
import { GhostButton } from "./GhostButton";
import { Link } from "./Link";

const meta: Meta<typeof FormActions> = {
  title: "Composants/Structure et mise en page/FormActions",
  component: FormActions,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof FormActions>;

/** Alignées à droite, ordre `Link` → `GhostButton` → `PrimaryButton`. */
export const Defaut: Story = {
  name: "Défaut",
  render: () => (
    <FormActions>
      <Link hideArrow onClick={() => {}}>Enregistrer comme brouillon</Link>
      <GhostButton label="Réinitialiser" />
      <PrimaryButton label="Créer le scénario" />
    </FormActions>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Créer le scénario" })).toBeInTheDocument();
  },
};

/** Pied d'assistant : Précédent à gauche, Suivant à droite. */
export const EntreDeux: Story = {
  name: "Entre deux (assistant)",
  render: () => (
    <FormActions justify="between">
      <GhostButton iconStart="arrow-left" label="Précédent" />
      <PrimaryButton iconEnd="arrow-right" label="Suivant" />
    </FormActions>
  ),
};
