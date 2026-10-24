/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Le nom du paquet pointe vers les sources (comme `paths` dans tsconfig.app.json) :
      // les gabarits de src/patterns s'importent ainsi, sans dépendre d'un dist/ construit
      { find: /^@ddaoellena\/cadence-ui$/, replacement: path.resolve(dirname, './src/components/index.ts') },
      // Allows both "src/components" and "src/components/" (trailing slash)
      { find: /^src\/components\/?$/, replacement: path.resolve(dirname, './src/components/index.ts') },
      { find: /^src\//, replacement: path.resolve(dirname, './src/') },
    ],
  },
  test: {
    projects: [{
      // Tests unitaires des fonctions pures (sans DOM) : src/**/*.test.ts
      extends: true,
      test: {
        name: 'unit',
        environment: 'node',
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.mjs'],
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});