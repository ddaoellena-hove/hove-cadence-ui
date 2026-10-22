export type ServiceWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export interface ServiceException { date: string; type: "added" | "removed" }
export interface ServiceCalendarValue {
  /** Dates civiles YYYY-MM-DD, ou chaîne vide tant que la période est incomplète. */
  startDate: string;
  endDate: string;
  weekdays: ServiceWeekday[];
  exceptions: ServiceException[];
}

/** Date locale à midi : aucune conversion UTC de la date civile. */
export function parseServiceDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
export function serviceDateKey(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function formatServiceDate(value: string): string {
  const date = parseServiceDate(value);
  return date ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date) : "Date non renseignée";
}
export function validServicePeriod(value: ServiceCalendarValue): boolean {
  return Boolean(parseServiceDate(value.startDate) && parseServiceDate(value.endDate) && value.startDate <= value.endDate);
}
/** Les exceptions remplacent le rythme hebdomadaire, dans la période inclusive. */
export function runsOnServiceDate(value: ServiceCalendarValue, key: string): boolean {
  const date = parseServiceDate(key);
  if (!date || !validServicePeriod(value) || key < value.startDate || key > value.endDate) return false;
  const exception = value.exceptions.find((item) => item.date === key);
  return exception ? exception.type === "added" : value.weekdays.includes((date.getDay() || 7) as ServiceWeekday);
}
