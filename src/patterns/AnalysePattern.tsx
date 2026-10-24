import { useState } from "react";
import {
  PageHeader, CardGrid, Card, LineChart, Heatmap, BarList, DonutChart, Histogram, DateRangePicker, type DateRange,
} from "@ddaoellena/cadence-ui";

// Pattern — Tableau de bord d'analyse (P8).
// Période partagée · grille d'indicateurs · évolution comparée à la période
// précédente (LineChart + série `reference`) · motif jour × heure (Heatmap) à
// côté du classement (BarList) · répartition (DonutChart) à côté de la
// distribution (Histogram). Chaque bloc gère son état (`state`) à partir de la
// requête ; les graphiques sont encadrés (`framed`) pour rester délimités.
const HOURS = ["6h", "8h", "10h", "12h", "14h", "16h", "18h"];
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
const CELLS = WEEKDAYS.flatMap((y, j) => HOURS.map((x, h) => ({ x, y, value: (j + h) % 5 })));
const DELAYS = HOURS.map((x, i) => ({ x, y: 2 + Math.sin(i) + i * 0.3 }));
const DELAYS_BEFORE = HOURS.map((x, i) => ({ x, y: 2.4 + Math.cos(i) * 0.6 + i * 0.2 }));
// Retards observés (min), une valeur par course : beaucoup de petits retards, une traîne
const ARRIVAL_DELAYS = Array.from({ length: 240 }, (_, i) => -Math.log(1 - ((i * 37) % 97) / 97) * 2.4 - 0.5);

export const AnalysePattern = ({ state = "ready" }: { state?: "loading" | "error" | "ready" } = {}) => {
  const [period, setPeriod] = useState<DateRange>({ start: new Date("2026-06-05"), end: new Date("2026-06-12") });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Analyse des perturbations" subtitle="Données de démonstration"
        actions={<DateRangePicker variant="button" aria-label="Période" value={period} onChange={setPeriod} maxDays={92} />} />

      <CardGrid>
        <Card headingLevel={2} title="Retard moyen" value={3.4} unit="min" goodDirection="down" delta={{ value: 0.2, label: "vs période précédente" }} loading={state === "loading"} />
        <Card headingLevel={2} title="Ponctualité" value={94.2} unit="%" delta={{ value: -0.6, unit: "pt" }} loading={state === "loading"} />
        <Card headingLevel={2} title="Perturbations" value={312} goodDirection="down" onClick={() => {}} actionLabel="Voir les perturbations" loading={state === "loading"} />
      </CardGrid>

      <LineChart framed headingLevel={2} title="Retard moyen par heure" description="Toutes lignes, sur la période"
        state={state} onRetry={() => {}} unit="min" goodDirection="down"
        series={[
          { id: "delay", label: "Période", data: DELAYS },
          { id: "before", label: "Période précédente", reference: true, data: DELAYS_BEFORE },
        ]}
        thresholds={[{ value: 5, label: "Seuil d'alerte 5 min" }]} />

      <CardGrid min={360} fit>
        <Heatmap framed headingLevel={2} title="Perturbations par jour et par heure" state={state}
          unit="perturbations" xLabels={HOURS} yLabels={WEEKDAYS} cells={CELLS} onCellClick={() => {}} />
        <BarList framed headingLevel={2} title="Lignes les plus impactées" state={state} unit="perturbations" goodDirection="down"
          items={[{ id: "m1", label: "Ligne 1", value: 84 }, { id: "ra", label: "RER A", value: 61 }, { id: "m4", label: "Ligne 4", value: 47 }]}
          limit={5} onItemClick={() => {}} />
      </CardGrid>

      <CardGrid min={360} fit>
        <DonutChart framed headingLevel={2} title="Perturbations par cause" state={state} onRetry={() => {}} unit="perturbations"
          slices={[
            { id: "technique", label: "Incident technique", value: 124 },
            { id: "travaux", label: "Travaux", value: 86 },
            { id: "voyageur", label: "Malaise voyageur", value: 54 },
            { id: "trafic", label: "Trafic routier", value: 48 },
          ]} />
        <Histogram framed headingLevel={2} title="Distribution des retards" state={state} onRetry={() => {}}
          values={ARRIVAL_DELAYS} bins={[0, 1, 2, 3, 5, 10]} unit="min" countLabel="courses"
          thresholds={[{ value: 5, label: "Retard 5 min" }]} />
      </CardGrid>
    </div>
  );
};
