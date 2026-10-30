import { useState } from "react";
import {
  PageHeader, PageSection, FieldRow, SegmentedControl, RepeatableFieldGroup, DatePicker, TimePicker,
  Checkbox, FormField, FormActions, PrimaryButton, DescriptionList, InlineAlert, type DateInputState,
} from "@ddaoellena/cadence-ui";
import { DAYS, describeSlot, slotsOverlap, validatePeriod, validateSlot, type Period, type Slot } from "./schedule-rules";

// Pattern — Périodes continues et créneaux récurrents (R2).
// Les deux modes conservent leur saisie ; seul le mode actif est appliqué. Les
// règles vivent dans schedule-rules.ts. Le fuseau est une décision du produit.
const newPeriod = (id: string): Period => ({ id, start: null, end: null });
const newSlot = (id: string): Slot => ({ id, days: [], from: "", to: "" });

export const PeriodesCreneauxPattern = () => {
  const [mode, setMode] = useState("periods");
  const [periods, setPeriods] = useState<Period[]>([newPeriod("p1")]);
  const [slots, setSlots] = useState<Slot[]>([newSlot("s1")]);
  const [nextId, setNextId] = useState(2);
  const [checked, setChecked] = useState(false);
  // Saisie de date non confirmée : la validation attend, pour ne pas juger une valeur périmée
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const updatePeriod = (id: string, patch: Partial<Period>) => setPeriods((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const updateSlot = (id: string, patch: Partial<Slot>) => setSlots((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const trackInput = (key: string) => (state: DateInputState) => setPending((map) => ({ ...map, [key]: state !== "confirmed" }));

  const slotError = (slot: Slot) => {
    const error = validateSlot(slot);
    if (error) return error;
    return slots.some((other) => other.id !== slot.id && !validateSlot(other) && slotsOverlap(slot, other)) ? "Ce créneau en chevauche un autre." : undefined;
  };

  const valid = mode === "periods"
    ? periods.every((period) => !validatePeriod(period)) && !Object.values(pending).some(Boolean)
    : slots.every((slot) => !slotError(slot));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720 }}>
      <PageHeader title="Période d'application" subtitle="Heures locales du réseau." />

      <SegmentedControl
        aria-label="Type de planification"
        value={mode}
        onChange={(value) => { setMode(value); setChecked(false); }}
        options={[{ value: "periods", label: "Périodes continues" }, { value: "slots", label: "Créneaux récurrents" }]}
      />

      <PageSection bodyPadding="all" title={mode === "periods" ? "Périodes" : "Créneaux"} description={mode === "slots" ? "Une heure de fin plus tôt que le début désigne le lendemain." : undefined}>
      {mode === "periods" ? (
        <RepeatableFieldGroup
          label="Périodes"
          items={periods}
          min={1}
          addLabel="Ajouter une période"
          getId={(item) => item.id}
          getTitle={(_, index) => `Période ${index + 1}`}
          getError={(item) => (checked ? validatePeriod(item) : undefined)}
          onAdd={() => { setPeriods((list) => [...list, newPeriod(`p${nextId}`)]); setNextId(nextId + 1); }}
          onRemove={(id) => setPeriods((list) => list.filter((item) => item.id !== id))}
          renderItem={(item) => (
            <FieldRow>
              <DatePicker label="Début" withTime value={item.start} onChange={(start) => updatePeriod(item.id, { start })} onInputStateChange={trackInput(`${item.id}-start`)} />
              <DatePicker label="Fin" withTime value={item.end} onChange={(end) => updatePeriod(item.id, { end })} onInputStateChange={trackInput(`${item.id}-end`)} />
            </FieldRow>
          )}
        />
      ) : (
        <RepeatableFieldGroup
          label="Créneaux"
          items={slots}
          min={1}
          addLabel="Ajouter un créneau"
          getId={(item) => item.id}
          getTitle={(_, index) => `Créneau ${index + 1}`}
          getError={(item) => (checked ? slotError(item) : undefined)}
          onAdd={() => { setSlots((list) => [...list, newSlot(`s${nextId}`)]); setNextId(nextId + 1); }}
          onRemove={(id) => setSlots((list) => list.filter((item) => item.id !== id))}
          renderItem={(item) => (
            <>
              <FormField label="Jours">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {DAYS.map((day, index) => (
                    <Checkbox
                      key={day}
                      label={day}
                      state={item.days.includes(index + 1) ? "checked" : "unchecked"}
                      onChange={(on) => updateSlot(item.id, { days: on ? [...item.days, index + 1] : item.days.filter((value) => value !== index + 1) })}
                    />
                  ))}
                </div>
              </FormField>
              <FieldRow>
                <TimePicker label="De" value={item.from} onChange={(from) => updateSlot(item.id, { from })} />
                <TimePicker label="À" value={item.to} onChange={(to) => updateSlot(item.id, { to })} />
              </FieldRow>
            </>
          )}
        />
      )}
      </PageSection>

      {mode === "slots" && (
        <PageSection bodyPadding="all" title="Récapitulatif">
          <DescriptionList aria-label="Créneaux saisis" items={slots.map((slot, index) => ({ id: slot.id, label: `Créneau ${index + 1}`, value: describeSlot(slot) }))} />
        </PageSection>
      )}

      {checked && valid && <InlineAlert type="success">Planification valide. Aucun enregistrement n'est effectué ici.</InlineAlert>}
      <FormActions>
        <PrimaryButton label="Vérifier" onClick={() => setChecked(true)} />
      </FormActions>
    </div>
  );
};
