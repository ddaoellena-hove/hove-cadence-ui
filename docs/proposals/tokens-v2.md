# Tokens v2 — propositions (phase 3)

> **Statut : proposition, rien n'est appliqué.** Les phases 1 et 2 (branche `chore/tokens-and-fixes`) n'ont changé aucun rendu en dehors des textes traduits. Tout ce qui suit modifie le visuel et attend un accord avant d'être appliqué.

Ratios calculés selon WCAG 2.1 (luminance relative, `(L1 + 0,05) / (L2 + 0,05)`). Seuils : **4,5:1** pour le texte courant, **3:1** pour le texte ≥ 18,66px gras / 24px, les icônes et les indicateurs graphiques (dont les anneaux de focus). Fonds de référence : `--cadence-color-white` `#ffffff` et `--cadence-color-surface-alt` `#eef1f4`.

---

## 1. Contraste

| Token | Actuel | Sur blanc | Sur surface-alt | Proposition | Sur blanc | Sur surface-alt |
|---|---|---|---|---|---|---|
| `--cadence-color-text-muted` | `#809397` | 3,21:1 ❌ | — | `#5f7175` | 5,12:1 ✅ | 4,51:1 ✅ |
| `--cadence-color-success` (texte) | `#24a148` | 3,35:1 ❌ | — | nouveau `--cadence-color-success-text` `#15803d` | 5,02:1 ✅ | — |
| `--cadence-color-warning` (texte) | `#f1c21b` | 1,68:1 ❌ | — | nouveau `--cadence-color-warning-text` `#b45309` | 5,02:1 ✅ | — |

**`text-muted`.** `#69797d` (darkblue-50-AA, déjà `--cadence-color-icon-muted`) passe sur blanc (4,53:1) mais **pas** sur `surface-alt` (4,00:1), où vivent les TableCard et les badges. `#5f7175` garde la même teinte (H ≈ 191°, S ≈ 10 %) en assombrissant de 3 points de luminosité et passe sur les deux fonds. Deux options :
- **A (recommandée)** — `--cadence-color-text-muted: #5f7175`.
- **B** — réutiliser `#69797d` et interdire `text-muted` sur `surface-alt`. Règle plus fragile.

**`success`.** `#24a148` reste valable pour les fonds, bordures et icônes (3,35:1 ≥ 3:1). On ajoute une variante texte `#15803d`, qui est déjà `--cadence-status-completed-fg` : pas de nouvelle couleur dans la palette.

**`warning`.** `#f1c21b` n'atteint même pas 3:1 : il ne convient ni au texte, ni seul comme icône sur blanc. On le garde pour la barre d'accent et la progression (où il est doublé par le titre). Nouvelle variante texte `#b45309`, à utiliser aussi pour l'icône d'`AlertToast type="warning"`. Alternative : `#c2410c` (`--cadence-status-warning-fg`, 5,18:1), plus orange que jaune.

---

## 2. Harmonisation des statuts

Aujourd'hui deux palettes coexistent :
- `Indicator` : palette de type Tailwind (`#1d4ed8`, `#15803d`, `#c2410c`, `#b91c1c`…), toutes les paires fg/bg passent 4,5:1.
- `AlertToast` : palette IBM Carbon (`#0f62fe`, `#24a148`, `#f1c21b`, `#da1e28`).

| Statut | Indicator fg | Ratio fg/bg | AlertToast actuel | Proposition AlertToast |
|---|---|---|---|---|
| info | `#1d4ed8` | 6,16:1 | `#0f62fe` | `var(--cadence-status-info-fg)` |
| succès | `#15803d` (completed) | 4,57:1 | `#24a148` | `var(--cadence-status-completed-fg)` |
| avertissement | `#c2410c` | 4,88:1 | `#f1c21b` | `var(--cadence-status-warning-fg)` |
| erreur | `#b91c1c` (critical) | 5,30:1 | `#da1e28` | garder `--cadence-color-danger` (5,00:1) ou passer à `critical-fg` |

**Proposition :** une seule palette, celle des `--cadence-status-*`. `AlertToast` n'a plus de couleurs propres : `--cadence-color-info` et `--cadence-color-warning` deviennent des alias (`--cadence-color-info: var(--cadence-status-info-fg)`), puis sont dépréciés. L'erreur reste sur `--cadence-color-danger`, déjà partagé avec les boutons destructifs.

Effet visuel : barre et icône du toast d'info légèrement plus sombres, toast d'avertissement orange au lieu de jaune.

---

## 3. Bleus

