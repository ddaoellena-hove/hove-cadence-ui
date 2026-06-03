import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: {
    name: "Diane Ellena",
    size: "md",
    color: "blue",
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
      <Avatar name="Alice Dupont"  size="sm" color="green" />
      <Avatar name="Bob Richard"   size="md" color="blue" />
      <Avatar name="Chloé Morin"   size="lg" color="purple" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar name="Alice"   color="green" />
      <Avatar name="Bob"     color="blue" />
      <Avatar name="Chloé"   color="orange" />
      <Avatar name="David"   color="purple" />
      <Avatar name="Eva"     color="gray" />
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    showIcon: true,
    name: "",
    color: "blue",
  },
};

export const Profile: Story = {
  args: {
    name: "Hector Malot",
    email: "hector.malot@hove.com",
    color: "gray",
    showIcon: true,
    showProfile: true,
    size: "lg"
  },
};

export const ProfileLarge: Story = {
  args: {
    name: "Sophie Martin",
    email: "s.martin@hove.com",
    color: "green",
    size: "lg",
    showProfile: true,
  },
};

export const NoName: Story = {
  args: { name: "", showIcon: true, color: "gray" },
};
