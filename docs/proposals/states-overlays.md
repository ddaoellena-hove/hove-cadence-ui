# Proposition — lot « États et surcouches »

**Composants** : `Skeleton`, `EmptyState`, `ActionMenu`, `Drawer`
**Branche** : `feat/states-overlays` · **Version cible** : `0.5.0` (déjà en place, pas de bump)
**Statut** : ⏸️ en attente de validation (Phase 0)

Ce document fige les interfaces, les exemples et le partage de code **avant** l'implémentation. Rien n'est codé tant qu'il n'est pas validé.

---

## 0. Vue d'ensemble

| Composant | Intention | Exporté | Remplace / comble |
|---|---|---|---|
| `Skeleton` | Réserver la place d'un contenu en cours de chargement | ✅ | les squelettes ad hoc de `DataTable` et `Card` |
| `EmptyState` | Liste vide / sans résultat / erreur | ✅ | la recette 4 (texte brut) et le défaut de `DataTable` |
| `ActionMenu` | Regrouper > 4 actions d'une ligne dans un menu | ✅ | la règle « regrouper dans un menu » qui ne pointait vers rien |
| `Drawer` | Consulter le détail d'une ligne sans quitter la liste | ✅ | (nouveau) |
| `useOverlay` + `OverlayPortal` | Comportement commun des surcouches | ❌ interne | corrige les manques de `Modal` (focus) sans toucher son API |

Tout en tokens, libellés FR accentués, commentaires FR. Aucune API existante cassée ; rendu visuel inchangé pour `Modal`, `DataTable`, `Card`.

---

## 1. Primitives de surcouche partagées (internes, non exportées)

**Fichier** : `src/components/overlay-primitives.ts` (+ `overlay.css` pour le voile commun).
Utilisées par `Drawer` **et** `Modal`. Rien n'est ajouté à `index.ts`.

### Interface

```ts
import { type RefObject, type ReactNode } from "react";

interface UseOverlayOptions {
  /** Surcouche ouverte. */
  isOpen: boolean;
  /** Appelé sur Échap, clic voile, ou fermeture programmée. */
  onClose: () => void;
  /** Élément de la surcouche à piéger (le panneau / le dialogue). */
  surfaceRef: RefObject<HTMLElement | null>;
  /** Fermer sur Échap. Défaut true. */
  closeOnEscape?: boolean;
}

/**
 * Pilote le comportement commun d'une surcouche modale :
 *  - Échap → onClose (capture au niveau document) ;
 *  - piège à focus : Tab / Maj+Tab bouclent dans `surfaceRef` ;
 *  - focus initial sur le 1er élément focusable (sinon la surface, tabIndex=-1) ;
 *  - retour du focus à l'élément déclencheur à la fermeture
 *    (mémorisé à l'ouverture via document.activeElement) ;
 *  - verrouillage du défilement du vrai conteneur scrollant ;
 *  - `inert` sur le reste de la page (aria-hidden en repli).
 */
function useOverlay(options: UseOverlayOptions): void;

/** Portail vers un nœud dédié ajouté en fin de <body> (hors overflow de l'app). */
function OverlayPortal(props: { children: ReactNode }): ReactNode;
```

### Points d'attention argumentés

- **Verrouillage du défilement** : le conteneur qui défile est `.app-layout__scroll`
  (`overflow: auto`, cf. `app-layout.css:53`), **pas** `body`. La primitive verrouille
  donc *le premier ancêtre réellement scrollant trouvé en remontant depuis `surfaceRef`*,
  avec repli sur `.app-layout__scroll` puis `document.body` (cas Storybook / usage hors
  `AppLayout`). On restaure la valeur d'`overflow` d'origine à la fermeture (pas un reset
  en dur, pour ne pas écraser un style existant). C'est strictement plus correct que le
  `document.body.style.overflow = "hidden"` actuel de `Modal`.
- **`inert`** : posé sur les enfants directs de `<body>` **sauf** le nœud du portail.
  `inert` retire focus + clics + lecture AT en un attribut ; `aria-hidden="true"` sert de
  repli si `inert` n'est pas supporté. Nettoyé à la fermeture.
- **Piège à focus** : un `keydown` sur la surface rattrape Tab/Maj+Tab et reboucle entre
  le premier et le dernier focusable ; combiné à `inert`, le focus ne peut pas sortir.
- **Retour du focus** : `document.activeElement` est capturé à l'ouverture et re-focalisé
  à la fermeture — y compris quand la surcouche est fermée par Échap ou le voile.

### Adoption par `Modal` (sans changement d'API ni visuel)

