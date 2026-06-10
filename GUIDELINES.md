# Guidelines — Hove Cadence UI

Design system React pour les produits Hove (transport public). Ce document est la **source de vérité unique** pour construire des interfaces avec `@ddaoellena/cadence-ui` — il est conçu pour être lu aussi bien par des développeurs que par des agents IA.

## Sommaire

1. [Instructions pour agents IA](#instructions-pour-agents-ia)
2. [Installation & setup](#installation--setup)
3. [Design tokens](#design-tokens)
4. [Typographie](#typographie)
5. [Intention → composant](#intention--composant)
6. [Layout & spacing](#layout--spacing)
7. [Boutons](#boutons)
8. [Formulaires](#formulaires)
9. [Navigation](#navigation)
10. [Listes & tableaux](#listes--tableaux)
11. [Statuts & étiquettes](#statuts--étiquettes)
12. [Feedback](#feedback)
13. [Recettes de pages complètes](#recettes-de-pages-complètes)
14. [Référence API des composants](#référence-api-des-composants)

---

## Instructions pour agents IA

Règles impératives pour générer du code avec ce design system :

1. **Ne jamais inventer de prop.** Si une prop n'apparaît pas dans la [Référence API](#référence-api-des-composants), elle n'existe pas. En cas de doute, consulter la fiche du composant avant de l'utiliser.
2. **Ne jamais recréer un composant qui existe.** Avant de coder un bouton, un champ, une carte ou un badge custom, vérifier la table [Intention → composant](#intention--composant).
3. **Couleurs : uniquement les tokens.** Écrire `var(--cadence-color-primary)`, jamais de hex en dur. Les couleurs absentes des tokens (bleus, violets…) sont réservées aux composants internes — ne pas les réutiliser.
4. **Les règles ❌ sont bloquantes.** Ce ne sont pas des suggestions : un code qui viole un ❌ est incorrect.
5. **`Checkbox`, `Toggle` et `RadioButton` se pilotent par la prop `state`**, pas par une prop `checked` — elle n'existe pas. Exemple : `<Checkbox state={isChecked ? "checked" : "unchecked"} onChange={setIsChecked} />`.
6. **Le CSS custom est limité au layout.** `display: flex`, `gap`, `padding`, `margin`, largeurs : OK en style inline. Couleurs, polices, bordures, ombres custom : interdit — les composants et tokens couvrent ces besoins.
7. **Partir des [recettes](#recettes-de-pages-complètes)** pour toute page nouvelle, puis adapter. Ne pas réinventer la structure.
8. **Un seul `PrimaryButton` rempli par vue.** Plusieurs `SecondaryButton` sont autorisés.
9. **Toujours passer `label`** sur les champs de formulaire (`TextInput`, `TextArea`, `Dropdown`, `DatePicker`, `CounterInput`).
10. **Imports** : composants depuis `@ddaoellena/cadence-ui`, styles via un unique `import "@ddaoellena/cadence-ui/style.css"`, polices via les `<link>` de la section [Installation](#installation--setup).

---

## Installation & setup

```bash
npm install @ddaoellena/cadence-ui
```

### 1. Importer les styles (une seule fois, à la racine)

```tsx
// main.tsx ou App.tsx
import "@ddaoellena/cadence-ui/style.css";
```

### 2. Charger les polices (dans le `<head>` du HTML)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

La **Uxum Grotesque** (titres) est une police commerciale : si le projet la possède, la déclarer via `@font-face` — elle prendra automatiquement le pas sur Space Grotesk dans `--cadence-font-display`. Sinon Space Grotesk sert de fallback sans configuration.

### 3. Importer les composants

```tsx
import { PrimaryButton, TextInput, TableCard, Modal } from "@ddaoellena/cadence-ui";
```

### 4. Squelette d'application minimal

Voir la [recette Layout d'application](#recette-1--layout-dapplication) — toute app commence par ce squelette (Sidebar fixe + Header fixe + zone de contenu).

---

## Design tokens

Les couleurs, polices et rayons sont centralisés dans des variables CSS (`tokens.css`, chargé automatiquement avec la lib). Chaque usage interne garde un fallback en dur : le rendu reste correct même sans le fichier de tokens.

| Token | Valeur | Usage |
|---|---|---|
| `--cadence-color-primary` | `#002830` | Encre principale — texte fort, boutons, modale |
| `--cadence-color-label` | `#1a3e45` | Labels de formulaire, badges |
| `--cadence-color-text-muted` | `#809397` | Texte secondaire (heures, descriptions) |
| `--cadence-color-text-disabled` | `#808080` | Texte des états désactivés |
| `--cadence-color-placeholder` | `#9ca3af` | Placeholders des champs |
| `--cadence-color-icon-muted` | `#69797d` | Icônes d'action discrètes |
| `--cadence-color-icon-neutral` | `#737373` | Icônes neutres (pictos métier) |
| `--cadence-color-danger` | `#da1e28` | Actions destructives, erreurs |
| `--cadence-color-success` | `#24a148` | Confirmations, états valides |
| `--cadence-color-white` | `#ffffff` | Surfaces de premier plan |
| `--cadence-color-surface-alt` | `#eef1f4` | Fonds de wrapper (TableCard, Badge) |
| `--cadence-color-border` | `#e5e5e5` | Bordures par défaut |
| `--cadence-color-border-strong` | `#bfc9cb` | Bordures appuyées, états disabled |
| `--cadence-color-divider` | `#f0f0f0` | Séparateurs internes |
| `--cadence-font-sans` | Inter | Texte d'interface |
| `--cadence-font-display` | Uxum Grotesque → Space Grotesk | Titres |
| `--cadence-font-mono` | Spline Sans Mono | Valeurs numériques |
| `--cadence-radius-sm` | `6px` | Petits éléments : badges, boutons d'icône |
| `--cadence-radius-md` | `8px` | Contenus internes |
| `--cadence-radius-lg` | `10px` | Champs et cards |
| `--cadence-radius-xl` | `12px` | Conteneurs : modale |

### Règles

- ✅ Dans du code applicatif, référencer les tokens (`color: var(--cadence-color-primary)`) plutôt que les hex en dur.
- ✅ Pour créer un nouveau composant, piocher dans `tokens.css` ; n'ajouter un token que si la valeur a vocation à être partagée.
- ❌ Ne pas redéfinir les `--cadence-*` au niveau d'un composant — ce sont des valeurs globales du thème.

---

## Typographie

Trois polices, chacune réservée à un rôle précis. Ne pas les substituer.

| Police | Token | Rôle |
|---|---|---|
| **Inter** | `--cadence-font-sans` | Texte d'interface : labels, valeurs, boutons, navigation, messages |
| **Uxum Grotesque** (fallback Space Grotesk) | `--cadence-font-display` | Titres de page (`<h1>`) et nom produit |
| **Spline Sans Mono** | `--cadence-font-mono` | Valeurs numériques et données chiffrées |

### Règles

- ✅ Utiliser **Inter** pour tout texte d'interface — c'est déjà la police par défaut de tous les composants.
- ✅ Utiliser le token `--cadence-font-display` pour les `<h1>` de page.
- ✅ Utiliser `--cadence-font-mono` uniquement pour les valeurs numériques affichées (codes, identifiants, axes de graphiques).
- ❌ Ne jamais utiliser une police système ou une autre police web.
- ❌ Ne pas utiliser la display pour du texte courant — réservée aux titres.
- ❌ Ne pas utiliser la mono pour des labels ou du texte d'interface.

```tsx
// ✅ Titre de page
<h1 style={{ fontFamily: "var(--cadence-font-display)", fontSize: 28, fontWeight: 500, color: "var(--cadence-color-primary)" }}>
  Titre de page
</h1>
```

---

## Intention → composant

Table de correspondance : ce que l'interface doit faire → le composant à utiliser. **Toujours consulter cette table avant d'écrire du code custom.**

| Intention | Composant | Ne pas confondre avec |
|---|---|---|
| Action principale de la page | `PrimaryButton` | — |
| Action secondaire, action inline de formulaire | `SecondaryButton` | — |
| Navigation inline, action tertiaire discrète | `Link` | — |
| Petite action par ligne de liste (icône) | `TableCardAction` | `SecondaryButton withIcon="only"` (trop gros ici) |
| Saisie de texte libre (1 ligne) | `TextInput` | — |
| Saisie de texte long (multi-lignes) | `TextArea` | — |
| Valeur numérique avec +/− | `CounterInput` | `TextInput type="number"` (interdit) |
| Choix dans une liste (≥ 3 options) | `Dropdown` | `NavigationDropdown` (réservé navigation) |
| Choix exclusif 2-4 options **dans un formulaire** | `SegmentedControlAlt` | `SegmentedControl` (réservé navigation) |
| Bascule entre vues / modes d'affichage | `SegmentedControl` | `Tab` (navigation de page) |
| Navigation entre vues d'une même page | `Tab` | `SegmentedControl` |
| Date (avec ou sans heure) | `DatePicker` | — |
| Option booléenne dans un formulaire (validée à la soumission) | `Checkbox` | `Toggle` |
| Activation/désactivation à effet immédiat | `Toggle` | `Checkbox` |
| Choix exclusif 2-5 options courtes | `RadioButton` | — |
| Choix exclusif avec icône + description | `RichRadioButton` | — |
| Étiquette d'information neutre (catégorie, tag, code) | `Badge` | `Indicator` (qui porte un état) |
| État ou statut avec picto + couleur sémantique | `Indicator` | `Badge` (purement informatif) |
| Élément de liste structuré (header + colonnes) | `TableCard` | un `<table>` HTML custom |
| Ligne d'en-têtes de colonnes avec tri | `TableHeader` | — |
| Dialogue bloquant (confirmation, formulaire court) | `Modal` | `AlertToast` (non bloquant) |
| Notification temporaire non bloquante | `AlertToast` | `Modal` |
| Info contextuelle au survol | `Tooltip` / `TooltipTrigger` | `Modal` |
| Navigation principale (sections de l'app) | `Sidebar` | — |
| Barre supérieure (périmètre + profil) | `Header` | — |
| Fil d'Ariane | `Breadcrumbs` | — |
| Sélecteur de contexte dans le breadcrumb | `NavigationDropdown` | `Dropdown` (formulaires) |
| Identité utilisateur (initiales / photo) | `Avatar` | — |
| Graphique en barres | `DataVisualization` | — |
| Icône seule | `Icons` | — |

---

## Layout & spacing

### Échelle d'espacement

Toutes les distances utilisent cette échelle (px) : **4, 8, 12, 16, 20, 24, 32, 48**.

| Contexte | Valeur |
|---|---|
| Gap entre boutons d'un groupe | `8` |
| Gap entre actions d'icône (`TableCardAction`) | `8` |
| Gap entre cards d'une liste | `8` |
| Gap entre champs d'un formulaire | `20` |
| Gap entre champs côte à côte (même ligne) | `12` |
| Gap entre sections d'un formulaire | `32` |
| Padding de page (zone de contenu) | `24px 32px` |
| Padding interne des cellules de colonnes | `16` |

### Constantes de layout

```tsx
const SIDEBAR_WIDTH = 240;  // largeur de la Sidebar
const HEADER_HEIGHT = 56;   // hauteur du Header
```

### Règles

- ✅ Le layout (flex, grid, gap, margins) se fait en style inline ou CSS applicatif — c'est le seul CSS custom autorisé.
- ✅ Largeurs de contenu : les formulaires sont limités à `max-width: 640px` ; les listes prennent toute la largeur.
- ❌ Ne pas inventer de valeurs d'espacement hors échelle (pas de `gap: 7px` ou `padding: 13px`).

---

## Boutons

### Choisir le bon composant

| Composant | Quand l'utiliser | Exemple |
|---|---|---|
| `PrimaryButton` | Action principale de la page. **Un seul par vue.** | « Créer », « Enregistrer », « Lancer » |
| `SecondaryButton` | Actions secondaires ou alternatives. Peut être utilisé plusieurs fois. | « Exporter », « Annuler », « Voir les détails » |
| `Link` | Navigation inline dans du texte, ou action tertiaire discrète. | « Retour », « En savoir plus », « Supprimer » |
| `TableCardAction` | Action rapide par ligne de liste (icône + tooltip). | Dupliquer, modifier, supprimer une ligne |

### Règles

- ✅ Un seul `PrimaryButton` par zone d'action.
- ✅ Placer le bouton principal à droite quand aligné avec un secondaire.
- ✅ En groupe de deux boutons (Primary ou Secondary) : toujours `outline` à gauche, `default` (rempli) à droite.
- ✅ Si une 3e action est nécessaire, la représenter sous forme de `Link` avec `hideArrow` — jamais un 3e bouton.
- ✅ Utiliser `variant="destructive"` sur `Link` pour les actions destructives.
- ❌ Ne jamais mettre deux boutons remplis ni deux `outline` côte à côte.
- ❌ Ne jamais associer un `PrimaryButton` et un `SecondaryButton` dans le même groupe — ils ne se mélangent pas.
- ❌ Ne pas utiliser `PrimaryButton` pour de la navigation.
- ❌ Ne pas désactiver un bouton sans `TooltipTrigger` explicatif.

**Règle universelle — boutons en groupe**

Lorsqu'ils apparaissent en groupe de deux, l'un est toujours `outline` (à gauche) et l'autre toujours rempli (à droite). Jamais deux remplis, jamais deux outlines.

```tsx
// ✅ Groupe de SecondaryButton
<div style={{ display: "flex", gap: 8 }}>
  <SecondaryButton outline label="Exporter" />
  <SecondaryButton label="Appliquer" />
</div>
```

**En fin de formulaire — deux PrimaryButton `size="large"`**

```tsx
<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
  <PrimaryButton size="large" outline label="Réinitialiser" onClick={onReset} />
  <PrimaryButton size="large" label="Enregistrer" onClick={onSubmit} />
</div>
```

**Dans un dashboard — PrimaryButton `size="large"` pour créer un élément**

Positionné en haut à droite, à l'opposé des onglets/filtres :

```tsx
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <div style={{ display: "flex", gap: 4 }}>
    <Tab label="En cours" variant="active" />
    <Tab label="À venir" />
  </div>
  <PrimaryButton size="large" label="Créer un scénario" onClick={onCreate} />
</div>
```

**Dans un formulaire — SecondaryButton inline**

Les `SecondaryButton` s'utilisent en inline à l'intérieur d'un formulaire, associés à un champ — jamais comme action de soumission.

```tsx
// Champ avec action inline
<div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
  <TextInput label="Identifiant d'arrêt" placeholder="stop_area:IDFM:…" />
  <SecondaryButton label="Vérifier" onClick={onCheck} />
</div>

// Ajout d'un élément dans une liste
<div style={{ display: "flex", gap: 8 }}>
  <Dropdown label="Type d'objet" options={types} value={type} onChange={setType} />
  <SecondaryButton withIcon="left" icon="plus" label="Ajouter" onClick={onAdd} />
</div>
```

**Dans un dashboard dense — hiérarchiser avec TableCardAction puis SecondaryButton**

Deux niveaux selon l'état de sélection :

*État par défaut — actions par ligne (`TableCardAction`)* : petits boutons icônes 24×24 dans le header de chaque ligne, tooltip blanc au survol.

```tsx
<>
  <TableCardAction icon="copy-01" label="Dupliquer" onClick={onDuplicate} />
  <TableCardAction icon="edit-02" label="Modifier" onClick={onEdit} />
  <TableCardAction icon="trash" label="Supprimer" onClick={onDelete} destructive />
</>
```

*État sélectionné — barre d'actions groupées* : `SecondaryButton` labellisés pour les actions neutres, `PrimaryButton` destructif pour la suppression — jamais un `Link` ici.

```tsx
// Barre visible uniquement quand selectedCount > 0
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <Checkbox state="checked" onChange={onDeselectAll} />
    <Link hideArrow onClick={onDeselectAll}>Tout désélectionner</Link>
  </div>
  <div style={{ display: "flex", gap: 8 }}>
    <SecondaryButton withIcon="left" icon="copy-01" label="Dupliquer" onClick={onDuplicate} />
    <PrimaryButton withIcon="left" icon="trash" label="Supprimer" destructive onClick={onDelete} />
  </div>
</div>
```

**Groupe de 3 actions — Link en 3e position**

```tsx
<div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
  <Link variant="secondary" hideArrow onClick={onSaveDraft}>
    Enregistrer comme brouillon
  </Link>
  <PrimaryButton size="large" outline label="Réinitialiser" onClick={onReset} />
  <PrimaryButton size="large" label="Valider" onClick={onSubmit} />
</div>
```

**Dans une modale — PrimaryButton `size="medium"` (défaut)**

Les modales utilisent la taille par défaut. Le footer est géré par les props `primaryAction` / `secondaryAction` de `Modal` — ne pas recréer de boutons dans `children`.

**État vide (empty state) — PrimaryButton `size="large"`**

```tsx
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 48 }}>
  <p style={{ color: "var(--cadence-color-text-muted)", fontSize: 14 }}>Aucun scénario créé pour ce réseau.</p>
  <PrimaryButton size="large" label="Créer le premier scénario" onClick={onCreate} />
</div>
```

**Action destructive — niveau de visibilité selon l'impact**

| Impact | Composant | Quand |
|---|---|---|
| Faible (1 élément, réversible) | `Link variant="destructive"` | Supprimer un champ, retirer une valeur |
| Moyen (1 élément, irréversible) | `TableCardAction destructive` + confirmation `Modal` | Supprimer une ligne d'une liste |
| Fort (plusieurs éléments, irréversible) | `PrimaryButton destructive` dans la barre groupée + confirmation `Modal` | Suppression multiple |

**Confirmation modale avant suppression irréversible**

Toute suppression irréversible est confirmée via une `Modal size="small"` :

```tsx
<Modal
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Supprimer 3 scénarios ?"
  size="small"
  secondaryAction={{ label: "Annuler", onClick: () => setConfirmOpen(false) }}
  primaryAction={{ label: "Supprimer", onClick: onConfirmDelete, destructive: true }}
>
  Cette action est irréversible. Les 3 scénarios sélectionnés seront définitivement supprimés.
</Modal>
```

**Contrôles de tri et de filtre d'une liste**

Positionnés dans la barre au-dessus de la liste, hors du flux des boutons d'action :
- Le tri : `SecondaryButton outline` avec icône `switch-vertical-01`.
- Le filtre : un `Link hideArrow` + compteur de filtres actifs.

```tsx
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <Link hideArrow onClick={onOpenFilters}>Filtrer les scénarios</Link>
    {activeFilters > 0 && <span style={{ color: "var(--cadence-color-text-muted)" }}>({activeFilters} filtres)</span>}
  </div>
  <SecondaryButton outline withIcon="left" icon="switch-vertical-01" label="Date de création" />
</div>
```

**Placement systématique**

| Contexte | Position | Composant |
|---|---|---|
| Dashboard — création | En haut à droite, à côté des onglets | `PrimaryButton size="large"` |
| Formulaire — soumission | En bas à droite | `PrimaryButton size="large"` (outline + rempli) |
| Modale — validation | Footer (via `primaryAction`/`secondaryAction`) | géré par `Modal` |
| Liste — action par ligne | À droite du header de la ligne | `TableCardAction` |
| Liste — sélection multiple | À droite de la barre de sélection | `SecondaryButton` + `PrimaryButton destructive` |
| Formulaire inline | À droite du champ associé | `SecondaryButton` |

Un bouton ne change jamais de position selon l'état de l'application — il peut être affiché/masqué, activé/désactivé, mais son emplacement reste fixe.

**Bouton désactivé — explication obligatoire**

`TooltipTrigger` rend sa propre icône ⓘ (il n'enveloppe pas d'enfants) : on l'accole au bouton désactivé.

```tsx
// ❌ Mauvais — l'utilisateur ne sait pas pourquoi
<PrimaryButton label="Enregistrer" disabled />

// ✅ Bon — icône ⓘ à côté du bouton, tooltip au survol
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <PrimaryButton label="Enregistrer" disabled />
  <TooltipTrigger label="Complétez tous les champs obligatoires pour enregistrer." position="top" />
</div>
```

**Ordre de lecture dans un groupe**

De gauche à droite, engagement croissant : `Link` (tertiaire) → bouton `outline` (secondaire) → bouton rempli (principal). Le bouton principal n'est jamais à gauche.

---

## Formulaires

### Choisir le bon composant de saisie

| Composant | Quand l'utiliser |
|---|---|
| `TextInput` | Texte libre — nom, description, recherche. |
| `TextArea` | Texte long multi-lignes — descriptions, commentaires. |
| `CounterInput` | Valeur numérique bornée avec +/−. |
| `Dropdown` | Choix parmi une liste fixe (3 options ou plus). |
| `SegmentedControlAlt` | 2 à 4 options mutuellement exclusives. **À privilégier dans les formulaires.** |
| `DatePicker` | Sélection d'une date (option heure avec `withTime`). |
| `Checkbox` | Option booléenne indépendante, ou sélection multiple. |
| `RadioButton` | Sélection exclusive parmi 2 à 5 options courtes. |
| `RichRadioButton` | Sélection exclusive avec description par option. |
| `Toggle` | Activation/désactivation à effet immédiat (hors soumission). |

### Règles

- ✅ Toujours passer la prop `label` sur `TextInput`, `TextArea`, `Dropdown`, `DatePicker` et `CounterInput` — c'est le seul moyen de garantir la cohérence visuelle.
- ✅ Utiliser la prop `helperText` de `TextInput`/`TextArea` pour les instructions.
- ✅ Afficher les erreurs avec `state="error"` + message dans `helperText`.
- ✅ Grouper les champs connexes avec un titre de section.
- ✅ Dans un formulaire, toujours `SegmentedControlAlt` — le `SegmentedControl` classique est réservé à la navigation.
- ❌ Ne pas utiliser `SegmentedControl` dans un formulaire.
- ❌ Ne pas mélanger `Checkbox` et `RadioButton` dans la même liste.
- ❌ Ne pas utiliser `Toggle` pour des choix qui nécessitent une confirmation.
- ❌ Ne jamais ajouter un `<label>` HTML custom autour d'un champ — utiliser la prop `label` du composant.
- ❌ Ne pas utiliser `TextInput type="number"` — utiliser `CounterInput`.

```tsx
<TextInput label="Nom du scénario" placeholder="Ex : Perturbation ligne A" />
<Dropdown label="Réseau" options={reseaux} value={reseauId} onChange={setReseauId} />
<TextInput label="Email" state="error" helperText="Format invalide." />
<CounterInput label="Durée (minutes)" min={0} max={120} step={5} unit="min" />
```

---

## Navigation

### Rôle de chaque composant

| Composant | Rôle | Position |
|---|---|---|
| `Sidebar` | Navigation principale entre les grandes sections. | Gauche, pleine hauteur, `fixed` |
| `Header` | Sélecteur de périmètre + profil utilisateur. | Haut, pleine largeur moins la sidebar, `fixed` |
| `Breadcrumbs` | Localisation dans l'arborescence + navigation ascendante. | Au-dessus du titre |
| `NavigationDropdown` | Sélecteur de contexte dans le breadcrumb. | Dans le breadcrumb |
| `Tab` | Navigation entre vues au sein d'une même page. | Sous le titre de page |

### Règles

- ✅ La `Sidebar` occupe toute la hauteur (`100vh`), ancrée à gauche, en `position: fixed` — via un wrapper `<div>` positionné (le composant n'a pas de prop `style`).
- ✅ Le `Header` est en `fixed`, de `left: SIDEBAR_WIDTH` jusqu'au bord droit.
- ✅ Le contenu principal compense avec `marginLeft: SIDEBAR_WIDTH` et `marginTop: HEADER_HEIGHT`.
- ✅ Afficher `Breadcrumbs` dès que l'utilisateur est à plus d'un niveau de profondeur.
- ✅ Le dernier item du breadcrumb est la page courante — sans `href`.
- ✅ L'onglet actif se marque avec `variant="active"` sur `Tab`.
- ❌ Ne jamais décaler ou centrer la `Sidebar` — toujours ancrée au bord gauche, jamais tronquée en hauteur.
- ❌ Ne pas positionner `Sidebar` ou `Header` en `relative` ou `absolute` — ils restent visibles au scroll.
- ❌ Ne pas imbriquer une `Sidebar` dans une `Sidebar`.
- ❌ Ne pas utiliser `Tab` pour de la navigation entre pages différentes.

Le code complet du layout est dans la [recette 1](#recette-1--layout-dapplication).

---

## Listes & tableaux

Une liste structurée se compose de trois briques :

1. **`TableHeader`** — la ligne d'en-têtes de colonnes (labels uppercase + flèches de tri).
2. **`TableCard`** — une ligne de la liste : header (checkbox + icône + titre + actions) et body en colonnes.
3. **`TableCardAction`** — les boutons d'action icône du header de ligne.

### Alignement des colonnes

**Règle clé** : les colonnes du `TableHeader` et celles des `TableCard` doivent utiliser **les mêmes valeurs `width`/`flex`**, dans le même ordre. Le `TableHeader` commence par une colonne *spacer* (`width` ≈ 220) qui compense la partie header des cards (checkbox + icône + titre).

### Règles

- ✅ `width` (px fixe) **ou** `flex` (part d'espace restant) par colonne — jamais les deux.
- ✅ Une seule colonne `flex: 1` par liste (la colonne de contenu principal).
- ✅ Gap de `8` entre les cards.
- ✅ État sélectionné : `state="selected"` + `checkboxState="checked"` ensemble.
- ✅ Sans titre ni actions, le header de la card disparaît automatiquement (variante contenu seul).
- ❌ Ne pas mettre de `<table>` HTML — la composition `TableHeader` + `TableCard` couvre le besoin.
- ❌ Ne pas mettre plus de 4 `TableCardAction` par ligne — au-delà, regrouper dans un menu.

Le code complet est dans la [recette 2](#recette-2--page-liste-avec-sélection-multiple).

---

## Statuts & étiquettes

Deux composants proches mais distincts :

| | `Badge` | `Indicator` |
|---|---|---|
| **Rôle** | Information neutre : catégorie, tag, code technique | État ou statut : porte une sémantique (couleur + picto) |
| **Exemples** | « Transilien », « stop_area:IDFM:47026 » | « En cours », « Critique », « Brouillon » |
| **Variantes** | `draggable`, `dismissible`, `mono` | 8 variantes sémantiques |

### Les 8 variantes d'Indicator

| Variante | Picto | Sens |
|---|---|---|
| `active` | double cercle | En cours |
| `upcoming` | horloge | À venir |
| `completed` | check cerclé | Passée / terminée |
| `draft` | crayon | Brouillon |
| `warning` | triangle | Ralenti / avertissement |
| `info` | cercle i | Information |
| `critical` | losange × | Critique |
| `nominal` | double check | Normal / RAS |

### Règles

- ✅ `Badge mono` pour les valeurs techniques (identifiants, codes) — police Spline Sans Mono.
- ✅ `Badge dismissible` pour les filtres actifs retirables.
- ✅ `Indicator` peut surcharger son libellé par défaut via `label`.
- ❌ Ne pas utiliser `Badge` pour un état (utiliser `Indicator`).
- ❌ Ne pas créer de nouvelles couleurs de statut — les 8 variantes couvrent les cas.

```tsx
<Badge label="Transilien" />
<Badge label="stop_area:IDFM:47026" mono />
<Badge label="Ligne 13" dismissible onDismiss={() => removeFilter("l13")} />
<Indicator variant="active" />
<Indicator variant="warning" label="Ralenti" />
```

---

## Feedback

### Choisir le bon composant

| Situation | Composant |
|---|---|
| Confirmation d'une action réussie | `AlertToast type="success"` |
| Erreur système ou action échouée | `AlertToast type="error"` |
| Avertissement non bloquant | `AlertToast type="warning"` |
| Info contextuelle sur un élément UI | `TooltipTrigger` |
| Explication d'un bouton désactivé | `TooltipTrigger` accolé au bouton `disabled` |
| Erreur de validation d'un champ | `TextInput state="error"` + `helperText` |
| Confirmation avant action irréversible | `Modal size="small"` |

### Règles

- ✅ `AlertToast` s'affiche en overlay (`position: fixed`, coin haut-droit) — jamais dans le flux du contenu.
- ✅ `success` et `information` : auto-dismiss après 4 secondes (à gérer côté app avec un `setTimeout`).
- ✅ `error` : reste visible jusqu'à fermeture manuelle (`dismissible` + `onDismiss`).
- ❌ Ne pas afficher plus de 3 toasts simultanément.
- ❌ Ne pas utiliser `Tooltip` pour du contenu long ou interactif.

```tsx
// Toast de confirmation
<AlertToast type="success" title="Scénario créé" dismissible onDismiss={() => setVisible(false)} />

// Icône ⓘ d'aide accolée à un bouton désactivé
<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <PrimaryButton label="Analyser" disabled />
  <TooltipTrigger label="Sélectionne un réseau d'abord" position="top" />
</div>
```

---

## Recettes de pages complètes

Blocs prêts à copier. **Partir d'une recette puis adapter** — ne pas réinventer la structure.

### Recette 1 — Layout d'application

Toute page de l'app vit dans ce squelette. `Sidebar` et `Header` n'ont pas de prop `style` : on les enveloppe dans des `<div>` positionnés.

```tsx
import { Sidebar, Header, Breadcrumbs, Dropdown, Avatar } from "@ddaoellena/cadence-ui";

const SIDEBAR_WIDTH = 240;
const HEADER_HEIGHT = 56;

export const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <div style={{ position: "fixed", top: 0, left: 0, width: SIDEBAR_WIDTH, height: "100vh", zIndex: 100 }}>
      <Sidebar
        product="datahub"
        clientName="Bordeaux Métropole"
        activeId="scenarios"
        onItemClick={(id) => navigate(id)}
        sections={[
          { id: "home", label: "Accueil", icon: <HomeIcon /> },
          {
            id: "disruptions", label: "Perturbations", icon: <DisruptionIcon />,
            items: [
              { id: "scenarios", label: "Scénarios" },
              { id: "history", label: "Historique" },
            ],
          },
        ]}
      />
    </div>

    <div style={{ position: "fixed", top: 0, left: SIDEBAR_WIDTH, right: 0, zIndex: 90 }}>
      <Header
        leftContent={<Dropdown options={reseaux} value={reseauId} onChange={setReseauId} />}
        rightContent={<Avatar name="Hector Malot" showIcon showProfile size="sm" color="gray" />}
      />
    </div>

    <main style={{
      marginLeft: SIDEBAR_WIDTH,
      marginTop: HEADER_HEIGHT,
      padding: "24px 32px",
      minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
    }}>
      {children}
    </main>
  </>
);
```

### Recette 2 — Page liste avec sélection multiple

Liste de `TableCard` avec en-têtes triables, sélection multiple, barre d'actions groupées et confirmation de suppression. Couvre : `TableHeader`, `TableCard`, `TableCardAction`, `Checkbox`, `Modal`, `AlertToast`, `Tab`, tri et filtres.

```tsx
import { useState } from "react";
import {
  Tab, PrimaryButton, SecondaryButton, Link, Checkbox,
  TableHeader, TableCard, TableCardAction, Modal, AlertToast, Indicator,
} from "@ddaoellena/cadence-ui";

// Largeurs partagées entre TableHeader et TableCard — NE PAS désynchroniser
const COL = { date: 110, severity: 110 };

export const ScenarioListPage = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const toggleRow = (id: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });

  return (
    <div>
      {/* ── Barre titre : onglets + création ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <Tab label="En cours" variant="active" />
          <Tab label="À venir" />
          <Tab label="Passées" />
        </div>
        <PrimaryButton size="large" label="Créer un scénario" onClick={onCreate} />
      </div>

      {/* ── Barre de sélection (visible si ≥ 1 sélection) ── */}
      {selected.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Checkbox state="checked" onChange={() => setSelected(new Set())} />
            <Link hideArrow onClick={() => setSelected(new Set())}>Tout désélectionner</Link>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <SecondaryButton withIcon="left" icon="copy-01" label="Dupliquer" onClick={onDuplicate} />
            <PrimaryButton withIcon="left" icon="trash" label="Supprimer" destructive onClick={() => setConfirmOpen(true)} />
          </div>
        </div>
      )}

      {/* ── En-têtes de colonnes ── */}
      <TableHeader
        columns={[
          { key: "spacer", label: "", width: 220 },
          { key: "date", label: "Créé le", sortable: true, sortDirection: sortDir,
            onSort: () => setSortDir((d) => (d === "asc" ? "desc" : "asc")), width: COL.date },
          { key: "info", label: "Informations et impacts", flex: 1 },
          { key: "severity", label: "Sévérité", width: COL.severity },
        ]}
      />

      {/* ── Lignes ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map((row) => (
          <TableCard
            key={row.id}
            title={row.title}
            icon="route"
            checkboxState={selected.has(row.id) ? "checked" : "unchecked"}
            state={selected.has(row.id) ? "selected" : "default"}
            onCheckboxChange={(checked) => toggleRow(row.id, checked)}
            actions={
              <>
                <TableCardAction icon="copy-01" label="Dupliquer" onClick={() => onDuplicateOne(row.id)} />
                <TableCardAction icon="edit-02" label="Modifier" onClick={() => onEdit(row.id)} />
                <TableCardAction icon="trash" label="Supprimer" destructive onClick={() => onDeleteOne(row.id)} />
              </>
            }
            columns={[
              { key: "date", content: <span>{row.createdAt}</span>, width: COL.date },
              { key: "info", content: <span>{row.info}</span>, flex: 1 },
              { key: "severity", content: <Indicator variant={row.severity} />, width: COL.severity },
            ]}
          />
        ))}
      </div>

      {/* ── Confirmation de suppression ── */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Supprimer ${selected.size} scénario(s) ?`}
        size="small"
        secondaryAction={{ label: "Annuler", onClick: () => setConfirmOpen(false) }}
        primaryAction={{
          label: "Supprimer",
          destructive: true,
          onClick: () => { deleteSelected(); setConfirmOpen(false); setToast(true); },
        }}
      >
        Cette action est irréversible.
      </Modal>

      {/* ── Toast de confirmation ── */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1100 }}>
          <AlertToast type="success" title="Scénarios supprimés" dismissible onDismiss={() => setToast(false)} />
        </div>
      )}
    </div>
  );
};
```

### Recette 3 — Page formulaire

Formulaire en sections, largeur contenue, soumission en bas à droite.

```tsx
import { TextInput, TextArea, Dropdown, DatePicker, CounterInput, SegmentedControlAlt, PrimaryButton, Link } from "@ddaoellena/cadence-ui";

export const ScenarioFormPage = () => (
  <div style={{ maxWidth: 640 }}>
    <h1 style={{ fontFamily: "var(--cadence-font-display)", fontSize: 28, fontWeight: 500, color: "var(--cadence-color-primary)" }}>
      Créer un scénario
    </h1>

    <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 24 }}>
      {/* ── Section 1 ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 16, fontWeight: 600, color: "var(--cadence-color-primary)", margin: 0 }}>
          Informations générales
        </h2>
        <TextInput label="Titre" placeholder="Ex : Tronçon Melun – Montereau" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Dropdown label="Type" options={typeOptions} value={type} onChange={setType} placeholder="Sélectionner" />
          </div>
          <div style={{ flex: 1 }}>
            <Dropdown label="Cause" options={causeOptions} value={cause} onChange={setCause} placeholder="Sélectionner" />
          </div>
        </div>
        <SegmentedControlAlt
          options={[{ value: "planned", label: "Planifiée" }, { value: "immediate", label: "Immédiate" }]}
          value={mode}
          onChange={setMode}
          aria-label="Mode de déclenchement"
        />
      </section>

      {/* ── Section 2 ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <h2 style={{ fontFamily: "var(--cadence-font-sans)", fontSize: 16, fontWeight: 600, color: "var(--cadence-color-primary)", margin: 0 }}>
          Période
        </h2>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <DatePicker label="Début" value={start} onChange={setStart} withTime />
          </div>
          <div style={{ flex: 1 }}>
            <DatePicker label="Fin" value={end} onChange={setEnd} withTime />
          </div>
        </div>
        <CounterInput label="Durée estimée" min={0} max={480} step={15} unit="min" value={duration} onChange={setDuration} />
        <TextArea label="Description" placeholder="Impacts attendus, mesures prises…" rows={4} value={desc} onChange={(e) => setDesc(e.target.value)} />
      </section>

      {/* ── Soumission ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
        <Link variant="secondary" hideArrow onClick={onSaveDraft}>Enregistrer comme brouillon</Link>
        <PrimaryButton size="large" outline label="Réinitialiser" onClick={onReset} />
        <PrimaryButton size="large" label="Créer le scénario" onClick={onSubmit} />
      </div>
    </div>
  </div>
);
```

### Recette 4 — Empty state

```tsx
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 48 }}>
  <p style={{ fontFamily: "var(--cadence-font-sans)", color: "var(--cadence-color-text-muted)", fontSize: 14, margin: 0 }}>
    Aucun scénario créé pour ce réseau.
  </p>
  <PrimaryButton size="large" label="Créer le premier scénario" onClick={onCreate} />
</div>
```

---

## Référence API des composants

**Source de vérité des props.** Si une prop n'est pas listée ici, elle n'existe pas — ne pas en inventer. Convention : les props sans défaut indiqué sont `undefined` ; ⚠️ signale les pièges courants.

### AlertToast

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `type` | `"information" \| "success" \| "warning" \| "error"` | `"information"` | Couleur d'accent + icône de statut. ⚠️ Pas de prop `variant`. |
| `title` | `string` | label du type | Titre en gras |
| `description` | `string` | — | Texte secondaire |
| `progress` | `number` (0-100) | — | Barre de progression (masquée si absent) |
| `actions` | `[AlertToastAction]` ou `[AlertToastAction, AlertToastAction]` | — | 1 à 2 boutons (`{ label, onClick?, outline? }`) |
| `dismissible` | `boolean` | auto `true` si `actions` | Affiche le bouton × |
| `onDismiss` | `() => void` | — | Clic sur ×. ⚠️ Pas de prop `onClose`. |
| `className`, `style` | — | — | Échappatoires |

### Avatar

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `src`, `alt` | `string` | — | Image (sinon initiales depuis `name`) |
| `name` | `string` | — | Génère les initiales |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Taille |
| `color` | `"green" \| "blue" \| "orange" \| "purple" \| "gray"` | — | Fond des initiales |
| `showIcon` | `boolean` | `false` | Icône placeholder à la place des initiales |
| `email` | `string` | — | Sous-titre (layout profil) |
| `showProfile` | `boolean` | `false` | Carte profil : avatar + nom + email |

### Badge

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | Texte du badge |
| `draggable` | `boolean` | `false` | Handle de drag à gauche |
| `dismissible` | `boolean` | `false` | Croix × à droite |
| `mono` | `boolean` | `false` | Police Spline Sans Mono |
| `onDismiss` | `() => void` | — | Clic sur la croix |
| `onDragStart`, `onDragEnd` | `(e: DragEvent) => void` | — | Événements de drag |

### Breadcrumbs

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `items` | `BreadcrumbItem[]` | **requis** | `{ id, label, icon?, href?, onClick? }` — le dernier = page courante |
| `separator` | `ReactNode` | chevron | Séparateur custom |
| `onNavigate` | `(id: string) => void` | — | Clic sur un item |

### Checkbox

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"unchecked" \| "hover" \| "checked" \| "indeterminate" \| "disabled" \| "disabled-checked"` | `"unchecked"` | ⚠️ Pas de prop `checked` — piloter via `state`. |
| `onChange` | `(nextChecked: boolean) => void` | — | Clic (sauf disabled) |

### CounterInput

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `number` | — | Mode contrôlé |
| `defaultValue` | `number` | — | Mode non contrôlé |
| `min`, `max`, `step` | `number` | — | Bornes et pas |
| `unit` | `string` | — | Unité affichée (ex : `"min"`, `"km"`) |
| `label` | `string` | — | Label au-dessus |
| `disabled` | `boolean` | `false` | — |
| `onChange` | `(value: number) => void` | — | — |

### DataVisualization

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `type` | `"stacked-vertical" \| "grouped-vertical" \| "horizontal"` | **requis** | Variante du graphique |
| `series` | `{ label, data: number[], color? }[]` | **requis** | Une entrée par série |
| `categories` | `string[]` | **requis** | Labels d'axe |
| `height` | `number` | `260` | Hauteur SVG (hors légende) |
| `showLegend` | `boolean` | `true` | — |
| `showGridLines` | `boolean` | `true` | — |
| `showValues` | `boolean` | `false` | Valeurs sur les barres |
| `showTooltip` | `boolean` | `true` | Tooltip au survol |

### DatePicker

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `value` | `Date \| null` | — | Date sélectionnée |
| `onChange` | `(date: Date) => void` | — | — |
| `label` | `string` | — | Label au-dessus |
| `placeholder` | `string` | — | — |
| `disabled` | `boolean` | `false` | — |
| `minDate`, `maxDate` | `Date` | — | Bornes |
| `withTime` | `boolean` | `false` | Heures/minutes + bouton Valider |
| `labelConfirm` | `string` | — | Label du bouton Valider |
| `segmentedOptions` | `{ value, label }[]` | — | SegmentedControlAlt dans le popover (contrôlé via `segmentedValue` + `onSegmentChange`) |

### Dropdown

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `options` | `DropdownOption[]` | **requis** | `{ id, label, icon?, disabled?, divider? }` — ⚠️ clé `id`, pas `value` |
| `label` | `string` | — | Label au-dessus |
| `value` | `string` | — | `id` de l'option sélectionnée |
| `placeholder` | `string` | — | — |
| `disabled` | `boolean` | `false` | — |
| `onChange` | `(id: string) => void` | — | — |

### Header

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `leftContent` | `ReactNode` | — | Contenu gauche (ex : Dropdown) — prioritaire sur `logo` |
| `logo` | `string` | — | Nom de marque (si pas de `leftContent`) |
| `navItems` | `{ label, active?, onClick? }[]` | — | Nav centrale |
| `rightContent` | `ReactNode` | — | Contenu droit (ex : Avatar) |

⚠️ Pas de prop `style` — positionner via un wrapper (`<div style={{ position: "fixed", … }}>`).

### Icons

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `icon` | nom d'icône (90+ valeurs) | `"search-md"` | Ex : `"trash"`, `"copy-01"`, `"edit-02"`, `"plus"`, `"calendar"`, `"chevron-down"`, `"switch-vertical-01"`… |
| `className` | `string` | **requis** ⚠️ | Passer `""` si inutile |
| `iconMap` | `string` | **requis** ⚠️ | Passer `""` (legacy) |

```tsx
<Icons icon="trash" className="" iconMap="" />
```

### Indicator

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `variant` | `"active" \| "upcoming" \| "completed" \| "draft" \| "warning" \| "info" \| "critical" \| "nominal"` | **requis** | Statut sémantique (picto + couleurs) |
| `label` | `string` | label de la variante | Surcharge du libellé |

### Link

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `children` | `ReactNode` | **requis** | Texte du lien |
| `href` | `string` | — | Rend un `<a>` ; sans `href` + avec `onClick` → `<button>` |
| `variant` | `"primary" \| "secondary" \| "destructive" \| "inverse"` | `"primary"` | ⚠️ `"destructive"`, pas `"danger"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | — |
| `icon` | `ReactNode` | — | Icône avant le texte |
| `hideArrow` | `boolean` | `false` | Masque la flèche (usage bouton texte) |
| `disabled` | `boolean` | `false` | — |
| `target` | `"_blank" \| …` | — | — |
| `onClick` | `(e) => void` | — | — |

### Modal

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `isOpen` | `boolean` | **requis** | Visibilité |
| `onClose` | `() => void` | **requis** | Backdrop, ×, Échap |
| `title` | `string` | — | Titre (header sombre) |
| `children` | `ReactNode` | **requis** | Corps (scrollable si long) |
| `primaryAction` | `{ label, onClick, destructive? }` | — | Bouton droit du footer |
| `secondaryAction` | `{ label, onClick }` | — | Bouton gauche (outline) |
| `size` | `"small" \| "medium" \| "large"` | `"medium"` | 400 / 560 / 800 px |
| `hideCloseButton` | `boolean` | `false` | — |

Comportements intégrés : fermeture sur Échap, scroll du body verrouillé, footer fixe quand le corps scrolle.

### NavigationDropdown

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | Texte du trigger |
| `items` | `NavigationDropdownItem[]` | — | `{ id, label, icon?, active?, disabled?, dividerAbove?, groupLabel?, onClick? }` |
| `align` | `"left" \| "right"` | `"left"` | Alignement du menu |
| `disabled` | `boolean` | `false` | — |
| `onSelect` | `(id: string) => void` | — | — |

### PrimaryButton / SecondaryButton

API identique pour les deux :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Texte (sauf si `withIcon="only"`) |
| `withIcon` | `"left" \| "no" \| "only" \| "right"` | `"no"` | Position de l'icône |
| `icon` | nom d'icône `Icons` | — | Ex : `"plus"`, `"trash"` |
| `outline` | `boolean` | `false` | Variante ghost |
| `destructive` | `boolean` | `false` | Style danger (rouge) |
| `size` | `"medium" \| "large"` | `"medium"` | — |
| `disabled` | `boolean` | `false` | — |
| `onClick` | `MouseEventHandler` | — | — |
| `state` | `"enabled" \| "hover" \| "clicked" \| "disabled"` | géré en interne | Ne pas piloter manuellement sauf besoin spécifique |

### RadioButton

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"default" \| "hover" \| "selected" \| "disabled"` | `"default"` | ⚠️ Pas de prop `checked` |
| `onChange` | `() => void` | — | — |

### RichRadioButton

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Texte principal |
| `description` | `string` | — | Texte secondaire |
| `state` | `"default" \| "hover" \| "selected" \| "disabled"` | `"default"` | — |
| `size` | `"medium" \| "large"` | `"medium"` | — |
| `onChange` | `() => void` | — | — |

### SegmentedControl / SegmentedControlAlt

API identique pour les deux (`SegmentedControl` = navigation, `SegmentedControlAlt` = formulaires) :

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `options` | `{ value, label }[]` | **requis** | 2 à 4 segments |
| `value` | `string` | — | Mode contrôlé |
| `defaultValue` | `string` | — | Mode non contrôlé |
| `onChange` | `(value: string) => void` | — | — |
| `disabled` | `boolean` | `false` | — |
| `aria-label` | `string` | — | Nom accessible du groupe |

### Sidebar

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `product` | `"datahub" \| "traffic-report" \| "insights"` | **requis** | Thème de couleur |
| `clientName` | `string` | **requis** | Nom client sous le logo |
| `sections` | `SidebarNavSection[]` | **requis** | `{ id, label, icon, items?, defaultOpen?, notification? }` — sans `items`, la section est un lien direct |
| `activeId` | `string` | — | Item ou section actif |
| `onItemClick` | `(id: string) => void` | — | — |
| `onCollapse` | `() => void` | — | Bouton replier |
| `onLogout` | `() => void` | — | Bouton déconnexion |

⚠️ Pas de prop `style` — positionner via un wrapper.

### Tab

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | **requis** | — |
| `variant` | `"default" \| "active"` | `"default"` | ⚠️ Pas de prop booléenne `active` |
| `disabled` | `boolean` | `false` | — |
| `onClick` | `() => void` | — | — |

### TableCard

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `title` | `string` | — | Titre du header. Sans `title`/`icon`/`actions`, le header n'est pas rendu |
| `icon` | nom d'icône `Icons` | — | Icône à gauche du titre |
| `iconElement` | `ReactNode` | — | SVG custom (16×16) — prioritaire sur `icon` |
| `checkboxState` | `"unchecked" \| "checked" \| "indeterminate"` | `"unchecked"` | — |
| `onCheckboxChange` | `(checked: boolean) => void` | — | — |
| `actions` | `ReactNode` | — | Slot — utiliser des `TableCardAction` |
| `columns` | `TableCardColumn[]` | `[]` | `{ key, content, width? \| flex? }` — `width` px fixe **ou** `flex` (jamais les deux) |
| `state` | `"default" \| "selected" \| "disabled"` | `"default"` | `selected` = fond bleu du wrapper |

### TableCardAction

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `icon` | nom d'icône `Icons` | **requis** | — |
| `label` | `string` | **requis** | Tooltip au survol + aria-label |
| `onClick` | `() => void` | — | — |
| `destructive` | `boolean` | `false` | Icône rouge |

### TableHeader

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `columns` | `TableHeaderColumn[]` | **requis** | `{ key, label, sortable?, sortDirection?, onSort?, width? \| flex? }` |

`sortDirection` : `"asc" \| "desc" \| "none"`. Les `width`/`flex` doivent refléter ceux des `TableCard` en dessous (+ colonne spacer initiale ≈ 220).

### TextArea

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"enabled" \| "hover" \| "focus" \| "disabled" \| "error" \| "success"` | `"enabled"` | — |
| `label` | `string` | — | — |
| `placeholder` | `string` | — | — |
| `value` | `string` | — | Contrôlé |
| `onChange` | `ChangeEventHandler<HTMLTextAreaElement>` | — | — |
| `helperText` | `string` | — | Message sous le champ |
| `rows` | `number` | `4` | Hauteur initiale (redimensionnable verticalement) |
| `disabled` | `boolean` | `false` | — |

### TextInput

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"enabled" \| "hover" \| "focus" \| "disabled" \| "error" \| "success"` | `"enabled"` | — |
| `label` | `string` | — | — |
| `placeholder` | `string` | — | — |
| `value` | `string` | — | Contrôlé |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | — | — |
| `helperText` | `string` | — | ⚠️ Pas de prop `helper` |
| `type` | type HTML natif | `"text"` | ⚠️ Pas de `type="number"` — utiliser `CounterInput` |
| `disabled` | `boolean` | `false` | — |

### Toggle

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `state` | `"default" \| "hover" \| "active" \| "disabled"` | `"default"` | ⚠️ Pas de prop `checked` ni `label` — accoler un `<span>` pour le texte |
| `onChange` | `(nextActive: boolean) => void` | — | — |

### Tooltip

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | — | Texte de la bulle |
| `theme` | `"light" \| "dark"` | `"light"` | — |
| `arrow` | `"top" \| "bottom" \| "right" \| "left"` | — | Direction de la flèche. `arrow="top"` = la bulle est **sous** l'élément (flèche vers le haut) |

Composant purement visuel — pas de logique de positionnement ni de déclenchement. Préférer `TooltipTrigger` pour le pattern complet.

### TooltipTrigger

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `label` | `string` | `"Label"` | Texte du tooltip |
| `theme` | `"light" \| "dark"` | `"light"` | — |
| `position` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Côté où la bulle apparaît. ⚠️ Pas de prop `tooltip` ni `arrowPosition` |

⚠️ Rend sa **propre icône ⓘ** comme déclencheur — il n'accepte pas de `children` et ne peut pas envelopper un autre élément. Pour un tooltip sur un élément custom, gérer le survol manuellement avec `Tooltip`.
