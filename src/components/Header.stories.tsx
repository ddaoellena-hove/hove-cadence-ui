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
        <div style={{ minWidth: 200 }}>
          <Dropdown
            options={[
              { id: "bordeaux", label: "Bordeaux Métropole" },
              { id: "lyon", label: "Métropole de Lyon" },
              { id: "nantes", label: "Nantes Métropole" },
              { id: "toulouse", label: "Toulouse Métropole" },
              { id: "strasbourg", label: "Eurométropole de Strasbourg" },
              { id: "grenoble", label: "Grenoble-Alpes Métropole" },
            ]}
            value="bordeaux"
          />
        </div>
      }
      rightContent={
        <Avatar
          name="Hector Malot"
          email="hector.malot@hove.com"
          showIcon
          showProfile
          size="sm"
          color="gray"
        />
      }
    />
  ),
};
