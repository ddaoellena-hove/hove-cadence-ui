# Prompt — Hove Cadence UI Design System

> Copie ce prompt dans ton `CLAUDE.md`, dans les instructions système de ton outil IA,  
> ou colle-le directement en début de session.

---

```
Tu travailles sur une application web utilisant le design system Hove Cadence UI.

## Design system

Le design system expose un serveur MCP à http://localhost:6006/mcp.
Utilise TOUJOURS les outils MCP disponibles avant de créer ou modifier un composant UI :
- list-all-documentation — liste tous les composants disponibles
- get-documentation — récupère les props, variantes et exemples d'un composant
- preview-stories — obtient l'URL de preview d'une story

Ne jamais inventer des props ou variantes qui n'existent pas dans la documentation.
Si un composant n'existe pas dans le design system, crée-le en respectant les conventions ci-dessous.

## Import

Tous les composants s'importent depuis le package `hove-cadence-ui` :

import { PrimaryButton, TextInput, Dropdown } from "@ddaoellena/cadence-ui";
import "@ddaoellena/cadence-ui/style.css"; // à inclure une seule fois dans le point d'entrée

## Typographie

- Titres de page : font-family "Uxum Grotesque", font-size 28px, font-weight 500, color #002830
- Corps / labels / navigation : font-family "Inter", Helvetica, sans-serif
- Tags techniques (noms de colonnes) : font-family "Spline Sans Mono", monospace

Ne jamais surcharger la font-family des composants du design system.

## Couleurs typographiques

- Titre principal : #002830
- Texte principal : #1a1a2e
- Texte secondaire : #555
- Placeholder / hint : #888
- Breadcrumb parent : #888 | Breadcrumb courant : #555
- Séparateur breadcrumb : #ccc

## Conventions de style

- border-radius standard : 10px (inputs, cards) — 8px (menus, options)
- Hauteur des champs (inputs, dropdowns) : 40px
- Padding horizontal des champs : 0 20px
- Couleur de focus/active : #2d5f6b avec halo rgba(45, 95, 107, 0.12)
- Transition standard : 120ms ease
- Ombre de champ (état normal) : 0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px rgba(0,0,0,0.04)
- Ombre de champ (hover) : 0px 0px 12px rgba(0,0,0,0.08), 0px 0px 2px rgba(0,0,0,0.25)

## Composants disponibles

AlertToast, Avatar, Breadcrumbs, Checkbox, DataVisualization, DatePicker,
Dropdown, Header, Icons, Link, NavigationDropdown, PrimaryButton, RadioButton,
RichRadioButton, SecondaryButton, SegmentedControl, SegmentedControlAlt,
Sidebar, Tab, TextInput, Toggle, Tooltip, TooltipTrigger

## Règles de développement

1. Consulter la doc MCP avant d'utiliser un composant (props exactes, variantes).
2. Préférer les composants existants plutôt que du HTML brut.
3. Ne jamais utiliser de variables CSS externes (ex: var(--some-token)) — utiliser des valeurs absolues.
4. Ne jamais ajouter de style inline sauf pour des valeurs dynamiques.
5. Nommer les classes CSS en BEM : .block__element--modifier.
6. Ne pas dupliquer des styles déjà couverts par le design system.
```
