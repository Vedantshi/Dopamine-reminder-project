import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use relative asset paths so the production build works when served from
// different origins or subpaths (fixes blank-page issues caused by absolute
// "/assets/..." references on some hosts).
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    // Use a fixed dev server port and fail if it's already in use. This
    // prevents Vite from automatically choosing a different port each run
    // which can cause localStorage to appear empty when you open a different origin.
    port: 5173,
    strictPort: true,
  },
})
