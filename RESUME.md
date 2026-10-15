# PF2E Spells Reference — Статус проекта

## Общее описание
Справочник заклинаний Pathfinder 2e на русском языке.
- **Стек:** Vite + Vue 3 + TypeScript + Pinia + MiniSearch + PWA
- **Данные:** 2009 записей из pf2.ru и Archives of Nethys
- **Деплой:** GitHub Pages (https://yankristsov.github.io/PFTH2E/)
- **Локально:** `npm run dev` → http://localhost:3000/PFTH2E/

## Текущий статус

### Работает
- Lint, typecheck, 5 тестов — все проходят
- Production build — успешный
- Поиск (MiniSearch) — работает (Fireball → Огненный шар)
- Фильтры — работают (уровень, традиция, школа, черты, редкость, источник)
- Детальная страница — работает (вкладки Brief/Full)
- PWA — Service Worker активен, 2009 строк в оффлайн-режиме
- Навигация — работает (клик на строку → /spell/:id)
- Деплой на GitHub Pages — работает (все JS/CSS отдают 200)

### Визуал (сайдбар)
- Все метки на русском (Уровень, Традиция, Школа, Класс, Черты, Компоненты, Редкость, Источник)
- Чекбоксы выровнены справа (justify-between)
- Уровень — горизонтальная прокрутка (overflow-x-auto)
- Традиции/Школы — компактные (gap-2xs, py-2xs)
- Классы — "Недоступно" (источники не предоставляет эту информацию)

### Известные ограничения
- Поле `classes` пусто у всех 2009 записей (pf2.ru и AoN не предоставляет классы)
- `dist/` игнорируется git (в `.gitignore`)
- `node_modules/` игнорируется git

## Команды
```powershell
npm run lint       # ESLint
npm run typecheck  # vue-tsc
npm run test       # Vitest (5 тестов)
npm run build      # Production build → dist/
npm run dev        # Dev server → http://localhost:3000/PFTH2E/
npm run parse:spells  # Парсинг данных из источников
```

## Деплой
GitHub Actions (`deploy.yml`) запускается автоматически при коммите в `main`.
Деплой на `gh-pages` вручную:
```powershell
git checkout gh-pages
git add -f dist/
git commit -m "Deploy"
git push origin gh-pages --force
```

## Ключевые файлы
- `src/App.vue` — главный компонент (router-view, AppHeader, AppSidebar)
- `src/components/AppSidebar.vue` — фильтры (все на русском)
- `src/components/AppHeader.vue` — хедер (все на русском)
- `src/views/HomeView.vue` — главная страница (таблица/сетка, поиск)
- `src/views/SpellDetailView.vue` — детали заклинания (вкладки Brief/Full)
- `src/views/SettingsView.vue` — настройки
- `src/stores/index.ts` — Pinia store (фильтры, настройки, избранное, история)
- `src/composables/useSpells.ts` — загрузка данных, MiniSearch, фильтрация
- `src/router/index.ts` — маршрутизация
- `scripts/parse-spells.ts` — парсинг данных из pf2.ru и AoN
- `vite.config.ts` — конфиг Vite (base: '/PFTH2E/', PWA настройки)

## История изменений
- `docs/decision_logs/2026-10-13-project-initialization.md` — инициализация
- `docs/decision_logs/2026-10-14-build-toolchain-fix.md` — исправление toolchain
- `docs/decision_logs/2026-10-14-parser-resume.md` — парсинг данных
- `docs/decision_logs/2026-10-15-search-and-navigation-fix.md` — поиск и навигация
- `docs/decision_logs/2026-10-15-sidebar-visual-fix.md` — визуал сайдбара

## Ограничения модели
Модель auto-free имеет лимит на объём размышлений. Работать короткими шагами:
- Читать только релевантные фрагменты кода
- Не анализировать весь проект за один раз
- Использовать `Read` с offset/limit для конкретных секций
- Делать одно изменение за раз, проверять, затем продолжать

## Node.js
Установлен: Node.js 24.0.0, npm 11.3.0
Путь: `C:\Program Files\nodejs`
PATH настроен через реестр (HKCU\Environment)

## Git
Установлен: Git 2.56.0.windows.2
Путь: `C:\Program Files\Git\cmd`
Репозиторий: https://github.com/YanKristsov/PFTH2E
Ветки: `main` (исходники), `gh-pages` (деплой)