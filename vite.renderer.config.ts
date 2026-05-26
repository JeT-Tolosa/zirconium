import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    target: 'esnext',
  },
  plugins: [cesium()],

  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
