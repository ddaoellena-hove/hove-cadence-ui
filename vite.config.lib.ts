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
  build: {
    lib: {
      entry: path.resolve(dirname, 'src/components/index.ts'),
      name: 'HoveCadenceUI',
      fileName: (format) => `hove-cadence-ui.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // React ne doit pas être inclus dans le bundle
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        // Préserver les imports CSS dans chaque chunk
        assetFileNames: 'style.css',
      },
    },
    // Générer les sourcemaps pour faciliter le debug
    sourcemap: true,
    // Ne pas vider dist automatiquement (géré par le script)
    emptyOutDir: true,
  },
});
