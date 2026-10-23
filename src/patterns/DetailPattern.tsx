import { useState } from "react";
import {
  PageHeader, Breadcrumbs, PageSection, TabList, Tab, DescriptionList, ActivityFeed,
  PrimaryButton, GhostButton, Modal, LineBadge,
} from "@ddaoellena/cadence-ui";

// Pattern — Page de détail (P4).
// En-tête avec actions (dont une action destructive à confirmer), onglets de
// page, sections, historique. Un seul `h1` ; sections en `h2`.
export const DetailPattern = () => {
  const [tab, setTab] = useState("infos");
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 880 }}>
      <PageHeader
        breadcrumbs={<Breadcrumbs items={[{ id: "list", label: "Perturbations" }, { id: "cur", label: "Travaux ligne 1" }]} />}
        title="Travaux entre Châtelet et Nation"
        subtitle="Ligne 1 · du 12 au 14 juin 2026"
        actions={<>
          <GhostButton label="Modifier" iconStart="edit-02" onClick={() => {}} />
          <PrimaryButton tone="danger" outline label="Supprimer" iconStart="trash" onClick={() => setConfirmOpen(true)} />
        </>} />

      <TabList aria-label="Sections de la perturbation">
        <Tab label="Informations" variant={tab === "infos" ? "active" : "default"} onClick={() => setTab("infos")} />
        <Tab label="Historique" variant={tab === "history" ? "active" : "default"} onClick={() => setTab("history")} />
      </TabList>

      {tab === "infos" ? (
        <PageSection title="Informations">
          <DescriptionList aria-label="Détail de la perturbation" items={[
            { id: "line", label: "Ligne", value: <LineBadge code="1" mode="metro" /> },
            { id: "type", label: "Type", value: "Travaux planifiés" },
            { id: "period", label: "Période", value: "12/06/2026 08:00 → 14/06/2026 18:00" },
            { id: "impact", label: "Impact", value: "Interruption entre Châtelet et Nation" },
          ]} />
        </PageSection>
      ) : (
        <PageSection title="Historique d'activité">
          <ActivityFeed aria-label="Historique de la perturbation" timeZone="Europe/Paris" items={[
            { id: "pub", title: "Message voyageurs publié", date: new Date("2026-06-11T07:00:00Z"), author: "Camille Martin", tone: "success" },
            { id: "cre", title: "Travaux programmés", date: new Date("2026-06-10T14:00:00Z"), author: "Alex Dupont" },
          ]} />
        </PageSection>
      )}

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Supprimer cette perturbation ?" size="small"
        secondaryAction={{ label: "Annuler", onClick: () => setConfirmOpen(false) }}
        primaryAction={{ label: "Supprimer", destructive: true, onClick: () => setConfirmOpen(false) }}>
        Cette action est irréversible.
      </Modal>
    </div>
  );
};
