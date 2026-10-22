# Proposition — lot « Composants additionnels » (avant 1.0)

**Version cible** : `0.6.0` · **Branche** : `feat/additional-components`
**Statut** : implémenté dans la branche de travail, audité et complété le 22/10/2026. Publication encore à préparer.
**Prérequis** : ✅ `feat/dataviz-v2` et `feat/states-overlays` fusionnés dans `main`.

Ce document conserve la proposition initiale pour traçabilité. Les API effectivement livrées et leurs limites figurent dans `GUIDELINES.md`. L’audit et les écarts sont documentés dans `docs/audits/additional-components-2026-10-22.md`. Le package reste en 0.5.0 tant que la version de livraison n’a pas été choisie.

---

## 0. Classement proposé

| Composant | Groupe | Classement | Pourquoi |
|---|---|---|---|
| `ProgressBar` | C | **Indispensable** | Primitive réutilisée par `AlertToast` et `FileUpload` ; aucune équivalente |
| `InlineAlert` | B | **Indispensable** | Feedback **persistant** dans le flux ; vrai manque (seul le toast éphémère existe) |
| `LineBadge` | A | **Indispensable** | Identité de ligne : présent dans quasi toute UI transport |
| `StopLabel` | A | **Indispensable** | Arrêt (nom + id mono + ville) : tableaux, autocomplétion |
| `Accordion` | B | **Indispensable** | Disclosure ARIA : très courant (détail, sections, FAQ) |
| `Stepper` | B | **Indispensable** | Formulaires en étapes / import |
| `FileUpload` | B | **Indispensable** | Flux d'import (cœur de la composition « Import réseau ») |
| `ExportMenu` | C | **Utile** | Spécialisation du menu d'`ActionMenu` ; pourrait rester une recette |
| `ColumnManager` | C | **Utile** | Fonction avancée ; demande une petite extension de `DataTable` |
| `Gauge` | C | **Utile** | Jauge à proportion unique ; `Card` couvre déjà le KPI chiffré |
| `Timeline` | A | **À reporter** | Le plus lourd (échelle de temps partagée, regroupement, chevauchements, clavier, alternative tabulaire). Auto-suffisant → aucun risque de gel d'API à le livrer après 1.0. ⚠️ s'il est reporté, la composition « Détail d'une perturbation » s'en passe. |

**Dépendances** : aucune nouvelle (d3-scale/shape/array déjà présents, File API native).
**Tokens** : aucun nouveau requis (réutilisation de `--cadence-status-*`, `--cadence-dataviz-*`, surfaces). Exception documentée : couleur de ligne de `LineBadge` (données GTFS).
**Extension non cassante** : `DataTable` gagne `columnOrder?: string[]` (consommé par `ColumnManager`) ; `AlertToast` délègue sa barre interne à `ProgressBar` (rendu inchangé).
**Refactor interne** : extraire de `ActionMenu` une primitive de menu interne (`menu-core` : positionnement portail + clavier + ARIA), réutilisée par `ActionMenu` (rendu inchangé) et `ExportMenu`.

---

## A. Métier transport

### `LineBadge` — Indispensable

Pastille d'identité de ligne. **Exception assumée** à la règle « tokens uniquement » : la couleur vient des données (GTFS `route_color` / `route_text_color`), pas d'un token.

```ts
interface LineBadgeProps {
  /** Code court de la ligne (« 13 », « RER A », « T3b »). */
  code: string;
  /** Mode de transport (pictogramme facultatif + nom accessible). */
  mode?: "metro" | "rer" | "train" | "tram" | "bus" | "car" | "bateau" | "navette";
  /** Couleur de fond (GTFS route_color). Défaut : encre neutre. */
  color?: string;
  /** Couleur du texte (GTFS route_text_color). Sinon calculée pour AA. */
  textColor?: string;
  /** Gabarit. Défaut "md". */
  size?: "sm" | "md";
  className?: string;
}
```

- **Contraste** : sans `textColor`, on choisit blanc (`#ffffff`) ou encre (`--cadence-color-primary`) selon celui qui atteint **4,5:1** sur `color`. Si aucun n'y parvient, liseré 1px (`--cadence-color-border-strong`) + `console.warn` en développement.
- **Forme** : pastille ronde si `code` court (≤ 3 car.), sinon pilule arrondie.
- **Nom accessible** : « Ligne 13, métro » (`aria-label`, pictogramme `aria-hidden`).

```tsx
<LineBadge code="13" mode="metro" color="#6EC4E8" textColor="#000000" />
<LineBadge code="RER A" mode="rer" color="#E2231A" /> {/* texte calculé → blanc */}
```

