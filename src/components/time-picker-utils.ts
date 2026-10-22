/** Heure de service en minutes, sans conversion de fuseau ni date. */
export const parseTime = (value: string, allowOvernight = false): number | null => {
  const match = /^(\d{1,2}):(\d{1,2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= (allowOvernight ? 47 : 23) && minute < 60 ? hour * 60 + minute : null;
};

export const formatTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

export const timeBounds = (allowOvernight: boolean, min?: string, max?: string): { min: number; max: number } => {
  const lower = min ? parseTime(min, allowOvernight) : null;
  const upper = max ? parseTime(max, allowOvernight) : null;
  const limit = (allowOvernight ? 48 : 24) * 60 - 1;
  // Une configuration invalide ne doit pas piéger la saisie dans un intervalle vide.
  if ((lower ?? 0) > (upper ?? limit)) return { min: 0, max: limit };
  return { min: lower ?? 0, max: upper ?? limit };
};
