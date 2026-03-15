import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: {
      // En web, @revenuecat/purchases-capacitor se reemplaza por un stub vacío.
      // En builds nativos (Capacitor), el paquete real está disponible.
      '@revenuecat/purchases-capacitor': path.resolve(
        __dirname,
        'src/stubs/revenuecat-stub.ts'
      ),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      // El alias ya resuelve el paquete; esto es solo por si algún loader lo necesita.
      external: [],
    },
  },
});
