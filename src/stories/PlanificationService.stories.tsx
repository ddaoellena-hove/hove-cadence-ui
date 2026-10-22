import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { ActivityFeed, DescriptionList, ErrorSummary, InlineAlert, PageHeader, PrimaryButton, TimePicker, type SummaryError } from "../components";
import { parseTime } from "../components/time-picker-utils";

function PlanificationService() {
  const [start, setStart] = useState("23:30");
  const [end, setEnd] = useState("23:00");
  const [errors, setErrors] = useState<SummaryError[]>([]);
  const [saved, setSaved] = useState<{ start: string; end: string } | null>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  return <div style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 720 }}>
    <PageHeader title="Planifier un service de nuit" sticky={false} subtitle="Les heures après 24:00 restent rattachées au même jour de service." />
    <form noValidate style={{ display: "flex", flexDirection: "column", gap: 24 }} onSubmit={(event) => {
      event.preventDefault();
      const next: SummaryError[] = [];
      if (!startRef.current?.checkValidity()) next.push({ id: "start", message: "Corrigez l’heure de début.", target: "service-start" });
      if (!endRef.current?.checkValidity()) next.push({ id: "end", message: "Corrigez l’heure de fin.", target: "service-end" });
      if (!next.length && parseTime(end, true)! <= parseTime(start, true)!) next.push({ id: "range", message: "La fin doit suivre le début du service.", target: "service-end" });
      setErrors(next);
      if (next.length) summaryRef.current?.focus();
      else setSaved({ start, end });
    }}>
      <ErrorSummary ref={summaryRef} errors={errors} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 24 }}>
        <div id="service-start"><TimePicker ref={startRef} label="Début de service" value={start} onChange={(value) => { setStart(value); setErrors([]); }} required allowOvernight minuteStep={15} /></div>
        <div id="service-end"><TimePicker ref={endRef} label="Fin de service" value={end} onChange={(value) => { setEnd(value); setErrors([]); }} required allowOvernight minuteStep={15}
          helperText="Exemple : 25:30 pour 01:30 le jour suivant." /></div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}><PrimaryButton type="submit" label="Enregistrer la plage" /></div>
    </form>
    {saved && <>
      <InlineAlert type="success" title="Plage enregistrée">L’enregistrement est local à cette démonstration.</InlineAlert>
      <DescriptionList aria-label="Plage enregistrée" items={[
        { id: "start", label: "Début de service", value: saved.start }, { id: "end", label: "Fin de service", value: saved.end },
      ]} />
      <ActivityFeed aria-label="Historique de planification" timeZone="Europe/Paris" items={[
        { id: "saved", title: "Plage de service enregistrée", author: "Camille Martin", date: new Date("2026-10-22T10:00:00Z"), tone: "success", description: `${saved.start} – ${saved.end}` },
      ]} />
    </>}
  </div>;
}
const meta: Meta<typeof PlanificationService> = {
  title: "Recettes/Planification de service", component: PlanificationService,
  parameters: { layout: "padded", a11y: { test: "error" } },
};
export default meta;
type Story = StoryObj<typeof meta>;
export const ServiceDeNuit: Story = {
  name: "Service de nuit et validation",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Enregistrer la plage" }));
    await expect(canvas.getByRole("region", { name: "Corrigez les champs suivants" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "La fin doit suivre le début du service." }));
    const trigger = canvas.getByRole("button", { name: "Fin de service : 23:00" });
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    const end = canvas.getByRole("spinbutton", { name: "Heures — Fin de service" });
    await userEvent.clear(end);
    await userEvent.type(end, "25");
    const minutes = canvas.getByRole("spinbutton", { name: "Minutes — Fin de service" });
    await userEvent.clear(minutes);
    await userEvent.type(minutes, "30{Enter}");
    await userEvent.click(canvas.getByRole("button", { name: "Enregistrer la plage" }));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent("Plage enregistrée");
    await expect(canvas.getByRole("region", { name: "Historique de planification" })).toHaveTextContent("23:30 – 25:30");
  },
};
