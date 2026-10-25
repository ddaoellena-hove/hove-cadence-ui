# Hove Cadence UI

Design system React pour les produits Hove (transport public), distribué sous `@ddaoellena/cadence-ui`. Les composants, leurs états et les parcours métier sont présentés dans Storybook.

## Utiliser la bibliothèque

```bash
npm install @ddaoellena/cadence-ui
```

```tsx
import { PrimaryButton, TextInput } from '@ddaoellena/cadence-ui';
import '@ddaoellena/cadence-ui/style.css';
```

React et React DOM 18 ou 19 sont requis. Charger les polices décrites dans [GUIDELINES.md](GUIDELINES.md) : Inter, Space Grotesk (repli de la police commerciale Uxum Grotesque) et Spline Sans Mono.

## Reprendre le projet

Pour passer le relais à un développeur ou à un autre LLM, commencer par [le document de reprise](docs/HANDOFF.md) : état local, décisions, validations et étapes restantes.

## Développer

```bash
npm ci --legacy-peer-deps
npm run storybook
```

Storybook est servi sur le port 6006. Il constitue la vitrine principale ; `npm run dev` lance encore le squelette Vite de démonstration.

| Commande | Usage |
|---|---|
| `npm run test:unit` | Tests des utilitaires et contrats |
| `npm test` | Tests unitaires et stories dans Chromium via Playwright |
| `npx tsc -b --noEmit` | Vérification TypeScript de l'application et des stories |
| `npm run build:lib` | Bundles ESM/CommonJS, styles et déclarations TypeScript dans `dist/` |
| `npm run build-storybook` | Catalogue statique dans `storybook-static/` |
| `npm run lint` | ESLint ; certains avertissements historiques sont connus |

⚠️ `npm run build` construit l'app Vite et écrase `dist/` : relancer `build:lib` avant de préparer un paquet. Les tests navigateur nécessitent Chromium Playwright (`npx playwright install chromium` si absent).

## Organisation

- `src/components/` : composants, CSS, stories, utilitaires et tests. `index.ts` définit l'API exportée ; `tokens.css` centralise le thème.
- `src/stories/` : fondations, règles d'usage et compositions métier avec données locales.
- `.storybook/` : configuration, accessibilité et documentation.
- `docs/proposals/` : propositions historiques et arbitrages ; se référer aux guidelines pour l'API actuelle.
- `docs/audits/` : constats, corrections et limites des audits.
- `scripts/codemods/` : migration de l'API des boutons.
- `storybook-package/` : paquet compagnon distinct pour lancer le catalogue et les outils MCP.

## Parcours de référence

Dans Storybook, rubrique **Page patterns** : onze gabarits de page vérifiés (coque d'application, liste, liste + détail latéral, détail, formulaire, assistant d'import, supervision, analyse, planification, paramètres, états de page), avec leur documentation. Les anciennes stories `Recettes/*` ont été retirées en 1.0.0 ; la page *Recettes / Vers les Page patterns* donne la correspondance.

## Contribuer et livrer

Lire [GUIDELINES.md](GUIDELINES.md), source de vérité pour les API et les règles visuelles. Un composant comporte son `.tsx`, son CSS, ses stories et un export ; mettre à jour les guidelines et le [changelog](CHANGELOG.md) à chaque évolution.

Réutiliser les tokens et les composants existants. Les couleurs GTFS de `LineBadge` sont une exception métier documentée. `Autocomplete` couvre déjà la recherche avec sélection multiple et groupes.

La configuration Vercel construit Storybook. La version courante du manifeste est `1.0.0`, non publiée (dernière version sur npm : 0.1.6) ; le guide de migration 0.x → 1.0 est en tête du [changelog](CHANGELOG.md). La publication npm reste une action explicite, précédée d'une décision de version et d'un build de la bibliothèque.


## Compléments avant 1.0

`ErrorSummary` harmonise les erreurs de soumission et l'accès aux champs ; `DescriptionList` les métadonnées et synthèses ; `ActivityFeed` les historiques datés ; `TimePicker` les heures seules, avec un mode après minuit. Les quatre disposent de stories, de tests et d'une fiche API dans les guidelines. Voir [le lot avant 1.0](docs/proposals/pre-1.0-complements.md) pour le périmètre et les limites.
