import { useRef, useState } from "react";
import {
  PageHeader, PageSection, FieldRow, FormActions,
  TextInput, TextArea, Dropdown, DatePicker, CounterInput, SegmentedControl,
  DescriptionList, ErrorSummary, PrimaryButton, GhostButton, Link, Modal,
} from "@ddaoellena/cadence-ui";

// Pattern — Formulaire de création / édition (P5).
// Sections empilées (PageSection), rangées de champs (FieldRow), synthèse
// (DescriptionList), résumé d'erreurs (ErrorSummary) et actions (FormActions).
// Le multi-colonnes vit à l'intérieur d'une section, jamais à côté du formulaire.
// `onSave` / `onLeave` : navigation et persistance fournies par l'app.
export const FormulairePattern = ({ onSave = () => {}, onLeave = () => {} }: {
  onSave?: () => void;
  onLeave?: () => void;
} = {}) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>();
  const [cause, setCause] = useState<string>();
  const [mode, setMode] = useState("planifiee");
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ id: string; message: string; target: typeof titleRef }[]>([]);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    // L'app calcule ses erreurs (formulaire noValidate) ; ErrorSummary renvoie au champ.
    const next = title.trim() ? [] : [{ id: "title", message: "Renseignez le titre du scénario.", target: titleRef }];
    setErrors(next);
    if (next.length === 0) onSave();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
      <PageHeader title="Créer un scénario" subtitle="Renseignez le titre, puis les détails de la perturbation." />

      {errors.length > 0 && <ErrorSummary title="Corrigez les erreurs suivantes" errors={errors} focusOnMount />}

      <PageSection title="Informations générales">
        <TextInput ref={titleRef} label="Titre" placeholder="Ex : Tronçon Melun – Montereau"
          value={title} onChange={(e) => setTitle(e.target.value)}
          helperText={errors.some((x) => x.id === "title") ? "Ce champ est requis." : undefined}
          state={errors.some((x) => x.id === "title") ? "error" : "enabled"} />
        <FieldRow>
          <Dropdown label="Type" placeholder="Sélectionner" value={type} onChange={setType}
            options={[{ id: "works", label: "Travaux" }, { id: "incident", label: "Incident" }]} />
          <Dropdown label="Cause" placeholder="Sélectionner" value={cause} onChange={setCause}
            options={[{ id: "weather", label: "Météo" }, { id: "tech", label: "Technique" }]} />
        </FieldRow>
        <SegmentedControl aria-label="Mode de déclenchement" value={mode} onChange={setMode}
          options={[{ value: "planifiee", label: "Planifiée" }, { value: "immediate", label: "Immédiate" }]} />
      </PageSection>

      <PageSection title="Période">
        <FieldRow>
          <DatePicker label="Début" value={start} onChange={setStart} withTime />
          <DatePicker label="Fin" value={end} onChange={setEnd} withTime />
        </FieldRow>
        <CounterInput label="Durée estimée" min={0} max={480} step={15} unit="min" value={duration} onChange={setDuration} />
        <TextArea label="Description" rows={4} placeholder="Impacts attendus, mesures prises…"
          value={description} onChange={(e) => setDescription(e.target.value)} />
      </PageSection>

      <PageSection title="Récapitulatif" gap={12}>
        <DescriptionList aria-label="Scénario à créer" items={[
          { id: "title", label: "Titre", value: title || undefined },
          { id: "type", label: "Type et cause", value: type && cause ? `${type} · ${cause}` : undefined },
          { id: "duration", label: "Durée estimée", value: `${duration} min` },
        ]} />
      </PageSection>

      <FormActions>
        <Link hideArrow onClick={() => setLeaveOpen(true)}>Quitter sans enregistrer</Link>
        <GhostButton label="Réinitialiser" onClick={() => setTitle("")} />
        <PrimaryButton label="Créer le scénario" onClick={submit} />
      </FormActions>

      <Modal isOpen={leaveOpen} onClose={() => setLeaveOpen(false)} title="Quitter sans enregistrer ?" size="small"
        secondaryAction={{ label: "Rester", onClick: () => setLeaveOpen(false) }}
        primaryAction={{ label: "Quitter", destructive: true, onClick: onLeave }}>
        Les modifications non enregistrées seront perdues.
      </Modal>
    </div>
  );
};
