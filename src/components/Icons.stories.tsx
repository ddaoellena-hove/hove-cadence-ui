import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icons } from "./Icons";
import { ICONS, type IconName } from "./icon-registry";

const ALL_ICONS = Object.keys(ICONS) as IconName[];

const meta: Meta<typeof Icons> = {
  title: "Composants/Médias et icônes/Icons",
  component: Icons,
  tags: ["autodocs"],
  argTypes: {
    icon: {
      options: ALL_ICONS,
      control: { type: "select" },
    },
    size: { control: { type: "number" } },
    color: { control: { type: "color" } },
    title: { control: { type: "text" } },
  },
};

export default meta;
type Story = StoryObj<typeof Icons>;

/** Un seul icône, pilotable via les contrôles (icon, size, color). */
export const Playground: Story = {
  args: {
    icon: "search-md",
    size: 24,
    color: "currentColor",
  },
};

/** La couleur suit `currentColor` : l'icône hérite de la couleur du texte parent. */
export const InheritsColor: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <span style={{ color: "var(--cadence-color-primary, #002830)", display: "inline-flex" }}>
        <Icons icon="route" />
      </span>
      <span style={{ color: "var(--cadence-color-danger, #da1e28)", display: "inline-flex" }}>
        <Icons icon="trash" />
      </span>
      <span style={{ color: "var(--cadence-color-icon-muted, #69797d)", display: "inline-flex" }}>
        <Icons icon="settings-01" />
      </span>
      <Icons icon="heart" color="#e91e63" />
    </div>
  ),
};

/** Plusieurs tailles via la prop `size`. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center", color: "var(--cadence-color-primary, #002830)" }}>
      {[16, 20, 24, 32, 48].map((s) => (
        <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <Icons icon="calendar" size={s} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "var(--cadence-color-text-secondary, #64757a)" }}>
            {s}px
          </span>
        </div>
      ))}
    </div>
  ),
};

/** Galerie complète — toutes les icônes du registre avec leur nom. */
export const AllIcons: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 8,
        color: "var(--cadence-color-primary, #002830)",
      }}
    >
      {ALL_ICONS.map((name) => (
        <div
          key={name}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "14px 8px",
            border: "1px solid var(--cadence-color-border, #e5e5e5)",
            borderRadius: 8,
          }}
        >
          <Icons icon={name} size={24} />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              color: "var(--cadence-color-text-secondary, #64757a)",
              textAlign: "center",
              wordBreak: "break-word",
            }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};
