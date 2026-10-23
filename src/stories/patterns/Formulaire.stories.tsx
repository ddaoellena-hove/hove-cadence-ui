import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { PageHeader, PageSection, Skeleton } from "../../components";
import { FormulairePattern } from "../../patterns/FormulairePattern";

/** Zone de contenu d'`AppLayout` (padding 24×32) pour une démo plein écran. */
const Content = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: "24px 32px", background: "var(--cadence-color-white, #fff)", minHeight: "100vh", boxSizing: "border-box" }}>
    {children}
  </div>
);

const meta: Meta<typeof FormulairePattern> = {
  title: "Page patterns/Formulaire",
  component: FormulairePattern,
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
  decorators: [(Story) => <Content><Story /></Content>],
};
export default meta;
type Story = StoryObj<typeof FormulairePattern>;

/** Formulaire de création en sections, synthèse et actions. */
export const Defaut: Story = {
  name: "Défaut",
  args: { onSave: fn(), onLeave: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Créer un scénario" })).toBeInTheDocument();
    await expect(canvas.getByRole("heading", { level: 2, name: "Informations générales" })).toBeInTheDocument();
  },
};

/** Parcours : soumettre vide → `ErrorSummary` → corriger → enregistrer. */
export const Erreur: Story = {
  args: { onSave: fn(), onLeave: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Créer le scénario" }));
    await waitFor(() => expect(canvas.getByText("Corrigez les erreurs suivantes")).toBeInTheDocument());
    await expect(args.onSave).not.toHaveBeenCalled();
    // Corriger puis enregistrer.
    await userEvent.type(canvas.getByRole("textbox", { name: /Titre/ }), "Tronçon Melun – Montereau");
    await userEvent.click(canvas.getByRole("button", { name: "Créer le scénario" }));
    await waitFor(() => expect(args.onSave).toHaveBeenCalled());
  },
};

/** Édition : chargement des données existantes. */
export const Chargement: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
      <PageHeader title="Modifier le scénario" subtitle="Chargement…" />
      <PageSection title="Informations générales">
        <Skeleton variant="rect" height={40} />
        <Skeleton variant="rect" height={40} />
      </PageSection>
      <PageSection title="Période">
        <Skeleton variant="rect" height={40} />
        <Skeleton variant="rect" height={96} />
      </PageSection>
    </div>
  ),
};
