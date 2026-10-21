# Proposition — onglets accessibles : `TabList`

Statut : **à valider** (phase 0 de `fix/a11y-and-0.4.0`). Rien n'est implémenté.

## Constat

`Tab` et `SecondaryTab` rendent chacun un `<button role="tab" aria-selected>` isolé :

- aucun conteneur `role="tablist"` : un `role="tab"` hors d'un `tablist` est invalide (axe : `aria-required-parent`) ;
- pas de lien onglet ↔ panneau (`aria-controls` / `role="tabpanel"` / `aria-labelledby`) ;
- pas de navigation aux flèches ;
- tous les onglets sont dans l'ordre de tabulation (Tab traverse chaque onglet).

## API proposée

### `TabList` (nouveau, exporté)

```tsx
<TabList aria-label="État des scénarios">
  <Tab label="En cours" variant="active" id="tab-current" controls="panel-current" onClick={…} />
  <Tab label="À venir" id="tab-upcoming" controls="panel-upcoming" onClick={…} />
</TabList>

<div role="tabpanel" id="panel-current" aria-labelledby="tab-current" tabIndex={0}>…</div>
```

| Prop | Type | Défaut | Description |
|---|---|---|---|
| `aria-label` | `string` | **requis** (typé) | Nom de la rangée d'onglets, annoncé à l'entrée dans la liste |
| `level` | `"primary" \| "secondary"` | `"primary"` | Écart entre onglets : `primary` 16px (rangée de `Tab`), `secondary` 4px (rangée de `SecondaryTab`) |
| `activation` | `"automatic" \| "manual"` | `"automatic"` | Voir ci-dessous |
| `children` | `ReactNode` | **requis** | Des `Tab` ou des `SecondaryTab` |
| `className` | `string` | — | — |

Rendu : `<div role="tablist" aria-label aria-orientation="horizontal" class="tab-list tab-list--primary">`.

**`level` explicite plutôt que déduit des enfants.** Déduire le niveau en inspectant le type des enfants (`child.type === SecondaryTab`) casse dès qu'un onglet est enveloppé (fragment, composant applicatif, `map` dans un composant) et ne fonctionne pas avec un rendu conditionnel. Une prop explicite, avec `primary` par défaut, est plus prévisible ; elle ne règle que l'écart, les onglets gardent leur propre style.

### Clavier (*roving tabindex*)

- Seul l'onglet actif (`variant="active"`) a `tabIndex={0}` ; les autres `-1`. Sans onglet actif, le premier onglet activable reçoit le `0`. **Tab** entre dans la rangée sur l'onglet actif puis en sort vers le panneau.
- **← / →** : onglet précédent / suivant, en boucle (du dernier au premier).
- **Début / Fin** : premier / dernier onglet.
- Les onglets `disabled` sont sautés.
- Pas de ↑ / ↓ (rangée horizontale, `aria-orientation="horizontal"`).

### Activation : automatique par défaut

En activation **automatique**, déplacer le focus avec les flèches active l'onglet (le `TabList` déclenche son `onClick`). En **manuelle**, les flèches ne déplacent que le focus ; Entrée ou Espace activent.

Choix : **automatique par défaut**. Nos onglets filtrent une liste déjà chargée côté client (« En cours », « À venir », « Passées ») : le changement de panneau est immédiat, et l'activation automatique évite un appui de plus à chaque onglet — c'est la recommandation de l'APG WAI-ARIA quand l'affichage du panneau est instantané. `activation="manual"` reste disponible pour un panneau coûteux (requête réseau, graphique lourd), où parcourir les onglets ne doit pas lancer un chargement à chaque flèche.

### `Tab` et `SecondaryTab` : nouvelles props optionnelles

| Prop | Type | Description |
|---|---|---|
| `id` | `string` | `id` du `<button role="tab">` — cible de `aria-labelledby` côté panneau |
| `controls` | `string` | `id` du panneau → `aria-controls` |

Le panneau reste écrit par l'app (`role="tabpanel"`, `id`, `aria-labelledby`, `tabIndex={0}`) : pas de composant `TabPanel` en 0.4.0, pour ne pas imposer de structure de contenu. À rediscuter si le besoin se répète.

### Avertissement en développement

`Tab` et `SecondaryTab` lisent un contexte fourni par `TabList`. Hors `TabList`, ils s'affichent comme aujourd'hui et émettent **une fois par composant** (comme `checkButtonContent` pour les boutons) :

```
[cadence-ui] <Tab> rendu hors d'un <TabList> : role="tab" exige un conteneur role="tablist".
Enveloppez la rangée : <TabList aria-label="…">…</TabList>.
```

Silencieux en production (`process.env.NODE_ENV`).

## Compatibilité

- Rien de cassé en 0.4.0 : un `Tab` hors `TabList` garde son rendu et son comportement actuels ; seul l'avertissement s'ajoute.
- Le `TabList` fournit l'écart entre onglets : les `<div style={{ display: "flex", gap }}>` des exemples sont remplacés par `TabList` (stories, `GUIDELINES.md`, MDX). Les écarts actuels, hétérogènes (4, 16, 24px), sont alignés sur 16px (`primary`) et 4px (`secondary`).
- Suppression possible de l'usage hors `TabList` en 1.0.0 (à décider plus tard).

## Tests prévus (Vitest + play)

- `role="tablist"` + `aria-label` ; `aria-selected` sur l'actif.
- *Roving tabindex* : un seul `tabIndex=0`, sur l'actif ; sur le premier sans actif.
- ←/→ avec boucle, Début / Fin, onglets désactivés sautés.
- Automatique : la flèche appelle `onClick` ; manuelle : non, Entrée oui.
- `id` / `controls` → `id` / `aria-controls`.
- Avertissement hors `TabList` (une fois), absent dans un `TabList`.

## Points à valider

1. Nom `TabList` et prop `level` explicite (défaut `primary`).
2. Activation automatique par défaut, `manual` en option.
3. Écarts fournis par `TabList` : 16px / 4px.
4. Pas de `TabPanel` en 0.4.0.
