import type { Meta, StoryObj } from "@storybook/react-vite";
import { Header } from "./Header";
import { Dropdown } from "./Dropdown";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Header> = {
  title: "Components/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  render: () => (
    <Header
      leftContent={
        <div style={{ minWidth: 220 }}>
          <Dropdown
            options={[
              { id: "all", label: "Toute la couverture" },
              { id: "metro", label: "Métropole" },
              { id: "periurbain", label: "Périurbain" },
              { id: "rural", label: "Rural" },
            ]}
            value="all"
          />
        </div>
      }
      rightContent={
        <Avatar
          name="Hector Malot"
          email="hector.malot@hove.com"
          showIcon
          showProfile
          size="lg"
          color="gray"
        />
      }
    />
  ),
};
