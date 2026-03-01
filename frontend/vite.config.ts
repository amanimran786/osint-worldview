import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          state: ['zustand', 'axios'],
          ui: ['lucide-react', 'clsx', 'date-fns'],
        },
      },
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Target modern browsers
    target: 'es2020',
  },
});
