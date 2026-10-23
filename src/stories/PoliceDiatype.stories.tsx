import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Badge,
  Card,
  DataFreshness,
  GhostButton,
  Indicator,
  LineBadge,
  PrimaryButton,
  TextInput,
} from "../components";

/**
 * Police d'interface : **ABC Diatype** (adoptée), **Inter** conservée en repli.
 *
 * `--cadence-font-sans` vaut ABC Diatype : tous les composants rendent donc en
 * Diatype. Ces pages gardent les deux polices **côte à côte** comme référence
 * (et pour rejuger vite si besoin) : la colonne « Inter » force
 * `--cadence-font-sans` sur Inter, la colonne « ABC Diatype » sur Diatype.
 * Les vrais composants lisent la variable et suivent leur colonne.
 */

const INTER = '"Inter", Helvetica, sans-serif';
const DIATYPE = '"ABC Diatype", Helvetica, sans-serif';

/** Applique une police d'interface à tout son contenu via le token. */
const FontScope = ({ font, children }: { font: string; children: ReactNode }) => (
  <div style={{ ["--cadence-font-sans"]: font } as CSSProperties}>{children}</div>
);

const Column = ({ title, font, children }: { title: string; font: string; children: ReactNode }) => (
  <section style={{ flex: "1 1 360px", minWidth: 320 }}>
    <h2
      style={{
        margin: "0 0 12px",
        paddingBottom: 8,
        borderBottom: "1px solid var(--cadence-color-divider, #f0f0f0)",
        fontFamily: font,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--cadence-color-text-secondary, #64757a)",
      }}
    >
      {title}
    </h2>
    <FontScope font={font}>{children}</FontScope>
  </section>
);

const SideBySide = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start", maxWidth: 900 }}>{children}</div>
);

const meta: Meta = {
  title: "Typographie/Police d'interface — ABC Diatype vs Inter",
  parameters: {
    layout: "padded",
    // Comparaison visuelle : pas de contrôle a11y automatique sur ces pages d'essai.
    a11y: { test: "off" },
  },
};
export default meta;
type Story = StoryObj;

/* ─────────────────────────── Spécimen ─────────────────────────── */

const Specimen = ({ font }: { font: string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18, color: "var(--cadence-color-label, #1a3e45)" }}>
    <p style={{ margin: 0, fontFamily: font, fontSize: 30, fontWeight: 500, lineHeight: 1.15 }}>
      Ponctualité du réseau
    </p>
    <p style={{ margin: 0, fontFamily: font, fontSize: 18, fontWeight: 400, lineHeight: 1.4 }}>
      Portez ce vieux whisky au juge blond qui fume.
    </p>
    <div style={{ fontFamily: font, fontSize: 15, lineHeight: 1.7 }}>
      <div style={{ fontWeight: 400 }}>400 — Regular · Portez ce vieux whisky au juge.</div>
      <div style={{ fontWeight: 500 }}>500 — Medium · Portez ce vieux whisky au juge.</div>
      <div style={{ fontWeight: 600 }}>600 — Semibold · Portez ce vieux whisky au juge.</div>
      <div style={{ fontWeight: 700 }}>700 — Bold · Portez ce vieux whisky au juge.</div>
      <div style={{ fontWeight: 400, fontStyle: "italic" }}>Italique · Portez ce vieux whisky au juge.</div>
    </div>
    <div style={{ fontFamily: font, fontSize: 15, color: "var(--cadence-color-text-secondary, #64757a)" }}>
      ABCDEFGHIJKLMNOPQRSTUVWXYZ
      <br />
      abcdefghijklmnopqrstuvwxyz
      <br />
      àâçéèêëîïôûùü— « » €£% · 0123456789
    </div>
    <div
      style={{
        fontFamily: font,
        fontVariantNumeric: "tabular-nums",
        fontSize: 15,
        lineHeight: 1.8,
        color: "var(--cadence-color-label, #1a3e45)",
      }}
    >
      <div>00:00 · 06:30 · 12:45 · 23:59</div>
      <div>1 024 voyageurs · 94,2 % · +1,8 pt · −0,6 min</div>
      <div>11 111 · 00 000 · 88 888</div>
    </div>
  </div>
);

