# 2026-10-27 — Исправление загрузки избранной и истории + проверка скролла

## Контекст
После предыдущего коммита («feat: favorites cards grid, table favorite toggle, home table-only, search fix») при проверке скролла выяснилось:
- Страница «Избранное» всегда показывала пустое состояние, даже если в localStorage есть данные.
- Причина: в `App.vue` при старте вызывался только `settingsStore.load()` и `useSpells().load()`. `useFavoritesStore.load()` и `useHistoryStore.load()` **не вызывались**, поэтому `items` оставались пустыми.

## Альтернативы
1. Вызывать `load()` в каждом view-компоненте (FavoritesView, HistoryView) — дублирование логики, риск забыть.
2. Вызывать `load()` в `App.vue` наряду с остальными сторами — единая точка инициализации, соответствует существующему паттерну.

## Решение
Добавлены вызовы `favoritesStore.load()` и `historyStore.load()` в `onMounted` в `src/App.vue`.

## Проверка
- `npm run typecheck` — 0 ошибок
- `npm run build` — успешная сборка, в `dist/index.html` есть `<script type="module" src="/PFTH2E/assets/index-*.js">`
- `npx tsx scripts/check-runtime.ts` — 0 console errors, 0 failed requests
- Проверка скролла (Playwright) на десктопе 1440px, мобильных 390px и 360px:
  - Главная (таблица): без горизонтального скролла на всех viewport'ах
  - Избранное (сетка карточек): без горизонтального скролла, карточки равной ширины 320px, упаковка `auto-fill minmax(280px, 320px)` с `justify-content: start`

## Файлы
- `src/App.vue` — добавлены `useFavoritesStore`, `useHistoryStore`, вызовы `.load()`