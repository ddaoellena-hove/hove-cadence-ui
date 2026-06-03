import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  args: {
    children: "Voir le rapport",
    href: "#",
    onClick: fn(),
  },
  decorators: [
    (StoryFn) => (
      <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", fontSize: 14 }}>
        <StoryFn />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Link>;

// ── Stories ────────────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Subtle: Story = {
  args: { variant: "subtle", children: "En savoir plus" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Supprimer le scénario", href: undefined },
};

export const External: Story = {
  args: {
    children: "Documentation",
    href: "https://hove.com",
    external: true,
  },
};

export const Disabled: Story = {
  args: { children: "Lien désactivé", disabled: true },
};

export const InlineText: Story = {
  render: (args) => (
    <p style={{ color: "#374151", lineHeight: 1.6 }}>
      Ce rapport est basé sur les données exportées depuis{" "}
      <Link {...args} href="#">Datahub</Link>. Pour modifier les paramètres,{" "}
      <Link {...args} href="#" variant="subtle">consultez les réglages</Link>.
    </p>
  ),
  args: { onClick: fn() },
};

export const ClickCallback: Story = {
  args: {
    href: undefined,
    children: "Cliquer ici",
    onClick: fn(),
  },
  play: async ({ canvas, args }) => {
    const link = canvas.getByRole("button", { name: "Cliquer ici" });
    await link.click();
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
