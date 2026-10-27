import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { TooltipTrigger } from "./TooltipTrigger";

const meta: Meta<typeof TooltipTrigger> = {
  title: "Composants/Surcouches/TooltipTrigger",
  component: TooltipTrigger,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Icône ⓘ qui affiche une bulle d'aide au survol et au focus clavier ; Échap la ferme. " +
          "Le texte est le nom accessible du bouton. `position` choisit le côté de la bulle, " +
          "dont la flèche pointe vers l'icône. N'enveloppe pas d'autre élément.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    theme: { control: "select", options: ["light", "dark"] },
    position: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "80px 120px", display: "inline-flex" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TooltipTrigger>;

/* ── Default ────────────────────────────────────────────────────── */
export const Default: Story = {
  args: {
    label: "This is a tooltip",
    theme: "light",
    position: "top",
  },
};

/* ── Direction: Bottom ──────────────────────────────────────────── */
export const DirectionBottom: Story = {
  args: {
    label: "Tooltip below",
    theme: "light",
    position: "bottom",
  },
};

/* ── Direction: Left ────────────────────────────────────────────── */
export const DirectionLeft: Story = {
  args: {
    label: "Tooltip on the left",
    theme: "light",
    position: "left",
  },
};

/* ── Direction: Right ───────────────────────────────────────────── */
export const DirectionRight: Story = {
  args: {
    label: "Tooltip on the right",
    theme: "light",
    position: "right",
  },
};

/* ── Dark theme ─────────────────────────────────────────────────── */
export const DarkTheme: Story = {
  args: {
    label: "Dark tooltip",
    theme: "dark",
    position: "top",
  },
};

/* ── All Directions grid ────────────────────────────────────────── */
export const AllDirections: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "80px 120px",
        alignItems: "center",
        justifyItems: "center",
      }}
    >
      {(["top", "bottom", "left", "right"] as const).map((position) => (
        <div
          key={position}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontFamily: "sans-serif",
              color: "#667085",
              textTransform: "capitalize",
            }}
          >
            {position}
          </span>
          <TooltipTrigger
            label={`Arrow points ${position}`}
            position={position}
            theme="light"
          />
        </div>
      ))}
    </div>
  ),
};

/* ── Clavier ────────────────────────────────────────────────────── */
/** Tab ouvre la bulle, Échap la ferme sans déplacer le focus, Maj+Tab la ferme. */
export const Clavier: Story = {
  args: { label: "Complétez tous les champs obligatoires pour enregistrer.", position: "top" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Complétez tous les champs obligatoires pour enregistrer." });
    await expect(button).toHaveAttribute("type", "button");
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(canvas.getByText("Complétez tous les champs obligatoires pour enregistrer.")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(button).toHaveFocus();
    await expect(canvas.queryByText("Complétez tous les champs obligatoires pour enregistrer.")).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect(canvas.getByText("Complétez tous les champs obligatoires pour enregistrer.")).toBeVisible();
    await userEvent.tab({ shift: true });
    await expect(canvas.queryByText("Complétez tous les champs obligatoires pour enregistrer.")).not.toBeInTheDocument();
  },
};
