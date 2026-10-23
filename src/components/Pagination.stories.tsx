import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Pagination, type PaginationProps } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Composants/Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    // Les violations a11y font échouer les tests de ce composant
    a11y: { test: "error" },
  },
  args: {
    page: 1,
    pageSize: 50,
    totalItems: 12430,
    pageSizeOptions: [25, 50, 100],
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

/* ── Wrapper contrôlé : la page et la taille vivent dans l'état local ── */

const ControlledPagination = (args: PaginationProps) => {
  const [page, setPage] = useState(args.page);
  const [pageSize, setPageSize] = useState(args.pageSize);
  return (
    <Pagination
      {...args}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
    />
  );
};

const render: Story["render"] = (args) => <ControlledPagination {...args} />;

/** Première page : « Page précédente » est désactivé. */
export const Debut: Story = {
  name: "Début",
  render,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("1–50 sur 12 430")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Page précédente" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
  },
};

/** Page du milieu : ellipses des deux côtés (1 … 4 5 6 … 249). */
export const Milieu: Story = {
  render,
  args: { page: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Page 4" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Page 249" })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Page suivante" }));
    await expect(canvas.getByRole("button", { name: "Page 6" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByText("251–300 sur 12 430")).toBeInTheDocument();
  },
};

/** Dernière page : la plage s'arrête au total, « Page suivante » est désactivé. */
export const Fin: Story = {
  render,
  args: { page: 249 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("12 401–12 430 sur 12 430")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Page suivante" })).toBeDisabled();
  },
};

/** Une seule page : les deux flèches sont désactivées. */
export const UneSeulePage: Story = {
  name: "Une seule page",
  render,
  args: { totalItems: 18 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("1–18 sur 18")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Page précédente" })).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Page suivante" })).toBeDisabled();
  },
};
