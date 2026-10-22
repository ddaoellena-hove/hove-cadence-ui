# Proposition — Data viz v2 : fondations, `LineChart`, `Heatmap`, `BarList`

Statut : **à valider** (phase 0 de `feat/dataviz-v2`). Rien n'est implémenté.

Existant : `DataVisualization` (barres empilées / groupées / horizontales, SVG fait main, ~730 lignes, tooltip positionné en absolu, pas de redimensionnement mesuré, pas d'alternative tabulaire), la mini-courbe `trend` de `Card`, `DataTable`. Palette `--CAI-dv-series-1..8` déclarée localement sur `.dv`.

---

## 1. Choix technique : primitives d3 *headless*, rendu SVG maison

**Recommandation : `d3-scale`, `d3-shape`, `d3-array`, sans aucun rendu d3.** d3 ne fait que les calculs (échelles, ticks, chemins, empilement) ; tout le DOM reste du JSX/SVG Cadence, stylé par nos tokens.

| | SVG fait main | **d3 headless (retenu)** | Recharts / ECharts / Nivo |
|---|---|---|---|
| Échelles, ticks « ronds », ticks de dates | à réécrire (ticks de dates multi-échelle : heures → jours → mois, ~200 lignes délicates) | `scaleLinear().nice().ticks()`, `scaleTime().ticks()` éprouvés | fournis |
| Courbes, aires empilées | `curveMonotoneX`, `stack` à réécrire | `line`, `area`, `stack`, `curveMonotoneX` | fournis |
| Style | le nôtre | **le nôtre** (rendu JSX) | le leur : surcharge par props / thèmes, rendu difficile à aligner sur les tokens |
| A11y (titre, table, clavier) | à faire | à faire (on maîtrise le DOM) | partielle, difficile à étendre |
| Bundle | 0 dépendance | **externe**, ~11 à 16 Ko gzip côté app (tree-shaké) | Recharts ≈ 100 Ko+ gzip, ECharts ≈ 300 Ko+ |

Les bibliothèques complètes sont écartées : elles imposent leur DOM et leur style, et pèsent 6 à 20 fois plus.

**Dépendances (version exacte, publiées depuis plus de deux semaines, toutes stables) :**

| Paquet | Version | Publiée le |
|---|---|---|
| `d3-scale` | `4.0.2` | 2021-09-24 |
| `d3-shape` | `3.2.0` | 2022-12-20 |
| `d3-array` | `3.2.4` | 2023-05-30 |

Ajoutées dans `dependencies` (comme TanStack), et **externes** dans `vite.config.lib.ts` : `external: [..., /^d3-/]`. Leurs dépendances transitives (`d3-time`, `d3-interpolate`, `d3-format`, `d3-time-format`, `d3-color`, `d3-path`) viennent avec. Types : `@types/d3-scale@4.0.9` (2025-02-05), `@types/d3-shape@3.2.0` (2026-08-21), `@types/d3-array@3.2.2` (2025-09-12) en `devDependencies`, versions exactes. **Aucun type d3 dans l'API publique** : les consommateurs n'ont pas besoin de ces types.

**Mesures (esbuild, minifié) :**

| | brut | gzip |
|---|---|---|
| `dist/hove-cadence-ui.js` aujourd'hui | 154,9 Ko | 41,5 Ko |
| `dist/style.css` aujourd'hui | 95,3 Ko | 13,4 Ko |
| d3 importé (`scaleLinear/Time/Band/Quantize`, `line/area/stack/curveMonotoneX`, `extent/max/bisector`) | 45,7 Ko | **16,2 Ko** — côté app, hors de notre `dist` |
| d3 sans `scaleTime` | 30,3 Ko | 11,4 Ko |
| Estimation de notre code ajouté (3 composants + fondations) | +25 à 30 Ko | **+7 à 9 Ko** |

Les dates et les nombres sont formatés avec `Intl` (fr-FR), pas `d3-format` / `d3-time-format` : seul `scaleTime` les tire (dans les 16 Ko).

## 2. Fondations partagées — **internes** (non exportées en 0.5.0)

Internes pour garder la liberté de les faire évoluer ; on exportera ce qui sert aux apps plus tard (ex. la légende). Fichiers plats dans `src/components/`, comme le reste :

| Fondation | Fichier | Rôle |
|---|---|---|
| Cadre | `ChartFrame.tsx`, `chart-frame.css` | Titre (`h3` par défaut) + description reliés par `aria-labelledby` / `aria-describedby` ; états **chargement** (squelette), **vide** (« Aucune donnée sur la période »), **erreur** (message + action « Réessayer » optionnelle) ; bouton « Voir les données » qui affiche l'alternative tabulaire ; légende en bas. |
| Taille | `use-chart-size.ts` | `ResizeObserver` sur le conteneur → largeur courante ; hauteur fixe par composant (par défaut, documentée). Aucun px de largeur imposé. |
| Axes, grille | `ChartAxis.tsx` | Axes X/Y en SVG, ticks issus des échelles d3, grille horizontale `--cadence-color-divider`, nombres en `--cadence-font-mono`. |
| Légende | `ChartLegend.tsx` | Pastille + **forme de marqueur** de la série + libellé ; clic = masquer / afficher une série (bouton `aria-pressed`). |
| Tooltip | `ChartTooltip.tsx` | **Portail** (`createPortal` vers `document.body`), `z-index: var(--cadence-z-popover)`, positionné au point, gardé dans la fenêtre (même logique que `usePopoverFit`). Même rendu pour les trois composants : en-tête (date / catégorie) + lignes série · valeur. `role="status"` `aria-live="polite"` pour l'annonce clavier. |
| Format | `chart-format.ts` | Nombres et variations fr-FR, **mutualisés avec `Card`** : `formatKpiValue`, `formatDelta`, `getDeltaTone`, `describeDelta` déménagent de `card-utils.ts` vers `chart-format.ts` ; `card-utils.ts` les ré-exporte (aucun import cassé). Dates : formats adaptés à l'étendue — < 2 jours → « 14 h » ; < 3 mois → « lun. 14 oct. » ; au-delà → « oct. 2026 ». |
| Table | `ChartDataTable.tsx` | Tableau HTML réel (`<table>`, `<caption>`, `<th scope>`), visuellement masqué par défaut, affiché par « Voir les données ». |

`prefers-reduced-motion` : aucune animation d'entrée ; transitions de survol coupées.

`DataVisualization` : **pas de migration dans ce lot** (API figée, ~730 lignes, risque de régression visuelle). Il lit la palette depuis les nouveaux tokens via les alias. Migration vers `ChartFrame` / `ChartTooltip` / alternative tabulaire proposée pour un lot suivant (0.6).

## 3. Tokens de data viz (dans `tokens.css`)

### Séries — renommage avec alias

`--cadence-dataviz-series-1..8` dans `tokens.css` ; dans `data-visualization.css`, `--CAI-dv-series-N: var(--cadence-dataviz-series-N)` (anciens noms toujours valides).

Contraste sur blanc (exigence : ≥ 3:1 pour traits et marqueurs) :

| Token | Valeur actuelle | Contraste | Proposition |
|---|---|---|---|
| `series-1` violet | `#6B3FD6` | 6,35 | inchangé |
| `series-2` bleu | `#1A91E8` | 3,35 | inchangé (≥ 3:1) |
| `series-3` teal | `#007D79` | 4,99 | inchangé |
| `series-4` ambre | `#F1A21B` | **2,12 ✗** | **`#B36B00` — 4,18** |
| `series-5` magenta | `#A0185E` | 7,53 | inchangé |
| `series-6` corail | `#F04E4E` | 3,56 | inchangé |
| `series-7` violet foncé | `#5A2D82` | 9,85 | inchangé |
| `series-8` ardoise | `#55606E` | 6,39 | inchangé |

⚠️ **À valider** : changer `series-4` change aussi la 4ᵉ couleur de `DataVisualization` (via l'alias). Alternative : garder `#F1A21B` pour `--CAI-dv-series-4` (alias figé) et n'utiliser `#B36B00` que dans les nouveaux composants.

Le sens ne repose pas sur la couleur seule : chaque série a aussi une **forme de marqueur** (rond, carré, triangle, losange, croix, triangle bas, étoile, anneau), reprise dans la légende et le tooltip.

### Rampe séquentielle (heatmap) — 7 pas, teinte pétrole unique

Une seule teinte à luminosité strictement croissante : l'ordre reste lisible en deutéranopie, protanopie et tritanopie (seule la clarté porte l'information) et en niveaux de gris.

| Token | Valeur | Contraste sur blanc | Texte lisible dessus |
|---|---|---|---|
| `--cadence-dataviz-seq-1` | `#EAF4F5` | 1,12 | encre |
| `--cadence-dataviz-seq-2` | `#C6E2E5` | 1,36 | encre |
| `--cadence-dataviz-seq-3` | `#94C8CE` | 1,84 | encre |
| `--cadence-dataviz-seq-4` | `#5FA9B1` | 2,69 | encre |
| `--cadence-dataviz-seq-5` | `#2F8892` | 4,15 | blanc |
| `--cadence-dataviz-seq-6` | `#0F6670` | 6,66 | blanc |
| `--cadence-dataviz-seq-7` | `#004650` | 10,54 | blanc (= `--cadence-product-datahub`) |

Les pas clairs sont proches du blanc : les cellules ont un liseré blanc de 2px (grille lisible) et la valeur exacte est dans le tooltip et la table. **Cellule vide** (pas de donnée ≠ 0) : fond `--cadence-color-surface-alt` + **hachures** (motif SVG), jamais une couleur de la rampe.

### Seuil et annotation

| Token | Valeur | Contraste | Usage |
|---|---|---|---|
| `--cadence-dataviz-threshold` | `#1A3E45` (= `--cadence-color-label`) | 11,55 | Ligne de seuil **tiretée** + libellé (« Objectif 95 % ») |
| `--cadence-dataviz-threshold-breach` | `#B91C1C` (= `--cadence-status-critical-fg`) | 6,47 | Portion de courbe / marqueurs du côté défavorable du seuil (selon `goodDirection`) |
| `--cadence-dataviz-annotation` | `#55606E` | 6,39 | Trait vertical / bord de bande + libellé (« Grève 14/10 ») |
| `--cadence-dataviz-annotation-band` | `rgba(85, 96, 110, 0.08)` | — (fond) | Remplissage d'une bande annotée |

## 4. API des composants

Hauteur par défaut documentée, largeur = 100 % du conteneur (`use-chart-size`). Titre obligatoire (accessibilité), description facultative mais recommandée.

### Types communs

```ts
type ChartState = "ready" | "loading" | "empty" | "error";

interface ChartCommonProps {
  /** Titre affiché au-dessus du graphique (nom accessible). */
  title: string;
  /** Phrase de description (aria-describedby) : « Retard moyen par heure, 7 derniers jours ». */
  description?: string;
  /** Niveau du titre. Défaut 3. */
  headingLevel?: 2 | 3 | 4;
  /** Défaut "ready". "empty" / "error" affichent un message à la place du graphique. */
  state?: ChartState;
  /** Message d'erreur. Défaut « Impossible de charger les données. » */
  errorMessage?: string;
  /** Action « Réessayer » de l'état d'erreur. */
  onRetry?: () => void;
  className?: string;
}
```

### `LineChart` — hauteur par défaut 280px (compact : 48px)

```ts
interface LineChartSeries {
  id: string;
  label: string;
  /** Points [x, y] ; x est une Date (axe temporel) ou une catégorie (string). y null = trou. */
  data: { x: Date | string; y: number | null }[];
}

interface LineChartThreshold {
  value: number;
  /** « Objectif 95 % » — toujours affiché sur la ligne. */
  label: string;
}

interface LineChartAnnotation {
  /** Trait vertical à une date, ou bande entre deux dates. */
  at: Date | string | [Date | string, Date | string];
  /** « Grève 14/10 » */
  label: string;
}

interface LineChartProps extends ChartCommonProps {
  series: LineChartSeries[];            // 1 à 8
  variant?: "line" | "area";            // défaut "line"
  stacked?: boolean;                    // area empilée, défaut false
  thresholds?: LineChartThreshold[];
  annotations?: LineChartAnnotation[];
  /** Comme Card : le côté défavorable d'un seuil est coloré --cadence-dataviz-threshold-breach. Défaut "up". */
  goodDirection?: "up" | "down" | "neutral";
  /** Unité de l'axe Y et du tooltip (« min », « % »). */
  unit?: string;
  format?: Intl.NumberFormatOptions;
  /** Bornes de l'axe Y (défaut : 0 → max arrondi). */
  yDomain?: [number, number];
  /** Sans axes ni légende ni titre visible (titre conservé pour l'accessibilité), pour Card. */
  compact?: boolean;
  height?: number;
}
```

Clavier : le graphique est focusable (`tabIndex=0`, `role="group"`) ; ←/→ passent d'une abscisse à l'autre, Début/Fin, le tooltip suit et est annoncé (`aria-live`). Échap masque le tooltip.

```tsx
<LineChart
  title="Retard moyen par heure"
  description="7 derniers jours, toutes lignes"
  unit="min"
  goodDirection="down"
  series={[{ id: "delay", label: "Retard moyen", data: hourlyDelays }]}
  thresholds={[{ value: 5, label: "Seuil d'alerte 5 min" }]}
  annotations={[{ at: [new Date(2026, 9, 14, 5), new Date(2026, 9, 14, 23)], label: "Grève 14/10" }]}
/>

<LineChart
  title="Ponctualité"
  variant="area"
  unit="%"
  yDomain={[80, 100]}
  series={[{ id: "punct", label: "Ponctualité", data: daily }]}
  thresholds={[{ value: 95, label: "Objectif 95 %" }]}
/>
```

L'app fournit : les séries (déjà agrégées), les seuils et annotations métier, l'unité.

**`Card trend`** : inchangé en 0.5.0 (`Card` ne tire pas d'échelles d3). Proposition pour un lot suivant : `Card` rend sa mini-courbe avec `<LineChart compact>` (même rendu, gagne le tooltip), sans changer la prop `trend: number[]`.

### `Heatmap` — hauteur : 28px par ligne + axes

```ts
interface HeatmapCell {
  x: string;            // colonne : « 08 h »
  y: string;            // ligne : « lun. 14 oct. »
  value: number | null; // null = pas de donnée (hachures)
}

interface HeatmapProps extends ChartCommonProps {
  /** Ordre des colonnes et des lignes (sinon ordre d'apparition). */
  xLabels: string[];
  yLabels: string[];
  cells: HeatmapCell[];
  /** Domaine de la rampe ; défaut [0, max]. 7 classes (quantize). */
  domain?: [number, number];
  unit?: string;
  format?: Intl.NumberFormatOptions;
  /** Ouvre la liste filtrée. Cellule = bouton nommé « lun. 14 oct., 08 h : 12 perturbations ». */
  onCellClick?: (cell: HeatmapCell) => void;
  /** Hauteur d'une ligne. Défaut 28. */
  rowHeight?: number;
}
```

Clavier : grille `role="grid"` avec *roving tabindex* ; flèches, Début/Fin (ligne), Ctrl+Début/Fin ; Entrée = `onCellClick`. Légende de rampe avec bornes (« 0 » … « 42 perturbations ») et la pastille hachurée « Pas de donnée ».

```tsx
<Heatmap
  title="Perturbations par jour et par heure"
  description="4 dernières semaines"
  unit="perturbations"
  xLabels={hours}           // « 05 h » … « 00 h »
  yLabels={days}            // « lun. » … « dim. »
  cells={cells}
  onCellClick={(c) => navigate(`/perturbations?jour=${c.y}&heure=${c.x}`)}
/>

<Heatmap title="Retard moyen par ligne et par jour" unit="min" xLabels={days} yLabels={lines} cells={delayCells} domain={[0, 15]} />
```

L'app fournit : les libellés déjà formatés et ordonnés, les valeurs agrégées.

### `BarList` — hauteur : 32px par ligne

```ts
interface BarListItem {
  id: string;
  /** ReactNode : texte aujourd'hui, LineBadge plus tard. */
  label: ReactNode;
  /** Nom accessible quand label n'est pas du texte. */
  ariaLabel?: string;
  value: number;
  /** Variation affichée à droite (« +12 % »), colorée selon goodDirection. */
  delta?: { value: number; unit?: "%" | "pt" | "" };
}

interface BarListProps extends ChartCommonProps {
  items: BarListItem[];           // trié par l'app (ou sort="desc")
  sort?: "none" | "desc";         // défaut "none"
  unit?: string;
  format?: Intl.NumberFormatOptions;
  goodDirection?: "up" | "down" | "neutral";
  /** N premières lignes + lien « Voir tout ». */
  limit?: number;
  onShowAll?: () => void;
  onItemClick?: (item: BarListItem) => void;
}
```

Rendu : liste (`<ol>`) ; chaque ligne = libellé, barre proportionnelle (`--cadence-dataviz-series-1`), valeur mono alignée à droite, variation. Avec `onItemClick`, la ligne est un bouton (« Ligne 13 : 42 perturbations, +12 % »).

```tsx
<BarList
  title="Lignes les plus impactées"
  unit="perturbations"
  goodDirection="down"
  items={top10}
  limit={5}
  onShowAll={() => navigate("/lignes")}
  onItemClick={(item) => navigate(`/lignes/${item.id}`)}
/>

<BarList title="Retard cumulé par mode" unit="min" sort="desc" items={[{ id: "metro", label: "Métro", value: 1240 }, { id: "bus", label: "Bus", value: 3820 }]} />
```

## Accessibilité (commune)

- Titre + description reliés (`aria-labelledby` / `aria-describedby`) ; le `<svg>` est `role="img"` (LineChart) ou décoratif quand les éléments interactifs portent le sens (Heatmap, BarList).
- Alternative tabulaire réelle derrière « Voir les données » (bouton `aria-expanded`), présente dans le DOM.
- Jamais la couleur seule : marqueurs de formes différentes, seuils et annotations libellés, cellules vides hachurées, variations avec flèche et signe.
- Clavier complet (focus visible `--cadence-focus-ring`), tooltip annoncé.
- `prefers-reduced-motion` respecté.

## Découpage (après validation)

1. Fondations + tokens (`tokens.css`, alias, `chart-format.ts`, `ChartFrame`, `ChartTooltip`, `ChartAxis`, `ChartLegend`, `ChartDataTable`, `use-chart-size`) + dépendances.
2. `LineChart`. 3. `Heatmap`. 4. `BarList`. 5. Docs (GUIDELINES, recette 7, CHANGELOG 0.5.0, version).

## Points à valider

1. d3 headless (`d3-scale` 4.0.2, `d3-shape` 3.2.0, `d3-array` 3.2.4), externes.
2. Fondations internes (non exportées en 0.5.0).
3. Palette : `series-4` passe à `#B36B00` **pour tous** (DataVisualization compris) — ou seulement pour les nouveaux composants ?
4. Rampe pétrole 7 pas ; seuil `#1A3E45`, dépassement `#B91C1C`, annotation `#55606E`.
5. `DataVisualization` migré plus tard (0.6) ; `Card trend` inchangé en 0.5.0.