`Modal` remplace ses deux `useEffect` (Échap l.63‑70, lock `body` l.73‑80) par un appel à
`useOverlay`, enveloppe son overlay dans `OverlayPortal`, et pose une `ref` sur
`.modal`. Aucune prop ne change, le DOM visible et le CSS restent identiques — on **ajoute**
le piège à focus et le retour du focus, qui lui manquaient.

---

## 2. `Skeleton`

**Fichiers** : `Skeleton.tsx`, `skeleton.css`, `Skeleton.stories.tsx`.

### Interface

```ts
interface SkeletonProps {
  /** Forme. Défaut "text". */
  variant?: "text" | "rect" | "circle";
  /** `variant="text"` : nombre de lignes (la dernière plus courte). Défaut 3. */
  lines?: number;
  /** Largeur en px (number) ou unité CSS (string, ex. "60%"). */
  width?: number | string;
  /** Hauteur en px (number) ou unité CSS. "circle" : diamètre. */
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}
```

- **Décoratif** : `aria-hidden="true"`. C'est **le conteneur** qui porte `aria-busy="true"`
  (documenté dans la fiche et la story) — le `Skeleton` n'annonce rien seul.
- **Animation** : pulsation `1.2s ease-in-out` (identique à l'existant `data-table-pulse` /
  `card-pulse`), **coupée** sous `prefers-reduced-motion: reduce`.
- **Couleur** : nouveau token sémantique `--cadence-color-skeleton`, aliasé sur
  `--cadence-color-surface-alt` (`#eef1f4`) → **rendu identique** à l'actuel, mais nommé
  pour pouvoir diverger plus tard. Radius `--cadence-radius-sm`.

### Exemples

```tsx
// 1. Trois lignes de texte (dernière plus courte)
<div aria-busy="true">
  <Skeleton variant="text" lines={3} />
</div>

// 2. Vignette ronde + bloc (en-tête d'une carte en chargement)
<div aria-busy="true" style={{ display: "flex", gap: 12 }}>
  <Skeleton variant="circle" width={40} />
  <Skeleton variant="rect" width="100%" height={40} />
</div>
```

### Ce que l'app fournit

Le conteneur et son `aria-busy`, la bascule chargé/chargement, et la mise en page
(largeurs, nombre de lignes). `Skeleton` ne fait que dessiner la forme animée.

---

## 3. `EmptyState`

**Fichiers** : `EmptyState.tsx`, `empty-state.css`, `EmptyState.stories.tsx`.

### Interface

```ts
interface EmptyStateAction {
  label: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  /** Nature de l'état. Défaut "empty". */
  variant?: "empty" | "no-results" | "error";
  /** Échelle. "page" = centré, padding 48px (remplace la recette 4) ;
   *  "inline" = compact, dans un DataTable / une Card / un graphique. Défaut "page". */
  size?: "page" | "inline";
  /** Titre (requis), ex. « Aucun scénario créé pour ce réseau ». */
  title: string;
  description?: string;
  /** Action principale → PrimaryButton. */
  action?: EmptyStateAction;
  /** Action secondaire → GhostButton. */
  secondaryAction?: EmptyStateAction;
  /** Illustration décorative (aria-hidden). */
  illustration?: ReactNode;
  className?: string;
}
```

- **Accessibilité** : `role="status"` pour `"no-results"` et `"error"` (changement attendu
  par l'utilisateur, annoncé sans voler le focus) ; `"empty"` reste neutre (contenu
  statique, pas un changement dynamique).
- **Conventions par variante** (libellés par défaut *suggérés*, surchargés par `title` /
  `action`) : `empty` → pas d'action imposée ; `no-results` → action « Réinitialiser les
  filtres » ; `error` → action « Réessayer ». Les libellés restent à la charge de l'app via
  les props ; seule la sémantique (`role`) est pilotée par `variant`.

### Exemples

```tsx
// 1. Page vide (remplace la recette 4)
<EmptyState
  variant="empty"
  size="page"
  title="Aucun scénario créé pour ce réseau"
  description="Créez un premier scénario pour commencer à planifier."
  action={{ label: "Créer le premier scénario", onClick: onCreate }}
/>

// 2. Sans résultat, en ligne dans un DataTable
<DataTable
  /* … */
  emptyState={
    <EmptyState
      variant="no-results"
      size="inline"
      title="Aucune course ne correspond à ces filtres"
      action={{ label: "Réinitialiser les filtres", onClick: resetFilters }}
    />
  }
/>
```

### Ce que l'app fournit

Les libellés (titre, description, actions), les handlers (`onClick`), et le choix de la
variante / taille selon le contexte.

---

## 4. `ActionMenu`

