import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  // Rutas relativas: el build funciona igual en GitHub Pages que abierto en local.
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    // Los tests cubren solo la lógica pura (logic.ts), no la UI.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
