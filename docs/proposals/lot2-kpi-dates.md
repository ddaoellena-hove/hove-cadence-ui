# Lot 2 — KpiCard et DateRangePicker : proposition d'API (phase 0)

> Statut : **validée (Q1 à Q8 selon les recommandations) et implémentée** sur `feat/kpi-daterange`. Écarts : voir la dernière section.
> Base : `main` @ `ac9bc47`, branche `feat/kpi-daterange`. Aucune nouvelle dépendance.

Le lot 1 a outillé les **listes** de supervision. Le lot 2 outille le **haut d'écran** :
- des indicateurs chiffrés (courses réalisées, retard moyen, perturbations actives) avec leur évolution ;
- une **période** d'analyse, qui alimente aussi les filtres de `FilterBar`.

## Sommaire

1. [KpiCard](#1-kpicard)
2. [DateRangePicker](#2-daterangepicker)
3. [Refactor préalable : un calendrier interne partagé](#3-refactor-préalable--un-calendrier-interne-partagé)
4. [Tests, stories, documentation](#4-tests-stories-documentation)
5. [Questions à trancher](#5-questions-à-trancher)

---

## 1. KpiCard

Carte d'indicateur : libellé, valeur principale, évolution par rapport à une période de référence et, en option, une mini-courbe et un statut.

### 1.1 Interface

```ts
export interface KpiCardDelta {
  /** Variation (ex. -3.2 pour −3,2 %). */
  value: number;
  /** Unité de la variation. Défaut "%". "pt" = points de pourcentage. */
  unit?: "%" | "pt" | "";
  /** Période de comparaison : « vs hier », « vs semaine dernière »… */
  label?: string;
}

export interface KpiCardProps {
  /** Libellé de l'indicateur (« Retard moyen »). */
  label: string;
  /** Valeur principale. Un nombre est formaté en fr-FR ; une chaîne est affichée telle quelle. */
  value: number | string;
  /** Unité accolée à la valeur (« min », « % », « courses »). */
  unit?: string;
  /** Options de formatage du nombre (décimales, compact…). Défaut : `{ maximumFractionDigits: 1 }`. */
  format?: Intl.NumberFormatOptions;
  /** Évolution par rapport à la période de référence. */
  delta?: KpiCardDelta;
  /**
   * Sens favorable de l'indicateur : colore la variation.
   * "up" = une hausse est bonne (ponctualité), "down" = une baisse est bonne (retard),
   * "neutral" = pas de jugement (volume). Défaut "up".
   */
  goodDirection?: "up" | "down" | "neutral";
  /** Statut sémantique optionnel, affiché avec un `Indicator` (ex. seuil dépassé). */
  status?: IndicatorVariant;
  /** Libellé du statut (surcharge celui de la variante). */
  statusLabel?: string;
  /** Série de points pour une mini-courbe (sparkline), de la plus ancienne à la plus récente. */
  trend?: number[];
  /** Texte secondaire sous la valeur (« Sur 1 240 courses prévues »). */
  description?: string;
  /** Squelette de chargement. */
  loading?: boolean;
  /** Rend la carte cliquable (accès à la liste détaillée). La carte devient un `<button>`. */
  onClick?: () => void;
  className?: string;
}
```

### 1.2 Exemples d'usage

```tsx
// 1) Retard moyen : une baisse est favorable
<KpiCard
  label="Retard moyen"
  value={3.4}
  unit="min"
  delta={{ value: -12, label: "vs hier" }}
  goodDirection="down"
  trend={[4.1, 3.9, 4.4, 3.8, 3.6, 3.4]}
/>
```

```tsx
// 2) Perturbations actives, avec seuil d'alerte et accès à la liste
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
  <KpiCard label="Courses réalisées" value={12430} delta={{ value: 1.8, label: "vs semaine dernière" }} />
  <KpiCard label="Ponctualité" value={94.2} unit="%" delta={{ value: -0.6, unit: "pt" }} />
  <KpiCard
    label="Perturbations actives"
    value={27}
    status="critical"
    statusLabel="Seuil dépassé"
    goodDirection="down"
    delta={{ value: 35, label: "vs hier" }}
    onClick={() => navigate("/perturbations?etat=actives")}
  />
</div>
```

### 1.3 Géré en interne / fourni par l'app

| Interne (KpiCard) | Fourni par l'app |
|---|---|
| Formatage fr-FR de la valeur (`12 430`, `94,2`) et de la variation (`+1,8 %`, `−0,6 pt`, vrai signe moins U+2212) | Valeurs, calcul des variations, choix de `goodDirection` |
| Flèche ↑ / ↓ et couleur de la variation selon `goodDirection` | Seuils d'alerte → `status` |
| Mini-courbe SVG (`trend`) sans axe ni infobulle, `aria-hidden` | Mise en grille des cartes (CSS Grid de l'app, voir recette) |
| Texte accessible de la variation : « en baisse de 12 % vs hier, favorable » | Navigation au clic |
| Squelette de chargement, rendu `<button>` si `onClick` | — |

### 1.4 Styles

- **Carte** : fond `--cadence-color-white`, bordure `--cadence-color-border`, `--cadence-radius-lg`, `padding: 16px 20px`. Au survol, si la carte est cliquable : `--cadence-shadow-md`. Focus : `--cadence-focus-ring`.
- **Libellé** : 13px / 600 / `--cadence-color-label`.
- **Valeur** : **`--cadence-font-mono`**, 28px / 500, `--cadence-color-primary`. `GUIDELINES.md` réserve la mono aux valeurs numériques et la display aux titres (voir Q2).
- **Variation favorable** : `--cadence-status-completed-fg` (`#15803d`, 5,0:1). **Défavorable** : `--cadence-status-critical-fg` (`#b91c1c`, 6,5:1). **Neutre** : `--cadence-color-icon-muted`.
  - ⚠️ Je n'utilise **pas** `--cadence-color-success` (`#24a148`, 3,4:1) : ce vert ne passe pas le seuil AA en couleur de texte.
- **Mini-courbe** : trait de 1,5px en `--cadence-color-label`, sans remplissage. Aucune nouvelle couleur.

---

## 2. DateRangePicker

Sélection d'une période (date de début → date de fin), avec des préréglages. Il complète `DatePicker` (date unique) avec le même déclencheur et le même calendrier.

### 2.1 Interface

```ts
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePreset {
  id: string;
  label: string;
  /** Calcule la période à partir de la date de référence. */
  getRange: (reference: Date) => { start: Date; end: Date };
}

export interface DateRangePickerProps {
  /** Période sélectionnée (contrôlée). */
  value?: DateRange;
  /** Appelé sur « Appliquer » ou au clic sur un préréglage. */
  onChange?: (range: { start: Date; end: Date }) => void;
  /** Label au-dessus du déclencheur (même style que TextInput). */
  label?: string;
  /** Défaut « JJ/MM/AAAA – JJ/MM/AAAA ». */
  placeholder?: string;
  disabled?: boolean;
  /** Bornes : jours hors bornes désactivés. */
  minDate?: Date;
  maxDate?: Date;
  /** Durée maximale de la période, en jours (ex. 31). */
  maxDays?: number;
  /** Préréglages. Défaut : voir 2.3. `[]` pour les masquer. */
  presets?: DateRangePreset[];
  /** Date de référence des préréglages et du jour courant. Défaut : maintenant. */
  referenceDate?: Date;
  /** Nombre de mois affichés côte à côte. Défaut 2. */
  months?: 1 | 2;
}
```

### 2.2 Exemples d'usage

```tsx
// 1) Période d'analyse d'un tableau de bord
const [range, setRange] = useState<DateRange>({ start: null, end: null });

<DateRangePicker label="Période" value={range} onChange={setRange} maxDate={new Date()} maxDays={92} />
```

```tsx
// 2) Filtre rapide d'une FilterBar, préréglages métier
<FilterBar
  quickFilters={
    <DateRangePicker
      value={period}
      onChange={setPeriod}
      months={1}
      presets={[
        { id: "service", label: "Journée de service", getRange: (ref) => serviceDay(ref) },
        { id: "week", label: "7 derniers jours", getRange: (ref) => lastDays(ref, 7) },
      ]}
    />
  }
/>
```

### 2.3 Comportement

- **Sélection en deux clics** : le 1er clic fixe le début, le 2e la fin. Si la fin est avant le début, les deux sont inversés. Au survol, la plage provisoire est surlignée. Un 3e clic recommence une nouvelle plage.
- **Validation** : pied du popover avec « Annuler » (`SecondaryButton outline`) et « Appliquer » (`SecondaryButton`), désactivé tant que la plage est incomplète. Un clic sur un **préréglage** applique et ferme directement.
- **Préréglages par défaut** : Aujourd'hui, Hier, 7 derniers jours, 30 derniers jours, Ce mois-ci, Mois dernier. Tous sont calculés à partir de `referenceDate`.
- **Déclencheur** : affiche « 01/10/2026 – 19/10/2026 », ou le libellé du préréglage si la plage correspond exactement à l'un d'eux (« 7 derniers jours »).
- **Bornes** : `minDate` / `maxDate` désactivent les jours. Avec `maxDays`, une fois le début choisi, les jours au-delà de la durée maximale sont désactivés, et la règle est rappelée sous le calendrier (« 92 jours maximum »).
- **Heures** : non gérées en v1. Les dates renvoyées sont à 00:00 (début) et à 23:59:59.999 (fin), pour que l'app filtre « jusqu'à la fin du jour » sans calcul. Voir Q4.
- **Clavier** :
  - flèches pour se déplacer de jour en jour, Page préc. / suiv. pour changer de mois, Début / Fin pour aller en début ou fin de semaine ;
  - Entrée choisit le jour ;
  - Échap ferme sans appliquer et rend le focus au déclencheur.
- **Accessibilité** :
  - le popover est un `role="dialog"` nommé « Choisir une période » ;
  - chaque jour annonce sa date en toutes lettres (« lundi 19 octobre 2026 ») et son état (début, fin, dans la plage) ;
  - le label est un vrai `<label>` associé au déclencheur.

### 2.4 Géré en interne / fourni par l'app

| Interne | App |
|---|---|
| Plage provisoire, survol, inversion, bornes, `maxDays` | `value`, application de la période aux données |
| Préréglages par défaut, détection du préréglage courant | Préréglages métier (journée de service à cheval sur minuit, etc.) |
| Normalisation 00:00 → 23:59:59.999 | Fuseau horaire : les dates sont locales au navigateur |
| Navigation clavier, focus, fermeture | — |

---

## 3. Refactor préalable : un calendrier interne partagé

Dans `DatePicker.tsx`, la grille du mois (`buildWeeks`, `formatDate`, `MONTHS`…) est privée au fichier, et ses styles sont dans `date-picker.css`. Or la convention veut un seul `.css` par composant. Pour ne pas dupliquer ~200 lignes :

- extraire un composant **interne** `CalendarMonth`, non exporté par `index.ts`, avec son `calendar-month.css` : en-tête de mois, jours de la semaine et grille. Il gérera aussi les états de plage (début, fin, dans la plage, survol) ;
- extraire les fonctions de date dans `date-utils.ts`, testées en unitaire ;
- `DatePicker` utilise `CalendarMonth` **à l'identique** : refactor iso-visuel, API inchangée, avec comparaison avant/après dans Storybook.

**Écarts d'accessibilité constatés sur `DatePicker`** (je ne les corrige pas sans ton accord, voir Q6) :
- les ~35 jours sont tous dans l'ordre de tabulation (`tabIndex=0`), sans navigation aux flèches ;
- Échap ne ferme pas le popover ;
- le label est un `<span>` qui n'est pas associé au déclencheur ;
- les jours n'annoncent que « 19/10/2026 ».

Avec le calendrier partagé, `DatePicker` hériterait de la navigation clavier de 2.3 **sans changement visuel**.

---

## 4. Tests, stories, documentation

- **Unitaires** (projet `unit`) :
  - `date-utils` : grille commençant le lundi, octobre 2026 qui commence un jeudi, préréglages relatifs à `referenceDate`, normalisation de fin de journée, `maxDays` ;
  - formatage de `KpiCard` : `+1,8 %`, `−0,6 pt`, signe moins, sens favorable.
- **Stories avec tests d'interaction et audit a11y bloquant** :
  - `KpiCard` : Défaut, Baisse favorable, Avec statut, Avec courbe, Cliquable, Chargement, Grille de 4 ;
  - `DateRangePicker` : Défaut, Préréglages, Bornes + `maxDays`, Un seul mois, Dans une FilterBar.
  - Les stories utilisent `referenceDate` fixe (19/10/2026), pour que les résultats ne dépendent pas du jour d'exécution.
- **`GUIDELINES.md`** :
  - table Intention → composant (« Indicateur chiffré + évolution → `KpiCard` ; ne pas confondre avec `Indicator` (statut) », « Période → `DateRangePicker` ; ne pas confondre avec deux `DatePicker` ») ;
  - section Formulaires (dates) ;
  - fiches API ;
  - **recette 6 — Tableau de bord de supervision** : grille de `KpiCard` + `DateRangePicker` + `DataTable` filtré par la période.
- **Branche** `feat/kpi-daterange`, un commit par étape : refactor du calendrier, `KpiCard`, `DateRangePicker`, doc. Rien n'est poussé sans ton accord.

---

## 5. Questions à trancher

| # | Question | Ma recommandation |
|---|---|---|
| Q1 | Mini-courbe (`trend`) dans `KpiCard` dès la v1 ? | **Oui** : SVG simple, sans dépendance, très demandée en supervision |
| Q2 | Police de la valeur : mono (règle actuelle pour les nombres) ou display (titres) ? | **Mono** : cohérent avec `DataTable` et la règle typographique |
| Q3 | Variations colorées avec les tokens de statut (`completed-fg` / `critical-fg`) plutôt que `--cadence-color-success` (3,4:1) ? | **Oui** |
| Q4 | Heures dans `DateRangePicker` en v1 ? | **Non** : jours entiers normalisés (00:00 → 23:59:59.999), heures en v2 si besoin |
| Q5 | Validation par « Appliquer » (plage à deux clics) plutôt qu'une application immédiate au 2e clic ? | **« Appliquer »** : évite un rechargement des données pendant la sélection ; les préréglages, eux, s'appliquent directement |
| Q6 | Calendrier interne partagé **et** navigation clavier apportée à `DatePicker` (comportement nouveau, aucun changement visuel) ? | **Oui aux deux** : un seul calendrier à maintenir, et `DatePicker` devient utilisable au clavier |
| Q7 | Prop `referenceDate` (défaut : maintenant) pour les préréglages ? | **Oui** : tests déterministes, et utile si l'app travaille à l'heure du serveur |
| Q8 | Préréglages par défaut (2.3) : liste correcte ? Faut-il ajouter « Journée de service » (à cheval sur minuit) par défaut ? | Liste 2.3 par défaut ; journée de service fournie par l'app (définition propre à chaque réseau) |

---

## 6. Écarts entre la proposition et l'implémentation

- **`aria-label` ajouté à `DateRangePicker`** : sans `label` visible (filtre rapide d'une `FilterBar`), le déclencheur n'était nommé que par son texte. Il est maintenant annoncé « Période : 7 derniers jours ».
- **Jours des mois voisins masqués dans `DateRangePicker`** (option interne `showOutsideDays` de `CalendarMonth`) : à deux mois, fin octobre apparaissait aussi dans la grille de novembre, surligné deux fois.
- **`DatePicker`** : l'effet de synchronisation de `value` (erreur de lint `set-state-in-effect`, qui existait déjà) est remplacé par un état dérivé pendant le rendu. Le comportement est inchangé.
- **Recette 6** : uniquement dans `GUIDELINES.md` (code d'exemple). Il n'y a pas de story de composition dédiée ; les stories `KpiCard / Grille de 4` et `DateRangePicker / Dans une FilterBar` couvrent les briques.
