import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3940,
    proxy: {
      '/api': 'http://localhost:3939',
      '/ws': {
        target: 'ws://localhost:3939',
        ws: true,
      },
    },
  },
});
