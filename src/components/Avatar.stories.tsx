import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: {
    name: "Diane Ellena",
    size: "md",
  },
  decorators: [
    (StoryFn) => (
      <div style={{ padding: "24px" }}>
        <StoryFn />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// ── Stories ────────────────────────────────────────────────────────────────────

export const Default: Story = {};

export const WithImage: Story = {
  args: {
    src: "https://i.pravatar.cc/150?img=47",
    name: "Sophie Martin",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Avatar name="Alice Dupont"  size="xs" />
      <Avatar name="Bob Richard"   size="sm" />
      <Avatar name="Chloé Morin"   size="md" />
      <Avatar name="David Leclerc" size="lg" />
      <Avatar name="Eva Fontaine"  size="xl" />
    </div>
  ),
};

export const Palette: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar name="Alice Dupont" />
      <Avatar name="Bob Richard" />
      <Avatar name="Chloé Morin" />
      <Avatar name="David Leclerc" />
      <Avatar name="Eva Fontaine" />
      <Avatar name="François Guérin" />
      <Avatar name="Gabriel Hamelin" />
      <Avatar name="Hannah Imbert" />
    </div>
  ),
};

export const WithStatus: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 11, color: "#888", fontFamily: "Inter, sans-serif" }}>
        <Avatar name="Alice Dupont" status="online" />
        online
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 11, color: "#888", fontFamily: "Inter, sans-serif" }}>
        <Avatar name="Bob Richard" status="away" />
        away
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 11, color: "#888", fontFamily: "Inter, sans-serif" }}>
        <Avatar name="Chloé Morin" status="busy" />
        busy
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontSize: 11, color: "#888", fontFamily: "Inter, sans-serif" }}>
        <Avatar name="David Leclerc" status="offline" />
        offline
      </div>
    </div>
  ),
};

export const NoName: Story = {
  args: { name: undefined },
};

export const SingleName: Story = {
  args: { name: "Sophie" },
};
