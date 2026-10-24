import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Accordion, AppLayout, Autocomplete, DataTable, Drawer, GhostButton, InlineAlert,
  LineBadge, PageHeader, PrimaryButton, ProgressBar, Sidebar, Stepper,
  DescriptionList, ErrorSummary, ActivityFeed,
  StopLabel, TextInput, FileUpload, Icons, type UploadFile,
} from "../components";
import { LINES, STOPS } from "./data/network";

function DemoLayout({ children, activeId }: { children: ReactNode; activeId: string }) {
  return <AppLayout sidebar={<Sidebar product="datahub" clientName="Réseau de démonstration" activeId={activeId}
    sections={[{ id: activeId, label: activeId === "import" ? "Import réseau" : "Perturbations", icon: <Icons icon="route" size={20} /> }]}
    user={{ name: "Camille Martin" }} />}>
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>{children}</div>
  </AppLayout>;
}

const DetailPage = () => {
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  return <DemoLayout activeId="perturbations">
    <PageHeader title="Détail d’une perturbation" subtitle="Exemple local : consultation et prise en compte" sticky={false} />
    {acknowledged && <InlineAlert type="success">La perturbation a été prise en compte dans cette démonstration.</InlineAlert>}
    <DataTable aria-label="Perturbations à consulter" data={[{ id: "works", title: "Travaux entre Châtelet et Nation", line: LINES[0] }]}
      getRowId={(row) => row.id} columns={[
        { id: "line", header: "Ligne", accessor: (row) => row.line.code, width: 100, cell: (row) => <LineBadge {...row.line} /> },
        { id: "title", header: "Perturbation", accessor: (row) => row.title, minWidth: 240 },
        { id: "actions", header: "Détail", accessor: () => "", width: 100, cell: () => <PrimaryButton outline size="sm" label="Consulter" onClick={() => setOpen(true)} /> },
      ]} />
    <Drawer isOpen={open} onClose={() => setOpen(false)} title="Travaux entre Châtelet et Nation" subtitle="Ligne 1 · 22 octobre 2026, de 09:00 à 17:00"
      primaryAction={acknowledged ? undefined : { label: "Prendre en compte", onClick: () => { setAcknowledged(true); setOpen(false); } }}
      secondaryAction={{ label: "Fermer", onClick: () => setOpen(false) }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <InlineAlert type="warning" title="Trafic interrompu">Bus de remplacement entre les deux stations pendant les travaux.</InlineAlert>
        <Accordion mode="multiple" items={[
          { id: "details", title: "Informations", defaultOpen: true, content: <DescriptionList density="compact" items={[
            { id: "id", label: "Identifiant", value: "perturbation-00001" },
            { id: "cause", label: "Cause", value: "Travaux programmés" },
            { id: "line", label: "Ligne", value: <LineBadge {...LINES[0]} /> },
          ]} /> },
          { id: "stops", title: "Arrêts concernés", defaultOpen: true, content: <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {STOPS.filter((stop) => ["Châtelet", "Nation"].includes(stop.name)).map((stop) => <StopLabel key={stop.id} {...stop} />)}
          </div> },
          { id: "message", title: "Message voyageurs", content: "La ligne 1 est interrompue entre Châtelet et Nation. Empruntez les bus de remplacement. Reprise prévue à 17:00." },
          { id: "history", title: "Historique d’activité", content: <ActivityFeed aria-label="Historique de la perturbation" timeZone="Europe/Paris" items={[
            { id: "publish", title: "Message voyageurs publié", date: new Date("2026-10-22T07:00:00Z"), author: "Camille Martin", tone: "success" },
            { id: "created", title: "Travaux programmés", date: new Date("2026-10-21T14:00:00Z"), author: "Alex Dupont" },
          ]} /> },
        ]} />
      </div>
    </Drawer>
  </DemoLayout>;
};

type ImportIssue = { message: string; target: "name" | "file" };
const IMPORT_STEPS = ["Source", "Vérification", "Résultat"];
const LINE_OPTIONS = LINES.map((line) => ({ id: line.code, label: line.code, group: line.mode === "metro" ? "Métro" : "Autres modes" }));

function ImportPage() {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (issues.length) summaryRef.current?.focus();
  }, [issues]);
  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);
  useEffect(() => {
    if (progress === null || progress >= 100) return;
    const timer = window.setInterval(() => setProgress((value) => Math.min(100, (value ?? 0) + 25)), 150);
    return () => window.clearInterval(timer);
  }, [progress]);

  const validate = async () => {
    const next: ImportIssue[] = [];
    if (!name.trim()) next.push({ target: "name", message: "Renseignez le nom du réseau." });
    if (!file) next.push({ target: "file", message: "Choisissez un fichier CSV d’arrêts." });
    if (file) {
      setChecking(true);
      try {
        const content = await file.text();
        const header = content.replace(/^\uFEFF/, "").split(/\r?\n/)[0]?.split(/[,;]/).map((part) => part.trim());
        if (!header?.includes("stop_id") || !header.includes("stop_name")) {
          next.push({ target: "file", message: "Le CSV doit contenir les colonnes stop_id et stop_name." });
        }
      } catch {
        next.push({ target: "file", message: "Le fichier ne peut pas être lu. Choisissez-le à nouveau." });
      } finally {
        setChecking(false);
      }
    }
    setIssues(next);
    if (!next.length) setStep(1);
  };

  const files: UploadFile[] = file ? [{ id: "source", name: file.name, size: file.size, status: issues.some((issue) => issue.target === "file") ? "error" : "pending" }] : [];
  const done = progress === 100;
  return <DemoLayout activeId="import">
    <PageHeader title="Importer un réseau" subtitle="Démonstration locale : contrôle des en-têtes CSV, aucun envoi à un serveur" sticky={false} />
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
      <Stepper steps={IMPORT_STEPS.map((label, index) => ({ id: String(index), label, state: index < step || (index === 2 && done) ? "completed" : index === step ? "current" : "upcoming" }))}
        onStepClick={progress === null ? (id) => { setStep(Number(id)); setIssues([]); } : undefined} />
      {step === 0 && <>
        <ErrorSummary ref={summaryRef} errors={issues.map((issue) => ({
          id: issue.target, message: issue.message, target: issue.target === "name" ? nameRef : uploadRef,
        }))} />
        <TextInput ref={nameRef} label="Nom du réseau" value={name} onChange={(event) => setName(event.target.value)}
          state={issues.some((issue) => issue.target === "name") ? "error" : "enabled"} helperText="Exemple : Réseau de Bordeaux" />
        <div ref={uploadRef}>
          <FileUpload accept=".csv" maxSize={5_000_000} files={files} onFiles={(next) => { setFile(next[0]); setIssues([]); }} onRemove={() => { setFile(null); setIssues([]); }} />
        </div>
        <InlineAlert type="information">Utilisez un CSV UTF-8 dont la première ligne contient stop_id et stop_name. Cette recette contrôle les en-têtes ; elle ne valide pas un jeu GTFS complet.</InlineAlert>
        <Autocomplete label="Lignes associées (facultatif)" multiple options={LINE_OPTIONS} value={lines} onChange={(value) => setLines(Array.isArray(value) ? value : [])} />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <PrimaryButton label="Vérifier le fichier" loading={checking} onClick={() => { void validate(); }} />
        </div>
      </>}
      {step === 1 && <>
        <h2 ref={headingRef} tabIndex={-1}>Vérifier avant l’import</h2>
        <InlineAlert type="success" title="En-têtes reconnus">Les colonnes stop_id et stop_name sont présentes.</InlineAlert>
        <DescriptionList aria-label="Synthèse de l’import" items={[
          { id: "network", label: "Réseau", value: name.trim() },
          { id: "file", label: "Source", value: file?.name },
          { id: "lines", label: "Lignes associées", value: lines.length ? lines.join(", ") : "Aucune" },
        ]} />
        <div style={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 8 }}>
          <GhostButton label="Modifier la source" onClick={() => setStep(0)} />
          <PrimaryButton label="Simuler l’import" onClick={() => { setStep(2); setProgress(0); }} />
        </div>
      </>}
      {step === 2 && <>
        <h2 ref={headingRef} tabIndex={-1}>{done ? "Import terminé" : "Import en cours"}</h2>
        <ProgressBar value={progress ?? undefined} label="Import du réseau" showValue tone={done ? "success" : "default"} />
        {done && <InlineAlert type="success" title="Simulation terminée">Le réseau {name.trim()} a été traité dans cette démonstration. Aucune donnée n’a été publiée.</InlineAlert>}
        <GhostButton label="Recommencer" disabled={!done} onClick={() => { setStep(0); setFile(null); setProgress(null); setName(""); setLines([]); }} />
      </>}
    </div>
  </DemoLayout>;
}

