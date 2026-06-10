# Guidelines — Hove Cadence UI

Règles d'usage des composants du design system.  
Version complète et interactive disponible dans le Storybook (`@ddaoellena/cadence-ui-storybook`).

---

## Typographie

Le design system utilise trois polices, chacune réservée à un rôle précis. Ne pas les substituer.

| Police | Rôle | Composants concernés |
|---|---|---|
| **Inter** | Texte d'interface : labels, valeurs, boutons, navigation, messages. | Tous les composants sauf exceptions ci-dessous |
| **Uxum Grotesque** | Titres de page et nom produit. Si indisponible, utiliser **Space Grotesk** (Google Fonts). | `Header` (nom produit), `<h1>` de page |
| **Spline Sans Mono** | Valeurs numériques et données chiffrées. | `CounterInput` (valeur), `DataVisualization` (axes, tooltips) |

### Règles

- ✅ Utiliser **Inter** pour tout texte d'interface (labels, placeholders, descriptions, boutons, navigation).
- ✅ Utiliser **Uxum Grotesque** pour les titres de page (`<h1>`) et le nom produit dans le `Header`.
- ✅ Utiliser **Spline Sans Mono** uniquement pour les valeurs numériques affichées (`CounterInput`, axes de graphiques, tooltips de données).
- ❌ Ne jamais utiliser une police système ou une autre police web à la place de ces trois polices.
- ❌ Ne pas utiliser **Uxum Grotesque** pour du texte courant — réservé aux titres.
- ❌ Ne pas utiliser **Spline Sans Mono** pour des labels ou du texte d'interface.

```tsx
// ✅ Titre de page
<h1 style={{ fontFamily: "var(--cadence-font-display)", fontSize: 28, fontWeight: 500, color: "var(--cadence-color-primary)" }}>
  Titre de page
</h1>

// ✅ Texte d'interface (déjà appliqué par les composants)
<TextInput label="Nom du scénario" placeholder="Ex : Perturbation ligne A" />

// ✅ Valeur numérique
<CounterInput label="Nombre d'arrêts" value={3} />
```

### Chargement des polices

Les composants déclarent les polices mais ne les embarquent pas. L'application consommatrice doit les charger — Inter, Space Grotesk et Spline Sans Mono sont disponibles sur Google Fonts :

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

La **Uxum Grotesque** est une police commerciale : si le projet la possède, la déclarer via `@font-face` — elle prendra automatiquement le pas sur Space Grotesk dans `--cadence-font-display`. Sinon, Space Grotesk sert de fallback sans rien configurer.

---

## Design tokens

Les couleurs, polices et rayons du design system sont centralisés dans des variables CSS (`src/components/tokens.css`, chargé automatiquement avec la lib). Chaque usage dans les composants garde un fallback en dur (`var(--cadence-color-primary, #002830)`) : le rendu reste correct même sans le fichier de tokens.

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
| `--cadence-radius-sm/md/lg/xl` | 6 / 8 / 10 / 12px | Rayons de référence |

### Règles

- ✅ Dans du code applicatif, référencer les tokens (`color: var(--cadence-color-primary)`) plutôt que les hex en dur.
- ✅ Pour créer un nouveau composant, piocher dans `tokens.css` ; n'ajouter un token que si la valeur a vocation à être partagée.
- ❌ Ne pas redéfinir les `--cadence-*` au niveau d'un composant — ce sont des valeurs globales du thème.

---

## Boutons

### Choisir le bon composant

| Composant | Quand l'utiliser | Exemple |
|---|---|---|
| `PrimaryButton` | Action principale de la page. **Un seul par vue.** | « Créer », « Enregistrer », « Lancer » |
| `SecondaryButton` | Actions secondaires ou alternatives. Peut être utilisé plusieurs fois. | « Exporter », « Annuler », « Voir les détails » |
| `Link` | Navigation inline dans du texte, ou action tertiaire discrète. | « Retour », « En savoir plus », « Supprimer » |

### Règles