**L'app fournit** : `code`, `mode`, les couleurs GTFS. **Réutilise** : `Icons` (pictos de mode), tokens de contour/encre pour le repli. **Tokens** : aucun.

### `StopLabel` — Indispensable

Libellé d'arrêt : nom lisible + identifiant technique.

```ts
interface StopLabelProps {
  /** Nom affiché (« Châtelet »). */
  name: string;
  /** Identifiant technique (« stop_area:IDFM:47026 »), en mono et atténué. */
  id?: string;
  /** Commune (« Paris 1er »). */
  city?: string;
  /** Lignes desservies (ex. des <LineBadge/>). */
  lines?: ReactNode;
  className?: string;
}
```

- Nom en Inter (`--cadence-color-primary`), `id` en Spline Sans Mono (`--cadence-color-text-muted`), ellipse avec le texte complet en **tooltip** (`TooltipTrigger`).
- Pensé pour une cellule de `DataTable` (dense) et une option d'`Autocomplete`.

```tsx
<StopLabel name="Châtelet" id="stop_area:IDFM:47026" city="Paris 1er"
  lines={<><LineBadge code="1" size="sm" color="#FFCD00"/><LineBadge code="4" size="sm" color="#C04191"/></>} />
<StopLabel name="Gare de Lyon" city="Paris 12e" />
```

**L'app fournit** : les champs de l'arrêt. **Réutilise** : `TooltipTrigger`, `LineBadge`, tokens typo. **Tokens** : aucun.

### `Timeline` — À reporter (auto-suffisant)

Frise de périodes sur une échelle de temps partagée avec `LineChart`.

```ts
interface TimelineItem {
  id: string;
  label: string;
  start: Date;
  end?: Date;               // absent → instant
  status?: IndicatorVariant;
  group?: string;           // regroupement (ligne, réseau)
}
interface TimelineProps {
  items: TimelineItem[];
  /** Regroupement par `group`. */
  groupBy?: "none" | "group";
  /** Fenêtre affichée. Défaut : englobe les items. */
  range?: [Date, Date];
  /** Repère « maintenant ». Défaut true. */
  showNow?: boolean;
  onItemClick?: (item: TimelineItem) => void;
  className?: string;
}
```

- Échelle `scaleTime` (d3-scale, déjà en dép) + `ChartFrame`/`ChartAxis` (fondations v2). Chevauchements empilés par piste. Repère « maintenant » pointillé.
- Clavier : flèches pour parcourir les éléments, Entrée → `onItemClick` (ex. ouvrir un `Drawer`). **Alternative tabulaire** accessible (comme les graphiques).

```tsx
<Timeline items={perturbations} groupBy="group" onItemClick={(p) => setDetail(p)} />
<Timeline items={[{ id:"1", label:"Travaux", start:new Date(2026,9,19,8), end:new Date(2026,9,19,12), status:"warning" }]} />
```

**L'app fournit** : les périodes, `onItemClick`. **Réutilise** : `ChartFrame`, `ChartAxis`, d3-scale, `Indicator` (couleurs de statut), `ChartDataTable` (alternative). **Tokens** : `--cadence-dataviz-*` existants. ⚠️ Le plus coûteux du lot — candidat n°1 au report.

---

## B. Formulaires et flux

### `Stepper` — Indispensable

```ts
interface StepperStep {
  id: string;
  label: string;
  description?: string;
  state: "upcoming" | "current" | "completed" | "error";
}
interface StepperProps {
  steps: StepperStep[];
  orientation?: "horizontal" | "vertical";  // Défaut "horizontal"
  /** Clic sur une étape complétée (revenir en arrière). */
  onStepClick?: (id: string) => void;
  className?: string;
}
```

- `horizontal` (haut de formulaire) ou `vertical` (dans un `Drawer`). Étape `completed` cliquable. L'étape `current` porte `aria-current="step"`.
- Recette **« Formulaire en étapes »** (`Stepper` + sections + pied `GhostButton` « Précédent » / `PrimaryButton` « Suivant »).

```tsx
<Stepper steps={[
  { id:"src", label:"Source", state:"completed" },
  { id:"map", label:"Correspondances", state:"current" },
  { id:"pub", label:"Publication", state:"upcoming" },
]} onStepClick={goTo} />
```

**L'app fournit** : les étapes et leur état, `onStepClick`. **Réutilise** : `Icons` (coche/erreur), tokens de statut. **Tokens** : aucun.

### `FileUpload` — Indispensable

