# Исправление деплоя GitHub Pages и Vite 8

## Контекст
После перевода всех меток на русский сайт https://yankristsov.github.io/PFTH2E/ перестал открываться — пользователь видел белую страницу.

## Диагностика
Проверка через Playwright (скрипт `scripts/check-runtime.ts` на локальной сборке) показала:
- HTTP 200, отрендерено 2009 заклинаний
- 0 console errors, 0 failed requests
- Все переводы на месте

Вывод: код приложения исправен, проблема в деплое.

Причина: **GitHub Pages из ветки `gh-pages` обслуживает файлы из КОРНЯ ветки, а не из подпапки `dist/`.** Собранные файлы находились в `dist/`, а в корне лежал dev-шаблон `index.html` со ссылкой на `/src/main.ts`, который сервер не обрабатывает → пустая страница.

Дополнительно выявлена несовместимость: **Vite 8 (rolldown) не авто-инжектит `<script type="module">` в `index.html`** при сборке, в отличие от Vite 7 (rollup). Сборка проходила успешно, но `dist/index.html` не содержал ссылок на JS/CSS бандлы.

## Решение

### 1. Сборка (Vite 8)
- `index.html`: добавлен `<script type="module" src="/src/main.ts"></script>` в `<body>`
- `vite.config.ts`: в `build.rollupOptions` добавлен `input: 'index.html'`
- Убрана функция `manualChunks` (несовместима с rolldown)

### 2. Деплой
Содержимое `dist/` копируется в корень репозитория (ветка `gh-pages`), а сама папка `dist/` удаляется из индекса git, чтобы не дублировать 13 МБ данных.

Команда деплоя:
```
npm run build
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force
git rm -r --cached dist
git add -f assets/ index.html sw.js workbox-*.js manifest.webmanifest *.svg *.png robots.txt spells*.json
git commit -m "Deploy"
git push origin gh-pages --force
```

Инструмент `gh-pages -d dist` непригоден: падает с `ENAMETOOLONG` из-за большого количества файлов в ветке.

### 3. Проверки
- `npm run typecheck` — проходит
- `npm run test` — 5/5
- `npm run lint` — 0 ошибок в `src/` (ошибки только в сгенерированных `sw.js`/`workbox-*.js`)
- `npm run build` — 71 модуль, все ассеты
- `scripts/check-runtime.ts` — локальная проверка собранной версии
- `scripts/check-live.ts` — проверка живого сайта: 2009 заклинаний, 0 console errors, 0 failed requests

## Обоснование
GitHub Pages требует собранные файлы в корне ветки. Проверочные скрипты на Playwright добавлены в репозиторий, чтобы деплой можно было верифицировать автоматически до и после публикации.

## Известные ограничения
- GitHub Pages обновляется с задержкой 1–2 минуты после push
- В ветке `gh-pages` исторически остались `node_modules/`, `src/`, `public/` — мусор, но не влияет на работу сайта
