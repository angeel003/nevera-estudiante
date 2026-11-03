import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: (process.env.CF_PAGES || process.env.VERCEL) ? '/' : (process.env.GITHUB_ACTIONS ? '/nevera-estudiante/' : './'),
})

