// Données de démonstration des graphiques (stories uniquement) : un même
// réseau, une même période (du mercredi 14 au mardi 20 octobre 2026, grève le
// vendredi 16),
// générées de façon déterministe pour des tests stables.

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Jour de grève (bande d'annotation). */
export const STRIKE_START = new Date(2026, 9, 16, 5);
export const STRIKE_END = new Date(2026, 9, 16, 23);

/** Retard moyen (min) par heure, du mercredi 14 au mardi 20 octobre 2026, de 5 h à 23 h. */
export const hourlyDelays = (() => {
  const random = seeded(14);
  const points: { x: Date; y: number | null }[] = [];
  for (let day = 14; day <= 20; day++) {
    const weekday = new Date(2026, 9, day).getDay();
    const weekend = weekday === 0 || weekday === 6;
    for (let hour = 5; hour <= 23; hour++) {
      const peak = Math.exp(-((hour - 8) ** 2) / 3) * 3.2 + Math.exp(-((hour - 18) ** 2) / 4) * 2.6;
      const strike = day === 16 ? 3.8 : 0;
      const base = weekend ? 1.4 : 2.1;
      points.push({ x: new Date(2026, 9, day, hour), y: round1(base + (weekend ? peak * 0.4 : peak) + strike + random() * 0.9) });
    }
  }
  return points;
})();

/** Ponctualité (%) quotidienne sur 30 jours, du 21 septembre au 20 octobre 2026. */
export const dailyPunctuality = (() => {
  const random = seeded(30);
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2026, 8, 21 + i);
    const strike = date.getDate() === 16 && date.getMonth() === 9 ? -6.5 : 0;
    return { x: date, y: round1(95.6 + random() * 2 - 1.2 + strike) };
  });
})();

/** Ponctualité (%) par mode sur 30 jours. */
export const punctualityByMode = (() => {
  const modes = [
    { id: "metro", label: "Métro", base: 97.1 },
    { id: "rer", label: "RER", base: 92.4 },
    { id: "bus", label: "Bus", base: 94.2 },
  ];
  return modes.map((mode, m) => {
    const random = seeded(100 + m);
    return {
      id: mode.id,
      label: mode.label,
      data: dailyPunctuality.map((p) => {
        const strike = p.x.getDate() === 16 && p.x.getMonth() === 9 ? -5 - m : 0;
        return { x: p.x, y: round1(mode.base + random() * 2.4 - 1.2 + strike) };
      }),
    };
  });
})();

/** Courses réalisées par mode (milliers), 14 → 20 octobre. */
export const tripsByMode = (() => {
  const days = Array.from({ length: 7 }, (_, i) => new Date(2026, 9, 14 + i));
  const modes = [
    { id: "metro", label: "Métro", base: 18 },
    { id: "rer", label: "RER", base: 9 },
    { id: "bus", label: "Bus", base: 26 },
  ];
  return modes.map((mode, m) => {
    const random = seeded(200 + m);
    return {
      id: mode.id,
      label: mode.label,
      data: days.map((d) => {
        const weekend = d.getDay() === 0 || d.getDay() === 6;
        const strike = d.getDate() === 16 ? 0.45 : 1;
        return { x: d, y: round1(mode.base * strike * (weekend ? 0.7 : 1) + random() * 2) };
      }),
    };
  });
})();

export const WEEKDAYS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
export const SERVICE_HOURS = Array.from({ length: 20 }, (_, i) => `${String((i + 5) % 24).padStart(2, "0")} h`);

/** Perturbations par jour de semaine × heure, cumulées sur 4 semaines (null = pas de service). */
export const disruptionsByWeekdayHour = (() => {
  const random = seeded(4);
  return WEEKDAYS.flatMap((day, d) =>
    SERVICE_HOURS.map((hour, h) => {
      const hourOfDay = h + 5;
      const weekend = d >= 5;
      // Pas de service à 0 h le week-end (samedi et dimanche)
      if (weekend && hourOfDay === 24) return { x: hour, y: day, value: null };
      const peak = Math.exp(-((hourOfDay - 8) ** 2) / 3) * 22 + Math.exp(-((hourOfDay - 18) ** 2) / 4) * 18;
      const strike = d === 2 ? 9 : 0; // grève un mercredi
      return { x: hour, y: day, value: Math.round((weekend ? peak * 0.35 : peak) + strike + random() * 6) };
    }),
  );
})();

/** Les 10 lignes les plus impactées (perturbations sur la semaine, variation vs semaine précédente). */
export const topImpactedLines = [
  { id: "l13", label: "Ligne 13", value: 42, delta: { value: 12 } },
  { id: "rerb", label: "RER B", value: 38, delta: { value: 31 } },
  { id: "l4", label: "Ligne 4", value: 27, delta: { value: -8 } },
  { id: "rera", label: "RER A", value: 24, delta: { value: 4 } },
  { id: "l7", label: "Ligne 7", value: 19, delta: { value: -15 } },
  { id: "b91", label: "Bus 91", value: 17, delta: { value: 6 } },
  { id: "t3a", label: "Tram T3a", value: 14, delta: { value: 0 } },
  { id: "l1", label: "Ligne 1", value: 11, delta: { value: -21 } },
  { id: "b38", label: "Bus 38", value: 9, delta: { value: 13 } },
  { id: "l9", label: "Ligne 9", value: 7, delta: { value: -3 } },
];
