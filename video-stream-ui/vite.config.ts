/// <reference types="vitest" />
import { defineConfig } from 'vite'
import type { Plugin, ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"

const PROD_ORIGIN = 'https://video.clam-tube.com'
const PROD_API_PATHS = ['/channels', '/viewers', '/ping', '/join', '/watch', '/comments', '/account']

// Prod's nginx 301s bare paths to an absolute URL the browser can't follow
// cross-origin, and ?dev=true makes the channels service report no live streams.
const toProdPath = (path: string) => {
  const url = new URL(path, PROD_ORIGIN)
  url.searchParams.delete('dev')
  if (!url.pathname.endsWith('/')) url.pathname += '/'
  return url.pathname + url.search
}

const prodProxy: ProxyOptions = {
  target: PROD_ORIGIN,
  changeOrigin: true,
  rewrite: toProdPath,
}

// Keeps a local session from changing prod: the viewer list, comments and accounts.
const prodReadOnly = (): Plugin => ({
  name: 'prod-read-only',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const path = (req.url ?? '').split('?')[0].replace(/\/$/, '')
      const isApiPath = PROD_API_PATHS.some((p) => path === p || path.startsWith(`${p}/`))
      if (!isApiPath || ['GET', 'HEAD', 'OPTIONS'].includes(req.method ?? '') || path === '/account/login') {
        next()
        return
      }

      res.setHeader('Content-Type', 'application/json')
      if (path === '/join') {
        res.end(JSON.stringify({ success: true }))
      } else if (path === '/watch') {
        const viewers = await fetch(`${PROD_ORIGIN}/viewers/`).then((r) => r.text()).catch(() => '[]')
        res.end(viewers)
      } else {
        res.statusCode = 403
        res.end(JSON.stringify({ error: 'writes to prod are disabled in prod-backend mode' }))
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const useProdBackend = mode === 'prod-backend'
  return {
    plugins: [react(), tsconfigPaths(), ...(useProdBackend ? [prodReadOnly()] : [])],
    server: {
      proxy: {
        // Mirrors the /highscores/ location in nginx.conf
        '/highscores': {
          target: 'https://navalblitz.cepholotech.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/highscores\/?/, '/scores'),
        },
        ...(useProdBackend
          ? Object.fromEntries(PROD_API_PATHS.map((path) => [path, prodProxy]))
          : {}),
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: false,
    },
  }
})
