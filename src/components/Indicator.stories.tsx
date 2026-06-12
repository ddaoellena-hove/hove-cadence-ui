import type { Meta, StoryObj } from "@storybook/react-vite";
import { Indicator, type IndicatorVariant } from "./Indicator";

const meta: Meta<typeof Indicator> = {
  title: "Components/Indicator",
  component: Indicator,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "active",
        "upcoming",
        "completed",
        "draft",
        "warning",
        "info",
        "critical",
        "nominal",
      ] satisfies IndicatorVariant[],
    },
    label: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Indicator>;

/* ── Stories individuelles ── */

export const Active: Story = {
  args: { variant: "active" },
};

export const Upcoming: Story = {
  args: { variant: "upcoming" },
};

export const Completed: Story = {
  args: { variant: "completed" },
};

export const Draft: Story = {
  args: { variant: "draft" },
};

export const Warning: Story = {
  args: { variant: "warning" },
};

export const Info: Story = {
  args: { variant: "info" },
};

export const Critical: Story = {
  args: { variant: "critical" },
};

export const Nominal: Story = {
  args: { variant: "nominal" },
};

/* ── Toutes les variantes ── */

const ALL_VARIANTS: IndicatorVariant[] = [
  "active",
  "upcoming",
  "completed",
  "draft",
  "warning",
  "info",
  "critical",
  "nominal",
];

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: 24 }}>
      {ALL_VARIANTS.map((v) => (
        <Indicator key={v} variant={v} />
      ))}
    </div>
  ),
};

/** Exemple contextuel — liste de perturbations avec leur statut. */
export const InContext: Story = {
  name: "In Context",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 24,
        maxWidth: 480,
      }}
    >
      {[
        { title: "Tronçon Melun – Montereau", variant: "active"    as const, sev: "warning"   as const },
        { title: "Scénario 2",                variant: "active"    as const, sev: "info"       as const },
        { title: "RER B — Travaux été",       variant: "upcoming"  as const, sev: "nominal"   as const },
        { title: "Incident Gare de Lyon",     variant: "completed" as const, sev: "completed" as const },
        { title: "Brouillon ligne 13",        variant: "draft"     as const, sev: "draft"     as const },
        { title: "Alerte caténaire",          variant: "critical"  as const, sev: "critical"  as const },
      ].map((row) => (
        <div
          key={row.title}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#ffffff",
            border: "1px solid #eef1f4",
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, Helvetica",
              fontSize: 13,
              fontWeight: 500,
              color: "#002830",
            }}
          >
            {row.title}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <Indicator variant={row.variant} />
            <Indicator variant={row.sev} />
          </div>
        </div>
      ))}
    </div>
  ),
};
