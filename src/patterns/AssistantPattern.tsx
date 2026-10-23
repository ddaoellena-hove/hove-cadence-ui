import { useState } from "react";
import {
  PageHeader, Stepper, FileUpload, ProgressBar, FormActions, InlineAlert,
  PrimaryButton, GhostButton, type UploadFile,
} from "@ddaoellena/cadence-ui";

// Pattern — Assistant multi-étapes / import (P6).
// Stepper (progression) · dépôt de fichier (FileUpload) · vérification ·
// transfert (ProgressBar) · reprise après erreur. Pied en `FormActions
// justify="between"` (Précédent / Suivant).
export const AssistantPattern = ({ step = 1 }: { step?: number } = {}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 760 }}>
      <PageHeader title="Importer un réseau" subtitle="Déposez le fichier GTFS, vérifiez, puis importez." />

      <Stepper steps={[
        { id: "upload", label: "Fichier", state: step > 1 ? "completed" : "current" },
        { id: "check", label: "Vérification", state: step > 2 ? "completed" : step === 2 ? "current" : "upcoming" },
        { id: "import", label: "Import", state: step === 3 ? "current" : "upcoming" },
      ]} />

      {step === 1 && (
        <FileUpload accept=".zip,.txt,.csv" onFiles={(fs) => setFiles(fs.map((f, i) => ({ id: `${i}`, name: f.name, size: f.size, status: "success" })))}
          files={files} onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))} />
      )}

      {step === 2 && (
        <InlineAlert type="error" title="2 erreurs à corriger">
          Corrigez les lignes signalées puis relancez la vérification.
        </InlineAlert>
      )}

      {step === 3 && <ProgressBar value={64} label="Import en cours…" showValue />}

      <FormActions justify="between">
        <GhostButton iconStart="arrow-left" label="Précédent" onClick={() => {}} />
        <PrimaryButton iconEnd="arrow-right" label={step === 3 ? "Terminer" : "Suivant"} onClick={() => {}} />
      </FormActions>
    </div>
  );
};