- ✅ Un seul `PrimaryButton` par zone d'action.
- ✅ Placer le bouton principal à droite quand aligné avec un secondaire.
- ✅ En groupe de deux boutons (Primary ou Secondary) : toujours `outline` à gauche, `default` (rempli) à droite.
- ✅ Si une 3e action est nécessaire, la représenter sous forme de `Link` avec `hideArrow` — jamais un 3e bouton.
- ✅ Utiliser `variant="danger"` sur `Link` pour les actions destructives.
- ❌ Ne jamais mettre deux boutons remplis ni deux `outline` côte à côte.
- ❌ Ne jamais associer un `PrimaryButton` et un `SecondaryButton` dans le même groupe — ils ne se mélangent pas.
- ❌ Ne pas utiliser `PrimaryButton` pour de la navigation.
- ❌ Ne pas désactiver un bouton sans `Tooltip` explicatif.

**Règle universelle — boutons en groupe**

Que ce soit `PrimaryButton` ou `SecondaryButton`, lorsqu'ils apparaissent en groupe de deux, l'un est toujours `outline` (à gauche) et l'autre toujours `default` rempli (à droite). Jamais deux remplis, jamais deux outlines.

```tsx
// ✅ Groupe de SecondaryButton
<div style={{ display: "flex", gap: 8 }}>
  <SecondaryButton outline label="Exporter" />
  <SecondaryButton label="Appliquer" />
</div>
```

**En fin de formulaire — deux PrimaryButton `size="large"`**

Les boutons de soumission d'un formulaire utilisent toujours `size="large"` : `outline` à gauche (action secondaire) et `default` rempli à droite (action principale), alignés à droite du formulaire.

```tsx
<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
  <PrimaryButton size="large" outline label="Réinitialiser" onClick={onReset} />
  <PrimaryButton size="large" label="Enregistrer" onClick={onSubmit} />
</div>
```

**Dans un dashboard — PrimaryButton `size="large"` pour créer un élément**

Le bouton de création principale d'un dashboard utilise `size="large"`, positionné en haut à droite, à l'opposé des onglets/filtres :

```tsx
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <div style={{ display: "flex", gap: 4 }}>
    <Tab label="En cours" active />
    <Tab label="À venir" />
  </div>
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <Toggle label="Affichage cartographique" />
    <PrimaryButton size="large" label="Créer un scénario" onClick={onCreate} />
  </div>
</div>
```

**Dans un formulaire — SecondaryButton inline**

Les `SecondaryButton` sont utilisés en mode inline à l'intérieur d'un formulaire, directement associés à un champ ou une section — jamais comme action principale de soumission. Exemples : ajouter un élément à une liste, appliquer un filtre, déclencher une recherche depuis un champ.

```tsx
// Champ de recherche avec action inline
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

**Dans un dashboard dense — hiérarchiser avec SecondaryButton**

Dans une liste dense (type `TableCard`), les actions se présentent en deux niveaux selon l'état de sélection. L'objectif est de ne pas surcharger visuellement : les actions par ligne restent discrètes (icônes), tandis que les actions groupées passent en `SecondaryButton` labellisés pour signaler une opération à plus fort impact.

*État par défaut — actions par ligne (`TableCardAction`)*

Chaque ligne expose ses actions propres sous forme de petits boutons icônes (24 × 24, couleur `#69797D`) dans son header. Ils n'ont pas de label visible — un tooltip blanc apparaît au survol.

```tsx
// Slot actions du TableCard
<>
  <TableCardAction icon="copy-01"  label="Dupliquer"  onClick={onDuplicate} />
  <TableCardAction icon="edit-02"  label="Modifier"   onClick={onEdit} />
  <TableCardAction icon="trash"    label="Supprimer"  onClick={onDelete} destructive />
</>
```

*État sélectionné — barre d'actions groupées*

Lorsqu'un ou plusieurs éléments sont cochés, une barre d'actions remplace les contrôles du dessus de liste. Elle contient :
- À gauche : `Checkbox` coché + `Link` « Tout désélectionner ».
- À droite : `SecondaryButton` avec icône pour les actions neutres (Dupliquer), et un `PrimaryButton` au style destructif (fond rouge) pour Supprimer — jamais un `Link` ici, car l'action porte sur plusieurs éléments et doit être bien visible.

