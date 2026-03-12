import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    rollupOptions: {
      // @revenuecat/purchases-capacitor solo existe en builds nativos (iOS/Android).
      // En web se importa dinámicamente dentro de un try/catch que nunca se ejecuta
      // porque isNative=false. Externalizamos para que Rollup no intente resolverlo.
      external: ['@revenuecat/purchases-capacitor'],
    },
  },
});

