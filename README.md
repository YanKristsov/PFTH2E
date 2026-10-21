# PFTH2E — Pathfinder 2e Spells Reference

Офлайн-справочник заклинаний Pathfinder 2e с полнотекстовым поиском, фильтрами, PWA-поддержкой и автоматическим обновлением данных.

## Стек
- Vite + Vue 3 + TypeScript + Composition API
- Pinia (state), Vue Router 4, MiniSearch (поиск)
- Zod (схемы валидации), vite-plugin-pwa (Workbox)
- JSDOM (парсинг данных), ручной деплой скриптом `npm run deploy`

## Данные
Генератор `scripts/parse-spells.ts` собирает каталог из трёх источников:
- **Archives of Nethys** (`elasticsearch.aonprd.com`) — официальные описания, школа, дескрипторы,
  уровень, а также трейт-класс (принадлежность заклинания классу);
- **pf2.ru** — русские названия и описания, фокусные заклинания классов;
- **pf2e-ru-translation** (readthedocs) — сверка списка классов и их русских названий.

В `public/spells.json` около 2 000 записей; класс указан у 485 из них, остальные помечены
как «Общее заклинание» (см. `docs/decision_logs/2026-10-21-spell-classes.md`).
Данные лежат в репозитории; обновление — вручную через `npm run parse:spells`.

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
- `src/stores/index.ts` — Pinia: filters, settings, favorites, history
- `src/constants/translations.ts` — словари переводов (традиции, школы, редкость, дескрипторы, классы, компоненты, фильтры)
- `scripts/parse-spells.ts` — генератор каталога и двуязычных описаний, сбор сведений о классах
- `scripts/check-runtime.ts`, `check-dev.ts`, `check-live.ts` — проверки сборки, dev-сервера и живого сайта (Playwright)

## Деплой
`https://yankristsov.github.io/PFTH2E/`

## Документация
- `AGENTS.md` — принципы работы, формат decision logs
- `docs/decision_logs/` — все архитектурные решения
- `RESUME.md` — инструкция для продолжения работы с другого ПК