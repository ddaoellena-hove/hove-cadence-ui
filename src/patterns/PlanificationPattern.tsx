import { useState } from "react";
import {
  PageHeader, PageSection, FieldRow, FormActions, Timeline, TimePicker, ErrorSummary,
  PrimaryButton, Link,
} from "@ddaoellena/cadence-ui";

// Pattern — Planification / temps (P9).
// Visualisation des amplitudes sur un axe temps (Timeline, heures de service
// jusqu'à 47:59) et saisie d'horaires de nuit (TimePicker allowOvernight),
// avec validation (ErrorSummary) et comparaison début/fin par l'app.
export const PlanificationPattern = () => {
  const [start, setStart] = useState("22:00");
  const [end, setEnd] = useState("25:30");
  // L'app calcule ses erreurs (comparaison début/fin) et renvoie au champ fautif.
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 820 }}>
      <PageHeader title="Planifier un service de nuit" subtitle="Les heures après 24:00 restent rattachées au même jour de service." />

      <Timeline headingLevel={2} title="Amplitudes de service" allowOvernight rows={[
        { id: "m1", label: "Ligne 1", items: [{ id: "a", start: "05:30", end: "25:30", label: "Service", tone: "active" }] },
        { id: "n", label: "Noctilien", items: [{ id: "b", start: "00:30", end: "05:30", label: "Service de nuit", tone: "upcoming" }] },
      ]} />

      {errors.length > 0 && <ErrorSummary title="Corrigez les erreurs" errors={errors} focusOnMount />}

      <PageSection bodyPadding="all" title="Plage de service">
        <FieldRow>
          <TimePicker label="Début" value={start} onChange={setStart} allowOvernight />
          <TimePicker label="Fin" value={end} onChange={setEnd} allowOvernight />
        </FieldRow>
      </PageSection>

      <FormActions>
        <Link hideArrow onClick={() => {}}>Annuler</Link>
        <PrimaryButton label="Enregistrer la plage" onClick={() => setErrors([])} />
      </FormActions>
    </div>
  );
};