| Valeur | Rôle actuel | Sur blanc |
|---|---|---|
| `#1b6cff` | `--cadence-color-accent` : sélection Sidebar/menus, SecondaryButton rempli, focus Tab/Segmented/Breadcrumbs | 4,53:1 |
| `#0f62fe` | `--cadence-color-info` (AlertToast), `Link` primary/secondary, focus du bouton × d'AlertToast | 5,00:1 |
| `#1d4ed8` | `--cadence-status-info-fg` (Indicator) | 6,70:1 |
| `#0048bf` | SecondaryButton pressé (en dur) | — |
| `#3b8eff` | Pastille de notification de la Sidebar (en dur) | — |
| `#f0f6ff` | `--cadence-color-accent-subtle` (survol actif Sidebar) | — |
| `#eff6ff` | Survol / focus des options Dropdown et Autocomplete (en dur), fond `--cadence-status-info-bg` | — |

**`#eff6ff` vs `#f0f6ff`** : un seul canal diffère d'une unité (rouge `ef` / `f0`). L'écart est invisible à l'œil (ΔE < 0,5). Les usages sont pourtant **deux** :
- survol d'une option de menu (Dropdown, Autocomplete) = même rôle que le survol actif de la Sidebar → **doublon visuel de `accent-subtle`** ;
- fond du statut info d'`Indicator` → **usage distinct** (sémantique de statut).

**Proposition :**
1. Dropdown/Autocomplete passent à `var(--cadence-color-accent-subtle)` (`#f0f6ff`) — changement imperceptible.
2. `--cadence-status-info-bg` garde `#eff6ff` : c'est un statut, il peut diverger plus tard.
3. `Link` passe de `#0f62fe` à `--cadence-color-accent` (`#1b6cff`, 4,53:1 — juste au seuil) **ou** l'accent est assombri pour tout le monde à `#0f62fe` (5,00:1, plus de marge). Recommandation : **accent = `#0f62fe`**, un seul bleu interactif, `#1b6cff` disparaît.
4. Ajouter `--cadence-color-accent-strong: #0048bf` (état pressé) et ranger `#3b8eff` sous l'accent.

---

## 4. Focus — anneau unique

Tokens préparés en phase 2 (non appliqués) :

```css
--cadence-focus-color: #1a3e45;
--cadence-focus-ring: 0 0 0 2px #ffffff, 0 0 0 4px #1a3e45;
```

- `#1a3e45` : **11,55:1** sur blanc, **10,18:1** sur `surface-alt` (≥ 3:1 requis).
- Le liseré blanc intérieur garde l'anneau visible sur les fonds sombres (Sidebar Datahub : blanc sur `#004650` = 10,54:1 ; Modal sur `#002830`).
- Application : `box-shadow: var(--cadence-focus-ring)` sur `:focus-visible`, `outline: none`. Pour les éléments qui ont déjà une ombre, concaténer (`box-shadow: var(--cadence-focus-ring), var(--cadence-shadow-sm)`).

### Avant / après

| Fichier | Sélecteur | Avant | Contraste avant | Après |
|---|---|---|---|---|
| `alert-toast.css` | `.alert-toast__close-btn:focus-visible` | `outline: 2px solid #0f62fe` | 5,00:1 | anneau unique |
| `breadcrumbs.css` | `.breadcrumbs__link:focus-visible` | `outline: 2px solid accent` | 4,53:1 | anneau unique |
| `checkbox.css` | `.checkbox:focus-visible` | `0 0 0 3px #1a3e4566` (40 %) | **2,19:1 ❌** | anneau unique |
| `counter-input.css` | `.counter-input__btn:focus-visible` | `outline: 2px solid #004650` | 10,54:1 | anneau unique |
| `dropdown.css` | `.dropdown__trigger:focus-visible` | bordure `#2d5f6b` + halo `rgba(45,95,107,.12)` | bordure 7,09:1, halo 1,19:1 | bordure conservée + anneau |
| `dropdown.css` | `.dropdown__option:focus-visible` | fond `#eff6ff` seul | fond seul ❌ | fond + anneau intérieur |
| `link.css` | `.link:focus-visible` | `outline: 2px solid currentColor` | selon variante | anneau unique (sauf `inverse` : garder `currentColor`) |
| `navigation-dropdown.css` | `.navigation-dropdown-trigger:focus-visible` | `0 0 0 2px #6366f1` | 4,47:1 | anneau unique |
| `navigation-dropdown.css` | `.navigation-dropdown-item:focus-visible` | fond `#ede9fe` + texte `#4f46e5` | fond seul ❌ | fond + anneau intérieur |
| `radio-button.css` | `.radio-button:focus-visible` | `0 0 0 3px #1a3e45` | 11,55:1 | anneau unique |
| `rich-checkbox.css` | `.rich-checkbox:focus-visible` | `0 0 0 3px #1a3e4540` (25 %) | **1,59:1 ❌** | anneau unique |
| `rich-radio-button.css` | `.rich-radio-button:focus-visible` | `0 0 0 3px #1a3e4540` (25 %) | **1,59:1 ❌** | anneau unique |
| `segmented-control.css` | `.segmented-control__segment:focus-visible` | `outline: 2px solid accent`, offset −2px | 4,53:1 | anneau unique (inset) |
| `segmented-control-alt.css` | `.alternative__tab:focus-visible` | idem | 4,53:1 | anneau unique (inset) |
| `sidebar.css` | `.sidebar__section-btn`, `.sidebar__item` | `outline: 2px solid rgba(255,255,255,.4)` | 3,01:1 (Datahub) | anneau inversé (blanc plein) |
| `tab.css` | `.tab:focus-visible` | `outline: 2px solid accent` | 4,53:1 | anneau unique |
| `text-input.css`, `text-area.css`, `autocomplete.css`, `date-picker.css` | états focus / open | bordure `#2d5f6b` + halo 12 % | halo 1,19:1 | bordure conservée + anneau |
| `toggle.css` | `.toggle:focus-visible` | `0 0 0 3px #1a3e4566` (40 %) | **2,19:1 ❌** | anneau unique |
| `tooltip-trigger.css` | `.tooltip-trigger__icon:focus-visible` | `outline: 2px solid primary` | 15,60:1 | anneau unique |

