import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const BASE = '/PFTH2E/'

/**
 * Корневой index.html содержит ПРОД-сборку (её отдаёт GitHub Pages),
 * поэтому dev-серверу нужен отдельный шаблон index.dev.html.
 * Middleware перехватывает все HTML-запросы, включая SPA-маршруты
 * (/spell/:id и т.п.), иначе Vite отдаёт для них коренной прод-index.html.
 */
function devHtmlPlugin(): Plugin {
  const templatePath = path.resolve(import.meta.dirname, 'index.dev.html')
  return {
    name: 'pf2e:dev-html',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next()
          return
        }
        const url = (req.url || '').split('?')[0]
        const accept = req.headers.accept || ''
        const isHtmlRequest =
          accept.includes('text/html') ||
          url === '/' ||
          url === BASE ||
          url.endsWith('/index.html') ||
          url.endsWith('.html')
        if (!isHtmlRequest) {
          next()
          return
        }
        const raw = readFileSync(templatePath, 'utf-8')
        const html = await server.transformIndexHtml(req.url ?? '/', raw)
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(html)
      })
    }
  }
}

export default defineConfig({
  base: BASE,
  plugins: [
    devHtmlPlugin(),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'PF2E Spells Reference',
        short_name: 'PF2E Spells',
        description: 'Pathfinder 2e заклинания — поиск, фильтры, офлайн справочник',
        theme_color: '#1a1a2e',
        background_color: '#fafafa',
        display: 'standalone',
        scope: BASE,
        start_url: BASE,
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,json,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.aonprd\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'aonprd-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      input: 'index.dev.html',
      output: {
        entryFileNames: (chunk) => {
          const name = chunk.name.replace(/\.dev$/, '')
          return `assets/${name}-[hash].js`
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
