import { useState } from "react";
import {
  PageHeader, CardGrid, Card, DataFreshness, InlineAlert, BulletChart, DateRangePicker, type DateRange,
} from "@ddaoellena/cadence-ui";

// Pattern — Tableau de bord de supervision (P7).
// Période partagée · fraîcheur de la donnée · alerte temps réel · grille
// d'indicateurs cliquables qui mènent à la liste filtrée · indicateurs du
// contrat par rapport à leur objectif (BulletChart).
export const SupervisionPattern = ({ loading = false }: { loading?: boolean } = {}) => {
  const [period, setPeriod] = useState<DateRange>({ start: new Date("2026-06-05"), end: new Date("2026-06-12") });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Supervision" subtitle="Temps réel · réseau de démonstration"
        actions={<DateRangePicker variant="button" aria-label="Période" value={period} onChange={setPeriod} maxDate={new Date()} maxDays={92} />} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <DataFreshness updatedAt="2026-06-12T08:12:00" now="2026-06-12T08:15:00" />
        <span />
      </div>

      <InlineAlert type="warning" title="3 perturbations critiques en cours">
        La ligne 1 est interrompue entre Châtelet et Nation.
      </InlineAlert>

      <CardGrid>
        <Card headingLevel={2} title="Ponctualité" value={94.2} unit="%" delta={{ value: -0.6, unit: "pt", label: "vs hier" }} loading={loading} />
        <Card headingLevel={2} title="Retard moyen" value={3.4} unit="min" goodDirection="down" delta={{ value: 0.2, label: "vs hier" }} loading={loading} />
        <Card headingLevel={2} title="Courses réalisées" value={12430} delta={{ value: 1.8, label: "vs hier" }} loading={loading} />
        <Card headingLevel={2} title="Perturbations actives" value={27} goodDirection="down"
          status="critical" statusLabel="Seuil dépassé" onClick={() => {}} actionLabel="Voir les alertes" loading={loading} />
      </CardGrid>

      <BulletChart framed headingLevel={2} title="Indicateurs du contrat" description="Depuis le début de la journée — échelle de 80 à 100 %"
        state={loading ? "loading" : "ready"} unit="%" min={80}
        items={[
          { id: "ponctualite", label: "Ponctualité", value: 94.2, target: 92,
            ranges: [{ value: 85, label: "Malus sous 85 %" }, { value: 92, label: "Bonus dès 92 %" }] },
          { id: "offre", label: "Réalisation de l'offre", value: 97.6, target: 98.5,
            ranges: [{ value: 97, label: "Malus sous 97 %" }, { value: 98.5, label: "Bonus dès 98,5 %" }] },
        ]} />

      {/* La liste filtrée par la même période suit (voir Pattern — Liste / index). */}
    </div>
  );
};
