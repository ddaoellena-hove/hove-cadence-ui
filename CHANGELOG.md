# Changelog — @ddaoellena/cadence-ui

## 0.3.0

### Boutons v2

Les actions s'organisent en **trois niveaux** :
1. `PrimaryButton` : action principale, un seul par vue ;
2. **`GhostButton`** (nouveau) : actions secondaires, sans fond ni bordure au repos ;
3. `Link hideArrow` : 3e action d'un groupe, ou action dans une phrase.

**Nouveau**
- `GhostButton`. Même API et mêmes dimensions que `PrimaryButton` :
  - `tone="default" | "danger"`, `size="sm" | "md" | "lg"` ;
  - `iconStart` / `iconEnd` ;
  - `icon` + `aria-label` (obligatoire, typé) ;
  - `loading`, `fullWidth`, `type`, `forwardRef`.
- `PrimaryButton` adopte la même API. Survol, appui et focus passent en CSS (plus de `state` JS).
- Focus clavier visible partout : `--cadence-focus-ring` sur `:focus-visible`.
- Nouveaux tokens :
  - `--cadence-color-danger-hover`, `-danger-active`, `-danger-text` ;
  - `--cadence-color-link` ;
  - `--cadence-color-hover-overlay`, `-active-overlay`, `-danger-hover-overlay`, `-danger-active-overlay`.
- Story **Actions / Matrice** : tous les boutons × tons × tailles × états.

**Changements visuels**
- Le **bleu plein disparaît des actions**. Les anciens `SecondaryButton` pleins sont rendus en `PrimaryButton size="sm"` (encre). `--cadence-color-accent` est réservé aux états.
- **`outline` devient ghost** : sans bordure, avec un voile au survol. Écrans concernés :
  - pied de `Modal` (« Annuler ») ;
  - 1re action d'`AlertToast` ;
  - « Annuler » de `DateRangePicker` ;
  - tous les `outline` des applications.
- « Valider » de `DatePicker`, « Appliquer » de `DateRangePicker` et l'action pleine d'`AlertToast` passent du bleu à l'encre.
- « Tout effacer » de `FilterBar` passe d'un lien bleu à un `GhostButton size="sm"`.
- Les anciens `SecondaryButton` passent d'un rayon de 6px à la pilule. Les boutons à icône seule deviennent carrés.
- Le rouge plein passe de `#de353e` (4,48:1, sous AA) à `--cadence-color-danger` (`#da1e28`, 5,0:1).
- `Link` :
  - `#0f62fe` → `--cadence-color-link` (`#1d4ed8`, AA aussi sur `surface-alt`) ;
  - `#dc2626` → `--cadence-color-danger-text` ;
  - une action (`Link` sans `href`) ne se coupe plus sur plusieurs lignes.

**Dépréciations** (acceptées en 0.3.0, avertissement en développement une seule fois, **suppression en 1.0.0**)

| Avant | Après |
|---|---|
| `PrimaryButton outline` | `GhostButton` |
| `SecondaryButton outline` | `GhostButton size="sm"` |
| `SecondaryButton` plein | `PrimaryButton size="sm"` ou `GhostButton size="sm"` selon le rôle |
| `destructive` | `tone="danger"` |
| `size="medium"` / `"large"` | `"md"` (défaut) / `"lg"` |
| `withIcon="left"` / `"right"` + `icon` | `iconStart` / `iconEnd` |
| `withIcon="only"` + `icon` | `icon` + `aria-label` |
| `state` | supprimé (`"disabled"` → `disabled`) |
| `Link variant="secondary"` | `Link` (identique) |

**Migration**

```bash
# Simulation (liste des fichiers et des « TODO buttons-v2 » à relire)
node node_modules/@ddaoellena/cadence-ui/scripts/codemods/buttons-v2.mjs --dry src
# Application
node node_modules/@ddaoellena/cadence-ui/scripts/codemods/buttons-v2.mjs src
```

- Le codemod traite les `.ts` / `.tsx` / `.js` / `.jsx` et les blocs ```tsx des `.md` / `.mdx`, et met à jour les imports. Il nécessite `typescript` dans le projet.
- Il ne sait pas deviner le rôle d'un `SecondaryButton` plein (principal ou secondaire ?). Il laisse alors un commentaire `TODO buttons-v2` à relire.

### Inclus depuis la 0.1.6 (0.2.0, non publiée)

- `DataTable` (tri, sélection, virtualisation, modes client / serveur), `Pagination`, `FilterBar`.
- `KpiCard`, `DateRangePicker` ; `DatePicker` navigable au clavier (calendrier interne partagé).
- `Checkbox` : `aria-label` optionnel.
- Tokens de statuts, thèmes produits, élévation, focus et couches (z-index).
- Libellés de `DatePicker` et d'`AlertToast` en français.
- Icônes `@untitledui/icons` en SVG inline (plus aucune URL distante).
- Nouvelles dépendances : `@tanstack/react-table`, `@tanstack/react-virtual`.