/** Spécimen typographique côte à côte (glyphes, graisses, chiffres tabulaires). */
export const Specimens: Story = {
  name: "Spécimen (glyphes & chiffres)",
  render: () => (
    <SideBySide>
      <Column title="Inter (actuel)" font={INTER}>
        <Specimen font={INTER} />
      </Column>
      <Column title="ABC Diatype (essai)" font={DIATYPE}>
        <Specimen font={DIATYPE} />
      </Column>
    </SideBySide>
  ),
};

/* ─────────────────────────── Interface ─────────────────────────── */

const StatsTable = () => (
  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 13,
      fontVariantNumeric: "tabular-nums",
      color: "var(--cadence-color-label, #1a3e45)",
    }}
  >
    <thead>
      <tr style={{ textAlign: "left", color: "var(--cadence-color-text-secondary, #64757a)" }}>
        <th style={{ padding: "6px 8px", fontWeight: 600 }}>Ligne</th>
        <th style={{ padding: "6px 8px", fontWeight: 600, textAlign: "right" }}>Retard moy.</th>
        <th style={{ padding: "6px 8px", fontWeight: 600, textAlign: "right" }}>Ponctualité</th>
        <th style={{ padding: "6px 8px", fontWeight: 600, textAlign: "right" }}>Voyageurs</th>
      </tr>
    </thead>
    <tbody>
      {[
        ["Ligne 1", "0,8 min", "96,4 %", "412 880"],
        ["Ligne 4", "1,9 min", "91,2 %", "298 140"],
        ["RER A", "3,4 min", "88,7 %", "1 024 505"],
        ["T3b", "0,5 min", "97,1 %", "86 300"],
      ].map(([l, r, p, v]) => (
        <tr key={l} style={{ borderTop: "1px solid var(--cadence-color-divider, #f0f0f0)" }}>
          <td style={{ padding: "6px 8px" }}>{l}</td>
          <td style={{ padding: "6px 8px", textAlign: "right" }}>{r}</td>
          <td style={{ padding: "6px 8px", textAlign: "right" }}>{p}</td>
          <td style={{ padding: "6px 8px", textAlign: "right" }}>{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const InterfaceSampler = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--cadence-color-primary, #002830)" }}>
        Perturbations en cours
      </h3>
      <DataFreshness updatedAt={Date.now() - 3 * 60_000} />
    </div>

    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--cadence-color-label, #1a3e45)" }}>
      Trois incidents actifs sur le réseau. La ligne 4 reste ralentie entre Montparnasse et Bagneux ;
      une reprise progressive est attendue vers 18 h 30.
    </p>

    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Card title="Ponctualité" value={94.2} unit="%" delta={{ value: -0.6, unit: "pt", label: "vs hier" }} />
      <Card title="Perturbations" value={27} delta={{ value: 3, label: "vs hier" }} goodDirection="down" />
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <LineBadge code="4" mode="metro" color="#B6007A" />
      <Indicator variant="warning" />
      <Badge label="Travaux" />
      <Badge label="Ligne 4 × 2" dismissible />
    </div>

    <StatsTable />

    <TextInput label="Rechercher un arrêt" placeholder="Nom ou code d'arrêt" helperText="Ex. « Châtelet » ou « 59:123 »." />

    <div style={{ display: "flex", gap: 8 }}>
      <PrimaryButton label="Publier l'info voyageurs" />
      <GhostButton label="Annuler" />
    </div>
  </div>
);

/** La même interface rendue avec chaque police, pour trancher en contexte. */
export const Interface: Story = {
  name: "Interface (côte à côte)",
  render: () => (
    <SideBySide>
      <Column title="Inter (actuel)" font={INTER}>
        <InterfaceSampler />
      </Column>
      <Column title="ABC Diatype (essai)" font={DIATYPE}>
        <InterfaceSampler />
      </Column>
    </SideBySide>
  ),
};

/** L'interface en pleine largeur, uniquement en ABC Diatype. */
export const InterfaceDiatype: Story = {
  name: "Interface — ABC Diatype seul",
  render: () => (
    <FontScope font={DIATYPE}>
      <div style={{ maxWidth: 460 }}>
        <InterfaceSampler />
      </div>
    </FontScope>
  ),
};
