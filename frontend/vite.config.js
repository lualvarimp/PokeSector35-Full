import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Base necesaria para que el build funcione en /pokesector35/
  // Todos los assets (JS, CSS, imágenes) se cargarán desde esa ruta
  base: '/pokesector35/',

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
  },
});