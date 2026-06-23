import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    target: 'esnext',
  },
  plugins: [cesium()],

  worker: {
    format: 'es',
  },

  optimizeDeps: {
    exclude: ['@ionic/core'],
  },
});
