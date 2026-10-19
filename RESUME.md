# PF2E Spells Reference — Статус проекта

> **Обновлено:** 2026-10-19. Актуальный статус после полного перевода интерфейса на русский и исправления деплоя.

## Общее описание
Справочник заклинаний Pathfinder 2e на русском языке.
- **Стек:** Vite 8 + Vue 3 + TypeScript + Pinia + MiniSearch + PWA (vite-plugin-pwa)
- **Данные:** 2009 записей из pf2.ru и Archives of Nethys
- **Деплой:** GitHub Pages → https://yankristsov.github.io/PFTH2E/
- **Локально:** `npm run dev` → http://localhost:3000/PFTH2E/

## Текущий статус

### Работает (проверено 2026-10-19)
- `npm run typecheck` — 0 ошибок
- `npm run test` — 10/10 тестов проходят (5 парсер + 5 словарей переводов)
- `npm run lint` — 0 ошибок (задеплоенные артефакты `assets/`, `sw.js`, `workbox-*.js` исключены в `eslint.config.js`)
- `npm run build` — 71 модуль, все ассеты генерируются
- **Runtime-проверка (Playwright) локально и на живом сайте:** HTTP 200, отрендерено 2009 заклинаний, **0 console errors, 0 failed requests**
- **Dev-сервер (Playwright):** `http://localhost:3000/PFTH2E/` — 2009 заклинаний, SPA-маршрут `/spell/1` работает, 0 console errors
- Поиск (MiniSearch) — работает (Fireball → Огненный шар)
- Фильтры — работают (уровень, традиция, школа, черты, редкость, источник, компоненты)
- Детальная страница — работает (вкладки «Кратко» / «Полно»)
- PWA — Service Worker активен, 2009 строк в оффлайне
- Навигация — клик по строке/карточке → `/spell/:id`
- Деплой на GitHub Pages — работает (все JS/CSS/JSON отдают 200)

### Интерфейс полностью на русском
- Переключатель языка (ru/en) **удалён** из `AppHeader.vue` и `SettingsView.vue`
- Поиск в шапке: «Поиск заклинаний...», label «Поиск заклинаний»
- **Традиции:** Арканная, Сакральная, Окультая, Первобытная
- **Школы:** Преграждение, Призыв, Прорицание, Очарование, Эвокация, Иллюзия, Некромантия, Превращение, Неизвестно
- **Редкость:** Обычное, Необычное, Редкое, Уникальное
- **Компоненты:** Словесный (С), Жестовый (Ж), Материальный (М), Фокусный (Ф) — отображаются инициалами с подсказкой
- **Черты:** 100+ терминов переведены (Acid→Кислота, Fire→Огонь, и т.д.)
- Все служебные надписи: «К заклинаниям», «Ошибка загрузки», «В избранном», «Посмотреть детали», «Ввод», «Уровень N», «Кратко»/«Полно», «Усиление», «Варианты источника», «Доступна новая версия. Перезагрузить?»
- **На английском остаётся только:** оригинальные названия заклинаний (`name.en`) и названия источников («Archives of Nethys: Divine Mysteries») — по требованию

### Механизм переводов
- `src/constants/translations.ts` — единый словарь: `TRADITION_LABELS`, `RARITY_LABELS`, `SCHOOL_LABELS`, `COMPONENT_LABELS`, `TRAIT_LABELS` + функции `traditionLabel()`, `schoolLabel()`, `rarityLabel()`, `traitLabel()`, `componentInitial()`
- Все компоненты используют эти функции, а не прямые обращения к константам
- Чтобы добавить перевод — дописать пару в `TRAIT_LABELS`
- **Тест `src/constants/translations.test.ts`** проверяет, что для каждой традиции, школы, редкости и английской черты из `public/spells.json` есть русская подпись. При добавлении новых данных тест укажет, чего не хватает
- Полнота на 2026-10-19: черты 114/114, школы 9/9, традиции 4/4, редкость 4/4

### Визуал (сайдбар)
- Все метки на русском (Уровень, Традиция, Школа, Класс, Черты, Компоненты, Редкость, Источник)
- Чекбоксы выровнены справа (justify-between)
- Уровень — горизонтальная прокрутка (overflow-x-auto)
- Традиции/Школы — компактные (gap-2xs, py-2xs)
- Классы — «Недоступно» (источники не предоставляют эту информацию)

