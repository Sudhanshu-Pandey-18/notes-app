import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the built files work from any folder
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
