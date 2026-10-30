// Règles de la recette Périodes et créneaux : logique pure, testable sans rendu.
// À adapter au produit : le fuseau et les changements d'heure y sont à décider.

export interface Period {
  id: string;
  start: Date | null;
  end: Date | null;
}

export interface Slot {
  id: string;
  /** 1 = lundi … 7 = dimanche. */
  days: number[];
  /** HH:mm. */
  from: string;
  to: string;
}

export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const minutes = (time: string) => {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
};

export const validatePeriod = (period: Period): string | undefined => {
  if (!period.start || !period.end) return "Renseignez le début et la fin.";
  if (period.end.getTime() <= period.start.getTime()) return "La fin doit suivre le début.";
  return undefined;
};

export const validateSlot = (slot: Slot): string | undefined => {
  if (slot.days.length === 0) return "Choisissez au moins un jour.";
  if (!slot.from || !slot.to) return "Renseignez les deux heures.";
  if (slot.from === slot.to) return "Les heures de début et de fin doivent différer.";
  return undefined;
};

/** Une fin antérieure au début désigne le lendemain. */
export const endsNextDay = (slot: Slot) => Boolean(slot.from && slot.to) && minutes(slot.to) < minutes(slot.from);

const slotRanges = (slot: Slot) => {
  const from = minutes(slot.from);
  const to = minutes(slot.to) + (endsNextDay(slot) ? 24 * 60 : 0);
  return slot.days.map((day) => [(day - 1) * 24 * 60 + from, (day - 1) * 24 * 60 + to] as const);
};

/** Chevauchement sur la semaine, y compris une nuit qui déborde sur le jour suivant. */
export const slotsOverlap = (a: Slot, b: Slot) => {
  const week = 7 * 24 * 60;
  return slotRanges(a).some(([aFrom, aTo]) =>
    slotRanges(b).some(([bFrom, bTo]) =>
      [-week, 0, week].some((shift) => aFrom < bTo + shift && bFrom + shift < aTo)));
};

/** Résumé lisible, pour un récapitulatif. */
export const describeSlot = (slot: Slot) => {
  const days = [...slot.days].sort((a, b) => a - b).map((day) => DAYS[day - 1]).join(", ");
  return `${days || "Aucun jour"} : ${slot.from || "--:--"} → ${slot.to || "--:--"}${endsNextDay(slot) ? " (lendemain)" : ""}`;
};
