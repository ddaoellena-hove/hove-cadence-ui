import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { GhostButton } from "../components/GhostButton";
import { Link } from "../components/Link";
import { PrimaryButton } from "../components/PrimaryButton";
import type { ActionButtonProps, ActionButtonSize, ActionButtonTone } from "../components/PrimaryButton";

// Matrice des actions : PrimaryButton et GhostButton × ton × taille × états,
// puis le groupe « Link + Ghost + Primary » sur les deux fonds de page.
// Survol, appui et focus sont gérés en CSS : on les voit en interagissant
// (Tab pour le focus clavier).

const SIZES: ActionButtonSize[] = ["sm", "md"];
const TONES: ActionButtonTone[] = ["default", "danger"];

const caption: React.CSSProperties = {
  color: "var(--cadence-color-label)",
  fontFamily: "var(--cadence-font-sans)",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.5,
  textTransform: "uppercase",
};

const Row = ({ title, children }: { title: string; children: ReactNode }) => (
  <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "center", gap: 16 }}>
    <span style={caption}>{title}</span>
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>{children}</div>
  </div>
);

type Button = typeof PrimaryButton | typeof GhostButton;

// PrimaryButton en variante contour, pour la matrice
const PrimaryOutline = (props: ActionButtonProps) => <PrimaryButton outline {...props} />;

const Variants = ({ Component, tone, size }: { Component: Button | typeof PrimaryOutline; tone: ActionButtonTone; size: ActionButtonSize }) => {
  const C = Component as React.ComponentType<ActionButtonProps>;
  const verb = tone === "danger" ? "Supprimer" : "Enregistrer";
  return (
    <>
      <C tone={tone} size={size} label={verb} />
      <C tone={tone} size={size} label="Ajouter" iconStart="plus" />
      <C tone={tone} size={size} label="Suivant" iconEnd="chevron-right" />
      <C tone={tone} size={size} icon={tone === "danger" ? "trash" : "edit-02"} aria-label={tone === "danger" ? "Supprimer" : "Modifier"} />
      <C tone={tone} size={size} label="Désactivé" disabled />
      <C tone={tone} size={size} label="Chargement" loading />
      <C tone={tone} size={size} label="Envoi" iconStart="send-01" loading />
    </>
  );
};

const Section = ({ name, Component }: { name: string; Component: Button | typeof PrimaryOutline }) => (
  <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <h2 style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 16, fontWeight: 600, color: "var(--cadence-color-primary)", margin: 0 }}>
      {name}
    </h2>
    {TONES.map((tone) =>
      SIZES.map((size) => (
        <Row key={`${tone}-${size}`} title={`${tone} · ${size}`}>
          <Variants Component={Component} tone={tone} size={size} />
        </Row>
      )),
    )}
  </section>
);

const Group = ({ background, label }: { background: string; label: string }) => (
  <div style={{ background, borderRadius: 10, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
    <span style={caption}>{label}</span>
    <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
      <Link hideArrow onClick={() => {}}>Enregistrer comme brouillon</Link>
      <GhostButton label="Réinitialiser" />
      <PrimaryButton label="Valider" />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
      <Link variant="destructive" hideArrow onClick={() => {}}>Retirer le filtre</Link>
      <GhostButton label="Annuler" />
      <PrimaryButton tone="danger" label="Supprimer" />
    </div>
  </div>
);

const MatriceActions = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 24 }}>
    <Section name="PrimaryButton" Component={PrimaryButton} />
    <Section name="PrimaryButton outline (dashboards)" Component={PrimaryOutline} />
    <Section name="GhostButton" Component={GhostButton} />
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 16, fontWeight: 600, color: "var(--cadence-color-primary)", margin: 0 }}>
        Groupe : Link → Ghost → Primary
      </h2>
      <Group background="var(--cadence-color-white)" label="Sur --cadence-color-white" />
      <Group background="var(--cadence-color-surface-alt)" label="Sur --cadence-color-surface-alt" />
    </section>
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 16, fontWeight: 600, color: "var(--cadence-color-primary)", margin: 0 }}>
        En-tête de dashboard : Outline + Primary
      </h2>
      {["var(--cadence-color-white)", "var(--cadence-color-surface-alt)"].map((background) => (
        <div key={background} style={{ background, borderRadius: 10, padding: 24, display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <PrimaryButton outline iconStart="download-02" label="Exporter" />
          <PrimaryButton outline iconEnd="chevron-down" label="Filtres" />
          <PrimaryButton iconStart="plus" label="Créer un scénario" />
        </div>
      ))}
    </section>
  </div>
);

const meta: Meta<typeof MatriceActions> = {
  title: "Actions/Matrice",
  component: MatriceActions,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
  },
};

export default meta;
type Story = StoryObj<typeof MatriceActions>;

export const Matrice: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Focus clavier visible : chaque bouton actif reçoit un anneau (box-shadow)
    await userEvent.tab();
    const first = document.activeElement as HTMLElement;
    await expect(first).toHaveClass("base-button");
    await expect(getComputedStyle(first).boxShadow).not.toBe("none");

    // Ghost : anneau de focus alors qu'il n'a ni fond ni bordure
    const ghost = canvas.getAllByRole("button", { name: "Réinitialiser" })[0];
    ghost.focus();
    await expect(ghost).toHaveFocus();
  },
};
