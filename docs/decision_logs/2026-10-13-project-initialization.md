# Decision Log: 2026-10-13-project-initialization

## Контекст
Создание сайта-справочника заклинаний Pathfinder 2e с поддержкой офлайн-режима, поиска, фильтров и ежедневного обновления данных из 3 источников.

## Принятые решения

### 1. Стек технологий
**Решение**: Vite + Vue 3 + TypeScript + Pinia + Vue Router 4 + MiniSearch + Zod + vite-plugin-pwa (Workbox)
**Альтернативы**: Vanilla JS, React, Next.js, Astro
**Обоснование**: 
- Vue 3 Composition API проще для новичка, меньше boilerplate
- TypeScript критичен для типизации данных заклинаний (сотни полей)
- Vite — быстрый HMR, простой PWA плагин
- Pinia — простое типизированное состояние с devtools
- GitHub Pages хостинг → статический экспорт

### 2. Архитектура данных
**Решение**: Один `public/spells.json` (~500 заклинаний, ~80 KB gzipped) + `spells.index.json` для легкого поиска
**Альтернативы**: По файлам на уровень, индекс + чанки, SQLite в браузере
**Обоснование**: Размер данных небольшой, gzip сжимает отлично, полнотекстовый поиск работает мгновенно на всем массиве

### 3. Источники данных и парсинг
**Источники**: 
- https://2e.aonprd.com/ (оригинал, английский)
- https://pf2e-ru-translation.readthedocs.io/ (русский перевод)
- https://pf2.ru/ (русское комьюнити)

**Решение**: GitHub Actions cron (ежедневно 03:00 UTC) → Node.js парсеры → коммит `public/spells.json`
**Альтернативы**: Клиентский фетч, гибрид, свой API
**Обоснование**: Бесплатно, работает на GitHub Pages, данные в репо с историей, офлайн работает сразу

### 4. Конфликты источников
**Решение**: Показывать все варианты с пометкой источника в массиве `source`
**Альтернативы**: Приоритет aonprd, объединение полей
**Обоснование**: Пользователь видит различия, может выбрать доверенный источник

### 5. UI/UX
- Адаптивно: таблица (десктоп) ↔ карточки (мобайл) с переключателем
- Сайдбар с фильтрами: уровень, традиция, школа, класс, traits, компоненты, источник, rarity
- Полнотекстовый поиск (MiniSearch) по названию + описанию + traits
- Детальная страница: вкладки «Кратко» / «Полно»
- PWA: офлайн, иконка на рабочем столе, авто-обновление

### 6. Расширенный функционал
- Избранное + заметки (localStorage + экспорт/импорт JSON)
- История просмотров (последние 20)
- Сравнение заклинаний (2-3 в модалке/таблице)
- Горячие клавиши (⌘K поиск, Esc закрытие)
- Настройки: тема (light/dark/system), язык (ru/en), колонки таблицы

### 7. Качество кода
- TypeScript strict mode
- ESLint + Prettier (flat config)
- Vitest (unit) + Playwright (e2e)
- CI: lint, typecheck, test, build

### 8. Деплой
- GitHub Actions `actions/deploy-pages` на `gh-pages` branch
- Parse cron отдельным workflow

## Файлы созданы
- `package.json` — зависимости и скрипты
- `vite.config.ts` — конфиг с PWA, alias, chunks
- `tsconfig.app.json` / `tsconfig.node.json` — TS strict
- `eslint.config.js` — flat config с Vue plugin
- `.prettierrc` — форматирование
- `src/types/spell.ts` — Zod схемы + TS типы
- `src/composables/useSpells.ts` — загрузка, кэш IndexedDB, поиск
- `src/stores/index.ts` — Pinia stores (filters, settings, favorites, history, comparison)
- `src/router/index.ts` — Vue Router 4
- `src/assets/styles/*.css` — CSS переменные, reset, компоненты, layout, utils
- `src/components/*.vue` — AppHeader, AppSidebar, SpellCard, SpellTable, MobileMenuButton
- `src/views/*.vue` — Home, SpellDetail, Favorites, History, Settings, Compare
- `scripts/parse-spells.ts` — парсер 3 источников
- `.github/workflows/deploy.yml` — деплой на GitHub Pages
- `.github/workflows/parse-spells.yml` — ежедневный парсинг
- `index.html` — PWA meta tags
- `public/favicon.svg`, `pwa-*.png`, `robots.txt`
- `agents.md` — принципы работы