# hove-cadence-ui-storybook

Storybook + serveur MCP du design system Hove, pour une utilisation en **vibe-coding** avec Claude Code ou tout autre outil IA compatible MCP.

---

## Installation

```bash
npm install -g hove-cadence-ui-storybook
```

ou en dépendance de développement dans ton projet :

```bash
npm install -D hove-cadence-ui-storybook
```

---

## Utilisation

### 1. Lancer le serveur

```bash
# Installation globale
hove-cadence

# ou via npx
npx hove-cadence

# Port personnalisé
PORT=7007 hove-cadence
```

Le terminal affiche l'URL du serveur MCP à configurer.

### 2. Configurer Claude Code

Ajoute un fichier `.mcp.json` à la racine de ton projet :

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

> Si tu as utilisé un port différent, remplace `6006` par le port choisi.

### 3. Démarrer Claude Code

Lance Claude Code dans ton projet. L'IA a maintenant accès à :
- La liste des composants disponibles
- La documentation et les props de chaque composant
- Les previews des stories
- Les guidelines typographiques du design system

---

## Composants disponibles

| Composant | Description |
|---|---|
| `AlertToast` | Notification avec accent coloré |
| `Avatar` | Cercle avec initiales, image ou icône |
| `Breadcrumbs` | Fil d'Ariane avec séparateur personnalisable |
| `Checkbox` | Case à cocher multi-états |
| `DataVisualization` | Graphiques et visualisations |
| `DatePicker` | Sélecteur de date |
| `Dropdown` | Liste déroulante avec icônes et dividers |
| `Header` | En-tête avec slots gauche/droite |
| `Icons` | Bibliothèque d'icônes SVG |
| `Link` | Lien inline avec variantes et icône |
| `NavigationDropdown` | Menu de navigation flottant |
| `PrimaryButton` | Bouton principal |
| `RadioButton` | Bouton radio |
| `RichRadioButton` | Bouton radio enrichi avec icône |
| `SecondaryButton` | Bouton secondaire |
| `SegmentedControl` | Contrôle segmenté |
| `Sidebar` | Barre latérale avec navigation |
| `Tab` | Onglets |
| `TextInput` | Champ de saisie |
| `Toggle` | Interrupteur |
| `Tooltip` | Info-bulle |

---

## Développement

Pour mettre à jour les sources depuis le repo principal :

```bash
node bin/sync.mjs
```

---

## Typo & design tokens

Le design system utilise :
- **Uxum Grotesque** — Titres de page (28px / 500)
- **Inter** — Corps, labels, navigation
- **Spline Sans Mono** — Tags techniques, colonnes de données