```tsx
// Barre visible uniquement quand selectedCount > 0
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <Checkbox state="checked" onChange={onDeselectAll} />
    <Link hideArrow onClick={onDeselectAll}>Tout désélectionner</Link>
  </div>
  <div style={{ display: "flex", gap: 8 }}>
    <SecondaryButton withIcon="left" icon="copy-01" label="Dupliquer" onClick={onDuplicate} />
    <PrimaryButton withIcon="left" icon="trash" label="Supprimer" onClick={onDelete} />
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

**Dans une modale — PrimaryButton `size="medium"`**

Les modales utilisent `size="medium"` (défaut) : elles sont plus compactes et l'action y est moins structurante qu'une page entière.

```tsx
// Footer de modale
<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
  <PrimaryButton outline label="Annuler" onClick={onClose} />
  <PrimaryButton label="Confirmer" onClick={onConfirm} />
</div>
```

**État vide (empty state) — PrimaryButton `size="large"`**

Quand une section ne contient encore aucun élément, proposer une action d'initialisation en `size="large"` pour inciter l'utilisateur à démarrer.

```tsx
<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 48 }}>
  <p style={{ color: "#809397", fontSize: 14 }}>Aucun scénario créé pour ce réseau.</p>
  <PrimaryButton size="large" label="Créer le premier scénario" onClick={onCreate} />
</div>
```

**Action destructive — niveau de visibilité selon l'impact**

| Impact | Composant | Quand |
|---|---|---|
| Faible (1 élément, réversible) | `Link variant="danger"` | Supprimer un champ, retirer une valeur |
| Moyen (1 élément, irréversible) | `TableCardAction destructive` + confirmation Modal | Supprimer une ligne d'une liste |
| Fort (plusieurs éléments, irréversible) | `PrimaryButton` rouge dans la barre groupée + confirmation Modal | Suppression multiple depuis la sélection |

```tsx
<Link variant="danger" onClick={onDelete}>Supprimer le scénario</Link>
```

**Confirmation modale avant suppression irréversible**

Toute suppression irréversible — qu'elle porte sur un seul élément ou sur une sélection multiple — doit être confirmée via une `Modal` avant exécution. La modale contient :
- Un titre explicite : « Supprimer X scénarios ? »
- Un corps qui résume l'impact : « Cette action est irréversible. »
- Un footer : `PrimaryButton outline` « Annuler » à gauche + `PrimaryButton` rouge « Supprimer » à droite.

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

Les contrôles de tri (« Trier par ») et de filtrage (« Filtrer ») sont positionnés dans la barre au-dessus de la liste, en dehors du flux des boutons d'action. Ce ne sont pas des `PrimaryButton` ni des `SecondaryButton` — ils utilisent le composant `Dropdown` ou un `SecondaryButton outline` avec icône de tri.

- Le tri utilise un `SecondaryButton outline` avec icône `switch-vertical-01` à gauche et un chevron à droite — il ouvre un menu de sélection.
- Le filtre utilise un `Link` ou un élément textuel cliquable accompagné d'un compteur de filtres actifs.

```tsx
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  {/* Filtre — Link cliquable */}
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <Icons icon="filter-lines" className="" iconMap="" />
    <Link hideArrow onClick={onOpenFilters}>
      Filtrer les scénarios
    </Link>
    {activeFilters > 0 && <span>({activeFilters} filtres sélectionnées)</span>}
  </div>

  {/* Tri — SecondaryButton outline */}
  <SecondaryButton outline withIcon="left" icon="switch-vertical-01" label="Date de création" />
