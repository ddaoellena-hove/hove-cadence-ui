import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: [
      { find: /^src\/components\/?$/, replacement: path.resolve(dirname, './src/components/index.ts') },
      { find: /^src\//, replacement: path.resolve(dirname, './src/') },
    ],
  },
  // Le dossier public (favicon, icônes de l'app démo) n'a rien à faire dans le paquet npm
  publicDir: false,
  build: {
    lib: {
      entry: path.resolve(dirname, 'src/components/index.ts'),
      name: 'HoveCadenceUI',
      fileName: (format) => `hove-cadence-ui.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // React, les icônes Untitled UI, TanStack et d3 ne doivent pas être inclus dans le bundle
      external: ['react', 'react-dom', 'react/jsx-runtime', /^@untitledui\/icons/, /^@tanstack\//, /^d3-/],
      output: [
        // ESM en un fichier par module : c'est ce qui permet aux produits de n'embarquer que ce qu'ils importent
        {
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: path.resolve(dirname, 'src/components'),
          entryFileNames: ({ name }) => (name === 'index' ? 'hove-cadence-ui.js' : '[name].js'),
          assetFileNames: 'style.css',
        },
        // CommonJS en un seul fichier : ni tree-shaking à préserver, ni require cassés par le nettoyage CSS de Vite
        {
          format: 'cjs',
          exports: 'named',
          entryFileNames: 'hove-cadence-ui.cjs',
          assetFileNames: 'style.css',
        },
      ],
    },
    // Générer les sourcemaps pour faciliter le debug
    sourcemap: true,
    // Ne pas vider dist automatiquement (géré par le script)
    emptyOutDir: true,
  },
});
