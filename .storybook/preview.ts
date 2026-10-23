import type { Preview } from '@storybook/react-vite'
import '../src/components/tokens.css'

const preview: Preview = {
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