</div>
```

**Placement systématique**

La position d'un bouton est toujours déterminée par son contexte :

| Contexte | Position | Composant |
|---|---|---|
| Dashboard — création | En haut à droite, à côté des onglets | `PrimaryButton size="large"` |
| Formulaire — soumission | En bas à droite | `PrimaryButton size="large"` (outline + rempli) |
| Modale — validation | En bas à droite du footer | `PrimaryButton size="medium"` |
| Liste — action par ligne | À droite du header de la ligne | `TableCardAction` |
| Liste — sélection multiple | À droite de la barre de sélection | `SecondaryButton` + `PrimaryButton` rouge |
| Formulaire inline | À droite du champ auquel il est associé | `SecondaryButton` |

Un bouton ne change jamais de position selon l'état de l'application — il peut être affiché/masqué, activé/désactivé, mais son emplacement reste fixe.

**Bouton désactivé — tooltip obligatoire**

Un bouton `disabled` sans explication est une impasse pour l'utilisateur. Toujours associer un `Tooltip` qui explique pourquoi et, si possible, ce qu'il faut faire pour le débloquer.

```tsx
// ❌ Mauvais — l'utilisateur ne sait pas pourquoi
<PrimaryButton label="Enregistrer" disabled />

// ✅ Bon — l'utilisateur comprend et peut agir
<TooltipTrigger label="Complétez tous les champs obligatoires pour enregistrer.">
  <PrimaryButton label="Enregistrer" disabled />
</TooltipTrigger>
```

**Ordre de lecture dans un groupe**

Dans tout groupe de boutons, l'ordre de gauche à droite suit la hiérarchie croissante d'engagement : action la moins engageante à gauche, action principale à droite.

```
Link (tertiaire)  →  Button outline (secondaire)  →  Button rempli (principal)
```

```tsx
// ✅ Ordre correct
<Link hideArrow onClick={onSaveDraft}>Brouillon</Link>
<PrimaryButton size="large" outline label="Réinitialiser" />
<PrimaryButton size="large" label="Valider" />

// ❌ Ordre incorrect — le bouton principal ne doit pas être à gauche
<PrimaryButton size="large" label="Valider" />
<PrimaryButton size="large" outline label="Réinitialiser" />
```

---

## Formulaires

### Choisir le bon composant de saisie

| Composant | Quand l'utiliser |
|---|---|
| `TextInput` | Texte libre — nom, description, recherche. |
| `Dropdown` | Choix parmi une liste fixe (3 options ou plus). |
| `SegmentedControlAlt` | 2 à 4 options mutuellement exclusives dans un formulaire. **À privilégier dans les formulaires.** |
| `SegmentedControl` | Réservé à la **navigation** entre vues ou sections — ne pas utiliser dans un formulaire. |
| `DatePicker` | Sélection d'une date ou plage de dates. |
| `Checkbox` | Option booléenne indépendante, ou sélection multiple. |
| `RadioButton` | Sélection exclusive parmi 2 à 5 options courtes. |
| `RichRadioButton` | Sélection exclusive avec icône + description par option. |
| `Toggle` | Activation/désactivation immédiate sans confirmation. |

### Règles

- ✅ Toujours passer la prop `label` sur `TextInput`, `Dropdown`, `TextArea`, `DatePicker` et `CounterInput` — c'est le seul moyen de garantir la cohérence visuelle du formulaire.
- ✅ Toujours fournir un `label` à chaque champ.
- ✅ Utiliser la prop `helper` de `TextInput` pour les instructions.
- ✅ Afficher les erreurs avec `state="error"` + message `helper`.
- ✅ Grouper les champs connexes avec un titre de section.
- ✅ Dans un formulaire, toujours utiliser `SegmentedControlAlt` — le `SegmentedControl` classique est réservé à la navigation.
- ❌ Ne pas utiliser `SegmentedControl` dans un formulaire.
- ❌ Ne pas mélanger `Checkbox` et `RadioButton` dans la même liste.
- ❌ Ne pas utiliser `Toggle` pour des choix qui nécessitent une confirmation.
- ❌ Ne jamais ajouter un `<label>` HTML custom autour d'un champ — utiliser la prop `label` du composant.

```tsx
<TextInput label="Nom du scénario" placeholder="Ex : Perturbation ligne A" />
<Dropdown label="Réseau" options={reseaux} value={reseau} onChange={setReseau} />
<TextInput label="Email" state="error" helper="Format invalide." />
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

