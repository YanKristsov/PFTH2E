# Продолжение работы над PFTH2E (с другого ПК)

## Контекст
Проект — справочник заклинаний Pathfinder 2e. Стек: Vite + Vue 3 + TypeScript + Pinia + Vue Router + MiniSearch + Zod + PWA. Деплой на GitHub Pages (`https://yankristsov.github.io/PFTH2E/`).

## Текущий статус
- `lint`, `typecheck`, `build` — прошли через временный Node.js 24; `dist/` создан
- В системе нет Node.js/npm/Git; временный Node.js 24 загружен в `%TEMP%`, зависимости установлены в `node_modules/`
- Команда `parse:spells` исправлена на запуск TypeScript через `tsx`
- Генератор читает встроенный JSON двух таблиц `pf2.ru`, затем получает RU/EN детали пакетами по 100 ID: 1 555 исходных строк объединяются в 1 470 записей
- `public/spells.json` и `public/spells.index.json` созданы; пустой результат приводит к ошибке и не перезаписывает файлы
- Coverage: 1 470 уникальных английских имён; все данные из `pf2ru`; у 440 записей нет традиции; школа, класс и компоненты отсутствуют во всех записях
- Добавлены четыре fixture-теста: список, детали с `<hr>`, детали без `<hr>`, объединение источников
- Dev server проверен: каталог отображается, поиск `Fireball` фильтрует до «Огненный шар»
- RU/EN описания, дальность, область, цель и длительность получаются через batch API; переключение языка на detail view проверено
- PWA precache включает JSON-каталог (около 7 MiB), лимит Workbox установлен в 10 MiB
- Школа, класс и компоненты пока неполны
- Репозиторий загружен ZIP-архивом, папка `.git` отсутствует; историю удалось проверить через GitHub API, там один initial commit
- Dev server проверен в браузере: главная и список работают; `Fireball` фильтруется до «Огненный шар»
- PWA manifest и offline-режим отдельно не проверялись в DevTools
- `npm run test` — четыре теста проходят
- Деплой не делался

## Что нужно сделать (по порядку)

### 1. Расширить полноту данных
```bash
npm run parse:spells
```
Генератор уже получает описания на обоих языках пакетами по 100 ID. Следующий этап — решить, нужны ли школе, классам и компонентам дополнительные источники или достаточно текущего объёма. Другие два источника пока не включены. Сохранять защиту от пустой генерации.

### 2. Проверка dev server
```bash
npm run dev
```
Убедись что:
- Страница загружается без ошибок
- Поиск и фильтры работают
- PWA активна (DevTools → Application → Manifest)
- Офлайн режим работает (Application → Service Worker → Offline)

### 3. Тесты
```bash
npm run test
```
Тесты парсера лежат в `scripts/parse-spells.test.ts` и используют HTML-фикстуру; запускай `npm run test` после изменений.

### 4. Финальная сборка
```bash
npm run build
```
Должна собираться без ошибок.

### 5. Деплой
```bash
npm run deploy
```
Или вручную:
```bash
git checkout gh-pages
git checkout main -- dist
git add dist
git commit -m "Deploy"
git push origin gh-pages
```

## Важные файлы
- `src/types/spell.ts` — Zod-схемы, единственный источник типов
- `src/composables/useSpells.ts` — загрузка, IndexedDB кэш, MiniSearch
- `src/stores/index.ts` — Pinia: filters, settings, favorites, history, comparison
- `src/router/index.ts` — маршруты
- `scripts/parse-spells.ts` — парсинг каталога и batch-деталей `pf2.ru`
- `.github/workflows/parse-spells.yml` — ежедневный cron (03:00 UTC)
- `.github/workflows/deploy.yml` — деплой на gh-pages
- `docs/decision_logs/` — все решения

## Известные проблемы
- `vite.config.ts:52` — предупреждение о `__dirname` (нужно `import.meta.dirname` в будущем)
- PWA-иконки в `public/` — заглушки 70 байт, нужно заменить на реальные SVG/PNG
- `public/spells.json` содержит двуязычные описания; школа, классы и компоненты не получаются из текущего источника
- `npm install` сообщил о 5 high severity уязвимостях; автоматический audit fix не запускался
- Иконки в шаблонах (emoji) — пока встроены, можно вынести в SVG-спрайт

## Команды для проверки
```bash
npm run lint       # ESLint + Prettier
npm run typecheck  # vue-tsc --noEmit
npm run test       # Vitest (если есть)
npm run build      # production build
npm run parse:spells  # генерация данных
npm run deploy     # деплой на GitHub Pages
```

## Ссылки
- Репозиторий: https://github.com/YanKristsov/PFTH2E
- Деплой: https://yankristsov.github.io/PFTH2E/
- AGENTS.md — принципы работы, формат decision logs
- docs/decision_logs/ — все решения