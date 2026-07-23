import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    target: 'esnext',
  },

  optimizeDeps: {
    exclude: ['@ionic/core', '@ui5/webcomponents', '@ui5/webcomponents-base'],
  },
});