```ts
interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;   // uploading
  error?: string;
}
interface FileUploadProps {
  /** Fichiers acceptés (« .zip,.csv »). */
  accept?: string;
  multiple?: boolean;
  /** Taille max en octets (sinon erreur « Fichier trop volumineux »). */
  maxSize?: number;
  /** Fichiers retenus (validés type/taille). L'app gère l'envoi. */
  onFiles?: (files: File[]) => void;
  /** Liste contrôlée affichée (état d'envoi). */
  files?: UploadFile[];
  /** Retrait d'un fichier de la liste. */
  onRemove?: (id: string) => void;
  className?: string;
}
```

- Zone de dépôt + bouton « Parcourir ». Validation **type et taille** côté composant, messages FR (« Format non pris en charge : .xls. Formats acceptés : .zip (GTFS), .csv »). Changements d'état annoncés (`aria-live="polite"`). Barres d'envoi via `ProgressBar`.
- **Le composant n'envoie rien** : il valide et remonte `onFiles` ; l'app met à jour `files`.

```tsx
<FileUpload accept=".zip,.csv" maxSize={50_000_000} onFiles={startUpload} files={uploads} onRemove={remove} />
<FileUpload accept=".csv" onFiles={(f) => setOne(f[0])} />
```

**L'app fournit** : `onFiles`, l'état `files`, l'envoi réel. **Réutilise** : `ProgressBar`, `GhostButton`, `Icons`, `cadence-scrollbar`. **Tokens** : aucun.

### `InlineAlert` — Indispensable

```ts
interface InlineAlertProps {
  type: "information" | "success" | "warning" | "error";
  title?: string;
  children: ReactNode;
  /** Action inline (ex. « Réessayer »). */
  action?: { label: string; onClick: () => void };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}
```

- Bandeau **dans le flux** (pleine largeur de section ou sous un `PageHeader`). Icône + texte (jamais la couleur seule). Couleurs `--cadence-status-*` (fond + texte AA). `role="status"`, ou `role="alert"` pour `error`.
- **≠ `useToast`** (éphémère, overlay) : persistant, non bloquant, dans la page. Documenté dans les guidelines.

```tsx
<InlineAlert type="warning" title="Flux GTFS expiré">Mettez-le à jour pour continuer.</InlineAlert>
<InlineAlert type="error" action={{ label:"Réessayer", onClick:retry }}>Échec du chargement.</InlineAlert>
```

**L'app fournit** : le message, l'action. **Réutilise** : `Icons`, `Link`/`GhostButton` pour l'action, tokens `status`. **Tokens** : aucun.

### `Accordion` — Indispensable

```ts
interface AccordionItem { id: string; title: ReactNode; content: ReactNode; defaultOpen?: boolean; }
interface AccordionProps {
  items: AccordionItem[];
  mode?: "single" | "multiple";   // Défaut "single"
  className?: string;
}
```

- Pattern **disclosure** : en-tête `<button aria-expanded aria-controls>`, panneau `role="region"`. Animation de hauteur coupée sous `prefers-reduced-motion`.

```tsx
<Accordion items={[
  { id:"info", title:"Informations", content:<StopLabel name="Châtelet" /> },
  { id:"lignes", title:"Lignes impactées", content:<LineBadge code="1" color="#FFCD00" /> },
]} mode="multiple" />
```

**L'app fournit** : les items. **Réutilise** : `Icons` (chevron), tokens. **Tokens** : aucun.

---

## C. Outils data

### `ProgressBar` — Indispensable

```ts
interface ProgressBarProps {
  /** 0–100. Absent/undefined → indéterminé (animation). */
  value?: number;
  label?: string;
  showValue?: boolean;
  tone?: "default" | "success" | "danger";   // Défaut "default"
  className?: string;
}
```

- `role="progressbar"` + `aria-valuenow`/min/max (absent si indéterminé). Piste `--cadence-color-surface-alt`, remplissage selon `tone` (`primary`/`success`/`danger`). Animation coupée sous `prefers-reduced-motion`.
- **Réutilisé** par `AlertToast` (remplace sa barre interne, **rendu inchangé**) et `FileUpload`.

```tsx
<ProgressBar value={45} label="Import" showValue />
<ProgressBar tone="success" value={100} />
```

**L'app fournit** : `value`. **Tokens** : aucun (statuts existants).

### `ExportMenu` — Utile

```ts
interface ExportScopeCounts { selection?: number; page?: number; total?: number; }
interface ExportMenuProps {
  counts: ExportScopeCounts;         // selection absente/0 → portée désactivée
  formats?: ("csv" | "excel")[];     // Défaut ["csv","excel"]
  loading?: boolean;
  onExport: (args: { scope: "selection" | "page" | "all"; format: "csv" | "excel" }) => void;
  className?: string;
}
```

