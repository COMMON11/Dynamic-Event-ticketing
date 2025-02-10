import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080/CA-2', // Replace with your Glassfish server's base URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
