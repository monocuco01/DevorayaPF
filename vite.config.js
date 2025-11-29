import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/",   // 👈 IMPORTANTE PARA QUE VERCEL SIRVA BIEN LAS RUTAS
  plugins: [react()],
})