Quatre composants (Checkbox, Toggle, RichCheckbox, RichRadioButton) ont aujourd'hui un focus sous 3:1 : ce sont les corrections prioritaires.

---

## 5. Autres points ouverts

- **NavigationDropdown** : menu à `z-index: 1000` (niveau des modales) au lieu de `--cadence-z-dropdown` (200), et palette violette propre (`#6366f1`, `#4f46e5`, `#ede9fe`) qui n'existe nulle part ailleurs. Proposer : z-index → `--cadence-z-dropdown`, couleurs → `--cadence-color-accent` / `accent-subtle`.
- **`--cadence-z-popover` = `--cadence-z-sticky` = 100** : un tooltip ou le popover du DatePicker passe sous un Header fixe (100 aussi, ordre DOM) et sous les menus. Proposer `--cadence-z-popover: 300`.
- **Ombres hors niveaux** (laissées en dur) : voir l'annexe B. Candidates au rapprochement : `AlertToast` et menu `NavigationDropdown` → `--cadence-shadow-md` ; popover `DatePicker` et tooltip `DataVisualization` → `--cadence-shadow-lg` ; `Header` et trigger `DatePicker` → `--cadence-shadow-sm`.
- **Danger** : 6 nuances de rouge en dur dans les boutons (`#de353e` survol, `#c91720` pressé, `#f6c7c9`, `#ed8e93`, `#fbe8e9`, `#fdf4f4`) et `Link` destructif sur `#dc2626` / `#b91c1c` au lieu de `--cadence-color-danger`. Proposer une échelle `--cadence-color-danger-{hover,pressed,subtle,border}`.
- **Noir pur `#000000`** (titre d'AlertToast, Segmented, DatePicker) : passer à `--cadence-color-primary` (`#002830`, 15,60:1).
- **`#004650` du CounterInput** : même valeur que `--cadence-product-datahub` mais rôle différent (bouton). À décider : token `--cadence-color-control` ou alignement sur `--cadence-color-primary`.

---

## Annexe A — Inventaire des styles de focus (état au commit de phase 2)

Voir le tableau « Avant / après » ci-dessus : une vingtaine de règles `:focus-visible` et d'états focus/open, réparties sur 20 fichiers, avec 7 styles différents (outline accent, outline `#0f62fe`, outline primary, outline `currentColor`, outline blanc 40 %, anneaux `box-shadow` `#1a3e45` à 100 / 40 / 25 %, halo des champs).

## Annexe B — Ombres hors niveaux (inchangées)

| Fichier | Sélecteur | Valeur |
|---|---|---|
| `alert-toast.css` | `.alert-toast` | `0 0 8px #0000001a, 0 0 2px #00000040` |
| `data-visualization.css` | `.dv__tooltip` | `0 4px 12px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.06)` |
| `date-picker.css` | `.date-picker__trigger` | `0 1px 2px rgba(0,0,0,.06)` |
| `date-picker.css` | `.date-picker__popover` | `0 4px 24px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06)` |
| `header.css` | `.header` | `0 1px 3px rgba(0,0,0,.06)` |
| `navigation-dropdown.css` | `.navigation-dropdown-menu` | `0 0 2px rgba(0,0,0,.25), 0 0 12px rgba(0,0,0,.1)` |
| `sidebar.css` | `.sidebar` | `0 0 3px rgba(0,0,0,.5), 0 0 12px rgba(0,0,0,.1)` |
| `toggle.css` | `.toggle-thumb` | `0 1px 3px #0000004d` |
| `tooltip.css` | `.tooltip--light` | `filter: drop-shadow(0 1px 8px rgba(0,0,0,.1)) drop-shadow(0 0 1px rgba(0,0,0,.25))` |
| boutons, Toggle, CounterInput | états | reliefs `inset` combinés à des ombres portées — matériau propre à chaque composant |

## Annexe C — Hex restants après la phase 2

Sortie de `grep -nE "#[0-9a-fA-F]{3,8}" src/components/*.css | grep -v tokens.css | grep -v "var(--"` : 208 lignes, toutes justifiées ci-dessous.

| Catégorie | Lignes | Fichiers | Raison |
|---|---|---|---|
| Reliefs et ombres en hex alpha (`#ffffff40`, `#ffffffbf`, `#0000000d`, `#0000001a`, `#00000040`, `#00000080`, `#0000004d`) | 113 | primary-button, secondary-button, toggle, counter-input, alert-toast | Couches `inset` / portées propres au matériau des boutons ; hors des 4 niveaux d'élévation. Restent des ombres, conformément à la règle « les noirs d'ombre restent dans les ombres ». |
| Nuances de danger des boutons (`#de353e`, `#c91720`, `#f6c7c9`, `#ed8e93`, `#fbe8e9`, `#fdf4f4`) | 20 | primary-button, secondary-button | Survol / pressé / désactivé destructifs ; aucun token existant. Proposition §5. |
| Séries DataViz (`--CAI-dv-series-1..8`) | 8 | data-visualization | Déjà en variables locales documentées, palette dédiée aux graphiques. |
| Texte DataViz `#1a1a2e` | 2 | data-visualization | Encre propre au graphique (proche de primary) ; à aligner en phase 3. |
| Palette d'Avatar (`#c8e6c9`/`#2e7d32`, `#bbdefb`/`#1565c0`, `#ffe0b2`/`#e65100`, `#e1bee7`/`#6a1b9a`, `#555`) | 9 | avatar | Couleurs d'identité décoratives par prop `color`, sans sémantique de statut. |
| Dégradé des Rich* (`#fcfdfd` → `#f2f6f6`) | 6 | rich-checkbox, rich-radio-button | Dégradé décoratif de carte sélectionnée. |
| Bordures des Rich* (`#405e64` sélectionné, `#bfbfbf` désactivé) | 8 | rich-checkbox, rich-radio-button | Pas de token équivalent (`#bfbfbf` ≠ `border-strong` `#bfc9cb`). |
| Bordure / texte de focus des champs `#2d5f6b` | 7 | text-input, text-area, dropdown, autocomplete, date-picker | Partie des styles de focus : traité avec l'anneau unique (§4). |
| Anneaux de focus `#1a3e4566`, `#1a3e4540`, `#6366f1`, outline `#0f62fe`, outline `#004650` | 7 | checkbox, toggle, rich-*, navigation-dropdown, alert-toast, counter-input | Inventaire focus (§4) — ne pas toucher avant l'anneau unique. |
| Primary à 10 % `#0028301a` | 2 | checkbox, radio-button | Alpha d'un token : non exprimable sans `color-mix()` (arrondi différent). |
| Noir pur `#000000` | 5 | alert-toast, segmented-control, segmented-control-alt, date-picker | Pas de token noir. Proposition §5. |
| `#eff6ff` des options de menu | 3 | dropdown, autocomplete | Doublon visuel de `accent-subtle` à une unité près ; fusion §3. |
| Fonds de piste segmentée `#e6f0fa`, `#dde8f0` | 3 | segmented-control-alt, date-picker | Spécifiques au SegmentedControlAlt (et sa copie interne du DatePicker). |
| `Link` (`#0f62fe` ×2, `#dc2626`, `#b91c1c`) | 4 | link | Bleus et rouges à fusionner (§3, §5). |
| Violet de NavigationDropdown (`#ede9fe`, `#4f46e5`) | 4 | navigation-dropdown | Palette isolée (§5). |
| Header actif (`#eef2ff`, `#3b5bdb`) | 2 | header | Indigo isolé, à rapprocher de l'accent. |
| SecondaryButton pressé `#0048BF` | 2 | secondary-button | Variante foncée de l'accent (§3). |
| Pastille de notification `#3b8eff` | 1 | sidebar | Bleu clair sur fond sombre (§3). |
| CounterInput `#004650` (fond) | 1 | counter-input | Même valeur que `--cadence-product-datahub`, rôle différent (§5). |
| TableCard sélectionnée `#c8d6e4` | 1 | table-card | Fond de sélection propre au wrapper de TableCard. |
