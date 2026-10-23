import { useState } from "react";
import { PageHeader, PageSection, FormActions, Toggle, RadioButton, PrimaryButton, Link } from "@ddaoellena/cadence-ui";

// Pattern — Paramètres (P10).
// Sections de réglages (PageSection) ; bascules immédiates (Toggle) et choix
// exclusifs (RadioButton). Décision : enregistrement **explicite** par défaut
// (bouton « Enregistrer ») ; les réglages à effet immédiat l'annoncent.
const Row = ({ title, description, control }: { title: string; description: string; control: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--cadence-color-label, #1a3e45)" }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--cadence-color-text-secondary, #64757a)" }}>{description}</div>
    </div>
    {control}
  </div>
);

export const ParametresPattern = () => {
  const [emailOn, setEmailOn] = useState(true);
  const [digest, setDigest] = useState("daily");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
      <PageHeader title="Paramètres" subtitle="Préférences de notification du réseau." />

      <PageSection title="Notifications" description="À effet immédiat.">
        <Row title="Notifications par e-mail" description="Un e-mail à chaque nouvelle perturbation critique."
          control={<Toggle state={emailOn ? "active" : "default"} aria-label="Notifications par e-mail" onChange={setEmailOn} />} />
      </PageSection>

      <PageSection title="Fréquence du récapitulatif">
        <Row title="Quotidien" description="Un récapitulatif chaque matin."
          control={<RadioButton state={digest === "daily" ? "selected" : "default"} aria-label="Récapitulatif quotidien" onChange={() => setDigest("daily")} />} />
        <Row title="Hebdomadaire" description="Un récapitulatif le lundi."
          control={<RadioButton state={digest === "weekly" ? "selected" : "default"} aria-label="Récapitulatif hebdomadaire" onChange={() => setDigest("weekly")} />} />
      </PageSection>

      <FormActions>
        <Link hideArrow onClick={() => {}}>Annuler</Link>
        <PrimaryButton label="Enregistrer les préférences" onClick={() => {}} />
      </FormActions>
    </div>
  );
};