**Fichiers** : `ActionMenu.tsx`, `action-menu.css`, `ActionMenu.stories.tsx`.
Réutilise `use-popover-fit` (maintien à l'écran) et **le style de menu de `Dropdown`**
(13px, `--cadence-radius-md`, fond `--cadence-color-surface-alt` au survol,
`--cadence-shadow-lg`). Pattern ARIA **`menu` / `menuitem`** (≠ `listbox` de `Dropdown` :
ce sont des actions, pas une sélection de valeur).

### Interface

```ts
interface ActionMenuItem {
  id: string;
  label: string;
  /** Icône avant le libellé. */
  icon?: IconName;
  /** "danger" → libellé et picto en rouge (--cadence-color-danger-text). */
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Séparateur au-dessus de cet item. */
  divider?: boolean;
  onSelect: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  /** Nom accessible du déclencheur icône. Défaut « Plus d'actions ». */
  label?: string;
  /** Libellé visible (variante bouton) au lieu de l'icône seule. */
  triggerLabel?: string;
  /** Icône du déclencheur. Défaut "dots-horizontal". */
  triggerIcon?: IconName;
  /** Bord d'alignement du menu sous le déclencheur. Défaut "end" (bord droit). */
  align?: "start" | "end";
  className?: string;
}
```

- **Déclencheur** : `GhostButton size="sm"` en icône seule (`dots-horizontal`,
  `aria-label` obligatoire) ; variante avec libellé via `triggerLabel`. ⚠️ l'infobulle
  intégrée du `GhostButton` icône est neutralisée ici (le menu porte déjà le nom).
- **Clavier** : ↓/↑ (avec bouclage), Début/Fin, **saisie de la 1re lettre** (typeahead),
  Entrée/Espace déclenche, **Échap** ferme et **rend le focus au déclencheur**, Tab ferme.
  `tabindex` roving sur les items.
- **Placement** : portail (`OverlayPortal` léger ou `createPortal` body) + `use-popover-fit`
  pour rester dans l'écran, `z-index: --cadence-z-dropdown`. Fonctionne donc **proprement
  dans la colonne d'actions collée à droite** d'un `DataTable` sans classes internes ni
  couleurs en dur (le menu est au-dessus, hors de l'overflow du tableau).

### Exemples

```tsx
// 1. Dans le slot `actions` d'une TableCard
<ActionMenu
  label="Plus d'actions"
  items={[
    { id: "dup", label: "Dupliquer", icon: "copy-01", onSelect: onDuplicate },
    { id: "edit", label: "Modifier", icon: "edit-02", onSelect: onEdit },
    { id: "del", label: "Supprimer", icon: "trash", tone: "danger", divider: true, onSelect: askDelete },
  ]}
/>

// 2. Variante avec libellé visible
<ActionMenu triggerLabel="Actions" items={items} align="end" />
```

### Ce que l'app fournit

Les items (libellés, icônes, `tone`, `onSelect`), et l'enchaînement d'un item `danger` vers
une confirmation `Modal` si besoin (montré en story).

---

## 5. `Drawer`

**Fichiers** : `Drawer.tsx`, `drawer.css`, `Drawer.stories.tsx`. Bâti sur les primitives
du §1 (voile, Échap, clic voile, bouton fermer, piège à focus, retour du focus).

### Interface

```ts
interface DrawerAction {
  label: string;
  onClick: () => void;
  /** Style destructif pour l'action principale. */
  destructive?: boolean;
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Action principale du pied → PrimaryButton (destructive → tone="danger"). */
  primaryAction?: DrawerAction;
  /** Action secondaire du pied → GhostButton (« Fermer », « Annuler »). */
  secondaryAction?: DrawerAction;
  /** Largeur : "md" 480px (défaut), "lg" 720px. */
  width?: "md" | "lg";
  className?: string;
}
```

> **Choix d'API à valider.** Le brief mentionne un `footer?`. Je propose plutôt de
> **refléter l'API de `Modal`** (`primaryAction` / `secondaryAction`), ce qui *garantit* la
> règle d'actions (GhostButton + PrimaryButton) au lieu de la laisser à un slot libre, et
> aligne les deux surcouches. Si un pied libre est souhaité, on peut ajouter `footer?:
> ReactNode` en complément (exclusif des deux actions). **Dis-moi quelle variante tu veux.**

- **Position / mouvement** : panneau à droite, entrée/sortie en `transform: translateX`
  sur **250 ms** (cohérent avec la `Sidebar`, `sidebar.css:13`), coupées sous
  `prefers-reduced-motion`.
- **Structure** : en-tête (titre + sous-titre + bouton fermer) et pied **fixes**, corps
  **défilant** avec `cadence-scrollbar`. `--cadence-shadow-overlay`, `--cadence-z-modal`.
- **Usage type** : détail d'une perturbation ouvert depuis une ligne de `DataTable`, avec
  `Indicator`, `Badge` et actions en pied — sans quitter la liste.

### Exemples

```tsx
// 1. Détail d'une perturbation depuis un DataTable
const [open, setOpen] = useState<Disruption | null>(null);
// … onRowClick={setOpen}
<Drawer
  isOpen={open !== null}
  onClose={() => setOpen(null)}
  title={open?.line ?? ""}
  subtitle="Perturbation en cours"
  primaryAction={{ label: "Modifier", onClick: edit }}
  secondaryAction={{ label: "Fermer", onClick: () => setOpen(null) }}
>
  <Indicator variant="warning" label="Ralenti" />
  {/* … détail … */}
</Drawer>

// 2. Panneau large en lecture seule
<Drawer isOpen={open} onClose={close} title="Journal des modifications" width="lg">
  {/* … */}
</Drawer>
```

### Ce que l'app fournit

L'état `isOpen` et `onClose`, le contenu (`children`), les libellés et handlers d'actions, et
le lien avec la ligne source (`onRowClick` du `DataTable`).

---

## 6. Adoption dans l'existant (rendu inchangé)

1. **`Skeleton` dans `DataTable` et `Card`** : **oui, dès ce lot.** Les lignes squelettes de
   `DataTable` (`data-table.css:187`) et le squelette de `Card` (`card.css:224`) utilisent
   déjà exactement le futur style du `Skeleton` (fond `surface-alt`, radius-sm, pulse 1.2s).
   On remplace les `<span>` ad hoc par `<Skeleton>`, **à l'identique visuellement** (vérifié
   par comparaison avant/après). Bénéfice : une seule primitive, cohérence garantie.
   ⚠️ Si une différence de rendu apparaît, on garde les styles locaux et on ne force pas
   l'adoption — l'objectif « rendu inchangé » prime.

2. **`EmptyState` dans `DataTable`** : **aucune API à changer.** `emptyState` est déjà
   `ReactNode` ; on peut y passer `<EmptyState size="inline" />`. Le défaut reste la chaîne
   « Aucun résultat. ». On **documente** l'usage et on ajoute une story.

3. **`Modal`** : passe sur les primitives (§1). API et visuel inchangés, gagne le focus.

---

## 7. Coordination avec le lot data viz (parallèle)

Fichiers partagés, modifiés **en fin de liste/section uniquement** (fusion triviale) :

- `src/components/index.ts` → 4 exports ajoutés à la fin.
- `tokens.css` → `--cadence-color-skeleton` ajouté (section Couleurs/surfaces).
- `GUIDELINES.md` → lignes ajoutées à la table Intention, recette 4 réécrite, fiches API en fin de Référence.
- `CHANGELOG.md` → sous-section ajoutée **à la fin** de `## 0.5.0`, sans toucher aux entrées data viz.

**Suite pour les graphiques** (hors de ce lot) : `Skeleton` et `EmptyState` sont exportés et
génériques ; les graphiques (`state="loading" | "empty" | "error"`) pourront les adopter
ensuite à la place de leurs états internes. Noté dans le rapport final comme travail de suivi.
Je ne touche pas à `DataVisualization` ni aux composants de graphique.

---

## 8. Tokens ajoutés

| Token | Valeur | Rôle |
|---|---|---|
| `--cadence-color-skeleton` | `var(--cadence-color-surface-alt, #eef1f4)` | Fond des squelettes de chargement |

(Aucun autre token : voiles, z-index, ombres, rayons et durées réutilisent l'existant.)

---

## 9. Plan de commits (après validation)

1. `feat(overlay): primitives de surcouche partagées (focus, scroll, inert)` — §1
2. `feat(skeleton): primitive de chargement` — §2 (+ adoption DataTable/Card)
3. `feat(empty-state): états vide / sans résultat / erreur` — §3
4. `feat(action-menu): menu d'actions par ligne` — §4
5. `feat(drawer): panneau latéral de détail` — §5
6. `refactor(modal): passage aux primitives de surcouche` — §1 adoption
7. `docs: GUIDELINES + CHANGELOG du lot états & surcouches` — §6/§7

**Rien n'est poussé ni publié sans ton accord.**

---

## Questions ouvertes (à trancher avant la Phase 1)

1. **`Drawer`** : API `primaryAction`/`secondaryAction` (reflète `Modal`, recommandé) ou
   slot `footer?: ReactNode` libre ? (cf. §5)
2. **Adoption de `Skeleton`** dans `DataTable`/`Card` dès ce lot : OK pour toi ? (recommandé, §6.1)
3. Libellés par défaut d'`EmptyState` par variante : pilotés par l'app (proposé) ou valeurs
   par défaut intégrées (« Réessayer », « Réinitialiser les filtres ») ?
