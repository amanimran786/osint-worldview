import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          state: ['zustand'],
          ui: ['lucide-react', 'clsx', 'date-fns'],
          charts: ['recharts'],
          map: ['leaflet', 'react-leaflet'],
          globe: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
    sourcemap: true,
    target: 'es2020',
  },
});
