# Guide utilisateur — Hove Cadence UI

> **Design system Hove** — composants React, guidelines typographiques et serveur MCP pour le vibe-coding.

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Prérequis](#2-prérequis)
3. [Installation dans ton projet](#3-installation-dans-ton-projet)
4. [Lancer le serveur MCP](#4-lancer-le-serveur-mcp)
5. [Configurer ton outil IA](#5-configurer-ton-outil-ia)
6. [Utiliser les composants](#6-utiliser-les-composants)
7. [Catalogue des composants](#7-catalogue-des-composants)
8. [Typographie](#8-typographie)
9. [Tokens de style](#9-tokens-de-style)
10. [Vibe-coding — workflow recommandé](#10-vibe-coding--workflow-recommandé)
11. [FAQ](#11-faq)

---

## 1. Vue d'ensemble

Le design system Hove Cadence UI se compose de deux packages npm :

| Package | Rôle |
|---|---|
| `@hove/cadence-ui` | Composants React + CSS — à installer dans ton app |
| `@hove/cadence-ui-storybook` | Storybook + serveur MCP — pour le vibe-coding avec l'IA |

```
ton-projet/
├── .mcp.json                  ← config MCP (créé à l'étape 5)
├── CLAUDE.md                  ← prompt IA (fourni dans ce package)
└── src/
    └── ton-code.tsx           ← importe depuis hove-cadence-ui
```

---

## 2. Prérequis

- **Node.js** ≥ 20
- **npm** / **pnpm** / **yarn**
- Un outil IA compatible MCP : [Claude Code](https://claude.ai/code), Cursor, Windsurf…

---

## 3. Installation dans ton projet

### 3.1 Installer les composants

```bash
npm install @hove/cadence-ui
# ou
pnpm add @hove/cadence-ui
```

### 3.2 Importer le CSS global

Dans le point d'entrée de ton application (ex : `main.tsx`, `layout.tsx`) :

```tsx
import "@hove/cadence-ui/style.css";
```

> ⚠️ Ce fichier ne doit être importé **qu'une seule fois**. Il contient tous les styles des composants.

### 3.3 Importer les composants

```tsx
import {
  PrimaryButton,
  TextInput,
  Dropdown,
  Sidebar,
} from "@hove/cadence-ui";
```

---

## 4. Lancer le serveur MCP

Le serveur MCP expose la documentation des composants à ton outil IA en temps réel.

### 4.1 Installer le package Storybook

```bash
# En global (recommandé)
npm install -g @hove/cadence-ui-storybook

# ou en dépendance de développement
npm install -D @hove/cadence-ui-storybook
```

### 4.2 Démarrer le serveur

```bash
hove-cadence
```

Tu verras dans le terminal :

```
┌─────────────────────────────────────────────────────────┐
│           Hove Cadence UI — Design System MCP           │
└─────────────────────────────────────────────────────────┘

 Storybook démarre sur http://localhost:6006
 Serveur MCP disponible sur http://localhost:6006/mcp
 ...
```

> Laisse ce terminal ouvert pendant toute ta session de développement.

**Changer le port :**
```bash
PORT=7007 hove-cadence
```

---

## 5. Configurer ton outil IA

### Claude Code

Crée un fichier `.mcp.json` à la **racine de ton projet** :

```json
{
  "mcpServers": {
    "hove-cadence-ui": {
      "url": "http://localhost:6006/mcp",
      "type": "http"
    }
  }
}
```

Puis crée un `CLAUDE.md` à la racine (copie le contenu de `PROMPT.md` fourni dans ce package).  
Lance Claude Code avec `claude` dans le terminal — il détecte automatiquement ces deux fichiers.

### Cursor

1. `Cursor > Settings > Rules for AI`
2. Colle le contenu de `PROMPT.md`
3. Dans `.cursor/mcp.json`, ajoute la même configuration que `.mcp.json` ci-dessus

### Windsurf / Codeium

1. `Settings > AI Rules` → colle le contenu de `PROMPT.md`
2. Paramétrage MCP selon la documentation de ton outil

---

## 6. Utiliser les composants

### Exemple minimal

```tsx
import "@hove/cadence-ui/style.css";
import { PrimaryButton, TextInput } from "@hove/cadence-ui";

export default function LoginForm() {
  return (
    <form>
      <TextInput label="Email" placeholder="tu@hove.com" />
      <TextInput label="Mot de passe" type="password" />
      <PrimaryButton label="Se connecter" />
    </form>
  );
}
```

### Exemple avec Sidebar + Header

```tsx
import "@hove/cadence-ui/style.css";
import { Sidebar, Header, Dropdown, Avatar } from "@hove/cadence-ui";

export default function AppLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        product="datahub"
        clientName="Bordeaux Métropole"
        sections={[/* ... */]}
        onNavigate={(id) => console.log(id)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header
          leftContent={
            <Dropdown
              options={[
                { id: "bdx", label: "Bordeaux Métropole" },
                { id: "lyon", label: "Métropole de Lyon" },
              ]}
              value="bdx"
            />
          }
          rightContent={
            <Avatar
              name="Hector Malot"
              email="hector.malot@hove.com"
              showIcon
              showProfile
              size="sm"
              color="gray"
            />
          }
        />

        <main style={{ padding: 32 }}>
          {/* contenu */}
        </main>
      </div>
    </div>
  );
}
```

---

## 7. Catalogue des composants

### Actions

| Composant | Import | Props clés |
|---|---|---|
| `PrimaryButton` | `{ PrimaryButton }` | `label`, `variant`, `disabled`, `onClick` |
| `SecondaryButton` | `{ SecondaryButton }` | `label`, `variant`, `disabled`, `onClick` |
| `Link` | `{ Link }` | `children`, `href`, `variant`, `icon`, `external`, `disabled` |
| `Toggle` | `{ Toggle }` | `checked`, `onChange`, `disabled` |
| `Checkbox` | `{ Checkbox }` | `checked`, `indeterminate`, `onChange`, `disabled` |
| `RadioButton` | `{ RadioButton }` | `checked`, `onChange`, `disabled` |
| `RichRadioButton` | `{ RichRadioButton }` | `label`, `icon`, `selected`, `onChange` |

### Saisie

| Composant | Import | Props clés |
|---|---|---|
| `TextInput` | `{ TextInput }` | `label`, `value`, `placeholder`, `state`, `helper`, `onChange` |
| `Dropdown` | `{ Dropdown }` | `options`, `value`, `placeholder`, `disabled`, `onChange` |
| `DatePicker` | `{ DatePicker }` | `value`, `onChange`, `disabled` |
| `SegmentedControl` | `{ SegmentedControl }` | `options`, `value`, `onChange` |
| `SegmentedControlAlt` | `{ SegmentedControlAlt }` | `options`, `value`, `onChange` |

### Navigation

| Composant | Import | Props clés |
|---|---|---|
| `Sidebar` | `{ Sidebar }` | `product`, `clientName`, `sections`, `onNavigate` |
| `Header` | `{ Header }` | `leftContent`, `logo`, `navItems`, `rightContent` |
| `Breadcrumbs` | `{ Breadcrumbs }` | `items`, `separator`, `onNavigate` |
| `NavigationDropdown` | `{ NavigationDropdown }` | `label`, `items`, `align`, `onSelect` |
| `Tab` | `{ Tab }` | `label`, `active`, `onClick` |

### Feedback

| Composant | Import | Props clés |
|---|---|---|
| `AlertToast` | `{ AlertToast }` | `title`, `description`, `variant`, `onClose` |
| `Tooltip` | `{ Tooltip }` | `label`, `arrowPosition`, `theme` |
| `TooltipTrigger` | `{ TooltipTrigger }` | `tooltip`, `children` |

### Affichage

| Composant | Import | Props clés |
|---|---|---|
| `Avatar` | `{ Avatar }` | `name`, `src`, `size`, `color`, `showIcon`, `showProfile`, `email` |
| `DataVisualization` | `{ DataVisualization }` | `data`, `type` |
| `Icons` | `{ Icons }` | — |

---

## 8. Typographie

### Polices

| Police | Usage | Chargement |
|---|---|---|
| **Uxum Grotesque** | Titres de page | Fichiers `.otf` locaux (`/fonts/`) |
| **Inter** | Corps, labels, navigation, UI | Google Fonts |
| **Spline Sans Mono** | Tags techniques, noms de colonnes | Google Fonts |

### Import Google Fonts (dans `index.html`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Spline+Sans+Mono:wght@400;600;700&display=swap"
  rel="stylesheet"
/>
```

### Import Uxum Grotesque (dans ton CSS global)

```css
@font-face {
  font-family: "Uxum Grotesque";
  src: url("/fonts/UxumGrotesque-Medium.otf") format("opentype");
  font-weight: 500;
}
```

### Hiérarchie

| Style | Police | Taille | Poids | Couleur |
|---|---|---|---|---|
| Titre de page | Uxum Grotesque | 28px | 500 | `#002830` |
| Titre de section | Inter | 13px | 600 uppercase | `#1a1a2e` |
| Label de champ | Inter | 12px | 500 | `#374151` |
| Corps | Inter | 12px | 400 | `#888` |
| NavigationDropdown | Inter | 14px | — | — |
| Tag technique | Spline Sans Mono | 11px | 700 | — |

---

## 9. Tokens de style

Ces valeurs s'appliquent quand tu crées des composants custom en dehors du design system.

### Dimensions

```css
/* Champs de saisie */
height: 40px;
padding: 0 20px;
border-radius: 10px;

/* Menus, options */
border-radius: 8px;
```

### Couleurs

```css
/* Bordures de champ */
border: 1px solid #e5e5e5;          /* défaut */
border: 1.5px solid #2d5f6b;        /* focus / actif */

/* Backgrounds */
background-color: #ffffff;          /* champ normal */
background-color: #e5e5e5;          /* champ désactivé */

/* Focus halo */
box-shadow: 0 0 0 4px rgba(45, 95, 107, 0.12);

/* Texte désactivé */
color: #808080;
```

### Ombres

```css
/* Champ normal */
box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.06),
            0px 1px 2px rgba(0, 0, 0, 0.04);

/* Champ hover */
box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.08),
            0px 0px 2px rgba(0, 0, 0, 0.25);
```

### Transitions

```css
transition: border-color 120ms ease, box-shadow 120ms ease;
```

### Couleurs typographiques

```css
color: #002830;   /* titre principal */
color: #1a1a2e;   /* texte principal */
color: #555;      /* texte secondaire / breadcrumb courant */
color: #888;      /* placeholder, hint, breadcrumb parent */
color: #bfbfbf;   /* placeholder input */
color: #ccc;      /* séparateur breadcrumb */
```

---

## 10. Vibe-coding — workflow recommandé

```
1. Lancer le serveur MCP
   $ hove-cadence

2. Ouvrir ton projet dans Claude Code
   $ claude

3. Décrire ce que tu veux construire en langage naturel
   "Crée un formulaire de création de scénario avec :
    - un TextInput pour le nom
    - un Dropdown pour choisir le réseau
    - un DatePicker pour la date de début
    - un PrimaryButton 'Créer'"

4. L'IA consulte automatiquement le MCP pour :
   - vérifier les props exactes de chaque composant
   - récupérer les exemples depuis les stories
   - respecter les conventions du design system

5. Vérifier visuellement
   → L'IA fournit les URLs de preview Storybook pour chaque composant utilisé
```

### Ce que l'IA sait faire automatiquement

- ✅ Consulter la doc MCP avant d'utiliser un composant
- ✅ Respecter les props exactes (pas d'invention)
- ✅ Appliquer la typographie correcte (Uxum Grotesque pour les titres)
- ✅ Utiliser les valeurs de style absolues (pas de variables CSS externes)
- ✅ Nommer les classes CSS en BEM

### Ce que tu dois faire

- ✅ Garder le serveur `hove-cadence` actif pendant la session
- ✅ Mentionner les noms exacts des composants quand tu les connais
- ✅ Vérifier les previews Storybook fournis par l'IA

---

## 11. FAQ

**Q : Le serveur MCP ne démarre pas.**  
R : Vérifie que Node.js ≥ 20 est installé (`node --version`). Si le port 6006 est occupé, utilise `PORT=7007 hove-cadence`.

**Q : L'IA n'utilise pas les bons composants.**  
R : Assure-toi que `.mcp.json` est bien à la racine de ton projet ET que le serveur `hove-cadence` tourne. Vérifie avec `curl http://localhost:6006/mcp`.

**Q : Un composant dont j'ai besoin n'existe pas.**  
R : Crée-le dans ton projet en respectant les conventions : BEM, valeurs absolues (pas de variables CSS), Inter comme police. Signale-le à l'équipe design pour l'intégrer au design system.

**Q : Comment mettre à jour les composants ?**  
R : `npm update @hove/cadence-ui && npm update @hove/cadence-ui-storybook`

**Q : Puis-je utiliser uniquement les composants sans le MCP ?**  
R : Oui. Installe seulement `hove-cadence-ui` et importe `hove-cadence-ui/style.css`. Le MCP est uniquement utile pour le vibe-coding avec l'IA.

**Q : Les styles Uxum Grotesque ne s'appliquent pas.**  
R : Les fichiers de police `.otf` doivent être servis depuis `/fonts/` dans ton projet. Copie-les dans `public/fonts/` et ajoute les `@font-face` dans ton CSS global.
