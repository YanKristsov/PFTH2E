# 2026-10-27 — Исправление загрузки избранной и истории + проверка скролла + устранение нижнего отступа карточки

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

## Второй проход: нижняя граница карточки
После исправления загрузки избранной пользователь заметил, что нижняя линия карточки не упирает в последнюю характеристику — под блоком «Черты» остаётся отступ `var(--spacing-md)` (16px).

### Причина
В `SpellCard.vue` scoped-стилях было `:deep(.card-body) { padding-bottom: var(--spacing-md); }`. Поскольку `.card-body` — это непосредственный контентный блок карточки, отступ снизу добавлял пустое пространство между последним элементом (чёртами) и нижней границей карточки.

### Решение
`padding-bottom: var(--spacing-md)` → `padding-bottom: 0`. Теперь последний элемент (чёрты) упирает в самую нижнюю границу карточки (с учётом 1px border-bottom).

### Проверка (Playwright)
- Десктоп 1440px: `cardBottom=760`, `lastChildBottom=759`, `gap=1` (только border)
- Мобильный 390px: `cardBottom=746`, `lastChildBottom=745`, `gap=1`
- Мобильный 360px: `cardBottom=746`, `lastChildBottom=745`, `gap=1`
- Горизонтальный скролл: отсутствует на всех viewport'ах

## Файлы
- `src/App.vue` — добавлены `useFavoritesStore`, `useHistoryStore`, вызовы `.load()`
- `src/components/SpellCard.vue` — `padding-bottom: 0` у `.card-body`

## Третий проход: переключатель вида в «Избранном»
Пользователь просил вернуть переключатель «Карточки»/«Таблица» в раздел «Избранное».

### Решение
- В `FavoritesView.vue` добавлено локальное состояние `viewMode` (`'table' | 'cards'`, по умолчанию `'cards'`).
- В шаблоне заголовка добавлены кнопки переключателя в `.content-actions`.
- При `viewMode === 'table'` рендерится `SpellTable`, при `'cards'` — сетка `SpellCard`.
- Импорт `SpellTable` добавлен в `FavoritesView.vue`.
- История (`HistoryView.vue`) осталась только с таблицей — без переключателя, как было решено.
- Главная (`HomeView.vue`) осталась только с таблицей — без переключателя, как было решено.

### Проверка
- `npm run typecheck` — 0 ошибок
- `npm run build` — успешная сборка, в `dist/index.html` есть скрипт
- `npx tsx scripts/check-runtime.ts` — 0 console errors, 0 failed requests