## Команды
```powershell
npm run lint       # ESLint
npm run typecheck  # vue-tsc
npm run test       # Vitest (5 тестов)
npm run build      # Production build → dist/
npm run dev        # Dev server → http://localhost:3000/PFTH2E/
npm run parse:spells  # Парсинг данных из источников

# Проверка runtime (Playwright, chromium установлен)
npx tsx scripts/check-runtime.ts   # локальная сборка из dist/
npx tsx scripts/check-dev.ts       # dev-сервер (нужен запущенный npm run dev)
npx tsx scripts/check-live.ts      # живой сайт https://yankristsov.github.io/PFTH2E/
```

## Деплой (важно!)

### Как это работает
GitHub Pages из ветки `gh-pages` обслуживает файлы **из КОРНЯ ветки**, а не из подпапки `dist/`.
Поэтому собранные файлы копируются в корень репозитория, а папка `dist/` удаляется из индекса git (иначе 13 МБ данных дублируются).

### Команды деплоя
```powershell
npm run build
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force
& "C:\Program Files\Git\cmd\git.exe" rm -r --cached assets
& "C:\Program Files\Git\cmd\git.exe" add assets/ index.html sw.js workbox-*.js manifest.webmanifest *.svg *.png robots.txt spells*.json index.dev.html scripts/postbuild.mjs vite.config.ts package.json eslint.config.js
& "C:\Program Files\Git\cmd\git.exe" commit -m "Deploy"
& "C:\Program Files\Git\cmd\git.exe" push origin gh-pages --force
```

> `dist/` уже вне индекса git (в `.gitignore`), поэтому `git rm -r --cached dist` не нужен.
> Старые хешированные ассеты в `assets/` нужно удалять перед копированием — иначе они копятся:
> ```powershell
> & "C:\Program Files\Git\cmd\git.exe" rm -r --cached assets
> Remove-Item -Path .\assets -Recurse -Force
> ```

### Особенности
- `npx gh-pages -d dist` **НЕ работает** — падает с `ENAMETOOLONG` (в ветке слишком много файлов)
- GitHub Pages обновляется с задержкой **1–2 минуты** после push
- GitHub Actions workflow **отсутствует** — деплой полностью ручной
- Git в этом окружении не в PATH, нужен полный путь: `& "C:\Program Files\Git\cmd\git.exe" ...`
- PowerShell 5.1: **не поддерживает `&&`** — команды выполнять последовательно, отдельными вызовами

### Требования Vite 8 + разделение dev/prod HTML (неочевидно)

**Главное правило:** корень `index.html` в репозитории — это **прод-сборка** (её отдаёт GitHub Pages). Использовать его как Vite-input нельзя: на следующей сборке Vite попытается разрешить уже собранный путь `/PFTH2E/assets/index-*.js` и упадёт с
`Error: Failed to resolve /PFTH2E/assets/index-*.js from index.html`.

Поэтому шаблон исходников вынесен в **`index.dev.html`**, а `index.html` в корне генерируется сборкой.

Что обязательно должно быть:
- `index.dev.html` (в корне): `<script type="module" src="/src/main.ts"></script>` внутри `<body>`; пути к статике **без** префикса `/PFTH2E/` (`href="/favicon.svg"`), иначе dev-сервер отдаст `/PFTH2E/PFTH2E/favicon.svg`
- `vite.config.ts`: `build.rollupOptions.input = 'index.dev.html'` + плагин `devHtmlPlugin()`, который отдаёт `index.dev.html` в dev-режиме
- `vite.config.ts`: `build.rollupOptions.output.entryFileNames` — убирает `.dev` из имени entry-чанка (`assets/index-*.js` вместо `assets/index.dev-*.js`)
- `scripts/postbuild.mjs` — переименовывает `dist/index.dev.html` → `dist/index.html` (запускается как `postbuild` в `npm run build`)
- Функция `manualChunks` в rolldown не поддерживается — её убрали
- Vite 8 **не авто-инжектит** `<script type="module">` в HTML — тег должен быть в шаблоне явно

