import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH permite desplegar en GitHub Pages (por ejemplo, BASE_PATH=/laser-idit/).
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  test: {
    include: ['src/**/*.test.js'],
  },
})