const meta = {
  title: "Recettes/Parcours transport",
  parameters: { layout: "fullscreen", a11y: { test: "error" } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const DetailPerturbation: Story = {
  name: "Détail d’une perturbation",
  render: () => <DetailPage />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: "Consulter" });
    await userEvent.click(trigger);
    const dialog = await body.findByRole("dialog", { name: "Travaux entre Châtelet et Nation" });
    await expect(within(dialog).getByText("Châtelet")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Prendre en compte" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent("prise en compte");
  },
};

export const ImportReseau: Story = {
  name: "Import réseau et reprise après erreur",
  render: () => <ImportPage />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Vérifier le fichier" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("Renseignez le nom du réseau");
    await userEvent.click(canvas.getByRole("button", { name: "Choisissez un fichier CSV d’arrêts." }));
    await expect(canvas.getByRole("button", { name: "Parcourir" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Renseignez le nom du réseau." }));
    await expect(canvas.getByRole("textbox", { name: "Nom du réseau" })).toHaveFocus();
    await userEvent.type(canvas.getByRole("textbox", { name: "Nom du réseau" }), "Réseau de Bordeaux");
    const input = canvas.getByLabelText("Choisir des fichiers");
    await userEvent.upload(input, new File(["id,name\n1,Châtelet"], "invalide.csv", { type: "text/csv" }));
    await userEvent.click(canvas.getByRole("button", { name: "Vérifier le fichier" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("stop_id et stop_name");
    await userEvent.upload(input, new File(["stop_id,stop_name\n1,Châtelet"], "arrets.csv", { type: "text/csv" }));
    await userEvent.click(canvas.getByRole("button", { name: "Vérifier le fichier" }));
    await canvas.findByRole("heading", { name: "Vérifier avant l’import" });
    await userEvent.click(canvas.getByRole("button", { name: "Simuler l’import" }));
    await waitFor(() => expect(canvas.getByRole("heading", { name: "Import terminé" })).toBeInTheDocument(), { timeout: 3000 });
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    await userEvent.click(canvas.getByRole("button", { name: "Recommencer" }));
    await expect(canvas.getByRole("textbox", { name: "Nom du réseau" })).toHaveValue("");
  },
};
