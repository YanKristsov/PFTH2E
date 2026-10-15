# PFTH2E — Pathfinder 2e Spells Reference

Офлайн-справочник заклинаний Pathfinder 2e с полнотекстовым поиском, фильтрами, PWA-поддержкой и автоматическим обновлением данных.

## Стек
- Vite + Vue 3 + TypeScript + Composition API
- Pinia (state), Vue Router 4, MiniSearch (поиск)
- Zod (схемы валидации), vite-plugin-pwa (Workbox)
- JSDOM (парсинг данных), GitHub Actions (cron + деплой)

## Данные
Текущий генератор использует `pf2.ru`: извлекает каталог из встроенных данных списка и получает русские и английские описания пакетным API. В `public/spells.json` около 1 470 записей. Школы, классы и компоненты источник в этих данных не предоставляет. Парсеры Archives of Nethys и `pf2e-ru-translation` пока не включены в генерацию. Ежедневно в 03:00 UTC GitHub Actions запускает генерацию и коммитит JSON.

## Запуск
```bash
npm install
npm run dev          # dev server
npm run parse:spells # генерация public/spells.json (требует сети)
npm run build        # production сборка
npm run deploy       # деплой на GitHub Pages
```

## Проверки
```bash
npm run lint       # ESLint + Prettier
npm run typecheck  # vue-tsc --noEmit
npm run test       # Vitest
```

## Архитектура
- `src/types/spell.ts` — Zod-схемы, единый источник типов
- `src/composables/useSpells.ts` — загрузка JSON, IndexedDB кэш, MiniSearch
- `src/stores/index.ts` — Pinia: filters, settings, favorites, history, comparison
- `scripts/parse-spells.ts` — генератор каталога и двуязычных описаний из данных `pf2.ru`
- `.github/workflows/` — deploy.yml (gh-pages), parse-spells.yml (cron)

## Деплой
`https://yankristsov.github.io/PFTH2E/`

## Документация
- `AGENTS.md` — принципы работы, формат decision logs
- `docs/decision_logs/` — все архитектурные решения
- `RESUME.md` — инструкция для продолжения работы с другого ПК