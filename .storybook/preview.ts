import type { Preview } from '@storybook/react-vite'
import '../src/components/tokens.css'

// ── Focus et fonctions play dans l'interface Storybook ──────────────────────
// Le play d'une story s'exécute à chaque ouverture (Tab, clics, focus) : il
// attire le focus dans le canevas et l'arrache à la barre latérale. Hors
// test, on mémorise l'élément focalisé côté interface avant la story, puis on
// le rend après le play. Les tests (Vitest, test-runner) ne sont pas concernés.
const isTestEnvironment = () =>
  Boolean((globalThis as { __vitest_browser__?: unknown }).__vitest_browser__) ||
  /StorybookTestRunner/.test(globalThis.navigator?.userAgent ?? '')

// Document de l'interface (manager) : même origine que le canevas
const managerDocument = (): Document | null => {
  try {
    return window.parent !== window ? window.parent.document : null
  } catch {
    return null
  }
}

let focusBeforeStory: HTMLElement | null = null

const preview: Preview = {
  beforeEach: ({ viewMode }) => {
    focusBeforeStory = null
    if (isTestEnvironment() || viewMode !== 'story') return
    // Élément d'un autre document : pas d'instanceof (autre contexte JS)
    const active = managerDocument()?.activeElement as HTMLElement | null | undefined
    // Focus déjà dans le canevas (iframe) ou nulle part : rien à rendre
    if (active && typeof active.focus === 'function' && active.tagName !== 'IFRAME' && active.tagName !== 'BODY') focusBeforeStory = active
  },
  afterEach: ({ id, viewMode }) => {
    const before = focusBeforeStory
    focusBeforeStory = null
    const manager = managerDocument()
    if (isTestEnvironment() || viewMode !== 'story' || !before || !manager) return
    // Le play n'a pas emmené le focus dans le canevas : rien à faire
    if (manager.activeElement?.tagName !== 'IFRAME') return
    if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) document.activeElement.blur()
    // Depuis la barre latérale : focus sur le lien de la story ouverte (ses
    // flèches repartent de là) ; sinon, l'élément d'origine.
    const storyLink = manager.getElementById(id) as HTMLElement | null
    const target = storyLink && before.closest('nav, [role="navigation"], #storybook-explorer-tree') ? storyLink : before
    if (target.isConnected) target.focus({ preventScroll: true })
  },
  parameters: {
    // Ordre du menu : fondations, composants par catégorie, page patterns, recettes.
    options: {
      storySort: {
        order: [
          'Configure your project',
          'Foundation',
          ['Couleurs', 'Typography', 'Tokens', 'Hauteurs de contrôle', 'Guidelines'],
          'Composants',
          [
            'Actions',
            'Formulaires',
            'Navigation',
            'Structure et mise en page',
            'Données et tableaux',
            'Visualisation de données',
            'Retours et statuts',
            'Surcouches',
            'Transport',
            'Médias et icônes',
          ],
          'Page patterns',
          'Recettes',
        ],
      },
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error'
    }
  },
};

export default preview;