import { renameSync, existsSync, copyFileSync } from 'node:fs'

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

// GitHub Pages отдаёт 404.html для любого пути, которого нет в репозитории.
// SPA-маршруты (/settings, /spell/:id, ...) физически не существуют на сервере,
// поэтому без 404.html прямой заход по такой ссылке возвращает страницу 404,
// а перезагрузка страницы ломает приложение.
// Копия index.html решает проблему: приложение стартует по запрошенному пути,
// а vue-router разбирает маршрут уже в браузере.
// Статус ответа останется 404, но пользователь получит рабочее приложение.
const notFound = 'dist/404.html'
if (existsSync(prod)) {
  copyFileSync(prod, notFound)
  console.log('[postbuild] dist/index.html -> dist/404.html (SPA-маршруты на GitHub Pages)')
}
