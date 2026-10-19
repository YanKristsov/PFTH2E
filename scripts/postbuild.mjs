import { renameSync, existsSync } from 'node:fs'

// Vite собирает из index.dev.html → dist/index.dev.html.
// GitHub Pages ожидает dist/index.html, поэтому переименовываем.
const dev = 'dist/index.dev.html'
const prod = 'dist/index.html'

if (existsSync(dev)) {
  renameSync(dev, prod)
  console.log('[postbuild] dist/index.dev.html -> dist/index.html')
} else {
  console.error('[postbuild] ERROR: dist/index.dev.html не найден')
  process.exit(1)
}
