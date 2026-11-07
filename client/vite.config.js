import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api calls to the local backend during development
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  // The backend serves this folder as static files
  build: { outDir: 'build' },
})
