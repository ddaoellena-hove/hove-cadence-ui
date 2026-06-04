# Guidelines — Hove Cadence UI

Règles d'usage des composants du design system.  
Version complète et interactive disponible dans le Storybook (`@ddaoellena/cadence-ui-storybook`).

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

**En fin de formulaire — deux PrimaryButton**

Associer la variante `outline` (action secondaire, à gauche) et la variante `default` (action principale, à droite) :

```tsx
<div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
  <PrimaryButton outline label="Réinitialiser" onClick={onReset} />
  <PrimaryButton label="Suivant" onClick={onNext} />
</div>
```

**Dans un dashboard — action principale**

Positionner en haut à droite, à l'opposé des onglets/filtres :

```tsx
<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
  <div style={{ display: "flex", gap: 4 }}>
    <Tab label="En cours" active />
    <Tab label="À venir" />
  </div>
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <Toggle label="Affichage cartographique" />
    <PrimaryButton label="Créer un scénario de mobilité" onClick={onCreate} />
  </div>
</div>
```

**Groupe de 3 actions — Link en 3e position**

```tsx
<div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
  <Link variant="secondary" hideArrow onClick={onSaveDraft}>
    Enregistrer comme brouillon
  </Link>
  <PrimaryButton outline label="Réinitialiser" onClick={onReset} />
  <PrimaryButton label="Valider" onClick={onSubmit} />
</div>
```

**Action destructive**

```tsx
<Link variant="danger" onClick={onDelete}>Supprimer le scénario</Link>
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

- ✅ Toujours fournir un `label` à chaque champ.
- ✅ Utiliser la prop `helper` de `TextInput` pour les instructions.
- ✅ Afficher les erreurs avec `state="error"` + message `helper`.
- ✅ Grouper les champs connexes avec un titre de section.
- ✅ Dans un formulaire, toujours utiliser `SegmentedControlAlt` — le `SegmentedControl` classique est réservé à la navigation.
- ❌ Ne pas utiliser `SegmentedControl` dans un formulaire.
- ❌ Ne pas mélanger `Checkbox` et `RadioButton` dans la même liste.
- ❌ Ne pas utiliser `Toggle` pour des choix qui nécessitent une confirmation.

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
| `Sidebar` | Navigation principale entre les grandes sections. | Gauche, pleine hauteur |
| `Header` | Sélecteur de périmètre + profil utilisateur. | Haut, pleine largeur |
| `Breadcrumbs` | Localisation dans l'arborescence + navigation ascendante. | Au-dessus du titre |
| `NavigationDropdown` | Sélecteur de contexte dans le breadcrumb. | Dans le breadcrumb |
| `Tab` | Navigation entre vues au sein d'une même page. | Sous le titre de page |

### Layout recommandé

```tsx
<div style={{ display: "flex", height: "100vh" }}>
  <Sidebar product="datahub" clientName="Bordeaux Métropole" sections={[…]} />

  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
    <Header
      leftContent={<Dropdown options={reseaux} value={reseau} onChange={setReseau} />}
      rightContent={<Avatar name="Hector Malot" showIcon showProfile size="sm" color="gray" />}
    />
    <main style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
      <Breadcrumbs items={[…]} />
      <h1 style={{ fontFamily: "Uxum Grotesque", fontSize: 28, fontWeight: 500, color: "#002830" }}>
        Titre de page
      </h1>
      <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
        <Tab label="Vue 1" active />
        <Tab label="Vue 2" />
      </div>
    </main>
  </div>
</div>
```

### Règles

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