## Известные ограничения
- Поле `classes` пусто у всех 2009 записей — pf2.ru и AoN не предоставляют классы. Интерфейс это скрывает (фильтр показывает «Недоступно», колонка убрана из дефолтных настроек таблицы)
- Рекомендация по классам: подтянуть из стороннего датасета (Pf2SRD / d20pfsrd / Foundry VTT) сопоставлением по `name.ru` + `level`; ручное заполнение 2009 записей нереалистично
- В ветке `gh-pages` исторически остались `node_modules/`, `src/`, `public/` — мусор, но на работу сайта не влияет
- `dist/` и `node_modules/` в `.gitignore`

## Ветки Git
- **Источник правды — `gh-pages`.** В ней лежат и исходники (`src/`), и собранный сайт в корне
- Локальной ветки `main` нет; `origin/main` содержит только первоначальные файлы и не используется
- Рабочая директория: `D:\Files\PTHFNDR`

## Ключевые файлы
- `src/App.vue` — главный компонент (router-view, AppHeader, AppSidebar)
- `src/constants/translations.ts` — **словарь переводов** (традиции, школы, редкость, черты, компоненты)
- `src/constants/translations.test.ts` — тест полноты словарей переводов
- `src/components/AppSidebar.vue` — фильтры (все на русском)
- `src/components/AppHeader.vue` — хедер, поиск, переключатель темы
- `src/components/SpellCard.vue` — карточка заклинания (сетка, клик открывает детали)
- `src/components/SpellTable.vue` — таблица заклинаний
- `src/views/HomeView.vue` — главная страница (таблица/сетка, фильтры, поиск)
- `src/views/SpellDetailView.vue` — детали заклинания (вкладки Кратко/Полно)
- `src/views/FavoritesView.vue` — избранное + заметки
- `src/views/HistoryView.vue` — история просмотров
- `src/views/CompareView.vue` — сравнение до 3 заклинаний
- `src/views/SettingsView.vue` — настройки (тема, колонки, экспорт/импорт)
- `src/stores/index.ts` — Pinia store (фильтры, настройки, избранное, история, сравнение)
- `src/composables/useSpells.ts` — загрузка данных, MiniSearch, фильтрация
- `src/router/index.ts` — маршрутизация
- `src/types/spell.ts` — Zod-схемы и типы
- `scripts/parse-spells.ts` — парсинг данных из pf2.ru и AoN
- `scripts/check-runtime.ts` — Playwright-проверка локальной сборки
- `scripts/check-dev.ts` — Playwright-проверка dev-сервера (dev-шаблон на всех маршрутах, включая SPA)
- `scripts/check-live.ts` — Playwright-проверка живого сайта
- `vite.config.ts` — конфиг Vite (base: '/PFTH2E/', PWA, `input: 'index.dev.html'`, плагин `devHtmlPlugin`)
- `index.dev.html` — шаблон HTML для dev-сборки (источник `<script type="module" src="/src/main.ts">`)
- `scripts/postbuild.mjs` — переименование `dist/index.dev.html` → `dist/index.html`

## История изменений (decision logs)
- `docs/decision_logs/2026-10-13-project-initialization.md` — инициализация
- `docs/decision_logs/2026-10-14-build-toolchain-fix.md` — исправление toolchain
- `docs/decision_logs/2026-10-14-parser-resume.md` — парсинг данных
- `docs/decision_logs/2026-10-15-search-and-navigation-fix.md` — поиск и навигация
- `docs/decision_logs/2026-10-15-sidebar-visual-fix.md` — визуал сайдбара
- `docs/decision_logs/2026-10-15-russian-labels-and-dirname-fix.md` — перевод меток, `__dirname` → `import.meta.dirname`
- `docs/decision_logs/2026-10-19-fix-github-pages-deploy.md` — **исправление белой страницы** (Vite 8 + деплой в корень ветки)

## Ограничения модели
Модель auto-free имеет лимит на объём размышлений. Работать короткими шагами:
- Читать только релевантные фрагменты кода
- Не анализировать весь проект за один раз
- Использовать `Read` с offset/limit для конкретных секций
- Делать одно изменение за раз, проверять, затем продолжать

## Node.js
Установлен: Node.js 24.0.0, npm 11.3.0
Путь: `C:\Program Files\nodejs`

## Git
Установлен: Git 2.56.0.windows.2
Путь: `C:\Program Files\Git\cmd`
Репозиторий: https://github.com/YanKristsov/PFTH2E
