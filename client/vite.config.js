import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://8c1mt1km-5173.uks1.devtunnels.ms/',
        // target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
