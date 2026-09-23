import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the build works on GitHub Pages under /<repo-name>/
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
