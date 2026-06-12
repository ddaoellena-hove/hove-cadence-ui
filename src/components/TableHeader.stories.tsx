import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TableHeader, type TableHeaderColumn } from "./TableHeader";
import { TableCard, TableCardAction } from "./TableCard";

const meta: Meta<typeof TableHeader> = {
  title: "Components/TableHeader",
  component: TableHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TableHeader>;

/* ── Helpers ── */

const DateCell = ({ date, time }: { date: string; time: string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ fontFamily: "Inter, Helvetica", fontSize: 13, fontWeight: 500, color: "#002830" }}>
      {date}
    </span>
    <span style={{ fontFamily: "Inter, Helvetica", fontSize: 12, color: "#809397" }}>
      {time}
    </span>
  </div>
);

const DisruptionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M18.4 17C18.7314 17 19 17.2686 19 17.6V18.8C19 18.9105 18.9105 19 18.8 19H1.2C1.08954 19 1 18.9105 1 18.8V17.6C1 17.2686 1.26863 17 1.6 17H18.4Z" fill="#737373"/>
    <path d="M15.7878 14.721C15.9086 15.1074 15.6199 15.5 15.2151 15.5H4.78486C4.38008 15.5 4.09143 15.1074 4.21216 14.721L5.21875 11.5H14.7813L15.7878 14.721Z" fill="#737373"/>
    <path d="M14.3125 10H5.6875L6.9375 6H13.0625L14.3125 10Z" fill="#737373"/>
    <path d="M10.3972 1C11.0533 1 11.6333 1.42638 11.829 2.05259L12.5938 4.5H7.40625L8.17105 2.05259C8.36674 1.42638 8.94671 1 9.60278 1H10.3972Z" fill="#737373"/>
  </svg>
);

/* ── Stories ── */

/** Header seul, sans tri actif. */
export const Default: Story = {
  args: {
    columns: [
      { key: "debut",  label: "Début",      sortable: true, sortDirection: "none", width: 110 },
      { key: "maj",    label: "Mise à jour", sortable: true, sortDirection: "none", width: 110 },
      { key: "fin",    label: "Fin",         sortable: true, sortDirection: "none", width: 110 },
      { key: "info",   label: "Informations et impacts", flex: 1 },
      { key: "sev",    label: "Sévérité",    width: 110 },
      { key: "cause",  label: "Cause",       width: 110 },
    ],
  },
};

/** Un tri actif (Mise à jour — ascendant). */
export const WithActiveSort: Story = {
  args: {
    columns: [
      { key: "debut",  label: "Début",      sortable: true, sortDirection: "none", width: 110 },
      { key: "maj",    label: "Mise à jour", sortable: true, sortDirection: "asc",  width: 110 },
      { key: "fin",    label: "Fin",         sortable: true, sortDirection: "none", width: 110 },
      { key: "info",   label: "Informations et impacts", flex: 1 },
      { key: "sev",    label: "Sévérité",    width: 110 },
      { key: "cause",  label: "Cause",       width: 110 },
    ],
  },
};

/**
 * Header combiné avec une liste de TableCards.
 * Le left-offset (espace avant les colonnes) correspond à la largeur
 * de la partie fixe du header de la card (checkbox + icon + title + actions).
 * Ici la carte header prend ~220px, géré via une colonne spacer.
 */
export const WithTableCards: Story = {
  render: () => {
    type SortKey = "debut" | "maj" | "fin";
    const [sortKey, setSortKey]       = useState<SortKey | null>(null);
    const [sortDir, setSortDir]       = useState<"asc" | "desc">("asc");

    const toggle = (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    };

    const dir = (key: SortKey) =>
      sortKey === key ? sortDir : "none";

    const headerColumns: TableHeaderColumn[] = [
      /* Spacer aligné sur la partie header du TableCard (checkbox + icon + titre) */
      { key: "spacer", label: "", width: 220 },
      { key: "debut",  label: "Début",      sortable: true, sortDirection: dir("debut"), onSort: () => toggle("debut"), width: 110 },
      { key: "maj",    label: "Mise à jour", sortable: true, sortDirection: dir("maj"),   onSort: () => toggle("maj"),   width: 110 },
      { key: "fin",    label: "Fin",         sortable: true, sortDirection: dir("fin"),   onSort: () => toggle("fin"),   width: 110 },
      { key: "info",   label: "Informations et impacts", flex: 1 },
      { key: "sev",    label: "Sévérité",    width: 110 },
      { key: "cause",  label: "Cause",       width: 110 },
    ];

    const rows = [
      { id: "1", title: "Tronçon Melun – Montereau", sev: "Ralenti",     cause: "Travaux"   },
      { id: "2", title: "Scénario 2",                sev: "Information", cause: "Travaux"   },
      { id: "3", title: "Perturbation 3",            sev: "Information", cause: "Incident"  },
    ];

    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 4 }}>
        <TableHeader columns={headerColumns} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => (
            <TableCard
              key={row.id}
              title={row.title}
              iconElement={<DisruptionIcon />}
              actions={
                <>
                  <TableCardAction icon="copy-01" label="Dupliquer" />
                  <TableCardAction icon="edit-02" label="Modifier" />
                  <TableCardAction icon="trash"   label="Supprimer" destructive />
                </>
              }
              columns={[
                { key: "debut",  content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
                { key: "maj",    content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
                { key: "fin",    content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
                {
                  key: "info",
                  content: (
                    <span style={{ fontFamily: "Inter, Helvetica", fontSize: 13, color: "#002830" }}>
                      {row.title}
                    </span>
                  ),
                  flex: 1,
                },
                {
                  key: "sev",
                  content: (
                    <span style={{ fontFamily: "Inter, Helvetica", fontSize: 13, color: "#002830" }}>
                      {row.sev}
                    </span>
                  ),
                  width: 110,
                },
                {
                  key: "cause",
                  content: (
                    <span style={{ fontFamily: "Inter, Helvetica", fontSize: 13, color: "#002830" }}>
                      {row.cause}
                    </span>
                  ),
                  width: 110,
                },
              ]}
            />
          ))}
        </div>
      </div>
    );
  },
};