### Layout recommandé

`Sidebar` et `Header` sont en `position: fixed`. Le contenu principal compense avec `marginLeft` (largeur de la sidebar) et `marginTop` (hauteur du header).

```tsx
const SIDEBAR_WIDTH = 240;
const HEADER_HEIGHT = 56;

<>
  <Sidebar
    style={{ position: "fixed", top: 0, left: 0, width: SIDEBAR_WIDTH, height: "100vh" }}
    product="datahub"
    clientName="Bordeaux Métropole"
    sections={[…]}
  />

  <Header
    style={{ position: "fixed", top: 0, left: SIDEBAR_WIDTH, right: 0 }}
    leftContent={<Dropdown options={reseaux} value={reseau} onChange={setReseau} />}
    rightContent={<Avatar name="Hector Malot" showIcon showProfile size="sm" color="gray" />}
  />

  <main style={{
    marginLeft: SIDEBAR_WIDTH,
    marginTop: HEADER_HEIGHT,
    padding: "24px 32px",
    minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
    overflow: "auto",
  }}>
    <Breadcrumbs items={[…]} />
    <h1 style={{ fontFamily: "Uxum Grotesque", fontSize: 28, fontWeight: 500, color: "#002830" }}>
      Titre de page
    </h1>
    <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
      <Tab label="Vue 1" active />
      <Tab label="Vue 2" />
    </div>
  </main>
</>
```

### Règles

- ✅ La `Sidebar` est en `position: fixed`, ancrée en `top: 0, left: 0`, et occupe `height: 100vh`.
- ✅ Le `Header` est en `position: fixed`, ancré en `top: 0, left: <largeur sidebar>`, et s'étend jusqu'au bord droit (`right: 0`).
- ✅ Le contenu principal compense avec `marginLeft` égal à la largeur de la sidebar et `marginTop` égal à la hauteur du header.
- ❌ Ne jamais décaler ou centrer la `Sidebar` — elle est toujours ancrée au bord gauche.
- ❌ Ne jamais tronquer la hauteur de la `Sidebar` — elle doit aller du haut au bas de l'écran.
- ❌ Ne pas positionner `Sidebar` ou `Header` en `relative` ou `absolute` — ils doivent rester visibles au scroll.
- ✅ Afficher `Breadcrumbs` dès que l'utilisateur est à plus d'un niveau de profondeur.
- ✅ Le dernier item du breadcrumb est la page courante — sans `href`, souligné.
- ❌ Ne pas imbriquer une `Sidebar` dans une `Sidebar`.
- ❌ Ne pas utiliser `Tab` pour de la navigation entre pages différentes.

---

## Feedback

### Choisir le bon composant

| Situation | Composant |
|---|---|
| Confirmation d'une action réussie | `AlertToast` variant `success` |
| Erreur système ou action échouée | `AlertToast` variant `error` |
| Avertissement non bloquant | `AlertToast` variant `warning` |
| Info contextuelle sur un élément UI | `Tooltip` via `TooltipTrigger` |
| Explication d'un bouton désactivé | `Tooltip` sur le bouton `disabled` |
| Erreur de validation d'un champ | `TextInput state="error"` + `helper` |

### Règles

- ✅ `AlertToast` s'affiche en overlay — jamais dans le flux du contenu.
- ✅ `success` et `info` : auto-dismiss après 4 secondes.
- ✅ `error` : reste visible jusqu'à fermeture manuelle.
- ❌ Ne pas afficher plus de 3 toasts simultanément.
- ❌ Ne pas utiliser `Tooltip` pour du contenu long ou interactif.

```tsx
// Toast de confirmation
<AlertToast variant="success" title="Scénario créé" onClose={() => setVisible(false)} />

// Tooltip sur bouton désactivé
<TooltipTrigger tooltip={<Tooltip label="Sélectionne un réseau d'abord" arrowPosition="bottom" />}>
  <PrimaryButton label="Analyser" disabled />
</TooltipTrigger>
```
