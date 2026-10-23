import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { FileUpload, type UploadFile } from "./FileUpload";

const meta: Meta<typeof FileUpload> = {
  title: "Composants/Formulaires/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  parameters: { a11y: { test: "error" } },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Vide: Story = {
  name: "Zone vide",
  args: { accept: ".zip,.csv", maxSize: 50_000_000 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // « Parcourir » est un PrimaryButton outline.
    const browse = canvas.getByRole("button", { name: "Parcourir" });
    await expect(browse).toHaveClass("primary-button--outline");
    await expect(canvas.getByText(/Formats acceptés/)).toBeInTheDocument();
  },
};

const FILES: UploadFile[] = [
  { id: "1", name: "reseau-idf.zip", size: 24_800_000, status: "success" },
  { id: "2", name: "arrets.csv", size: 1_536_000, status: "uploading", progress: 62 },
  { id: "3", name: "trajets.csv", size: 3_200_000, status: "pending" },
  { id: "4", name: "horaires.xls", size: 800_000, status: "error", error: "Format non pris en charge : .xls. Formats acceptés : .zip, .csv." },
];

/** Fichier importé : corbeille en `PrimaryButton outline tone="danger"`. */
export const FichierImporte: Story = {
  name: "Fichier importé",
  args: {
    accept: ".zip,.csv",
    files: [{ id: "1", name: "reseau-idf.zip", size: 20_971_520, status: "success" }],
    onRemove: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Fichier importé")).toBeInTheDocument();
    const remove = canvas.getByRole("button", { name: "Supprimer reseau-idf.zip" });
    await expect(remove).toHaveClass("primary-button--outline");
  },
};

/** Fichier en cours d'import : croix d'annulation, barre et pourcentage. */
export const FichierEnCours: Story = {
  name: "Fichier en cours d’import",
  args: {
    accept: ".zip,.csv",
    files: [{ id: "1", name: "reseau-idf.zip", size: 20_971_520, status: "uploading", progress: 50 }],
    onRemove: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Fichier en cours d’import")).toBeInTheDocument();
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    await expect(canvas.getByText(/^50\s%$/)).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Annuler l’import de reseau-idf.zip" })).toBeInTheDocument();
  },
};

/** Liste de fichiers avec leurs états : importé, envoi, attente, erreur. */
export const AvecFichiers: Story = {
  name: "Avec fichiers",
  render: () => {
    const [files, setFiles] = useState<UploadFile[]>(FILES);
    return (
      <FileUpload
        accept=".zip,.csv"
        maxSize={50_000_000}
        multiple
        files={files}
        onRemove={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
        onFiles={() => {}}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Le message d'erreur d'un fichier rejeté est affiché.
    await expect(canvas.getByText(/Format non pris en charge/)).toBeInTheDocument();
    // La barre de progression d'un envoi en cours est présente.
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "62");
  },
};

export const ValidationEtRetrait: Story = {
  render: function Validation() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    return <FileUpload accept=".csv" maxSize={1024} files={files}
      onFiles={(next) => setFiles(next.map((f) => ({ id: f.name, name: f.name, size: f.size, status: "pending" })))}
      onRemove={(id) => setFiles((prev) => prev.filter((file) => file.id !== id))} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Choisir des fichiers");
    await userEvent.upload(input, new File(["stop_id,stop_name"], "arrets.csv", { type: "text/csv" }));
    await expect(canvas.getByText("Fichier en attente")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Retirer arrets.csv" }));
    await expect(canvas.queryByText("arrets.csv")).not.toBeInTheDocument();
    await userEvent.upload(input, new File(["x".repeat(1025)], "gros.csv", { type: "text/csv" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("trop volumineux");
  },
};
