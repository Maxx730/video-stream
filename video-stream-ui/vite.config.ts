/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      // Mirrors the /highscores/ location in nginx.conf
      '/highscores': {
        target: 'http://navalblitz.cepholotech.com:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/highscores\/?/, '/scores'),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
