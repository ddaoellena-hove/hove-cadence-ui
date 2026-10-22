import { useId, useState } from "react";
import { Checkbox } from "./Checkbox";
import { DateRangePicker } from "./DateRangePicker";
import { DatePicker } from "./DatePicker";
import { SegmentedControl } from "./SegmentedControl";
import { GhostButton } from "./GhostButton";
import { InlineAlert } from "./InlineAlert";
import { runsOnServiceDate, formatServiceDate, parseServiceDate, serviceDateKey, validServicePeriod, type ServiceCalendarValue, type ServiceException, type ServiceWeekday } from "./service-calendar-utils";
import "./service-calendar.css";

export type { ServiceCalendarValue, ServiceException, ServiceWeekday } from "./service-calendar-utils";
export interface ServiceCalendarProps {
  label: string;
  value: ServiceCalendarValue;
  onChange: (value: ServiceCalendarValue) => void;
  disabled?: boolean;
  className?: string;
}
const DAYS: { value: ServiceWeekday; label: string }[] = [
  { value: 1, label: "Lundi" }, { value: 2, label: "Mardi" }, { value: 3, label: "Mercredi" },
  { value: 4, label: "Jeudi" }, { value: 5, label: "Vendredi" }, { value: 6, label: "Samedi" }, { value: 7, label: "Dimanche" },
];

/** Éditeur contrôlé de jours de circulation ; aucune règle de jours fériés implicite. */
export function ServiceCalendar({ label, value, onChange, disabled = false, className }: ServiceCalendarProps) {
  const id = useId();
  const [date, setDate] = useState<Date | null>(() => parseServiceDate(value.startDate));
  const [type, setType] = useState<ServiceException["type"]>("removed");
  const [error, setError] = useState("");
  const valid = validServicePeriod(value);
  const exceptions = [...value.exceptions].sort((a, b) => a.date.localeCompare(b.date));
  const outside = exceptions.some((item) => !parseServiceDate(item.date) || item.date < value.startDate || item.date > value.endDate);
  const addException = () => {
    if (!date || !valid) { setError("Choisissez une période valide et une date d’exception."); return; }
    const key = serviceDateKey(date);
    if (key < value.startDate || key > value.endDate) { setError("L’exception doit appartenir à la période de validité."); return; }
    onChange({ ...value, exceptions: [...value.exceptions.filter((item) => item.date !== key), { date: key, type }] });
    setError("");
  };
  return <section className={["service-calendar", className].filter(Boolean).join(" ")} aria-labelledby={id}>
    <h3 id={id} className="service-calendar__title">{label}</h3>
    <DateRangePicker label="Période de validité" months={1} presets={[]} disabled={disabled}
      value={{ start: parseServiceDate(value.startDate), end: parseServiceDate(value.endDate) }}
      onChange={({ start, end }) => { setError(""); onChange({ ...value, startDate: serviceDateKey(start), endDate: serviceDateKey(end) }); }} />
    {!valid && <InlineAlert type="warning">Renseignez une période valide, début antérieur ou égal à la fin.</InlineAlert>}
    <fieldset className="service-calendar__days">
      <legend>Jours habituels de circulation</legend>
      {DAYS.map((day) => {
        const checked = value.weekdays.includes(day.value);
        return <div className="service-calendar__day" key={day.value}>
          <Checkbox aria-label={day.label} state={disabled ? checked ? "disabled-checked" : "disabled" : checked ? "checked" : "unchecked"}
            onChange={(next) => onChange({ ...value, weekdays: DAYS.filter((item) => item.value === day.value ? next : value.weekdays.includes(item.value)).map((item) => item.value) })} />
          <span aria-hidden="true">{day.label}</span>
        </div>;
      })}
    </fieldset>
    <p className="service-calendar__summary" role="status">
      {valid ? `Du ${formatServiceDate(value.startDate)} au ${formatServiceDate(value.endDate)}. ` : "Période à compléter. "}
      {value.weekdays.length ? `Circulation : ${DAYS.filter((day) => value.weekdays.includes(day.value)).map((day) => day.label.toLowerCase()).join(", ")}.` : "Aucun jour régulier ; seules les dates ajoutées circulent."}
      {` ${exceptions.length} exception(s).`}
    </p>
    <div className="service-calendar__editor">
      <DatePicker label="Date d’exception" value={date} onChange={(next) => { setDate(next); setError(""); }} disabled={disabled || !valid}
        minDate={parseServiceDate(value.startDate) ?? undefined} maxDate={parseServiceDate(value.endDate) ?? undefined} />
      <SegmentedControl aria-label="Effet de l’exception" value={type} disabled={disabled}
        options={[{ value: "removed", label: "Ne circule pas" }, { value: "added", label: "Circule" }]}
        onChange={(next) => setType(next as ServiceException["type"])} />
      <GhostButton label="Appliquer l’exception" disabled={disabled} onClick={addException} />
    </div>
    {date && <p className="service-calendar__summary">Calendrier actuel au {formatServiceDate(serviceDateKey(date))} : {runsOnServiceDate(value, serviceDateKey(date)) ? "circule" : "ne circule pas"}.</p>}
    {error && <InlineAlert type="error">{error}</InlineAlert>}
    {outside && <InlineAlert type="warning">Certaines exceptions sont hors période ou invalides. Corrigez-les ou retirez-les ; elles ne sont pas supprimées automatiquement.</InlineAlert>}
    {exceptions.length > 0 && <ul className="service-calendar__exceptions" aria-label="Exceptions de circulation">
      {exceptions.map((item) => <li key={item.date}>
        <span>{formatServiceDate(item.date)} — <strong>{item.type === "added" ? "Circule" : "Ne circule pas"}</strong></span>
        <GhostButton label="Retirer" size="sm" aria-label={`Retirer l’exception du ${formatServiceDate(item.date)}`} disabled={disabled}
          onClick={() => onChange({ ...value, exceptions: value.exceptions.filter((entry) => entry.date !== item.date) })} />
      </li>)}
    </ul>}
  </section>;
}
