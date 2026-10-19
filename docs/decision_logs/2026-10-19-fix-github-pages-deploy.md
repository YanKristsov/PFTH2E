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

---

# Дополнение: разделение dev/prod HTML (2026-10-19, вечер)

## Контекст
После первого успешного деплоя следующая `npm run build` упала:
```
Error: Failed to resolve /PFTH2E/assets/index-01VthlNm.js from D:/Files/PTHFNDR/index.html
```

## Диагностика
Деплой копирует `dist/*` в корень репозитория. Поэтому корневой `index.html` после деплоя — **прод-сборка** со ссылкой `/PFTH2E/assets/index-01VthlNm.js`, а не dev-шаблон. На следующей сборке Vite взял этот файл как `rollupOptions.input` и попытался разрешить уже существующий (но отсутствующий на диске) путь бандла → падение.

То есть dev-шаблон и прод-выход физически занимали один и тот же файл.

## Решение
Разделить шаблоны по разным файлам:

| Файл | Назначение | Кто генерирует |
|------|-----------|-----------------|
| `index.dev.html` | шаблон исходников (`<script type="module" src="/src/main.ts">`) | вручную, в репозитории |
| `index.html` (корень) | прод-сборка, которую отдаёт GitHub Pages | `scripts/postbuild.mjs` при деплое |
| `dist/index.html` | результат сборки | `scripts/postbuild.mjs` |

Изменения:
- `index.dev.html` — новый файл-шаблон; пути к статике **без** `/PFTH2E/` (`href="/favicon.svg"`), иначе dev-сервер отдавал `/PFTH2E/PFTH2E/favicon.svg`
- `vite.config.ts`:
  - `build.rollupOptions.input = 'index.dev.html'`
  - `build.rollupOptions.output.entryFileNames` — функция убирает `.dev` из имени entry-чанка → `assets/index-*.js`
  - плагин `devHtmlPlugin()` (`enforce: 'pre'`) — в dev-режиме middleware отдаёт `index.dev.html` для HTML-запросов
- `scripts/postbuild.mjs` — `renameSync('dist/index.dev.html', 'dist/index.html')`; вызывается как `postbuild` в `npm run build`
- `eslint.config.js` — в `ignores` добавлены `assets/**`, `sw.js`, `workbox-*.js` (это задеплоенные артефакты, они ломали `npm run lint`)

## Обоснование
Физическое разделение шаблона и выхода сборки убирает класс ошибок «деплой ломает следующую сборку». Dev-сервер при этом работает как раньше — пользователь открывает `http://localhost:3000/PFTH2E/` и получает рабочее приложение с HMR.

## Проверки
- `npm run build` — проходит, `dist/index.html` содержит `<script src="/PFTH2E/assets/index-*.js">`
- `npm run lint` — 0 ошибок; `npm run test` — 5/5; `npm run typecheck` — 0 ошибок
- `scripts/check-runtime.ts` — HTTP 200, 2009 заклинаний, 0 console errors, 0 failed requests
- dev-сервер — `http://localhost:3000/PFTH2E/` отдаёт `/PFTH2E/src/main.ts`, пути статики без двойного префикса

## Дополнение: SPA-маршруты в dev-режиме
Middleware `devHtmlPlugin()` изначально перехватывал только `/`, `/index.html` и пути с `/index.html`.
Vite-овский SPA-fallback для остальных маршрутов (`/spell/:id`, `/settings`) отдавал коренной
**прод**-`index.html` → в консоли `Failed to load url /PFTH2E/assets/index-*.js`, страница не грузится.

Исправление: middleware отдаёт `index.dev.html` для **любого** запроса с `Accept: text/html`
(плюс явные `/`, `/index.html`, `*.html`). Добавлен скрипт `scripts/check-dev.ts`, который
проверяет dev-сервер в браузере на `/` и на SPA-маршруте.

## Дополнение: полнота словарей переводов
Проверка живого сайта показала два английских слова в UI фильтров:
- `Arcane` (1 заклинание) и `Conjuration` (41 заклинание) — черты, для которых
  не было пары в `TRAIT_LABELS`. Добавлены: `Arcane → 'Арканный'`, `Conjuration → 'Призыв'`.

Одновременно `check-live.ts` был уточнён: проверка английских терминов теперь
охватывает только шапку и разделы фильтров, исключая список заклинаний и раздел
«Источник» — там английские названия заклинаний и источников остаются намеренно
(требование проекта).

Защита от регрессии: `src/constants/translations.test.ts` — тест проверяет, что
для каждой традиции, школы, редкости и английской черты из `public/spells.json`
есть русская подпись. Полнота на момент коммита: черты 114/114, школы 9/9,
традиции 4/4, редкость 4/4.
