import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


export default defineConfig({
  // App is served from its own subdomain, so assets live at the domain root.
  // Set VITE_BASE=/notepaperai/ only if you serve it from a subfolder.
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    historyApiFallback: true,
  },
})