- Déclencheur `PrimaryButton outline size="sm"` (« Exporter »), sur la **primitive de menu** d'`ActionMenu`. Portées : sélection (compteur, désactivée si vide), page courante, tout le résultat (total). État `loading`.
- Pensé pour les actions d'un `PageHeader` et la `FilterBar`.

```tsx
<ExportMenu counts={{ selection: sel.length, page: 50, total: 12430 }} onExport={handleExport} />
<ExportMenu counts={{ total: 320 }} formats={["csv"]} loading={exporting} onExport={handleExport} />
```

**L'app fournit** : les compteurs, `onExport`, `loading`. **Réutilise** : primitive `menu-core`, `PrimaryButton outline`, `Icons`. **Tokens** : aucun.

### `ColumnManager` — Utile

```ts
interface ColumnManagerColumn { id: string; label: string; }
interface ColumnManagerProps {
  columns: ColumnManagerColumn[];
  visibleIds: string[];
  order: string[];
  onChange: (next: { visibleIds: string[]; order: string[] }) => void;
  className?: string;
}
```

- Popover (déclencheur `GhostButton`/`PrimaryButton outline`), `Checkbox` par colonne, réordonnancement **au clavier** (boutons monter/descendre — pas de glisser-déposer seul), « Réinitialiser ». Contrôlé.
- **`DataTable`** gagne `columnOrder?: string[]` (appliqué après `hiddenColumnIds`), **non cassant**.

```tsx
<ColumnManager columns={cols} visibleIds={vis} order={ord} onChange={setColState} />
<DataTable columns={cols} hiddenColumnIds={hidden} columnOrder={ord} /* … */ />
```

**L'app fournit** : l'état colonnes + `onChange`. **Réutilise** : `use-popover-fit`, portail, `Checkbox`, `GhostButton`. **Tokens** : aucun.

### `Gauge` — Utile

```ts
interface GaugeThreshold { value: number; label: string; }
interface GaugeProps {
  value: number;
  max?: number;              // Défaut 100
  unit?: string;
  thresholds?: GaugeThreshold[];
  goodDirection?: "up" | "down" | "neutral";  // Défaut "up"
  shape?: "arc" | "ring";    // Défaut "arc"
  className?: string;
}
```

- Arc ou anneau (fondations v2), valeur centrale en Spline Sans Mono. Couleur selon `goodDirection` + seuils (jamais la couleur seule : **libellé du seuil franchi** affiché). Utilisable seule ou dans une `Card`.

```tsx
<Gauge value={92} unit="%" goodDirection="up" thresholds={[{ value: 85, label: "Objectif" }]} />
<Gauge value={18} max={30} unit="min" goodDirection="down" shape="ring" />
```

**L'app fournit** : `value`, `max`, seuils. **Réutilise** : `ChartFrame`, d3-shape (`arc`), tokens `dataviz`/`status`. **Tokens** : aucun.

---

## Arbitrages initiaux (historique)

1. **`Timeline`** : le reporter après 1.0 (recommandé, il est lourd et auto-suffisant) ou le garder — sachant que la composition « Détail d'une perturbation » l'utilise ?
2. **`ExportMenu`** : vrai composant, ou simple **recette** bâtie sur `ActionMenu` ? (je penche pour un petit composant : la logique de portées/compteurs/formats mérite d'être cadrée.)
3. **`Gauge`** vs `Card` : garder les deux (Gauge = proportion visuelle, Card = KPI chiffré) ou se contenter de `Card` pour la 1.0 ?
4. Confirmes-tu le reste du classement (7 indispensables, 3 utiles) et les extensions non cassantes de `DataTable` (`columnOrder`) et d'`AlertToast` (barre → `ProgressBar`) ?


## État après audit du 22/10/2026

Les dix composants sont présents et exportés ; `Timeline` reste reporté. `ExportMenu` et `Gauge` restent des composants autonomes. `StopLabel` utilise `title` natif plutôt que `TooltipTrigger` (ce dernier ne peut pas envelopper un contenu). `Gauge` utilise directement d3-shape sans `ChartFrame` : chargement/erreur à composer par l'app. Le mode transport de `LineBadge` est annoncé, sans pictogramme dédié. Le repli de contraste utilise le noir lorsque blanc/encre ne suffisent pas ; les couleurs GTFS sans dièse sont normalisées. Voir les guidelines pour les contrats publics à jour.
