# Lot 1 « gros volumes » — proposition d'API (phase 0)

> Statut : **validée (Q1 à Q8 selon les recommandations) et implémentée** sur `feat/data-components`. Écarts à l'implémentation : voir la dernière section.
> Base : `main` @ `0c3d252`, branche `feat/data-components`.
> TanStack Table **v9.2.6** (vérifié sur les types publiés : `useTable`, `tableFeatures`, `createSortedRowModel`, `createPaginatedRowModel`, `manualSorting`, `manualPagination`, `enableMultiSort`, `getToggleSortingHandler`, `toggleAllRowsSelected` existent bien) et TanStack Virtual **v3.14.13**. La v9.3.1 est sortie depuis ; je m'en tiens aux versions demandées.

## Sommaire

1. [Réponses aux trois questions](#1-réponses-aux-trois-questions)
2. [DataTable](#2-datatable)
3. [Pagination](#3-pagination)
4. [FilterBar](#4-filterbar)
5. [Blocages et changements proposés à part](#5-blocages-et-changements-proposés-à-part)
6. [Tests : ce qui est réellement configuré](#6-tests--ce-qui-est-réellement-configuré)
7. [Questions à trancher](#7-questions-à-trancher)

---

## 1. Réponses aux trois questions

### 1.1 Mode client et mode serveur dès la v1 ? → **Oui, les deux, pour un coût faible**

- Le tri est déjà **contrôlé** (`sort` + `onSortChange`). Le mode serveur se résume donc à « ne pas trier en mémoire » : une prop booléenne `manualSorting`. En interne, c'est l'option `manualSorting` de TanStack, sans autre code.
- La pagination n'est pas dans `DataTable` (voir 1.3). `DataTable` reçoit seulement `page` / `pageSize` pour découper **après** le tri en mode client. En mode serveur, `data` est déjà la page : on passe `manualPagination` et on ne découpe rien.
- **Pourquoi ne pas reporter le mode serveur** : les écrans de supervision (milliers de courses, d'arrêts) seront majoritairement paginés côté API. Une v1 uniquement client obligerait à changer l'API en v2 : le contrat `sort` contrôlé + `page`/`pageSize` doit être le bon dès le départ.
- **Piège évité** : en mode client, si l'app découpait `data.slice(...)` elle-même avant de passer les lignes, le tri ne porterait que sur la page affichée. C'est pour ça que `DataTable` reçoit `page`/`pageSize` et découpe lui-même, après le tri.
- Les filtres restent **toujours côté app**, dans les deux modes : `FilterBar` est contrôlé et l'app filtre `data` (en mémoire ou via l'API). `DataTable` n'embarque ni filtre de colonne ni filtre global en v1.

### 1.2 Virtualisation automatique au-delà d'un seuil, ou prop explicite ? → **Prop explicite `virtualized`, défaut `false`**

- La virtualisation change le **contrat de mise en page** : hauteur bornée obligatoire (`maxHeight`), lignes de hauteur fixe (celle de la densité), lignes positionnées en absolu. Elle change aussi le comportement du navigateur : la recherche Ctrl+F et l'impression ne voient que les lignes montées.
- Un basculement automatique à 200 lignes ferait changer ces comportements **en silence** dès qu'un filtre fait passer le résultat de 190 à 210 lignes. Ce genre de bug n'arrive qu'en production, avec de vraies données.
- **Garde-fou** : en développement uniquement (`import.meta.env.DEV`), un `console.warn` si plus de 500 lignes sont rendues sans `virtualized` ni `page`/`pageSize`.
- Si `virtualized` est passé sans `maxHeight`, la zone prend une hauteur par défaut de `560px`, et le cas est documenté.
- **Un seul chemin de rendu** : les lignes sont toujours mises en page en CSS Grid, avec le même `grid-template-columns` pour l'en-tête et le corps, qu'on virtualise ou non. Activer `virtualized` ne fait donc pas bouger les largeurs de colonnes.

### 1.3 `DataTable` intègre-t-il `Pagination` et la barre de sélection ? → **Non : on les compose à côté**

- **Pagination** : elle sert aussi aux listes de `TableCard` et aux résultats d'API hors tableau. Un tableau virtualisé ne pagine pas. L'intégrer obligerait `DataTable` à exposer toutes les props de `Pagination` en doublon.
- **Barre de sélection** : ses actions sont propres à chaque écran (« Dupliquer », « Clôturer », « Exporter »…) et `GUIDELINES.md` la décrit déjà comme une composition de l'app (recette 2). La garder dehors reste cohérent.
- **Ce qui facilite la composition** :
  - `DataTable` reçoit `page`/`pageSize`, donc l'état de pagination vit au même endroit pour `DataTable` et `Pagination` ;
  - la sélection est contrôlée par des **identifiants** (`selectedIds`), qui survivent aux changements de page et de tri ;
  - la **recette 5** et la story « Liste de perturbations » donnent l'assemblage complet, prêt à copier.

---

## 2. DataTable

### 2.1 Interface

```ts
/** Valeur triable renvoyée par une colonne. */
export type DataTableValue = string | number | Date | boolean | null | undefined;

export interface DataTableColumn<T> {
  /** Identifiant stable de la colonne (clé de tri, de masquage). */
  id: string;
  /** Libellé FR, affiché en MAJUSCULES (style de TableHeader). */
  header: string;
  /** Valeur brute : sert au tri et au rendu par défaut. */
  accessor: (row: T) => DataTableValue;
  /** Rendu personnalisé (Indicator, Badge…). Sans `cell`, rendu par défaut (voir 2.3). */
  cell?: (row: T) => React.ReactNode;
  /** Alignement. Défaut "left" ; "right" si `numeric`. */
  align?: "left" | "right" | "center";
  /** Nombre : police mono + alignement à droite. */
  numeric?: boolean;
  /** Largeur fixe en px. Sans `width`, la colonne se partage l'espace restant (1fr). */
  width?: number;
  /** Largeur minimale en px des colonnes sans `width`. Défaut 80. */
  minWidth?: number;
  /** Colonne triable. Défaut false. */
  sortable?: boolean;
}

export interface DataTableSort {
  id: string;
  desc: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  /** Nom accessible du tableau (obligatoire). */
  "aria-label": string;

  /** 36px (compact) / 48px (comfortable). Défaut "comfortable". */
  density?: "compact" | "comfortable";
  /** Colonnes masquées (ids). */
  hiddenColumnIds?: string[];

  // ── Tri ──
  /** Tri contrôlé. Sans `sort`, le tri est géré en interne (non contrôlé). */
  sort?: DataTableSort[];
  /** Tri initial en mode non contrôlé. */
  defaultSort?: DataTableSort[];
  onSortChange?: (sort: DataTableSort[]) => void;
  /** Mode serveur : `data` arrive déjà trié, DataTable ne trie pas. Défaut false. */
  manualSorting?: boolean;

  // ── Pagination (le composant Pagination est composé à côté) ──
  /** Page courante (1-based). Avec `pageSize`, DataTable découpe après le tri (mode client). */
  page?: number;
  pageSize?: number;
  /** Mode serveur : `data` est déjà la page courante, aucun découpage. Défaut false. */
  manualPagination?: boolean;

  // ── Sélection (contrôlée) ──
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;

  // ── Interaction ──
  onRowClick?: (row: T) => void;

  // ── États ──
  /** Sans données : lignes squelettes. Avec données : lignes atténuées + aria-busy. */
  loading?: boolean;
  /** Défaut : « Aucun résultat. » */
  emptyState?: React.ReactNode;

  // ── Défilement ──
  /** Hauteur max de la zone scrollable ; l'en-tête reste collant. */
  maxHeight?: number | string;
  /** Virtualisation des lignes (voir 1.2). Défaut false. */
  virtualized?: boolean;

  className?: string;
}

export function DataTable<T>(props: DataTableProps<T>): React.ReactElement;
```

**Écarts avec l'esquisse, et pourquoi :**

| Esquisse | Proposition | Raison |
|---|---|---|
| `accessor: (row) => unknown` | `=> DataTableValue` | Un tri a besoin de valeurs comparables. Le type empêche de renvoyer un objet ou un nœud React. |
| `hideable?: boolean` | `hiddenColumnIds?: string[]` | Sans menu de colonnes intégré, `hideable` ne servirait à rien en v1. Le menu de colonnes est fourni par l'app (slot `actions` de `FilterBar`) et pilote `hiddenColumnIds`. Un menu intégré pourra venir au lot 2. |
| `sort` contrôlé uniquement | `sort` **ou** `defaultSort` | Le cas simple (tri client sans état dans l'app) ne doit pas exiger un `useState`. |
| — | `page`, `pageSize`, `manualSorting`, `manualPagination` | Voir 1.1. |
| — | `className` | Comme les autres composants. |

### 2.2 Exemples d'usage

```tsx
// 1) Mode client : 3 000 arrêts en mémoire, paginés, tri non contrôlé
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(50);

<DataTable
  aria-label="Arrêts du réseau"
  columns={[
    { id: "name", header: "Arrêt", accessor: (s) => s.name, sortable: true },
    { id: "code", header: "Code", accessor: (s) => s.code, width: 180,
      cell: (s) => <Badge label={s.code} mono /> },
    { id: "lines", header: "Lignes", accessor: (s) => s.lineCount, numeric: true, width: 100, sortable: true },
  ]}
  data={stops}
  getRowId={(s) => s.id}
  defaultSort={[{ id: "name", desc: false }]}
  page={page}
  pageSize={pageSize}
/>
<Pagination page={page} pageSize={pageSize} totalItems={stops.length}
  onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
```

```tsx
// 2) Mode serveur : tri et pagination calculés par l'API, sélection contrôlée
<DataTable
  aria-label="Perturbations"
  columns={columns}
  data={response?.items ?? EMPTY}          // EMPTY défini au niveau module (référence stable)
  getRowId={(d) => d.id}
  manualSorting
  manualPagination
  sort={sort}
  onSortChange={(s) => { setSort(s); setPage(1); }}
  loading={isFetching}
  selectable
  selectedIds={selectedIds}
  onSelectionChange={setSelectedIds}
  onRowClick={(d) => navigate(`/perturbations/${d.id}`)}
  maxHeight="calc(100vh - 280px)"
/>
```

### 2.3 Géré en interne / fourni par l'app

| Interne (DataTable) | Fourni par l'app |
|---|---|
| Tri client : chaînes `localeCompare("fr", { numeric: true })` (« Ligne 2 » avant « Ligne 10 »), nombres, dates, `null` toujours en dernier | Données, `getRowId`, définitions de colonnes |
| Cycle de tri asc → desc → aucun, Maj+clic pour le tri multi-colonnes (ordre affiché si ≥ 2 colonnes) | Tri serveur (`manualSorting`) |
| Découpage de la page après le tri (mode client) | Composant `Pagination`, `totalItems` |
| Case d'en-tête à trois états, Maj+clic pour sélectionner une plage | État `selectedIds`, barre de sélection et ses actions |
| Rendu par défaut : nombre → `Intl.NumberFormat("fr-FR")`, `Date` → `JJ/MM/AAAA HH:mm`, booléen → « Oui » / « Non », vide → « — » | Rendus riches via `cell` |
| En-tête collant, virtualisation, squelettes, état vide | Filtres (via `FilterBar`) et menu de colonnes |
| Navigation au clavier, attributs ARIA | — |

### 2.4 Sémantique et clavier

- **Balisage** : vrais `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">` et `<td>`, avec `aria-sort` sur les en-têtes triables.
  - Comme les lignes sont mises en page en CSS Grid (voir 1.2), certains navigateurs retirent la sémantique de tableau quand `display` change. J'ajoute donc des rôles **explicites** : `role="table"`, `rowgroup`, `row`, `columnheader`, `cell`.
  - En mode virtualisé, j'ajoute `aria-rowcount` (nombre total de lignes) et `aria-rowindex` sur chaque ligne montée.
- **Pas de `role="grid"`** : ce rôle promet une navigation cellule par cellule au clavier (flèches gauche/droite, Début/Fin…), que la v1 ne fait pas. Annoncer `grid` sans ce comportement est pire qu'un `table` honnête.
- **Tri** : chaque en-tête triable contient un `<button>`. Il est donc atteignable avec Tab et activable avec Entrée ou Espace (Maj+Entrée pour le tri multi-colonnes).
- **Lignes** : quand `onRowClick` est fourni, focus mobile (*roving tabindex*) : une seule ligne est dans l'ordre de tabulation.
  - Haut / Bas / Début / Fin déplacent le focus, Entrée active la ligne et Espace la sélectionne si `selectable`.
  - En mode virtualisé, le focus sur une ligne qui sort de l'écran est conservé grâce à `scrollToIndex` puis une remise du focus après le rendu.
- **Cases à cocher** : `Checkbox` existant (piloté par `state`, focusable). Le Maj+clic est capté par un `onClickCapture` / `onKeyDownCapture` sur la cellule, **sans modifier `Checkbox`**.
- **Case d'en-tête** : elle sélectionne les lignes **affichées** (la page courante, ou toutes les lignes si le tableau est virtualisé). Pour « Sélectionner les 12 430 résultats », c'est la barre de sélection de l'app qui décide (pattern montré dans la story).

### 2.5 Styles (tokens uniquement)

| Élément | Token |
|---|---|
| Fond | `--cadence-color-white` |
| Survol de ligne | `--cadence-color-surface-alt` |
| Ligne sélectionnée | `--cadence-color-accent-subtle` |
| Séparateurs | `--cadence-color-divider` |
| Texte | `--cadence-color-primary` |
| En-têtes | style de `TableHeader` : `--cadence-color-icon-muted` → `--cadence-color-primary` si actif, 11px, 600, majuscules |
| Nombres | `--cadence-font-mono` |
| Squelettes | `--cadence-color-surface-alt` (animation de pulsation, désactivée avec `prefers-reduced-motion`) |
| Focus (lignes, boutons d'en-tête) | `--cadence-focus-ring` (voir Q4) |
| En-tête collant | `position: sticky; top: 0` ; `z-index` local 1 (empilement interne, comme le prévoit la règle des tokens) |

⚠️ Survol (`#eef1f4`) et sélection (`#f0f6ff`) sont très proches à l'œil. La sélection reste lisible grâce à la case cochée, mais je le signale pour la phase 3 des tokens.

---

## 3. Pagination

### 3.1 Interface

```ts
export interface PaginationProps {
  /** Page courante (1-based). */
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  /** Défaut [25, 50, 100]. */
  pageSizeOptions?: number[];
  /** Sans ce callback, le sélecteur de taille de page n'est pas affiché. */
  onPageSizeChange?: (size: number) => void;
  /** Défaut « Pagination ». */
  "aria-label"?: string;
  className?: string;
}
```

### 3.2 Exemples d'usage

```tsx
// 1) Liste paginée simple, taille fixe
<Pagination page={page} pageSize={50} totalItems={12430} onPageChange={setPage} />
// → « 1–50 sur 12 430 »   ‹  1 … 4 5 6 … 249  ›
```

```tsx
// 2) Taille de page modifiable (l'app remet la page à 1)
<Pagination
  page={page}
  pageSize={pageSize}
  totalItems={total}
  onPageChange={setPage}
  pageSizeOptions={[25, 50, 100, 200]}
  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
/>
```

### 3.3 Géré en interne / fourni par l'app

| Interne | App |
|---|---|
| Calcul du nombre de pages, plage « 1–50 sur 12 430 » (`Intl.NumberFormat("fr-FR")`, espace insécable fine), « 0 résultat » si vide | `page`, `pageSize`, `totalItems` |
| Liste des pages avec ellipses : première, dernière, courante ±1, et toutes les pages si ≤ 7 (fonction pure `getPageItems`, testée) | Remise à la page 1 quand la taille change |
| Précédent / suivant désactivés aux bornes (`chevron-left` / `chevron-right`, `title` « Page précédente » / « Page suivante ») | — |
| `nav aria-label="Pagination"`, `aria-current="page"`, chaque numéro annoncé « Page 4 » | — |
| Sélecteur « 50 par page » via le `Dropdown` existant | — |

Les numéros de page et les flèches sont des `<button>` natifs, stylés dans `pagination.css`. Aucun composant existant ne convient : `TableCardAction` affiche un tooltip, et `SecondaryButton` est trop gros pour cet usage.

⚠️ **Limite connue** : le menu de `Dropdown` s'ouvre toujours vers le bas. En bas de page, il peut déborder de la fenêtre. Je ne modifie pas `Dropdown` ; c'est à noter pour le lot 2.

---

## 4. FilterBar

### 4.1 Interface

```ts
export interface FilterBarSearch {
  value: string;
  onChange: (value: string) => void;
  /** Défaut « Rechercher… ». */
  placeholder?: string;
  /** Nom accessible. Défaut « Rechercher ». */
  "aria-label"?: string;
}

export interface FilterBarProps {
  search?: FilterBarSearch;
  /** Slot : Dropdown, SegmentedControl… fournis par l'app. */
  quickFilters?: React.ReactNode;
  activeFilters?: { id: string; label: string }[];
  onRemoveFilter?: (id: string) => void;
  /** « Tout effacer » (Link hideArrow), affiché à partir de 2 filtres actifs. */
  onClearAll?: () => void;
  /** « 12 430 résultats » / « 1 résultat » / « Aucun résultat ». */
  resultCount?: number;
  /** Slot à droite : export, menu de colonnes… */
  actions?: React.ReactNode;
  className?: string;
}
```

### 4.2 Exemples d'usage

```tsx
// 1) Recherche seule + compteur
<FilterBar
  search={{ value: query, onChange: setQuery, placeholder: "Rechercher un arrêt…" }}
  resultCount={filtered.length}
/>
```

```tsx
// 2) Barre complète d'un écran de supervision
<FilterBar
  search={{ value: query, onChange: setQuery }}
  quickFilters={
    <>
      <Dropdown options={lineOptions} value={line} onChange={setLine} placeholder="Ligne" />
      <SegmentedControl options={periodOptions} value={period} onChange={setPeriod} aria-label="Période" />
    </>
  }
  activeFilters={[{ id: "line:13", label: "Ligne 13" }, { id: "sev:critical", label: "Critique" }]}
  onRemoveFilter={removeFilter}
  onClearAll={clearFilters}
  resultCount={total}
  actions={<SecondaryButton outline withIcon="left" icon="download-02" label="Exporter" />}
/>
```


### 4.3 Géré en interne / fourni par l'app

| Interne | App |
|---|---|
| Debounce de 300 ms : saisie locale immédiate, `onChange` après 300 ms d'inactivité. Entrée valide tout de suite. | La valeur `value` (contrôlée) et le filtrage effectif |
| Resynchronisation si `value` change de l'extérieur (ex. « Tout effacer » vide la recherche) | Contenu de `quickFilters` et `actions` |
| `Badge dismissible` par filtre actif ; « Tout effacer » seulement à partir de 2 filtres | Liste `activeFilters`, retrait des filtres |
| Compteur dans une région `aria-live="polite"` (annoncé après filtrage) ; pluriel français ; `0` → « Aucun résultat » | `resultCount` |
| Mise en page : ligne 1 = recherche · filtres rapides · actions à droite ; ligne 2 (si non vide) = filtres actifs · compteur | — |
| `role="search"` autour du champ | — |

La recherche réutilise `TextInput` avec `label=""` et `aria-label` (props existantes). Voir le blocage 5.2 pour l'icône.

---

## 5. Blocages et changements proposés à part

Aucun de ces changements ne casse l'API : ce sont des **ajouts optionnels**. Je ne les fais qu'avec ton accord, chacun dans un commit séparé.

### 5.1 `Checkbox` n'a pas de nom accessible ⛔ (bloquant pour l'a11y)

`Checkbox` rend une `div role="checkbox"` sans contenu ni prop `aria-label`. Une case de ligne n'a donc **aucun nom accessible**, et axe lève une violation sérieuse (`aria-toggle-field-name`) sur chaque ligne. Un `<label>` HTML ne peut pas nommer une `div`.

- **Proposition** : ajouter une prop optionnelle `"aria-label"?: string` à `Checkbox`, transmise telle quelle. `DataTable` passerait « Sélectionner la ligne » (avec, si possible, le libellé de la 1re colonne) et « Tout sélectionner » pour l'en-tête.
- **Sans cet ajout** : le critère « aucune violation a11y bloquante » ne peut pas être tenu.

### 5.2 `TextInput` n'accepte pas d'icône

Il n'y a pas de prop d'icône. Conformément à la consigne, je n'en invente pas.

- **Option A (v1 par défaut)** : recherche sans loupe. Le placeholder « Rechercher… » porte le sens.
- **Option B (proposée à part)** : prop optionnelle `leadingIcon?: IconName` sur `TextInput`, rendue dans le champ, avec padding gauche ajusté et icône `aria-hidden`.

### 5.3 Flèches de tri : réutiliser celles de `TableHeader`

L'icône `SortIcon` de `TableHeader.tsx` n'est pas exportée, et ses couleurs sont en dur dans le TSX : `#002830`, ainsi que `#c5cfd3`, qui n'est **pas un token**.

- **Proposition** : extraire `SortIcon` dans un module interne (non exporté par `index.ts`), avec des couleurs pilotées en CSS.
  - Actif : `--cadence-color-primary`.
  - Inactif : **nouveau token** `--cadence-color-icon-disabled: #c5cfd3`, commenté « Pictos inactifs (flèches de tri non actives) ».
- `TableHeader` l'utilise ensuite à l'identique : refactor iso-visuel, API inchangée.

---

## 6. Tests : ce qui est réellement configuré

« Vitest déjà configuré » est vrai, mais **seulement** sous la forme du projet `storybook` (`@storybook/addon-vitest`, navigateur Chromium via Playwright). Il n'y a ni projet de tests unitaires, ni `@testing-library/react`, ni script `test`. Pour rester sans nouvelle dépendance :

1. **Fonctions pures** (`getPageItems`, format « 1–50 sur 12 430 », comparateur de tri) : j'ajoute un projet Vitest `unit` (environnement `node`, `src/**/*.test.ts`) dans `vite.config.ts`, et un script `"test": "vitest run"`.
2. **Interactions** (tri, Maj+clic, case d'en-tête indéterminée, debounce) : fonctions `play` dans les stories (`storybook/test` : `expect`, `userEvent`, `within`, intégré à Storybook 10). Elles sont exécutées par le projet `storybook` existant.
3. **Accessibilité** : `parameters.a11y.test = "error"` sur les stories des trois composants. Le réglage global reste `"todo"`, pour ne pas faire échouer les autres composants.

---

## 7. Questions à trancher

| # | Question | Ma recommandation |
|---|---|---|
| Q1 | Valides-tu les réponses 1.1 (client + serveur), 1.2 (prop explicite) et 1.3 (composition à côté) ? | Oui |
| Q2 | Ajout de `aria-label` sur `Checkbox` (5.1) ? | **Oui**, sinon l'a11y échoue |
| Q3 | Icône de recherche : option A (sans loupe) ou B (`leadingIcon` sur `TextInput`) ? | A en v1, B en commit séparé si tu le veux |
| Q4 | Les nouveaux composants utilisent-ils déjà `--cadence-focus-ring` (proposé mais pas encore appliqué ailleurs) ? Leur focus serait alors différent de celui des composants existants. | **Oui** : ce sont de nouveaux composants, autant partir sur l'anneau cible |
| Q5 | Le critère de vérification 4 (`grep` des hex sur les 3 CSS) entre en conflit avec la convention `var(--token, #fallback)` : chaque fallback contient un hex. Que veux-tu ? (a) Pas de fallback dans ces 3 fichiers : `tokens.css` est toujours importé via `index.ts`. (b) Garder les fallbacks et appliquer le `grep` avec `grep -v "var(--"`, comme en phase 2. | **(b)**, pour rester cohérent avec `CLAUDE.md` |
| Q6 | Extraction de `SortIcon` + nouveau token `--cadence-color-icon-disabled` (5.3) ? | Oui |
| Q7 | `hiddenColumnIds` à la place de `hideable` (2.1) ? | Oui |
| Q8 | Ajout du projet Vitest `unit` et du script `test` (6) ? | Oui |

Une fois validé, j'enchaîne dans cet ordre : phase 1 (dépendances, `external`, `pnpm-lock.yaml` mis à jour), puis un commit par composant, puis la documentation. Rien n'est poussé.

---

## 8. Écarts entre la proposition et l'implémentation

- **Garde-fou « > 500 lignes » (1.2) abandonné.** En mode bibliothèque, Vite remplace `import.meta.env.DEV` par `false` au build : l'avertissement ne s'afficherait jamais chez les applications. Les consignes « pagination ou virtualisation » sont dans `GUIDELINES.md` à la place.
- **Pas d'`aria-selected` sur les lignes** : cet attribut n'est pas autorisé sur `role="row"` dans un `table` (seulement dans un `grid`). L'état est porté par la case à cocher de la ligne.
- **Navigation clavier élargie** : Page préc. / Page suiv. en plus de ↑/↓ et Début/Fin.
- **Q5 (b) retenue** : les nouveaux CSS gardent `var(--token, #fallback)`. Le contrôle des hex se fait avec `grep -v "var(--"`.
