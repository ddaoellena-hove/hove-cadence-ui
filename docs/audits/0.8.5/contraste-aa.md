# Audit contraste AA — `icon-muted` utilisé comme couleur de texte (0.8.5)

Checklist pour la passe composant-par-composant de la 0.8.5. **Rien n'est
appliqué** : ce document liste les sélecteurs, les mesures et la décision
attendue pour chacun.

## Constat

`--cadence-color-icon-muted` (`#69797d`) est documenté comme couleur
d'**icônes** (`tokens.css`), mais sert de `color` de **texte** dans une
vingtaine de sélecteurs. Le texte concerné fait 11–12 px, poids ≤ 600 :
c'est du petit texte, il faut donc **4,5:1** (WCAG 1.4.3).

Ratios mesurés (formule WCAG, sRGB) :

| Fond | `icon-muted` #69797d | `text-secondary` #64757a | candidat #607075 |
|---|---|---|---|
| blanc `#ffffff` | 4,53 ✅ (limite) | 4,81 ✅ | 5,16 ✅ |
| `surface-subtle` `#fafafa` | 4,34 ❌ | 4,61 ✅ | — |
| `accent-subtle` `#f0f6ff` | 4,17 ❌ | 4,43 ❌ | 4,75 ✅ |
| `hover-overlay` sur blanc (≈ `#f0f2f3`) | 4,04 ❌ | 4,28 ❌ | 4,59 ✅ |
| `surface-alt` `#eef1f4` | 4,00 ❌ | 4,24 ❌ | 4,55 ✅ |

À retenir :

- Sur **fond blanc**, `icon-muted` passe de justesse (4,53:1). Il n'y a pas de
  marge : le moindre fond teinté, survol ou anticrénelage le fait échouer. C'est
  pour ça qu'axe ne signale aujourd'hui presque rien, alors que le token reste
  fragile.
- `text-secondary` corrige les cas **blanc / surface-subtle**, mais **échoue
  aussi sur `surface-alt` et sur les fonds de survol**. Aucun token de texte
  secondaire n'est aujourd'hui AA sur `surface-alt` (hormis `label`, beaucoup
  plus foncé).
- **Décision à prendre en 0.8.5** : soit assombrir `text-secondary` vers
  `#607075` (≈ 5,2:1 sur blanc, ≥ 4,5:1 sur tous les fonds clairs du DS ;
  impact visuel minime, mais touche tous ses usages), soit garder `#64757a` et
  n'utiliser `text-secondary` que sur fond blanc.

## À corriger — texte informatif

Remplacer `--cadence-color-icon-muted` par `--cadence-color-text-secondary` (en
gardant le fallback dans `var(…)`). Fond : contexte habituel du sélecteur.

- [ ] `page-header.css` — `.page-header__subtitle` (fond blanc)
- [ ] `card.css` — `.card__description` (blanc)
- [ ] `card.css` — `.card__delta-label` (blanc)
- [ ] `card.css` — `.card__delta--neutral` (blanc) — *ajouté par l'audit : delta « stable », c'est une information*
- [ ] `bar-list.css` — `.bar-list__delta--neutral` (blanc, `hover-overlay` au survol de ligne ❌ avec `#64757a`) — *ajouté par l'audit*
- [ ] `chart-frame.css` — `.chart__description` (blanc)
- [ ] `chart-frame.css` — `.chart__axis-label` (SVG : propriété **`fill`**, pas `color`, 11 px)
- [ ] `chart-tooltip.css` — `.chart-tooltip__note` (blanc)
- [ ] `breadcrumbs.css` — `.breadcrumbs__link` (transparent, sur l'en-tête blanc)
- [ ] `heatmap.css` — `.heatmap__row-label` et libellés de colonnes (règle partagée, 11 px / 500)
- [ ] `date-range-picker.css` — `.date-range-picker__hint` (blanc)
- [ ] `data-table.css` — `.data-table__header` (libellé 11 px / 600, blanc)
- [ ] `table-header.css` — `.table-header__cell` (même style) — *ajouté par
  l'audit, à traiter avec `DataTable` pour garder les deux en-têtes identiques*

  > Note : le plan signalait une incohérence de poids (`font-weight: normal`
  > dans `DataTable` contre 600 dans `TableHeader`). Elle **n'existe pas** :
  > `normal` ne fait qu'annuler le gras par défaut du `<th>`, et le libellé
  > (`.data-table__label` / `.table-header__label`) est en 600 dans les deux.
  > Seul le contraste est à corriger.

## À trancher — états volontairement estompés

Pour un **onglet inactif** ou un **jour hors plage**, l'estompage porte du sens,
mais le libellé reste lisible et cliquable : WCAG ne l'exempte pas (seuls les
composants *désactivés* le sont). À décider en 0.8.5 :

- [ ] `tab.css` — `.tab` (onglet inactif, fond transparent)
- [ ] `secondary-tab.css` — `.secondary-tab` (inactif ; `hover-overlay` au survol : 4,04:1)
- [ ] `calendar-month.css` — `.date-picker__day--in-range.date-picker__day--outside` (sur `surface-alt` : **4,00:1**)
- [ ] `chart-frame.css` — `.chart-legend__item[aria-pressed="false"]` (série masquée : l'état est aussi porté par `aria-pressed`)
- [ ] `pagination.css` — `.pagination__ellipsis` (« … » décoratif ; défendable en `aria-hidden` plutôt qu'en contraste)

## Hors périmètre (usages légitimes d'`icon-muted`)

Icônes, chevrons et poignées : 3:1 suffit pour les composants graphiques
(WCAG 1.4.11), et `#69797d` le respecte partout. À ne **pas** toucher :
`accordion__chevron`, `autocomplete__value-icon`/`__chevron`,
`badge__drag-handle`, `column-manager__move`/`__handle`,
`date-range-picker__icon`, `dropdown__trigger-icon`/`__chevron`,
`file-upload__zone-icon`/`__dismiss`/`__glyph-bottom`, `scope-picker__field svg`,
`search-input__icon`, `tree-view__twisty`/`__icon`.

Cas limite : `search-input.css` `.search-input__input::placeholder` utilise
`icon-muted`, alors qu'il existe un token `--cadence-color-placeholder`
(`#737373`, 4,74:1 sur blanc). C'est une incohérence de token plutôt qu'un échec
AA : à aligner en passant.

## Règle et garde-fou proposés

- `icon-muted` reste **réservé aux icônes** (`color` d'un SVG en
  `currentColor`, `fill`/`stroke` de pictos), jamais au texte.
- Option : un test `icon-muted-text-usage.test.ts` sur le modèle de
  `deprecated-api-usage.test.ts`, qui lit `src/components/*.css` et refuse
  `color: var(--cadence-color-icon-muted` (et `fill` sur une classe `*label*`)
  hors d'une liste blanche de sélecteurs d'icônes. À activer **après** la
  correction 0.8.5, pour verrouiller le résultat.

## Méthode

Recensement : tous les `color:`/`fill:` sur `--cadence-color-icon-muted` dans
`src/components/*.css`, puis tri icône / texte en lisant chaque sélecteur. Fonds
lus dans les CSS des composants (`background`) et dans `tokens.css`. Ratios
calculés avec la formule de luminance relative WCAG 2.x (même calcul que
`contrastRatio` de `line-badge-utils.ts`).
