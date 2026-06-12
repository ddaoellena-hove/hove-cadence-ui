import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TableCard, TableCardAction } from "./TableCard";

/* ── Icône personnalisée ── */

const DisruptionIcon = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.4 17C18.7314 17 19 17.2686 19 17.6V18.8C19 18.9105 18.9105 19 18.8 19H1.2C1.08954 19 1 18.9105 1 18.8V17.6C1 17.2686 1.26863 17 1.6 17H18.4Z" fill="#737373"/>
    <path d="M15.7878 14.721C15.9086 15.1074 15.6199 15.5 15.2151 15.5H4.78486C4.38008 15.5 4.09143 15.1074 4.21216 14.721L5.21875 11.5H14.7813L15.7878 14.721Z" fill="#737373"/>
    <path d="M14.3125 10H5.6875L6.9375 6H13.0625L14.3125 10Z" fill="#737373"/>
    <path d="M10.3972 1C11.0533 1 11.6333 1.42638 11.829 2.05259L12.5938 4.5H7.40625L8.17105 2.05259C8.36674 1.42638 8.94671 1 9.60278 1H10.3972Z" fill="#737373"/>
  </svg>
);

const meta: Meta<typeof TableCard> = {
  title: "Components/TableCard",
  component: TableCard,
  tags: ["autodocs"],
  argTypes: {
    state: {
      control: "select",
      options: ["default", "selected", "disabled"],
    },
    checkboxState: {
      control: "select",
      options: ["unchecked", "checked", "indeterminate"],
    },
    icon: { control: "text" },
    title: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof TableCard>;

/* ── Helpers cellules ── */

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

const InfoCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div
    style={{
      background: "#ECECEC",
      border: "1px solid #E5E5E5",
      borderRadius: 10,
      overflow: "hidden",
    }}
  >
    {/* Header — transparent */}
    <div style={{ padding: "6px 12px" }}>
      <span
        style={{
          fontFamily: "Inter, Helvetica",
          fontSize: 11,
          fontWeight: 600,
          color: "#737373",
          textTransform: "uppercase" as const,
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
    </div>
    {/* Content */}
    <div
      style={{
        borderRadius: "10px 10px 0 0",
        background: "#F7F7F7",
        boxShadow: "0 0 2px 0 rgba(0, 0, 0, 0.25)",
        padding: "10px 12px",
      }}
    >
      {children}
    </div>
  </div>
);

const SeverityBadge = ({ label, color }: { label: string; color: "orange" | "green" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: color === "orange" ? "#f59e0b" : "#24a148",
        flexShrink: 0,
      }}
    />
    <span style={{ fontFamily: "Inter, Helvetica", fontSize: 13, fontWeight: 500, color: "#002830" }}>
      {label}
    </span>
  </div>
);

/* ── Actions par défaut (utilise TableCardAction du composant) ── */

const defaultActions = (
  <>
    <TableCardAction icon="copy-01" label="Copier" />
    <TableCardAction icon="edit-02" label="Modifier" />
    <TableCardAction icon="save-01" label="Archiver" />
    <TableCardAction icon="trash" label="Supprimer" destructive />
  </>
);

/* ── Colonnes par défaut ── */

const defaultColumns = [
  { key: "maj",    content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
  { key: "debut",  content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
  { key: "fin",    content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
  {
    key: "info",
    content: (
      <InfoCard label="Ligne">
        <span style={{ fontFamily: "Inter, Helvetica", fontSize: 13, color: "#002830" }}>
          Ligne 13 → Châtillon - Montrouge
        </span>
      </InfoCard>
    ),
    flex: 1,
  },
  {
    key: "severity",
    content: <SeverityBadge label="Ralenti" color="orange" />,
    width: 110,
  },
];

/* ── Stories ── */

export const Default: Story = {
  args: {
    title: "Perturbation 1",
    iconElement: <DisruptionIcon />,
    checkboxState: "unchecked",
    state: "default",
    columns: defaultColumns,
  },
};

export const WithActions: Story = {
  args: {
    title: "Perturbation 1",
    iconElement: <DisruptionIcon />,
    checkboxState: "unchecked",
    state: "default",
    actions: defaultActions,
    columns: defaultColumns,
  },
};

export const Selected: Story = {
  args: {
    title: "Perturbation 1",
    iconElement: <DisruptionIcon />,
    checkboxState: "checked",
    state: "selected",
    actions: defaultActions,
    columns: defaultColumns,
  },
};

export const Indeterminate: Story = {
  args: {
    title: "Perturbation 1",
    iconElement: <DisruptionIcon />,
    checkboxState: "indeterminate",
    state: "default",
    actions: defaultActions,
    columns: defaultColumns,
  },
};

export const Disabled: Story = {
  args: {
    title: "Perturbation 1",
    iconElement: <DisruptionIcon />,
    checkboxState: "unchecked",
    state: "disabled",
    actions: defaultActions,
    columns: defaultColumns,
  },
};

/** Plusieurs InfoCards empilées dans la même colonne. */
export const StackedInfoCards: Story = {
  render: () => (
    <div style={{ padding: 24 }}>
      <TableCard
        title="Perturbation 1"
        iconElement={<DisruptionIcon />}
        checkboxState="unchecked"
        actions={
          <>
            <TableCardAction icon="copy-01" label="Copier" />
            <TableCardAction icon="edit-02" label="Modifier" />
            <TableCardAction icon="save-01" label="Archiver" />
            <TableCardAction icon="trash" label="Supprimer" destructive />
          </>
        }
        columns={[
          { key: "maj",   content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
          { key: "debut", content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
          { key: "fin",   content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
          {
            key: "details",
            flex: 1,
            content: (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <InfoCard label="Ligne">
                  <span style={{ fontFamily: "Inter, Helvetica", fontSize: 13, color: "#002830" }}>
                    Ligne 13 → Châtillon - Montrouge
                  </span>
                </InfoCard>
                <InfoCard label="Points d'intérêt">
                  <span style={{ fontFamily: "Inter, Helvetica", fontSize: 13, color: "#002830" }}>
                    Gare du Nord, Châtelet-Les Halles
                  </span>
                </InfoCard>
                <InfoCard label="Déviation">
                  <span style={{ fontFamily: "Inter, Helvetica", fontSize: 13, color: "#002830" }}>
                    Via Boulevard Haussmann → Rue Lafayette
                  </span>
                </InfoCard>
              </div>
            ),
          },
          { key: "severity", content: <SeverityBadge label="Ralenti" color="orange" />, width: 110 },
        ]}
      />
    </div>
  ),
};

/** Variante sans header — uniquement le contenu avec ses colonnes. */
export const ContentOnly: Story = {
  args: {
    columns: defaultColumns,
  },
};

export const MultipleRows: Story = {
  render: () => {
    const [checked, setChecked] = useState<Record<string, boolean>>({
      "1": false,
      "2": false,
      "3": false,
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 24 }}>
        {[
          { id: "1", title: "Perturbation 1", severity: { label: "Ralenti",      color: "orange" as const }, info: "Ligne 13 → Châtillon - Montrouge" },
          { id: "2", title: "Perturbation 2", severity: { label: "Information",  color: "green"  as const }, info: "Hôpital Bretonneau (Paris)"         },
          { id: "3", title: "Perturbation 3", severity: { label: "Information",  color: "green"  as const }, info: "RER A — Nation → Gare de Lyon"       },
        ].map((row) => (
          <TableCard
            key={row.id}
            title={row.title}
            iconElement={<DisruptionIcon />}
            checkboxState={checked[row.id] ? "checked" : "unchecked"}
            state={checked[row.id] ? "selected" : "default"}
            onCheckboxChange={(v) => setChecked((prev) => ({ ...prev, [row.id]: v }))}
            actions={
              <>
                <TableCardAction icon="copy-01"  label="Copier"     />
                <TableCardAction icon="edit-02"  label="Modifier"   />
                <TableCardAction icon="save-01"  label="Archiver"   />
                <TableCardAction icon="trash"    label="Supprimer" destructive />
              </>
            }
            columns={[
              { key: "maj",      content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
              { key: "debut",    content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
              { key: "fin",      content: <DateCell date="13.03.2024" time="14h00" />, width: 110 },
              {
                key: "info",
                content: (
                  <InfoCard label="Informations">
                    <span style={{ fontFamily: "Inter, Helvetica", fontSize: 13, color: "#002830" }}>
                      {row.info}
                    </span>
                  </InfoCard>
                ),
                flex: 1,
              },
              {
                key: "severity",
                content: <SeverityBadge label={row.severity.label} color={row.severity.color} />,
                width: 110,
              },
            ]}
          />
        ))}
      </div>
    );
  },
};
