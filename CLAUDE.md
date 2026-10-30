# Hove Cadence UI — contexte projet

Design system React publié sur npm sous `@ddaoellena/cadence-ui`.
Repo local : /Users/ddao-ellena/hove-cadence-ui

## À lire en premier
`GUIDELINES.md` est la source de vérité (composants, props, tokens, règles). Lis-le au début de chaque session. Si une info manque, demande — n'invente pas de prop ni de composant.

Pour reprendre le travail en cours, lire aussi [`docs/HANDOFF.md`](docs/HANDOFF.md) : état local non commité, décisions, résultats de tests et limites connues.

## Stack
React 19 · TypeScript ~6 (strict) · Vite 8 · Storybook 10 (`@storybook/react-vite`). Icônes : `@untitledui/icons` (SVG inline).

## Conventions
- Fichiers plats dans `src/components/` : pour `Foo` → `Foo.tsx`, `foo.css` (kebab-case), `Foo.stories.tsx`, puis export dans `index.ts`.
- CSS autonome : chaque composant importe son seul `.css`. BEM-like (`.foo`, `.foo__el`, `.foo--mod`).
- Couleurs/polices/tailles de texte/graisses : toujours via tokens avec fallback — `var(--cadence-color-primary, #002830)`, jamais de hex nu. Tokens dans `tokens.css`.
- `Checkbox`/`Toggle`/`RadioButton`/`RichCheckbox`/`RichRadioButton` se pilotent par la prop `state`, jamais `checked`.
- Icônes via `<Icons icon="…" size={…} />` (suit `currentColor`). Nouvelle icône → entrée dans `icon-registry.ts` (kebab → composant PascalCase). Jamais d'URL distante.
- Couches : Core ← DataViz ← Domain (`docs/proposals/refactoring-v2.md`). Core n'importe ni le transport ni d3 ; nouveau composant métier ou graphique → l'ajouter à `couches.test.ts`.
- Libellés FR accentués en UTF-8 (« Créer », « Sévérité »…), jamais d'ASCII aplati. Commentaires en français.

## Ajouter / modifier un composant
1. Les 3 fichiers, en réutilisant composants et tokens existants.
   Titre de la story : `Composants/<Catégorie>/<Nom>`, catégorie prise dans la liste de `.storybook/preview.ts` (Actions, Formulaires, Navigation, Structure et mise en page, Données et tableaux, Visualisation de données, Retours et statuts, Surcouches, Transport, Médias et icônes). Un test le vérifie.
2. Export dans `index.ts`.
3. Mettre à jour `GUIDELINES.md` : table « Intention → composant », section de domaine, et fiche API (toutes les props, défauts, pièges ⚠️).

## Vérifier
- `npx tsc -b --noEmit`
- `npm run build:lib`  (⚠️ build de la LIB ; `npm run build` est l'app démo et écrase `dist/`)
- `npx eslint <fichiers touchés>`  (le lint global est bruité par `storybook-static/` et les stories générées — ne juge que les fichiers touchés)
- Aucune URL `animaapp` ne doit subsister.

## Git & publication
- Toujours une branche dédiée (`feat/…`), jamais `main` directement sans accord.
- Ne jamais publier sur npm sans demande explicite. Avant un publish : `npm version …`, puis `npm run build:lib` (car `dist/` peut avoir été écrasé par le build app), vérifier `dist/hove-cadence-ui.js/.cjs` + `index.d.ts` / `index.d.cts` (déclarations regroupées par `build:types`), puis `npm run check:types`.

## Pièges connus
- `npm install` exige `--legacy-peer-deps` (conflit préexistant sur `@storybook/addon-a11y`).
- `@untitledui/icons` doit rester externe au bundle (configuré dans `vite.config.lib.ts`).
- `dist/` ESM est en un fichier par module (`preserveModules`) pour le tree-shaking ; `hove-cadence-ui.js` n'est que le point d'entrée. CommonJS reste en un seul fichier : `preserveModules` y casse des `require` au nettoyage CSS de Vite.
- Un seul gestionnaire : npm (`package-lock.json`), en local comme sur Vercel (`npm ci --legacy-peer-deps`). ⚠️ `npm ci` échoue si `package-lock.json` n'est pas synchronisé avec `package.json` : toujours commiter les deux ensemble. Pas de `pnpm-lock.yaml`.
- Vercel : un seul projet, `hove-cadence-ui` (lié localement via `.vercel/repo.json`). Chaque push sur une branche avec PR déclenche un déploiement preview du Storybook ; chaque push sur `main`, la production (https://hove-cadence-ui.vercel.app). `hove-cadence-ui-test` est déconnecté de Git.
